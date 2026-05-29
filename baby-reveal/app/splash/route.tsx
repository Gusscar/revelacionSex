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
          width: 1170,
          height: 2532,
          background: '#06000f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          gap: 0,
        }}
      >
        {/* Background glow top-left */}
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,78,216,0.45) 0%, transparent 70%)',
            top: -200,
            left: -200,
            display: 'flex',
          }}
        />
        {/* Background glow bottom-right */}
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%)',
            bottom: -200,
            right: -200,
            display: 'flex',
          }}
        />

        {/* Baby 3D image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          width={520}
          height={520}
          style={{ objectFit: 'contain', position: 'relative', marginBottom: 48 }}
          alt=""
        />

        {/* App name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-2px',
            position: 'relative',
          }}
        >
          Baby Revelación
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 16,
            position: 'relative',
          }}
        >
          El reveal más especial
        </div>
      </div>
    ),
    { width: 1170, height: 2532 }
  )
}
