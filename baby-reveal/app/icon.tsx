import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  const imgBuffer = readFileSync(join(process.cwd(), 'public', 'baby-3d.png'))
  const base64 = imgBuffer.toString('base64')
  const src = `data:image/png;base64,${base64}`

  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          borderRadius: 44,
          background: 'linear-gradient(135deg, #06000f 0%, #0f172a 50%, #1e0a2e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
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
        <img src={src} width={148} height={148} style={{ objectFit: 'contain', position: 'relative' }} alt="" />
      </div>
    ),
    { ...size }
  )
}
