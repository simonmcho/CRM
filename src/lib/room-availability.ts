import { prisma } from '@/lib/prisma'

interface AvailabilityQuery {
  hotelId: string
  checkIn: Date
  checkOut: Date
  roomTypeId?: string
}

interface AvailableRoom {
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

export class RoomAvailabilityService {
  /**
   * Get all available rooms for a hotel within a date range
   */
  static async getAvailableRooms({
    hotelId,
    checkIn,
    checkOut,
    roomTypeId,
  }: AvailabilityQuery): Promise<AvailableRoom[]> {
    try {
      // First, get all rooms for the hotel (optionally filtered by room type)
      const allRooms = await prisma.room.findMany({
        where: {
          hotelId,
          ...(roomTypeId && { roomTypeId }),
          status: 'AVAILABLE', // Only consider rooms that are not out of service
        },
        include: {
          roomType: {
            select: {
              id: true,
              name: true,
              basePrice: true,
              maxOccupancy: true,
            },
          },
        },
      })

      // Get all bookings that overlap with the requested date range
      const overlappingBookings = await prisma.booking.findMany({
        where: {
          hotelId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'], // Consider all active bookings including pending
          },
          OR: [
            // Booking starts during our stay
            {
              checkIn: {
                gte: checkIn,
                lt: checkOut,
              },
            },
            // Booking ends during our stay (but room is available on checkout date)
            {
              checkOut: {
                gt: checkIn,
                lt: checkOut, // Changed from lte to lt - room available on checkout date
              },
            },
            // Booking completely encompasses our stay
            {
              checkIn: {
                lte: checkIn,
              },
              checkOut: {
                gt: checkOut, // Changed from gte to gt - room available on checkout date
              },
            },
          ],
        },
        select: {
          roomId: true,
        },
      })

      // Get the room IDs that are booked
      const bookedRoomIds = new Set(
        overlappingBookings.map((booking) => booking.roomId)
      )

      // Filter out booked rooms
      const availableRooms = allRooms.filter(
        (room) => !bookedRoomIds.has(room.id)
      )

      return availableRooms
    } catch (error) {
      console.error('Error checking room availability:', error)
      return []
    }
  }

  /**
   * Get availability summary by room type
   */
  static async getAvailabilitySummary({
    hotelId,
    checkIn,
    checkOut,
  }: Omit<AvailabilityQuery, 'roomTypeId'>) {
    try {
      const availableRooms = await this.getAvailableRooms({
        hotelId,
        checkIn,
        checkOut,
      })

      // Group by room type
      const availabilityByType = availableRooms.reduce(
        (acc, room) => {
          const typeId = room.roomType.id
          if (!acc[typeId]) {
            acc[typeId] = {
              roomType: room.roomType,
              availableCount: 0,
              rooms: [],
            }
          }
          acc[typeId].availableCount++
          acc[typeId].rooms.push(room)
          return acc
        },
        {} as Record<
          string,
          {
            roomType: AvailableRoom['roomType']
            availableCount: number
            rooms: AvailableRoom[]
          }
        >
      )

      return Object.values(availabilityByType)
    } catch (error) {
      console.error('Error getting availability summary:', error)
      return []
    }
  }

  /**
   * Check if a specific room is available for the given dates
   */
  static async isRoomAvailable({
    roomId,
    checkIn,
    checkOut,
  }: {
    roomId: string
    checkIn: Date
    checkOut: Date
  }): Promise<boolean> {
    try {
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          roomId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
          },
          OR: [
            {
              checkIn: {
                gte: checkIn,
                lt: checkOut,
              },
            },
            {
              checkOut: {
                gt: checkIn,
                lt: checkOut, // Changed from lte to lt - room available on checkout date
              },
            },
            {
              checkIn: {
                lte: checkIn,
              },
              checkOut: {
                gt: checkOut, // Changed from gte to gt - room available on checkout date
              },
            },
          ],
        },
      })

      return !conflictingBooking
    } catch (error) {
      console.error('Error checking room availability:', error)
      return false
    }
  }

  /**
   * Get total room counts by type for a hotel
   */
  static async getRoomInventory(hotelId: string) {
    try {
      const roomCounts = await prisma.room.groupBy({
        by: ['roomTypeId'],
        where: {
          hotelId,
          status: 'AVAILABLE',
        },
        _count: {
          id: true,
        },
      })

      const roomTypesWithCounts = await Promise.all(
        roomCounts.map(async (count) => {
          const roomType = await prisma.roomType.findUnique({
            where: { id: count.roomTypeId },
            select: {
              id: true,
              name: true,
              basePrice: true,
              maxOccupancy: true,
            },
          })
          return {
            ...roomType,
            totalRooms: count._count.id,
          }
        })
      )

      return roomTypesWithCounts.filter(Boolean)
    } catch (error) {
      console.error('Error getting room inventory:', error)
      return []
    }
  }
}
