import { prisma } from '@/lib/prisma'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, DollarSign } from 'lucide-react'

async function getAmenities() {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: {
        price: 'asc',
      },
    })
    return amenities
  } catch (error) {
    console.error('Error fetching amenities:', error)
    return []
  }
}

export async function AmenitiesDisplay() {
  const amenities = await getAmenities()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Hotel Amenities
        </CardTitle>
        <CardDescription>Available amenities and their pricing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <h4 className="font-medium">{amenity.name}</h4>
                {amenity.notes && (
                  <p className="text-sm text-muted-foreground">
                    {amenity.notes}
                  </p>
                )}
              </div>
              <Badge variant={amenity.price > 0 ? 'default' : 'secondary'}>
                {amenity.price > 0 ? (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {amenity.price}
                  </div>
                ) : (
                  'Free'
                )}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
