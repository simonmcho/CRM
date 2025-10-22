'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

interface RoomAvailabilityTableProps {
  hotelId: string
  checkIn: string
  checkOut: string
  selectedRoom?: string | null
  onRoomSelect?: (room: AvailableRoom | null, date: string) => void
}

interface DayAvailability {
  date: string
  available: boolean
  rooms: AvailableRoom[]
}

interface RoomWeekAvailability {
  room: AvailableRoom
  days: DayAvailability[]
}

function generateWeekDates(startDate: string): string[] {
  const dates = []
  const start = new Date(startDate + 'T12:00:00Z') // Use noon UTC to avoid timezone shifts

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + i) // Use UTC date methods
    dates.push(date.toISOString().split('T')[0])
  }

  return dates
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00Z') // Use noon UTC to avoid timezone shifts
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function RoomAvailabilityTable({
  hotelId,
  checkIn,
  checkOut,
  selectedRoom: externalSelectedRoom = null,
  onRoomSelect,
}: RoomAvailabilityTableProps) {
  const [roomAvailability, setRoomAvailability] = useState<
    RoomWeekAvailability[]
  >([])
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(
    externalSelectedRoom
  )
  const [hasLoaded, setHasLoaded] = useState(false)

  // Sync internal selectedRoom state with external prop
  useEffect(() => {
    setSelectedRoom(externalSelectedRoom)
  }, [externalSelectedRoom])

  const weekDates = useMemo(() => generateWeekDates(checkIn), [checkIn])

  const checkWeekAvailability = useCallback(async () => {
    if (!hotelId || !checkIn || !checkOut) return

    setLoading(true)
    try {
      // Get all rooms for the hotel first
      const roomsResponse = await fetch(`/api/rooms?hotelId=${hotelId}`)
      if (!roomsResponse.ok) throw new Error('Failed to fetch rooms')

      const allRooms: AvailableRoom[] = await roomsResponse.json()

      // Sort rooms by room number (numbered rooms first, then lettered rooms)
      const sortedRooms = allRooms.sort((a, b) => {
        const roomA = a.number
        const roomB = b.number

        // Check if rooms are purely numeric
        const isNumericA = /^\d+$/.test(roomA)
        const isNumericB = /^\d+$/.test(roomB)

        // If one is numeric and one isn't, numeric comes first
        if (isNumericA && !isNumericB) return -1
        if (!isNumericA && isNumericB) return 1

        // If both are numeric, sort numerically
        if (isNumericA && isNumericB) {
          return parseInt(roomA) - parseInt(roomB)
        }

        // If both are non-numeric, sort alphabetically
        return roomA.localeCompare(roomB)
      })

      // Check availability for each date in the week
      const roomIds = sortedRooms.map((room) => room.id)

      // Get daily availability for all rooms and dates at once
      const dailyAvailabilityResponse = await fetch(
        '/api/rooms/daily-availability',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hotelId,
            dates: weekDates,
            roomIds,
          }),
        }
      )

      if (!dailyAvailabilityResponse.ok) {
        throw new Error('Failed to fetch daily availability')
      }

      const dailyAvailability = await dailyAvailabilityResponse.json()

      console.log('Daily availability response:', {
        hotelId,
        dates: weekDates,
        roomCount: sortedRooms.length,
        availability: dailyAvailability,
      })

      // Transform the data into the expected format
      const results = sortedRooms.map((room) => {
        const days = weekDates.map((date) => ({
          date,
          available: dailyAvailability[date]?.[room.id] ?? false,
          rooms: dailyAvailability[date]?.[room.id] ? [room] : [],
        }))

        return { room, days }
      })
      setRoomAvailability(results)
      setHasLoaded(true)
    } catch (error) {
      console.error('Error checking week availability:', error)
    } finally {
      setLoading(false)
    }
  }, [hotelId, checkIn, checkOut, weekDates])

  // Automatically load data when component mounts or props change
  useEffect(() => {
    if (hotelId && checkIn && checkOut) {
      setHasLoaded(false)
      checkWeekAvailability()
    }
  }, [hotelId, checkIn, checkOut, checkWeekAvailability])

  const handleCellClick = (
    room: AvailableRoom,
    date: string,
    available: boolean
  ) => {
    if (!available) return // Can't select unavailable cells

    // If clicking on already selected room, unselect it
    if (selectedRoom === room.id) {
      setSelectedRoom(null)
      onRoomSelect?.(null, date)
      return
    }

    // Check if room is available for the entire booking period
    const roomAvailableForPeriod = isRoomAvailableForPeriod(room.id)
    if (roomAvailableForPeriod) {
      setSelectedRoom(room.id)
      onRoomSelect?.(room, date)
    }
  }

  // Check if a cell should be highlighted as part of the booking range
  const isCellInBookingRange = (roomId: string, date: string) => {
    if (selectedRoom !== roomId) return false

    const cellDate = new Date(date + 'T12:00:00Z')
    const startDate = new Date(checkIn + 'T12:00:00Z')
    const endDate = new Date(checkOut + 'T12:00:00Z')

    return cellDate >= startDate && cellDate < endDate
  }

  // Check if a room is available for the entire booking period
  const isRoomAvailableForPeriod = (roomId: string) => {
    const roomData = roomAvailability.find((ra) => ra.room.id === roomId)
    if (!roomData) return false

    const startDate = new Date(checkIn + 'T12:00:00Z')
    const endDate = new Date(checkOut + 'T12:00:00Z')

    return roomData.days.every((day) => {
      const dayDate = new Date(day.date + 'T12:00:00Z')
      // Only check dates within the booking period
      if (dayDate >= startDate && dayDate < endDate) {
        return day.available
      }
      return true // Don't care about dates outside the booking period
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Room Availability
          </CardTitle>
          <CardDescription>
            Check availability for the week starting from {formatDate(checkIn)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="mb-4 text-center text-muted-foreground">
              Loading room availability...
            </div>
          )}

          {roomAvailability.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="min-w-[120px] border-b p-3 text-left font-semibold">
                      Room
                    </th>
                    {weekDates.map((date) => (
                      <th
                        key={date}
                        className="min-w-[100px] border-b p-3 text-center font-semibold"
                      >
                        <div className="text-sm">{formatDate(date)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roomAvailability.map(({ room, days }) => (
                    <tr key={room.id} className="hover:bg-muted/50">
                      <td className="border-b p-3">
                        <div>
                          <div className="font-medium">Room {room.number}</div>
                          <div className="text-sm text-muted-foreground">
                            {room.roomType.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {room.roomType.maxOccupancy} guests
                          </div>
                          <div className="text-xs font-medium text-green-600">
                            ${room.roomType.basePrice}/night
                          </div>
                        </div>
                      </td>
                      {days.map(({ date, available }) => {
                        const inBookingRange = isCellInBookingRange(
                          room.id,
                          date
                        )

                        return (
                          <td key={date} className="border-b p-1">
                            <button
                              onClick={() => {
                                console.log('Cell clicked:', {
                                  roomId: room.id,
                                  date,
                                  available,
                                  isSelected: selectedRoom === room.id,
                                })
                                handleCellClick(room, date, available)
                              }}
                              disabled={!available}
                              className={`
                                h-12 w-full rounded text-xs font-medium transition-colors
                                ${
                                  inBookingRange
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : !available
                                      ? 'cursor-not-allowed bg-red-100 text-red-800'
                                      : available
                                        ? 'cursor-pointer bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-gray-50 text-gray-600'
                                }
                              `}
                            >
                              {inBookingRange
                                ? 'Selected'
                                : !available
                                  ? 'Booked'
                                  : available
                                    ? 'Available'
                                    : '-'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedRoom && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-900">Selected Room</h4>
              <p className="text-sm text-blue-700">
                Room{' '}
                {
                  roomAvailability.find((ra) => ra.room.id === selectedRoom)
                    ?.room.number
                }
                from {formatDate(checkIn)} to {formatDate(checkOut)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
