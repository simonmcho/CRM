import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        rooms: true,
        _count: {
          select: {
            rooms: true,
            bookings: true,
          },
        },
      },
    })

    return NextResponse.json(hotels)
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, phone, email, description } = body

    const hotel = await prisma.hotel.create({
      data: {
        name,
        address,
        phone,
        email,
        description,
      },
    })

    return NextResponse.json(hotel, { status: 201 })
  } catch (error) {
    console.error('Error creating hotel:', error)
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    )
  }
}
