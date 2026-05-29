import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const imgBuffer = readFileSync(join(process.cwd(), 'public', 'baby-3d.png'))
  const base64 = imgBuffer.toString('base64')
  const src = `data:image/png;base64,${base64}`

  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          borderRadius: 120,
          background: 'linear-gradient(135deg, #06000f 0%, #0f172a 50%, #1e0a2e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(236,72,153,0.2) 60%, transparent 100%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />
        {/* Baby 3D image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={400} height={400} style={{ objectFit: 'contain', position: 'relative' }} alt="" />
      </div>
    ),
    { width: 512, height: 512 }
  )
}
