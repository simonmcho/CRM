'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RoomAvailabilityCheck } from '@/components/room-availability-check'
import { Calendar, User, MapPin } from 'lucide-react'

interface BookingFormWithAvailabilityProps {
  onBookingAdded?: () => void
}

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface Hotel {
  id: string
  name: string
}

interface SelectedRoom {
  id: string
  number: string
  floor: number | null
  roomType: {
    id: string
    name: string
    basePrice: number
    maxOccupancy: number
  }
}

export function BookingFormWithAvailability({ onBookingAdded }: BookingFormWithAvailabilityProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [selectedGuest, setSelectedGuest] = useState('')
  const [selectedHotel, setSelectedHotel] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [notes, setNotes] = useState('')

  // Load guests and hotels on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [guestsResponse, hotelsResponse] = await Promise.all([
          fetch('/api/guests'),
          fetch('/api/hotels')
        ])

        if (guestsResponse.ok) {
          const guestsData = await guestsResponse.json()
          setGuests(guestsData)
        }

        if (hotelsResponse.ok) {
          const hotelsData = await hotelsResponse.json()
          setHotels(hotelsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [])

  const handleRoomSelect = (room: SelectedRoom) => {
    setSelectedRoom(room)
  }

  const handleDateChange = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
    // Reset selected room when dates change
    setSelectedRoom(null)
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (!selectedRoom) return 0
    const nights = calculateNights()
    return selectedRoom.roomType.basePrice * nights
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedGuest || !selectedHotel || !selectedRoom || !checkIn || !checkOut) {
      alert('Please fill in all required fields and select a room')
      return
    }

    setIsSubmitting(true)

    try {
      const bookingData = {
        guestId: selectedGuest,
        hotelId: selectedHotel,
        roomId: selectedRoom.id,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        totalAmount: calculateTotal(),
        notes: notes.trim() || undefined,
        status: 'CONFIRMED'
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        // Reset form
        setSelectedGuest('')
        setSelectedHotel('')
        setSelectedRoom(null)
        setCheckIn('')
        setCheckOut('')
        setNotes('')
        
        alert('Booking created successfully!')
        onBookingAdded?.()
      } else {
        const errorData = await response.json()
        alert(`Error creating booking: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Error creating booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Booking
          </CardTitle>
          <CardDescription>
            Select a guest, hotel, and available room to create a booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guest" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Guest
                </Label>
                <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a guest" />
                  </SelectTrigger>
                  <SelectContent>
                    {guests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.firstName} {guest.lastName}
                        {guest.email && ` (${guest.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hotel" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Hotel
                </Label>
                <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Room Availability Check */}
            {selectedHotel && (
              <RoomAvailabilityCheck
                hotelId={selectedHotel}
                checkIn={checkIn}
                checkOut={checkOut}
                onDateChange={handleDateChange}
                onRoomSelect={handleRoomSelect}
              />
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or notes about the booking..."
                rows={3}
              />
            </div>

            {/* Booking Summary */}
            {selectedRoom && checkIn && checkOut && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Guest:</span>
                      <span className="font-medium">
                        {guests.find(g => g.id === selectedGuest)?.firstName} {guests.find(g => g.id === selectedGuest)?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hotel:</span>
                      <span className="font-medium">
                        {hotels.find(h => h.id === selectedHotel)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <span className="font-medium">
                        {selectedRoom.number} ({selectedRoom.roomType.name})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dates:</span>
                      <span className="font-medium">
                        {checkIn} to {checkOut} ({calculateNights()} nights)
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedGuest || !selectedHotel || !selectedRoom}
              className="w-full"
            >
              {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}