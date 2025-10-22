'use client'

import { Button } from '@/components/ui/button'
import { UserPlus, Plus } from 'lucide-react'
import Link from 'next/link'
import { BookingModal } from '@/components/booking-modal'

export function DashboardActions() {
  return (
    <div className="flex items-center space-x-2">
      <Link href="/guests">
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </Link>
      <BookingModal />
    </div>
  )
}
