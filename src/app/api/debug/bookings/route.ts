import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotelId')

    const whereClause = hotelId ? { hotelId } : {}

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        room: {
          select: {
            number: true,
          },
        },
        guest: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        checkIn: 'asc',
      },
    })

    return NextResponse.json({
      count: bookings.length,
      bookings: bookings.map((booking) => ({
        id: booking.id,
        roomNumber: booking.room.number,
        guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        checkIn: booking.checkIn.toISOString().split('T')[0],
        checkOut: booking.checkOut.toISOString().split('T')[0],
        status: booking.status,
      })),
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
