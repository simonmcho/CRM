import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotelId, dates, roomIds } = body

    if (!hotelId || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: 'hotelId and dates array are required' },
        { status: 400 }
      )
    }

    // Get all pending/confirmed/checked-in bookings for the hotel that overlap with any of the dates
    const bookings = await prisma.booking.findMany({
      where: {
        hotelId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'], // Include PENDING bookings
        },
        ...(roomIds && { roomId: { in: roomIds } }),
        OR: dates.map((date: string) => {
          const dayStart = new Date(date + 'T12:00:00Z')
          const dayEnd = new Date(date + 'T12:00:00Z')
          dayEnd.setDate(dayEnd.getDate() + 1)

          return {
            AND: [{ checkIn: { lt: dayEnd } }, { checkOut: { gt: dayStart } }],
          }
        }),
      },
      select: {
        roomId: true,
        checkIn: true,
        checkOut: true,
        status: true,
      },
    })

    // Also check for ALL bookings to see if there are any with different statuses
    const allBookings = await prisma.booking.findMany({
      where: {
        hotelId,
        ...(roomIds && { roomId: { in: roomIds } }),
      },
      select: {
        roomId: true,
        checkIn: true,
        checkOut: true,
        status: true,
      },
    })

    console.log('Daily availability check:', {
      hotelId,
      dates,
      roomIds: roomIds?.slice(0, 3), // Log first 3 room IDs
      bookingsFound: bookings.length,
      allBookingsFound: allBookings.length,
      bookings: bookings.map((b) => ({
        roomId: b.roomId,
        checkIn: b.checkIn.toISOString().split('T')[0],
        checkOut: b.checkOut.toISOString().split('T')[0],
        status: b.status,
      })),
      allBookings: allBookings.map((b) => ({
        roomId: b.roomId,
        checkIn: b.checkIn.toISOString().split('T')[0],
        checkOut: b.checkOut.toISOString().split('T')[0],
        status: b.status,
      })),
    })

    // Create a map of room availability for each date
    const availability: Record<string, Record<string, boolean>> = {}

    dates.forEach((date: string) => {
      availability[date] = {}

      // If roomIds specified, check only those rooms, otherwise we'll need all rooms
      if (roomIds) {
        roomIds.forEach((roomId: string) => {
          const dayStart = new Date(date + 'T12:00:00Z')
          const dayEnd = new Date(date + 'T12:00:00Z')
          dayEnd.setDate(dayEnd.getDate() + 1)

          // Check if any booking conflicts with this day
          const hasConflict = bookings.some(
            (booking) =>
              booking.roomId === roomId &&
              booking.checkIn < dayEnd &&
              booking.checkOut > dayStart // Room is available ON checkout date
          )

          availability[date][roomId] = !hasConflict

          // Debug logging for specific cases
          if (
            roomId.includes('room21') ||
            bookings.some((b) => b.roomId === roomId)
          ) {
            console.log(`Room ${roomId} on ${date}:`, {
              hasConflict,
              available: !hasConflict,
              dayStart: dayStart.toISOString(),
              dayEnd: dayEnd.toISOString(),
              relevantBookings: bookings
                .filter((b) => b.roomId === roomId)
                .map((b) => ({
                  checkIn: b.checkIn.toISOString(),
                  checkOut: b.checkOut.toISOString(),
                })),
            })
          }
        })
      }
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error checking daily availability:', error)
    return NextResponse.json(
      { error: 'Failed to check daily availability' },
      { status: 500 }
    )
  }
}
