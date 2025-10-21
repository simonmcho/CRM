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

interface AddBookingFormProps {
  onBookingAdded?: () => void
}

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Room {
  id: string
  number: string
  roomType: {
    name: string
    basePrice: number
  }
}

interface Hotel {
  id: string
  name: string
}

export function AddBookingForm({ onBookingAdded }: AddBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guestId: '',
    roomId: '',
    hotelId: '',
    notes: '',
  })

  // Load guests, rooms, and hotels
  useEffect(() => {
    const loadData = async () => {
      try {
        const [guestsRes, roomsRes, hotelsRes] = await Promise.all([
          fetch('/api/guests'),
          fetch('/api/rooms'),
          fetch('/api/hotels'),
        ])

        if (guestsRes.ok) setGuests(await guestsRes.json())
        if (roomsRes.ok) setRooms(await roomsRes.json())
        if (hotelsRes.ok) setHotels(await hotelsRes.json())
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Reset form
        setFormData({
          checkIn: '',
          checkOut: '',
          guestId: '',
          roomId: '',
          hotelId: '',
          notes: '',
        })
        onBookingAdded?.()
        alert('Booking added successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to add booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Booking</CardTitle>
        <CardDescription>Create a new reservation for a guest</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in Date *</Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out Date *</Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Guest *</Label>
            <Select
              value={formData.guestId}
              onValueChange={(value) => handleSelectChange('guestId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a guest" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.firstName} {guest.lastName} ({guest.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hotel *</Label>
            <Select
              value={formData.hotelId}
              onValueChange={(value) => handleSelectChange('hotelId', value)}
            >
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

          <div className="space-y-2">
            <Label>Room *</Label>
            <Select
              value={formData.roomId}
              onValueChange={(value) => handleSelectChange('roomId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.number} - {room.roomType.name} ($
                    {room.roomType.basePrice}/night)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any special requests or notes..."
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
