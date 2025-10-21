'use client'

import { useState, useEffect } from 'react'

export function MinimalHydrationTest() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('🔥 MINIMAL: useEffect fired!')
    // Force a console log every second for 5 seconds to make it obvious
    const interval = setInterval(() => {
      console.log('🔥 MINIMAL: Interval tick', new Date().toLocaleTimeString())
    }, 1000)

    setTimeout(() => {
      clearInterval(interval)
    }, 5000)
  }, [])

  return (
    <div>
      <h1>Minimal Test</h1>
      <p>Count: {count}</p>
      <button
        onClick={() => {
          console.log('🔥 MINIMAL: Button clicked!')
          setCount((c) => c + 1)
        }}
      >
        Click me
      </button>
    </div>
  )
}
