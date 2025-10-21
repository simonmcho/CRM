export default function TestPage() {
  return (
    <html>
      <head>
        <title>Test</title>
      </head>
      <body>
        <h1>Server-side content</h1>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🔥 DIRECT SCRIPT: This should appear in browser console');
              setTimeout(() => {
                console.log('🔥 DELAYED SCRIPT: This runs after 1 second');
              }, 1000);
            `,
          }}
        />
      </body>
    </html>
  )
}
