import { NextRequest, NextResponse } from 'next/server'
import { RoomAvailabilityService } from '@/lib/room-availability'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotelId')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const roomTypeId = searchParams.get('roomTypeId')

    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'hotelId, checkIn, and checkOut are required' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: 'Check-in date must be before check-out date' },
        { status: 400 }
      )
    }

    if (checkInDate < new Date()) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      )
    }

    const availableRooms = await RoomAvailabilityService.getAvailableRooms({
      hotelId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      roomTypeId: roomTypeId || undefined
    })

    return NextResponse.json(availableRooms)
  } catch (error) {
    console.error('Error checking room availability:', error)
    return NextResponse.json(
      { error: 'Failed to check room availability' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotelId, checkIn, checkOut } = body

    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'hotelId, checkIn, and checkOut are required' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    const availabilitySummary = await RoomAvailabilityService.getAvailabilitySummary({
      hotelId,
      checkIn: checkInDate,
      checkOut: checkOutDate
    })

    return NextResponse.json(availabilitySummary)
  } catch (error) {
    console.error('Error getting availability summary:', error)
    return NextResponse.json(
      { error: 'Failed to get availability summary' },
      { status: 500 }
    )
  }
}