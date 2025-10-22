import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotelId')

    const whereClause = hotelId ? { hotelId } : {}

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        hotel: true,
        roomType: true,
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'], // Include PENDING bookings
            },
          },
        },
      },
    })

    // Sort rooms by room number (numbered rooms first, then lettered rooms)
    const sortedRooms = rooms.sort((a, b) => {
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

    return NextResponse.json(sortedRooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { number, floor, hotelId, roomTypeId } = body

    const room = await prisma.room.create({
      data: {
        number,
        floor,
        hotelId,
        roomTypeId,
      },
      include: {
        hotel: true,
        roomType: true,
      },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
