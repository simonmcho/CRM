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

interface DailyRoomSelection {
  date: string
  room: SelectedRoom | null
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
  const [dailyRoomSelections, setDailyRoomSelections] = useState<
    DailyRoomSelection[]
  >([])
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
    console.log('handleRoomSelect called with:', room)
    setSelectedRoom(room)
    console.log('selectedRoom state set to:', room)
    // Clear daily selections when a new room is selected
    setDailyRoomSelections([])
  }

  // Function to check room availability (simplified version)
  const checkRoomAvailabilityAndOfferAlternatives = async (roomId: string) => {
    // For now, we don't auto-check availability on room selection
    // This will be handled when the user submits the booking
    console.log('Room selected:', roomId)
  }

  const handleDateChange = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
    // Reset selected room and daily selections when dates change
    setSelectedRoom(null)
    setDailyRoomSelections([])
  }

  // Initialize daily room selections when switching to per-day mode
  const initializeDailySelections = (unavailableDates: string[]) => {
    const dateRange = generateDateRange(checkIn, checkOut)
    const dailySelections: DailyRoomSelection[] = dateRange.map((date) => ({
      date,
      room: unavailableDates.includes(date) ? null : selectedRoom,
    }))
    setDailyRoomSelections(dailySelections)
  }

  // Update a specific day's room selection
  const updateDailyRoomSelection = (
    date: string,
    room: SelectedRoom | null
  ) => {
    setDailyRoomSelections((prev) =>
      prev.map((selection) =>
        selection.date === date ? { ...selection, room } : selection
      )
    )
  }

  // Handle individual cell clicks for per-day room selection
  const handleCellRoomSelect = (
    room: SelectedRoom | null,
    date: string,
    enablePerDayMode?: boolean
  ) => {
    console.log('Cell clicked:', { room: room?.number, date, enablePerDayMode })

    if (enablePerDayMode) {
      // User wants to enable per-day selection mode
      console.log('Enabling per-day selection mode')

      // Initialize daily selections for the date range
      const dateRange = generateDateRange(checkIn, checkOut)
      const dailySelections: DailyRoomSelection[] = dateRange.map(
        (rangeDate) => ({
          date: rangeDate,
          room: rangeDate === date ? room : null, // Set the clicked room for the clicked date
        })
      )

      setDailyRoomSelections(dailySelections)
      setSelectedRoom(null) // Clear single room selection when entering per-day mode

      // Show user guidance
      alert(
        'Per-day selection mode enabled. You can now click on individual cells to select different rooms for each day.'
      )
      return
    }

    // If we're in per-day mode, handle individual day selection
    if (dailyRoomSelections.length > 0) {
      updateDailyRoomSelection(date, room)
      return
    }

    // Normal single room selection
    handleRoomSelect(room)
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
    if (dailyRoomSelections.length > 0) {
      return dailyRoomSelections.reduce(
        (total, selection) => total + (selection.room?.roomType.basePrice || 0),
        0
      )
    }
    if (!selectedRoom) return 0
    const nights = calculateNights()
    return selectedRoom.roomType.basePrice * nights
  }

  // Check if selected room is available for the entire booking period
  const checkRoomAvailabilityForPeriod = async (
    roomId: string
  ): Promise<{
    available: boolean
    unavailableDates: string[]
    alternativeRooms: { [date: string]: SelectedRoom[] }
  }> => {
    if (!checkIn || !checkOut || !selectedHotel) {
      return { available: false, unavailableDates: [], alternativeRooms: {} }
    }

    try {
      // Get all rooms for the hotel
      const roomsResponse = await fetch(`/api/rooms?hotelId=${selectedHotel}`)
      if (!roomsResponse.ok) {
        return { available: false, unavailableDates: [], alternativeRooms: {} }
      }
      const allRooms: SelectedRoom[] = await roomsResponse.json()

      const dateRange = generateDateRange(checkIn, checkOut)
      const allRoomIds = allRooms.map((room) => room.id)

      const response = await fetch('/api/rooms/daily-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: selectedHotel,
          dates: dateRange,
          roomIds: allRoomIds,
        }),
      })

      if (!response.ok) {
        return { available: false, unavailableDates: [], alternativeRooms: {} }
      }

      const availability = await response.json()
      const unavailableDates: string[] = []
      const alternativeRooms: { [date: string]: SelectedRoom[] } = {}

      // Check each date in the booking period
      for (const date of dateRange) {
        const isSelectedRoomAvailable = availability[date]?.[roomId]

        if (!isSelectedRoomAvailable) {
          unavailableDates.push(date)
        }

        // Find alternative rooms for each date
        const availableRoomsForDate = allRooms.filter(
          (room) => room.id !== roomId && availability[date]?.[room.id]
        )
        alternativeRooms[date] = availableRoomsForDate
      }

      return {
        available: unavailableDates.length === 0,
        unavailableDates,
        alternativeRooms,
      }
    } catch (error) {
      console.error('Error checking room availability:', error)
      return { available: false, unavailableDates: [], alternativeRooms: {} }
    }
  }

  // Helper function to generate date range
  const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates = []
    const start = new Date(startDate + 'T12:00:00Z')
    const end = new Date(endDate + 'T12:00:00Z')

    while (start < end) {
      dates.push(start.toISOString().split('T')[0])
      start.setUTCDate(start.getUTCDate() + 1)
    }

    return dates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Detailed validation with specific error messages
    if (!selectedGuest) {
      alert('Please select a guest for the booking.')
      return
    }

    if (!selectedHotel) {
      alert('Please select a hotel for the booking.')
      return
    }

    if (!checkIn) {
      alert('Please select a check-in date.')
      return
    }

    if (!checkOut) {
      alert('Please select a check-out date.')
      return
    }

    // Validate date logic
    const checkInDate = new Date(checkIn + 'T12:00:00Z')
    const checkOutDate = new Date(checkOut + 'T12:00:00Z')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      alert('Check-in date cannot be in the past.')
      return
    }

    if (checkOutDate <= checkInDate) {
      alert('Check-out date must be after the check-in date.')
      return
    }

    // Check if we're using per-day selections or single room selection
    if (dailyRoomSelections.length > 0) {
      console.log('Using per-day selections, validating...')
      // Validate that all days have room selections
      const missingDays = dailyRoomSelections.filter(
        (selection) => !selection.room
      )
      if (missingDays.length > 0) {
        const missingDatesFormatted = missingDays
          .map((selection) =>
            new Date(selection.date + 'T12:00:00Z').toLocaleDateString()
          )
          .join(', ')
        alert(
          `Please select rooms for the following dates: ${missingDatesFormatted}`
        )
        return
      }

      // Show confirmation dialog for per-day booking
      setShowConfirmation(true)
      return
    }

    if (!selectedRoom) {
      alert('Please select a room for your booking.')
      return
    }

    // Check if the selected room is available for the entire date range
    console.log('Checking room availability before booking...')
    try {
      const availability = await checkRoomAvailabilityForPeriod(selectedRoom.id)
      if (!availability.available) {
        if (availability.unavailableDates.length > 0) {
          const unavailableDatesFormatted = availability.unavailableDates
            .map((date) => new Date(date + 'T12:00:00Z').toLocaleDateString())
            .join(', ')
          alert(
            `This room is not available for the following dates: ${unavailableDatesFormatted}. Please select a different room or change your dates.`
          )
        } else {
          alert(
            'This room is not available for your selected dates. Please select a different room or change your dates.'
          )
        }
        return
      }
    } catch (error) {
      console.error('Error checking room availability:', error)
      alert('Error checking room availability. Please try again.')
      return
    }

    // Show confirmation dialog
    setShowConfirmation(true)
  }

  const handleCancelBooking = () => {
    console.log('handleCancelBooking called')
    setShowConfirmation(false)
    // Clear selections when canceling
    setSelectedRoom(null)
    setDailyRoomSelections([])
  }

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    setShowConfirmation(false)

    try {
      // Handle per-day bookings differently
      if (dailyRoomSelections.length > 0) {
        // For per-day bookings, create multiple bookings - one for each day
        const bookingPromises = dailyRoomSelections.map(async (selection) => {
          const nextDay = new Date(selection.date + 'T12:00:00Z')
          nextDay.setUTCDate(nextDay.getUTCDate() + 1)

          const bookingData = {
            guestId: selectedGuest,
            hotelId: selectedHotel,
            roomId: selection.room!.id,
            checkIn: selection.date,
            checkOut: nextDay.toISOString().split('T')[0],
            totalAmount: selection.room!.roomType.basePrice,
            notes: notes.trim() || undefined,
            status: 'CONFIRMED',
          }

          return fetch('/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
          })
        })

        const responses = await Promise.all(bookingPromises)
        const failedBookings = responses.filter((response) => !response.ok)

        if (failedBookings.length > 0) {
          const errorData = await failedBookings[0].json()
          alert(
            `Error creating bookings: ${errorData.error || 'Unknown error'}`
          )
          return
        }
      } else {
        // Standard single-room booking
        const bookingData = {
          guestId: selectedGuest,
          hotelId: selectedHotel,
          roomId: selectedRoom!.id,
          checkIn: checkIn,
          checkOut: checkOut,
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

        if (!response.ok) {
          const errorData = await response.json()
          alert(`Error creating booking: ${errorData.error || 'Unknown error'}`)
          return
        }
      }

      // Reset form
      setSelectedGuest('')
      setSelectedHotel('')
      setSelectedRoom(null)
      setDailyRoomSelections([])
      setCheckIn('')
      setCheckOut('')
      setNotes('')

      alert('Booking created successfully!')
      onBookingAdded?.()
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Error creating booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-none space-y-6">
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
            dailyRoomSelections={dailyRoomSelections}
            onDateChange={handleDateChange}
            onRoomSelect={handleCellRoomSelect}
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
        {(selectedRoom || dailyRoomSelections.length > 0) &&
          checkIn &&
          checkOut && (
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
                    <div className="text-right font-medium">
                      {dailyRoomSelections.length > 0 ? (
                        <div className="space-y-1">
                          {dailyRoomSelections.map((selection) => (
                            <div key={selection.date} className="text-sm">
                              {new Date(
                                selection.date + 'T12:00:00Z'
                              ).toLocaleDateString()}
                              : Room {selection.room?.number} (
                              {selection.room?.roomType.name})
                            </div>
                          ))}
                        </div>
                      ) : (
                        `${selectedRoom?.number} (${selectedRoom?.roomType.name})`
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Dates:</span>
                    <span className="font-medium">
                      {checkIn} to {checkOut} (
                      {dailyRoomSelections.length > 0
                        ? dailyRoomSelections.length
                        : calculateNights()}{' '}
                      nights)
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
            isSubmitting ||
            !selectedGuest ||
            !selectedHotel ||
            (!selectedRoom && dailyRoomSelections.length === 0)
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
                <div className="text-muted-foreground">
                  {dailyRoomSelections.length > 0 ? (
                    <div className="space-y-1">
                      {dailyRoomSelections.map((selection) => (
                        <div key={selection.date} className="text-xs">
                          {new Date(
                            selection.date + 'T12:00:00Z'
                          ).toLocaleDateString()}
                          : Room {selection.room?.number} (
                          {selection.room?.roomType.name})
                        </div>
                      ))}
                    </div>
                  ) : (
                    `${selectedRoom?.number} (${selectedRoom?.roomType.name})`
                  )}
                </div>
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
                <div className="text-muted-foreground">
                  {dailyRoomSelections.length > 0 ? (
                    <div className="space-y-1">
                      {dailyRoomSelections.map((selection) => (
                        <div key={selection.date} className="text-xs">
                          {new Date(
                            selection.date + 'T12:00:00Z'
                          ).toLocaleDateString()}
                          : ${selection.room?.roomType.basePrice}/night
                        </div>
                      ))}
                    </div>
                  ) : (
                    `$${selectedRoom?.roomType.basePrice}/night`
                  )}
                </div>
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
