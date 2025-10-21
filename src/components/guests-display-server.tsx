import { prisma } from '@/lib/prisma'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Phone, MapPin } from 'lucide-react'

async function getGuests() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Show latest 10 guests
    })
    return guests
  } catch (error) {
    console.error('Error fetching guests:', error)
    return []
  }
}

export async function GuestsDisplay() {
  const guests = await getGuests()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recent Guests
        </CardTitle>
        <CardDescription>
          Latest registered guests in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {guests.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              No guests registered yet
            </p>
          ) : (
            guests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">
                    {guest.firstName} {guest.lastName}
                  </h4>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {guest.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {guest.email}
                      </div>
                    )}
                    {guest.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {guest.phone}
                      </div>
                    )}
                    {guest.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {guest.address}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(guest.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
