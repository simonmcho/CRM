import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Users, Bed, DollarSign } from 'lucide-react'
import Link from 'next/link'

async function getDashboardMetrics() {
  try {
    const [totalBookings, totalGuests, totalRooms, availableRooms] =
      await Promise.all([
        prisma.booking.count(),
        prisma.guest.count(),
        prisma.room.count(),
        prisma.room.count({
          where: {
            status: 'AVAILABLE',
          },
        }),
      ])

    // Calculate occupancy rate
    const occupancyRate =
      totalRooms > 0
        ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100)
        : 0

    // Calculate total revenue (simplified - sum of all booking amounts)
    const revenueResult = await prisma.booking.aggregate({
      _sum: {
        totalAmount: true,
      },
    })
    const totalRevenue = revenueResult._sum.totalAmount || 0

    return {
      totalBookings,
      totalGuests,
      availableRooms,
      occupancyRate,
      totalRevenue,
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return {
      totalBookings: 0,
      totalGuests: 0,
      availableRooms: 0,
      occupancyRate: 0,
      totalRevenue: 0,
    }
  }
}

export async function DashboardMetrics() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Link href="/bookings" className="block">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Active bookings in system
            </p>
          </CardContent>
        </Card>
      </Link>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalGuests}</div>
          <p className="text-xs text-muted-foreground">Registered guests</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.availableRooms}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.occupancyRate}% occupancy rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Total revenue</p>
        </CardContent>
      </Card>
    </div>
  )
}
