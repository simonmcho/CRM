'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar, Plus } from 'lucide-react'
import { BookingFormWithAvailability } from '@/components/booking-form-with-availability'

interface BookingModalProps {
  onBookingAdded?: () => void
  triggerButton?: React.ReactNode
}

export function BookingModal({
  onBookingAdded,
  triggerButton,
}: BookingModalProps) {
  const [open, setOpen] = useState(false)

  const handleBookingAdded = () => {
    console.log('Booking added, closing modal')
    setOpen(false) // Close modal
    onBookingAdded?.() // Call parent callback
  }

  const handleOpenChange = (newOpen: boolean) => {
    console.log('Modal open state changing to:', newOpen)
    setOpen(newOpen)
  }

  const defaultTrigger = (
    <Button
      onClick={() => {
        console.log('Default trigger clicked')
        setOpen(true)
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      New Booking
    </Button>
  )

  return (
    <>
      {/* Custom trigger */}
      {triggerButton ? (
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
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
