import { prisma } from '@/lib/prisma'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bed, Utensils, Home } from 'lucide-react'

async function getRoomTypes() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        beds: {
          include: {
            bedType: true,
          },
        },
      },
      orderBy: {
        basePrice: 'asc',
      },
    })
    return roomTypes
  } catch (error) {
    console.error('Error fetching room types:', error)
    return []
  }
}

export async function RoomTypesDisplay() {
  const roomTypes = await getRoomTypes()

  const getKitchenAmenities = (roomType: any) => {
    const amenities = []
    if (roomType.hasStove) amenities.push('Stove')
    if (roomType.hasMicrowave) amenities.push('Microwave')
    if (roomType.hasSink) amenities.push('Sink')
    if (roomType.hasFridge) amenities.push('Fridge')
    if (roomType.hasMiniFridge) amenities.push('Mini Fridge')
    return amenities
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Room Types & Configurations
        </CardTitle>
        <CardDescription>
          Available room types with bed configurations and amenities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {roomTypes.map((roomType) => (
            <Card key={roomType.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{roomType.name}</CardTitle>
                  <Badge variant="outline" className="font-bold">
                    ${roomType.basePrice}/night
                  </Badge>
                </div>
                {roomType.description && (
                  <CardDescription className="text-sm">
                    {roomType.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Bed Configuration */}
                <div>
                  <h4 className="mb-2 flex items-center gap-1 text-sm font-semibold">
                    <Bed className="h-4 w-4" />
                    Beds
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {roomType.beds.map((bed: any) => (
                      <Badge
                        key={bed.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {bed.quantity}x {bed.bedType.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Other Furniture */}
                <div>
                  <h4 className="mb-2 flex items-center gap-1 text-sm font-semibold">
                    <Bed className="h-4 w-4" />
                    Furniture
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {roomType.numberOfCouches}x Couch
                      {roomType.numberOfCouches !== 1 ? 'es' : ''}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Max {roomType.maxOccupancy} guests
                    </Badge>
                  </div>
                </div>

                {/* Kitchen Amenities */}
                {getKitchenAmenities(roomType).length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-1 text-sm font-semibold">
                      <Utensils className="h-4 w-4" />
                      Kitchen
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {getKitchenAmenities(roomType).map((amenity: string) => (
                        <Badge
                          key={amenity}
                          variant="outline"
                          className="text-xs"
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
