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
import { Bed, Users } from 'lucide-react'
import { RoomAvailabilityTable } from '@/components/room-availability-table'

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
  selectedRoom?: AvailableRoom | null
  onDateChange?: (checkIn: string, checkOut: string) => void
  onRoomSelect?: (room: AvailableRoom | null) => void
}

export function RoomAvailabilityCheck({
  hotelId,
  checkIn: externalCheckIn = '',
  checkOut: externalCheckOut = '',
  selectedRoom: externalSelectedRoom = null,
  onDateChange,
  onRoomSelect,
}: RoomAvailabilityCheckProps) {
  const [checkIn, setCheckIn] = useState(externalCheckIn)
  const [checkOut, setCheckOut] = useState(externalCheckOut)
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(
    externalSelectedRoom
  )

  // Update local state when external props change
  useEffect(() => {
    setCheckIn(externalCheckIn)
    setCheckOut(externalCheckOut)
  }, [externalCheckIn, externalCheckOut])

  // Update selected room when external prop changes
  useEffect(() => {
    setSelectedRoom(externalSelectedRoom)
  }, [externalSelectedRoom])

  const handleRoomSelect = (room: AvailableRoom) => {}

  // Calculate total nights and price
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn + 'T12:00:00Z')
    const end = new Date(checkOut + 'T12:00:00Z')
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  return (
    <div className="space-y-6">
      {/* Table View - Show automatically when both dates are selected */}
      {checkIn && checkOut && (
        <RoomAvailabilityTable
          hotelId={hotelId}
          checkIn={checkIn}
          checkOut={checkOut}
          selectedRoom={selectedRoom?.id || null}
          onRoomSelect={(room, date) => {
            console.log('Selected room:', room, 'for date:', date)
            setSelectedRoom(room)
            onRoomSelect?.(room)
          }}
        />
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
                <p className="text-sm text-muted-foreground">
                  {selectedRoom.roomType.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {checkIn} to {checkOut} ({nights} night{nights > 1 ? 's' : ''}
                  )
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
    </div>
  )
}
