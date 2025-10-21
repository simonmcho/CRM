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
import { Star, DollarSign } from 'lucide-react'

interface Amenity {
  id: string
  name: string
  price: number
  notes: string | null
}

export function AmenitiesDisplay() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        console.log('Fetching amenities...')
        setError(null)
        const response = await fetch('/api/amenities')
        console.log('Amenities response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('Amenities data received:', data)
          setAmenities(data)
        } else {
          const errorText = await response.text()
          console.error('Amenities error:', response.status, errorText)
          setError(`Failed to fetch amenities: ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to fetch amenities:', error)
        setError(`Network error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchAmenities()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading amenities...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
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
          <Star className="h-5 w-5" />
          Available Amenities
        </CardTitle>
        <CardDescription>
          Additional services and amenities for guests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="font-medium">{amenity.name}</h4>
                  <Badge
                    variant={amenity.price === 0 ? 'secondary' : 'outline'}
                  >
                    {amenity.price === 0 ? (
                      'Free'
                    ) : (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {amenity.price}
                      </span>
                    )}
                  </Badge>
                </div>
                {amenity.notes && (
                  <p className="text-sm text-muted-foreground">
                    {amenity.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
