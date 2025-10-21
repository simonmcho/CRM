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
import { Bed, Utensils, Waves, Refrigerator, Coffee, Home } from 'lucide-react'

interface BedType {
  id: string
  name: string
}

interface RoomTypeBed {
  id: string
  quantity: number
  bedType: BedType
}

interface RoomType {
  id: string
  name: string
  description: string | null
  basePrice: number
  maxOccupancy: number
  numberOfCouches: number
  hasStove: boolean
  hasMicrowave: boolean
  hasSink: boolean
  hasFridge: boolean
  hasMiniFridge: boolean
  beds: RoomTypeBed[]
}

export function RoomTypesDisplay() {
  // Only log in browser
  if (typeof window !== 'undefined') {
    console.log('BROWSER: Component rendering')
  }

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Ensure component only runs on client side
  useEffect(() => {
    console.log('BROWSER: Component mounting in useEffect')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      console.log('CLIENT: Not mounted yet, skipping fetch')
      return // Don't run on server
    }

    console.log('CLIENT: useEffect running')
    const fetchRoomTypes = async () => {
      try {
        console.log('CLIENT: getting room types')
        setError(null)
        const response = await fetch('/api/room-types')
        console.log('CLIENT: Response status:', response.status)
        console.log('CLIENT: Response ok:', response.ok)

        if (response.ok) {
          const data = await response.json()
          console.log('CLIENT: Room types data received:', data)
          console.log('CLIENT: Number of room types:', data.length)
          setRoomTypes(data)
        } else {
          console.error(
            'CLIENT: Response not ok:',
            response.status,
            response.statusText
          )
          const errorText = await response.text()
          console.error('CLIENT: Error response body:', errorText)
          setError(`Failed to fetch room types: ${response.status}`)
        }
      } catch (error) {
        console.error('CLIENT: Failed to fetch room types:', error)
        setError(`Network error: ${error}`)
      } finally {
        console.log('CLIENT: Setting loading to false')
        setLoading(false)
      }
    }

    fetchRoomTypes()
  }, [mounted])

  const getKitchenAmenities = (roomType: RoomType) => {
    const amenities = []
    if (roomType.hasStove) amenities.push('Stove')
    if (roomType.hasMicrowave) amenities.push('Microwave')
    if (roomType.hasSink) amenities.push('Sink')
    if (roomType.hasFridge) amenities.push('Fridge')
    if (roomType.hasMiniFridge) amenities.push('Mini Fridge')
    return amenities
  }

  if (loading) {
    console.log('Loading room types...')
    return (
      <Card>
        <CardHeader>
          <CardTitle>Room Types loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading room types...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
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
                    {roomType.beds.map((bed) => (
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
                    <Waves className="h-4 w-4" />
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
                      {getKitchenAmenities(roomType).map((amenity) => (
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
