'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bed, Users, Calendar } from 'lucide-react'

interface AvailableRoom {
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

interface AvailabilitySummary {
  roomType: {
    id: string
    name: string
    basePrice: number
    maxOccupancy: number
  }
  availableCount: number
  rooms: AvailableRoom[]
}

interface RoomAvailabilityCheckProps {
  hotelId: string
  checkIn?: string
  checkOut?: string
  onDateChange?: (checkIn: string, checkOut: string) => void
  onRoomSelect?: (room: AvailableRoom) => void
}

export function RoomAvailabilityCheck({ 
  hotelId, 
  checkIn: externalCheckIn = '',
  checkOut: externalCheckOut = '',
  onDateChange,
  onRoomSelect 
}: RoomAvailabilityCheckProps) {
  const [checkIn, setCheckIn] = useState(externalCheckIn)
  const [checkOut, setCheckOut] = useState(externalCheckOut)
  const [availability, setAvailability] = useState<AvailabilitySummary[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null)

  // Update local state when external props change
  useEffect(() => {
    setCheckIn(externalCheckIn)
    setCheckOut(externalCheckOut)
  }, [externalCheckIn, externalCheckOut])

  const handleDateChange = (type: 'checkIn' | 'checkOut', value: string) => {
    if (type === 'checkIn') {
      setCheckIn(value)
      onDateChange?.(value, checkOut)
    } else {
      setCheckOut(value)
      onDateChange?.(checkIn, value)
    }
  }

  const checkAvailability = async () => {
    if (!checkIn || !checkOut) return

    setLoading(true)
    try {
      const response = await fetch('/api/rooms/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId,
          checkIn,
          checkOut,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAvailability(data)
      } else {
        console.error('Failed to check availability')
        setAvailability([])
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailability([])
    } finally {
      setLoading(false)
    }
  }

  const handleRoomSelect = (room: AvailableRoom) => {
    setSelectedRoom(room)
    onRoomSelect?.(room)
  }

  // Calculate total nights and price
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Check Availability
          </CardTitle>
          <CardDescription>
            Select your check-in and check-out dates to see available rooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="checkIn">Check-in Date</Label>
              <Input
                id="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => handleDateChange('checkIn', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="checkOut">Check-out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => handleDateChange('checkOut', e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <Button 
            onClick={checkAvailability} 
            disabled={!checkIn || !checkOut || loading}
            className="w-full"
          >
            {loading ? 'Checking Availability...' : 'Check Availability'}
          </Button>
        </CardContent>
      </Card>

      {/* Availability Results */}
      {availability.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Rooms</CardTitle>
            <CardDescription>
              {nights > 0 && `${nights} night${nights > 1 ? 's' : ''} - ${checkIn} to ${checkOut}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availability.map((summary) => (
                <div key={summary.roomType.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{summary.roomType.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Max {summary.roomType.maxOccupancy} guests
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {summary.availableCount} available
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${summary.roomType.basePrice}/night
                      </div>
                      {nights > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Total: ${summary.roomType.basePrice * nights}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Individual Room Selection */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Select a specific room:</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {summary.rooms.map((room) => (
                        <Button
                          key={room.id}
                          variant={selectedRoom?.id === room.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleRoomSelect(room)}
                          className="justify-start"
                        >
                          <div className="flex flex-col items-start">
                            <span>Room {room.number}</span>
                            {room.floor && (
                              <span className="text-xs opacity-70">Floor {room.floor}</span>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Room Summary */}
      {selectedRoom && nights > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Selected Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Room {selectedRoom.number}</h3>
                <p className="text-sm text-muted-foreground">{selectedRoom.roomType.name}</p>
                <p className="text-sm text-muted-foreground">
                  {checkIn} to {checkOut} ({nights} night{nights > 1 ? 's' : ''})
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">
                  ${selectedRoom.roomType.basePrice * nights}
                </div>
                <p className="text-sm text-muted-foreground">
                  ${selectedRoom.roomType.basePrice} × {nights} nights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Availability Message */}
      {availability.length === 0 && checkIn && checkOut && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No rooms available for the selected dates. Please try different dates.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}