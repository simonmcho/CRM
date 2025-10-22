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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useRouter } from 'next/navigation'

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

export function BookingFormWithAvailability({
  onBookingAdded,
}: BookingFormWithAvailabilityProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [selectedGuest, setSelectedGuest] = useState('')
  const [selectedHotel, setSelectedHotel] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [notes, setNotes] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Load guests and hotels on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [guestsResponse, hotelsResponse] = await Promise.all([
          fetch('/api/guests'),
          fetch('/api/hotels'),
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

  const handleRoomSelect = (room: SelectedRoom | null) => {
    setSelectedRoom(room)
  }

  const handleDateChange = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
    // Reset selected room when dates change
    setSelectedRoom(null)
  }

  const handleDateInputChange = (
    type: 'checkIn' | 'checkOut',
    value: string
  ) => {
    if (type === 'checkIn') {
      setCheckIn(value)
      handleDateChange(value, checkOut)
    } else {
      setCheckOut(value)
      handleDateChange(checkIn, value)
    }
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn + 'T12:00:00Z')
    const end = new Date(checkOut + 'T12:00:00Z')
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (!selectedRoom) return 0
    const nights = calculateNights()
    return selectedRoom.roomType.basePrice * nights
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !selectedGuest ||
      !selectedHotel ||
      !selectedRoom ||
      !checkIn ||
      !checkOut
    ) {
      console.log({
        selectedGuest,
        selectedHotel,
        selectedRoom,
        checkIn,
        checkOut,
      })
      alert('Your starting date needs to be the same as the check-in date')
      return
    }

    // Show confirmation dialog instead of immediately submitting
    setShowConfirmation(true)
  }

  const handleCancelBooking = () => {
    setShowConfirmation(false)
    setSelectedRoom(null) // Clear the selected room when canceling
  }

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    setShowConfirmation(false)

    try {
      const bookingData = {
        guestId: selectedGuest,
        hotelId: selectedHotel,
        roomId: selectedRoom!.id,
        checkIn: checkIn, // Send as YYYY-MM-DD string
        checkOut: checkOut, // Send as YYYY-MM-DD string
        totalAmount: calculateTotal(),
        notes: notes.trim() || undefined,
        status: 'CONFIRMED',
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection - First Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Your Dates
            </CardTitle>
            <CardDescription>
              Choose your check-in and check-out dates to see available rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in Date</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  onChange={(e) =>
                    handleDateInputChange('checkIn', e.target.value)
                  }
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out Date</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  onChange={(e) =>
                    handleDateInputChange('checkOut', e.target.value)
                  }
                  min={checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest and Hotel Selection - After dates are selected */}
        {checkIn && checkOut && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        )}

        {/* Room Availability Check - Shows automatically when hotel is selected */}
        {selectedHotel && checkIn && checkOut && (
          <RoomAvailabilityCheck
            hotelId={selectedHotel}
            checkIn={checkIn}
            checkOut={checkOut}
            selectedRoom={selectedRoom}
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
                    {guests.find((g) => g.id === selectedGuest)?.firstName}{' '}
                    {guests.find((g) => g.id === selectedGuest)?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hotel:</span>
                  <span className="font-medium">
                    {hotels.find((h) => h.id === selectedHotel)?.name}
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
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
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
          disabled={
            isSubmitting || !selectedGuest || !selectedHotel || !selectedRoom
          }
          className="w-full"
        >
          {isSubmitting ? 'Creating Booking...' : 'Review & Book'}
        </Button>
      </form>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Please review your booking details before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Guest:</span>
                <p className="text-muted-foreground">
                  {guests.find((g) => g.id === selectedGuest)?.firstName}{' '}
                  {guests.find((g) => g.id === selectedGuest)?.lastName}
                </p>
              </div>
              <div>
                <span className="font-medium">Hotel:</span>
                <p className="text-muted-foreground">
                  {hotels.find((h) => h.id === selectedHotel)?.name}
                </p>
              </div>
              <div>
                <span className="font-medium">Room:</span>
                <p className="text-muted-foreground">
                  {selectedRoom?.number} ({selectedRoom?.roomType.name})
                </p>
              </div>
              <div>
                <span className="font-medium">Dates:</span>
                <p className="text-muted-foreground">
                  {checkIn} to {checkOut}
                </p>
              </div>
              <div>
                <span className="font-medium">Duration:</span>
                <p className="text-muted-foreground">
                  {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <span className="font-medium">Rate:</span>
                <p className="text-muted-foreground">
                  ${selectedRoom?.roomType.basePrice}/night
                </p>
              </div>
            </div>

            {notes && (
              <div>
                <span className="text-sm font-medium">Notes:</span>
                <p className="mt-1 text-sm text-muted-foreground">{notes}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  ${calculateTotal()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelBooking}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} disabled={isSubmitting}>
              {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
