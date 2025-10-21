'use client'

import { useState, useEffect } from 'react'

export function RoomTypesDisplaySimple() {
  const [hydrated, setHydrated] = useState(false)

  // This will only run in browser after hydration
  useEffect(() => {
    console.log(
      '🎯 BROWSER: Hydration complete! This should be in browser console!'
    )
    setHydrated(true)
  }, [])

  // Server-side log (shows in terminal)
  console.log('🖥️ SERVER: Component rendering (this shows in terminal)')

  // Button click test
  const handleClick = () => {
    console.log(
      '🖱️ BROWSER: Button clicked! This should be in browser console!'
    )
    alert('Button clicked! Check browser console for logs.')
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '3px solid red',
        margin: '10px',
        backgroundColor: hydrated ? 'lightgreen' : 'yellow',
      }}
    >
      <h2>🧪 HYDRATION TEST</h2>
      <p>
        <strong>Status:</strong>{' '}
        {hydrated
          ? '✅ HYDRATED (Client-side)'
          : '⏳ NOT HYDRATED (Server-side)'}
      </p>
      <p>
        <strong>Background color:</strong>{' '}
        {hydrated ? 'Light Green = Hydrated!' : 'Yellow = Server-side render'}
      </p>

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
        CLICK ME - Test Browser Console
      </button>

      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        <p>Expected behavior:</p>
        <p>1. Page loads with YELLOW background (server render)</p>
        <p>2. Background changes to GREEN (hydration complete)</p>
        <p>3. Button click shows alert + browser console log</p>
      </div>
    </div>
  )
}
