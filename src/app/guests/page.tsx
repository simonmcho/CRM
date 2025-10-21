import { AddGuestForm } from '@/components/add-guest-form'

export default function GuestsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Guest Management</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <AddGuestForm />
      </div>
    </div>
  )
}
