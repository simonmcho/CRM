'use client'

import { useState, useEffect } from 'react'

interface RoomType {
  id: string
  name: string
  basePrice: number
  maxOccupancy: number
  beds: {
    quantity: number
    bedType: { name: string }
  }[]
}

export function RoomTypesDisplay() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/room-types')
      .then((res) => res.json())
      .then((data) => {
        setRoomTypes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading room types...</div>

  return (
    <div style={{ padding: '20px' }}>
      <h2>Room Types</h2>
      {roomTypes.map((room) => (
        <div
          key={room.id}
          style={{
            border: '1px solid #ccc',
            margin: '10px 0',
            padding: '15px',
            borderRadius: '5px',
          }}
        >
          <h3>{room.name}</h3>
          <p>
            <strong>Price:</strong> ${room.basePrice}/night
          </p>
          <p>
            <strong>Max Occupancy:</strong> {room.maxOccupancy}
          </p>
          <p>
            <strong>Beds:</strong>{' '}
            {room.beds
              ?.map((bed) => `${bed.quantity}x ${bed.bedType.name}`)
              .join(', ') || 'No beds configured'}
          </p>
        </div>
      ))}
    </div>
  )
}
