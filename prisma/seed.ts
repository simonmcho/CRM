import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create bed types
  const queenBed = await prisma.bedType.create({
    data: { name: 'queen' },
  })

  const doubleBed = await prisma.bedType.create({
    data: { name: 'double' },
  })

  const kingBed = await prisma.bedType.create({
    data: { name: 'king' },
  })

  // Create amenities
  const wifiAmenity = await prisma.amenity.create({
    data: {
      name: 'High-Speed WiFi',
      price: 0.0,
      notes: 'Complimentary high-speed internet access',
    },
  })

  const cableTvAmenity = await prisma.amenity.create({
    data: {
      name: 'Cable TV',
      price: 0.0,
      notes: 'Access to cable channels',
    },
  })

  // Create room types with bed configurations
  const oneQueenNoKitchen = await prisma.roomType.create({
    data: {
      name: '1 Queen Room',
      description: '',
      basePrice: 120.0,
      maxOccupancy: 2,
      numberOfCouches: 1,
      hasStove: false,
      hasMicrowave: true,
      hasSink: false,
      hasFridge: false,
      hasMiniFridge: true,
      beds: {
        create: [
          {
            bedType: { connect: { id: queenBed.id } },
            quantity: 1,
          },
        ],
      },
    },
  })

  const twoQueenNoKitchen = await prisma.roomType.create({
    data: {
      name: '2 Queen Room',
      description: '',
      basePrice: 140.0,
      maxOccupancy: 4,
      numberOfCouches: 1,
      hasStove: false,
      hasMicrowave: true,
      hasSink: false,
      hasFridge: false,
      hasMiniFridge: true,
      beds: {
        create: [
          {
            bedType: { connect: { id: queenBed.id } },
            quantity: 1,
          },
        ],
      },
    },
  })

  const oneQueenKitchen = await prisma.roomType.create({
    data: {
      name: '1 Queen Kitchen Room',
      description: '',
      basePrice: 140.0,
      maxOccupancy: 2,
      numberOfCouches: 1,
      hasStove: true,
      hasMicrowave: true,
      hasSink: true,
      hasFridge: true,
      hasMiniFridge: false,
      beds: {
        create: [
          {
            bedType: { connect: { id: queenBed.id } },
            quantity: 1,
          },
        ],
      },
    },
  })

  const twoQueenKitchen = await prisma.roomType.create({
    data: {
      name: '2 Queen Kitchen Room',
      description: '',
      basePrice: 140.0,
      maxOccupancy: 4,
      numberOfCouches: 1,
      hasStove: true,
      hasMicrowave: true,
      hasSink: true,
      hasFridge: true,
      hasMiniFridge: false,
      beds: {
        create: [
          {
            bedType: { connect: { id: queenBed.id } },
            quantity: 2,
          },
        ],
      },
    },
  })

  const oneDoubleNoKitchen = await prisma.roomType.create({
    data: {
      name: '1 Double Room',
      description: '',
      basePrice: 110.0,
      maxOccupancy: 2,
      numberOfCouches: 1,
      hasStove: false,
      hasMicrowave: true,
      hasSink: false,
      hasFridge: false,
      hasMiniFridge: true,
      beds: {
        create: [
          {
            bedType: { connect: { id: doubleBed.id } },
            quantity: 1,
          },
        ],
      },
    },
  })

  const twoDoubleKitchen = await prisma.roomType.create({
    data: {
      name: '2 Double Kitchen Room',
      description: '',
      basePrice: 140.0,
      maxOccupancy: 4,
      numberOfCouches: 1,
      hasStove: true,
      hasMicrowave: true,
      hasSink: true,
      hasFridge: true,
      hasMiniFridge: false,
      beds: {
        create: [
          {
            bedType: { connect: { id: doubleBed.id } },
            quantity: 2,
          },
        ],
      },
    },
  })

  // Create a hotel
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Copper River Motel',
      address: '4113 BC-16, Terrace, BC V8G 1J7',
      phone: '1-250-635-6124',
      email: 'happy@copperrivermotel.com',
      description: 'Hotel in Terrace/Thornhill, BC',
    },
  })

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        number: '21',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: oneQueenKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '22',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoDoubleKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '23',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoQueenKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '24',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoDoubleKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '25',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoDoubleKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '26',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoDoubleKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '27',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoDoubleKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '28',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: oneQueenKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '32',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: oneQueenKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '35',
        floor: 2,
        hotelId: hotel.id,
        roomTypeId: oneQueenKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '31',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoQueenNoKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '33',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: oneDoubleNoKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '34',
        floor: 2,
        hotelId: hotel.id,
        roomTypeId: oneQueenNoKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: '36',
        floor: 2,
        hotelId: hotel.id,
        roomTypeId: oneDoubleNoKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: 'T-1',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoQueenKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: 'T-2',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoQueenKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: 'T-3',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoQueenKitchen.id,
      },
    }),
    prisma.room.create({
      data: {
        number: 'T-5',
        floor: 1,
        hotelId: hotel.id,
        roomTypeId: twoQueenKitchen.id,
      },
    }),
  ])

  // Create sample guests (email is now nullable)
  const guests = await Promise.all([
    prisma.guest.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 987-6543',
        address: '456 Oak Avenue, City, State 54321',
      },
    }),
    prisma.guest.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        // email is nullable - not provided
        phone: '+1 (555) 123-9876',
      },
    }),
    prisma.guest.create({
      data: {
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.j@example.com',
      },
    }),
  ])

  console.log('Seed data created successfully!')
  console.log('Hotel:', hotel.name)
  console.log('Bed Types:', [queenBed.name, doubleBed.name, kingBed.name])
  console.log('Rooms:', rooms.map((r) => r.number).join(', '))
  console.log(
    'Guests:',
    guests.map((g) => `${g.firstName} ${g.lastName}`).join(', ')
  )
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
