import { Button } from '@/components/ui/button'
import { UserPlus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { RoomTypesDisplay } from '@/components/room-types-display-server'
import { AmenitiesDisplay } from '@/components/amenities-display-server'
import { GuestsDisplay } from '@/components/guests-display-server'
import { DashboardMetrics } from '@/components/dashboard-metrics-server'

export default function HomePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Hotel Management Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <Link href="/guests">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Guest
            </Button>
          </Link>
          <Link href="/bookings/new">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      <DashboardMetrics />

      {/* Data Display Section */}
      <div className="grid gap-6">
        <RoomTypesDisplay />

        <div className="grid gap-6 md:grid-cols-2">
          <AmenitiesDisplay />
          <GuestsDisplay />
        </div>
      </div>
    </div>
  )
}
