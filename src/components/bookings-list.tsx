import { prisma } from '@/lib/prisma'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  Users,
  MapPin,
  Bed,
  DollarSign,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

async function getBookings() {
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
    return bookings
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
}

type Booking = Awaited<ReturnType<typeof getBookings>>[0]

function getStatusColor(status: Booking['status']) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'CHECKED_IN':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'CHECKED_OUT':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function formatDate(dateString: string | Date) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function calculateNights(checkIn: string | Date, checkOut: string | Date) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export async function BookingsList() {
  const bookings = await getBookings()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
          <p className="text-muted-foreground">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/bookings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No bookings found</h3>
              <p className="mb-4 text-muted-foreground">
                Get started by creating your first booking.
              </p>
              <Link href="/bookings/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Booking
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.guest.firstName} {booking.guest.lastName}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {booking.guest.email ||
                            booking.guest.phone ||
                            'No contact'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.hotel.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          Room {booking.room.number}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.toLowerCase().replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Check-in
                    </p>
                    <p className="text-sm">{formatDate(booking.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Check-out
                    </p>
                    <p className="text-sm">{formatDate(booking.checkOut)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Duration
                    </p>
                    <p className="text-sm">
                      {calculateNights(booking.checkIn, booking.checkOut)} night
                      {calculateNights(booking.checkIn, booking.checkOut) !== 1
                        ? 's'
                        : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="flex items-center gap-1 text-sm font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {booking.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Room Type
                    </p>
                    <p className="text-sm">{booking.room.roomType.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Payment Status
                    </p>
                    <p className="text-sm">
                      {booking.payments.length > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          {booking.payments[0].status.toLowerCase()}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No payments
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-1 rounded bg-muted p-2 text-sm">
                      {booking.notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 text-xs text-muted-foreground">
                  Booking created: {formatDate(booking.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
