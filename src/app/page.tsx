import { RoomTypesDisplay } from '@/components/room-types-display-server'
import { AmenitiesDisplay } from '@/components/amenities-display-server'
import { GuestsDisplay } from '@/components/guests-display-server'
import { DashboardMetrics } from '@/components/dashboard-metrics-server'
import { DashboardActions } from '@/components/dashboard-actions'

export default function HomePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Hotel Management Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <DashboardActions />
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
