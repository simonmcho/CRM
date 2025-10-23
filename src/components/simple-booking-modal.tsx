'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, Plus } from 'lucide-react'
import { BookingFormWithAvailability } from '@/components/booking-form-with-availability'

interface SimpleBookingModalProps {
  onBookingAdded?: () => void
  triggerButton?: React.ReactNode
}

export function SimpleBookingModal({
  onBookingAdded,
  triggerButton,
}: SimpleBookingModalProps) {
  const [open, setOpen] = useState(false)

  const handleBookingAdded = () => {
    console.log('Booking added, closing modal')
    setOpen(false)
    onBookingAdded?.()
  }

  const handleClick = () => {
    console.log('Modal trigger clicked')
    setOpen(true)
  }

  return (
    <>
      {/* Trigger */}
      <div onClick={handleClick} style={{ display: 'inline-block' }}>
        {triggerButton || (
          <Button onClick={handleClick}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        )}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-[95vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Create New Booking
            </DialogTitle>
            <DialogDescription>
              Select a guest, hotel, and available room to create a booking
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <BookingFormWithAvailability onBookingAdded={handleBookingAdded} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
