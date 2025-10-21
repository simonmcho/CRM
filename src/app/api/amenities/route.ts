import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: {
        price: 'asc',
      },
    })

    return NextResponse.json(amenities)
  } catch (error) {
    console.error('Error fetching amenities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch amenities' },
      { status: 500 }
    )
  }
}
