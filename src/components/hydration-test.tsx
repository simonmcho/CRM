'use client'

export function HydrationTest() {
  // This should run on both server and client
  const isClient = typeof window !== 'undefined'

  return (
    <div
      style={{
        padding: '20px',
        border: '3px solid red',
        margin: '10px',
        backgroundColor: isClient ? 'lightgreen' : 'yellow',
      }}
    >
      <h2>🔬 Hydration Test</h2>
      <p>Is Client: {isClient ? '✅ YES' : '❌ NO'}</p>
      <p>Window exists: {typeof window !== 'undefined' ? '✅ YES' : '❌ NO'}</p>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            console.log('🔥 SCRIPT TAG: This should appear in browser console!');
            document.addEventListener('DOMContentLoaded', function() {
              console.log('🎯 DOM LOADED: This should appear in browser console!');
            });
          `,
        }}
      />
    </div>
  )
}
