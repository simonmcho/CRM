import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        beds: {
          include: {
            bedType: true,
          },
        },
        rooms: {
          include: {
            hotel: true,
          },
        },
      },
      orderBy: {
        basePrice: 'asc',
      },
    })

    return NextResponse.json(roomTypes)
  } catch (error) {
    console.error('Error fetching room types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room types' },
      { status: 500 }
    )
  }
}
