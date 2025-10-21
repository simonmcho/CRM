'use client'

import { useState, useEffect } from 'react'

export function ReactHydrationTest() {
  const [mounted, setMounted] = useState(false)
  const [timestamp, setTimestamp] = useState('')

  useEffect(() => {
    console.log('🎯 REACT: useEffect running in browser!')
    setMounted(true)
    setTimestamp(new Date().toLocaleTimeString())
  }, [])

  const handleClick = () => {
    console.log('🖱️ REACT: Button clicked in browser!')
    alert(`Clicked at ${new Date().toLocaleTimeString()}`)
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '3px solid blue',
        margin: '10px',
        backgroundColor: mounted ? 'lightgreen' : 'yellow',
      }}
    >
      <h2>⚛️ React Hydration Test</h2>
      <p>Mounted: {mounted ? '✅ YES' : '❌ NO'}</p>
      <p>Hydrated at: {timestamp || 'Not yet'}</p>

      <button
        onClick={handleClick}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginTop: '10px',
        }}
      >
        Test React Click Handler
      </button>
    </div>
  )
}
