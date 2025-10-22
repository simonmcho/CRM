import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

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
    // Work with date strings to completely avoid timezone issues
    console.log('Received dates:', { checkIn, checkOut })

    // Calculate nights using string dates
    const checkInParts = checkIn.split('-').map(Number)
    const checkOutParts = checkOut.split('-').map(Number)

    const checkInMs = new Date(
      checkInParts[0],
      checkInParts[1] - 1,
      checkInParts[2]
    ).getTime()
    const checkOutMs = new Date(
      checkOutParts[0],
      checkOutParts[1] - 1,
      checkOutParts[2]
    ).getTime()
    const nights = Math.ceil((checkOutMs - checkInMs) / (1000 * 60 * 60 * 24))

    console.log('Date calculation:', { checkIn, checkOut, nights })

    const totalAmount = nights * room.roomType.basePrice

    const booking = await prisma.booking.create({
      data: {
        checkIn: new Date(checkIn + 'T12:00:00Z'), // Use noon UTC to avoid date shifts
        checkOut: new Date(checkOut + 'T12:00:00Z'), // Use noon UTC to avoid date shifts
        totalAmount,
        status: 'CONFIRMED', // Set status to CONFIRMED instead of default PENDING
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

    // Revalidate pages that show booking counts or booking data
    revalidatePath('/') // Dashboard page
    revalidatePath('/bookings') // Bookings list page

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
