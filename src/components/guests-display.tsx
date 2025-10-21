'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Phone, MapPin } from 'lucide-react'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  address: string | null
  createdAt: string
}

export function GuestsDisplay() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        console.log('Fetching guests...')
        setError(null)
        const response = await fetch('/api/guests')
        console.log('Guests response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('Guests data received:', data)
          setGuests(data)
        } else {
          const errorText = await response.text()
          console.error('Guests error:', response.status, errorText)
          setError(`Failed to fetch guests: ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to fetch guests:', error)
        setError(`Network error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchGuests()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Guests</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading guests...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Guests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
          <p className="mt-2 text-sm text-gray-500">
            Check the browser console for more details.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recent Guests
        </CardTitle>
        <CardDescription>Recently registered guests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {guests.slice(0, 6).map((guest) => (
            <div
              key={guest.id}
              className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h4 className="font-medium">
                    {guest.firstName} {guest.lastName}
                  </h4>
                  {!guest.email && (
                    <Badge variant="outline" className="text-xs">
                      No Email
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  {guest.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {guest.email}
                    </div>
                  )}

                  {guest.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {guest.phone}
                    </div>
                  )}

                  {guest.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {guest.address}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {new Date(guest.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}

          {guests.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">
              No guests registered yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
