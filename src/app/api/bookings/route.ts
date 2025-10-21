import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: {
          include: {
            roomType: true,
          },
        },
        hotel: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkIn, checkOut, guestId, roomId, hotelId, notes } = body

    // Validate required fields
    if (!checkIn || !checkOut || !guestId || !roomId || !hotelId) {
      return NextResponse.json(
        { error: 'Check-in, check-out, guest, room, and hotel are required' },
        { status: 400 }
      )
    }

    // Get room type for pricing
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Calculate total amount (simple calculation: nights * base price)
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const totalAmount = nights * room.roomType.basePrice

    const booking = await prisma.booking.create({
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalAmount,
        guestId,
        roomId,
        hotelId,
        notes,
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true,
          },
        },
        hotel: true,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
