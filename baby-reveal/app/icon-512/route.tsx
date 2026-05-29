import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          borderRadius: 100,
          background: 'linear-gradient(135deg, #1d4ed8, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 280,
        }}
      >
        👶
      </div>
    ),
    { width: 512, height: 512 }
  )
}
