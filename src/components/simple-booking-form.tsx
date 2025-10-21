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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

export function SimpleBookingForm() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [selectedGuest, setSelectedGuest] = useState('')
  const [selectedHotel, setSelectedHotel] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading guests and hotels...')
        
        const [guestsResponse, hotelsResponse] = await Promise.all([
          fetch('/api/guests'),
          fetch('/api/hotels')
        ])

        console.log('Guests response:', guestsResponse.status)
        console.log('Hotels response:', hotelsResponse.status)

        if (guestsResponse.ok) {
          const guestsData = await guestsResponse.json()
          console.log('Guests data:', guestsData)
          setGuests(guestsData)
        } else {
          console.error('Failed to load guests')
        }

        if (hotelsResponse.ok) {
          const hotelsData = await hotelsResponse.json()
          console.log('Hotels data:', hotelsData)
          setHotels(hotelsData)
        } else {
          console.error('Failed to load hotels')
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading booking form...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug Booking Form</CardTitle>
        <CardDescription>
          Testing dropdown functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm mb-2">Guests loaded: {guests.length}</p>
          <Select value={selectedGuest} onValueChange={(value) => {
            console.log('Guest selected:', value)
            setSelectedGuest(value)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select a guest" />
            </SelectTrigger>
            <SelectContent>
              {guests.length === 0 ? (
                <SelectItem value="no-guests" disabled>No guests available</SelectItem>
              ) : (
                guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.firstName} {guest.lastName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="text-sm mb-2">Hotels loaded: {hotels.length}</p>
          <Select value={selectedHotel} onValueChange={(value) => {
            console.log('Hotel selected:', value)
            setSelectedHotel(value)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select a hotel" />
            </SelectTrigger>
            <SelectContent>
              {hotels.length === 0 ? (
                <SelectItem value="no-hotels" disabled>No hotels available</SelectItem>
              ) : (
                hotels.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4">
          <p className="text-sm">Selected Guest: {selectedGuest || 'None'}</p>
          <p className="text-sm">Selected Hotel: {selectedHotel || 'None'}</p>
        </div>

        <Button onClick={() => {
          console.log('Button clicked!')
          alert('Button is working!')
        }}>
          Test Button
        </Button>
      </CardContent>
    </Card>
  )
}