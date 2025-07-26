import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Notopy - AI-Powered Note Generation'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#000000',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#000000',
              fontFamily: 'system-ui',
            }}
          >
            Notopy
          </div>
        </div>
        <div
          style={{
            fontSize: '36px',
            color: '#666666',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.2',
            fontFamily: 'system-ui',
          }}
        >
          Transform any topic into beautiful, colorful notes with hand-drawn elements using AI
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '40px',
            fontSize: '24px',
            color: '#888888',
            fontFamily: 'system-ui',
          }}
        >
          ✨ AI-Powered • 🎨 Beautiful Design • 📝 Multi-Page Notes
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}