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
  dailyRoomSelections?: Array<{ date: string; room: AvailableRoom | null }>
  onRoomSelect?: (
    room: AvailableRoom | null,
    date: string,
    enablePerDayMode?: boolean
  ) => void
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

function generateBookingPeriodDates(
  startDate: string,
  endDate: string
): string[] {
  const dates = []
  const start = new Date(startDate + 'T12:00:00Z') // Use noon UTC to avoid timezone shifts
  const end = new Date(endDate + 'T12:00:00Z')

  // Calculate the number of days in the booking period
  const diffTime = end.getTime() - start.getTime()
  const bookingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Show minimum 7 days, but if booking is longer, show the full period
  const daysToShow = Math.max(7, bookingDays)

  // Generate dates for the display period
  for (let i = 0; i < daysToShow; i++) {
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
  dailyRoomSelections = [],
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

  const bookingDates = useMemo(
    () => generateBookingPeriodDates(checkIn, checkOut),
    [checkIn, checkOut]
  )

  const checkWeekAvailability = useCallback(async () => {
    console.log('Checking week availability for:', {
      hotelId,
      checkIn,
      checkOut,
    })
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
            dates: bookingDates,
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
        dates: bookingDates,
        roomCount: sortedRooms.length,
        availability: dailyAvailability,
      }) // Transform the data into the expected format
      const results = sortedRooms.map((room) => {
        const days = bookingDates.map((date) => ({
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
  }, [hotelId, checkIn, checkOut, bookingDates])

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

    // If we're in per-day selection mode, allow individual cell selection
    if (dailyRoomSelections && dailyRoomSelections.length > 0) {
      console.log(`Per-day mode: selecting room ${room.number} for ${date}`)
      onRoomSelect?.(room, date)
      return
    }

    // Check if room is available for the entire booking period
    if (!isRoomAvailableForPeriod(room.id)) {
      console.log(
        `Room ${room.number} is not available for the entire booking period`
      )

      // Find which dates are unavailable for this room
      const roomData = roomAvailability.find((ra) => ra.room.id === room.id)
      const startDate = new Date(checkIn + 'T12:00:00Z')
      const endDate = new Date(checkOut + 'T12:00:00Z')

      const unavailableDates =
        roomData?.days
          .filter((day) => {
            const dayDate = new Date(day.date + 'T12:00:00Z')
            return dayDate >= startDate && dayDate < endDate && !day.available
          })
          .map((day) => day.date) || []

      const unavailableDatesFormatted = unavailableDates
        .map((date) => new Date(date + 'T12:00:00Z').toLocaleDateString())
        .join(', ')

      // Prompt user for day-by-day selection
      const userWantsPerDaySelection = confirm(
        `Room ${room.number} is not available for the following dates: ${unavailableDatesFormatted}.\n\nWould you like to select different rooms for specific days?`
      )

      if (userWantsPerDaySelection) {
        // Enable per-day selection mode by calling the parent with special flag
        onRoomSelect?.(room, date, true) // true indicates starting per-day selection mode
      }
      return
    }

    // If clicking on already selected room, unselect it
    if (selectedRoom === room.id) {
      setSelectedRoom(null)
      onRoomSelect?.(null, date)
      return
    }

    // Allow room selection only if available for entire period
    setSelectedRoom(room.id)
    onRoomSelect?.(room, date)
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

  // Check if a specific room is selected for a specific date in daily selections
  const isDailyRoomSelected = (roomId: string, date: string) => {
    if (dailyRoomSelections.length === 0) return false
    const selection = dailyRoomSelections.find((sel) => sel.date === date)
    return selection?.room?.id === roomId
  }

  // Calculate dynamic cell width based on number of days
  const calculateCellWidth = () => {
    const numDays = bookingDates.length
    if (numDays <= 7) {
      return 'w-[120px] min-w-[120px]' // Comfortable width for 7 days or less
    } else if (numDays <= 14) {
      return 'w-[90px] min-w-[90px]' // Medium width for 8-14 days
    } else if (numDays <= 21) {
      return 'w-[70px] min-w-[70px]' // Smaller width for 15-21 days
    } else {
      return 'w-[60px] min-w-[60px]' // Minimal width for more than 21 days
    }
  }

  const cellWidthClass = calculateCellWidth()

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Room Availability for Booking Period
          </CardTitle>
          <CardDescription>
            Availability from {formatDate(checkIn)} to{' '}
            {formatDate(checkOut)}{' '}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="mb-4 text-center text-muted-foreground">
              Loading room availability...
            </div>
          )}

          {roomAvailability.length > 0 && (
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-max border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-[140px] min-w-[140px] max-w-[140px] border-b bg-white p-2 text-left font-semibold">
                      Room
                    </th>
                    {bookingDates.map((date) => (
                      <th
                        key={date}
                        className={`${cellWidthClass} border-b p-1 text-center font-semibold`}
                      >
                        <div className="text-xs">{formatDate(date)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roomAvailability.map(({ room, days }) => (
                    <tr key={room.id} className="hover:bg-muted/50">
                      <td className="sticky left-0 z-10 w-[140px] min-w-[140px] max-w-[140px] border-b bg-white p-2">
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
                        const isDailySelected = isDailyRoomSelected(
                          room.id,
                          date
                        )
                        const isSelected = inBookingRange || isDailySelected

                        return (
                          <td
                            key={date}
                            className={`${cellWidthClass} border-b p-1`}
                          >
                            <button
                              onClick={() => {
                                handleCellClick(room, date, available)
                              }}
                              disabled={!available}
                              className={`
                                h-10 w-full rounded text-xs font-medium transition-colors
                                ${
                                  isSelected
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : !available
                                      ? 'cursor-not-allowed bg-red-100 text-red-800'
                                      : available
                                        ? 'cursor-pointer bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-gray-50 text-gray-600'
                                }
                              `}
                            >
                              {isSelected
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
