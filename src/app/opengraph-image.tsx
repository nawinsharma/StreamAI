import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'StreamAI - Streaming AI Chat | with personal long-term memory, RAG, different custom tools, persistent chat history with top class experience'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #000319 0%, #1a1a2e 50%, #16213e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(96, 165, 250, 0.1) 2px, transparent 0)',
            backgroundSize: '50px 50px',
            opacity: 0.3,
          }}
        />

        {/* Top badge */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            background: 'rgba(96, 165, 250, 0.2)',
            color: '#60a5fa',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            border: '1px solid rgba(96, 165, 250, 0.4)',
          }}
        >
          streamai.nawin.xyz
        </div>
        
        {/* Main content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 1,
            maxWidth: '1000px',
          }}
        >
          {/* Name with gradient */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: '0 0 16px 0',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            StreamAI
          </h1>
          
          {/* Title with enhanced styling */}
          <h2
            style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#60a5fa',
              margin: '0 0 24px 0',
              lineHeight: 1.2,
              textShadow: '0 0 20px rgba(96, 165, 250, 0.3)',
            }}
          >
            Streaming AI Chat
          </h2>
          
          {/* Enhanced description */}
          <p
            style={{
              fontSize: '22px',
              color: '#e5e7eb',
              margin: '0 0 32px 0',
              maxWidth: '700px',
              lineHeight: 1.5,
              opacity: 0.9,
            }}
          >
            A streaming AI chat with personal long-term memory, RAG, different custom tools, persistent chat history with top class experience
          </p>
        </div>
        {/* Enhanced bottom accent with multiple gradients */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #60a5fa 0%, #8b5cf6 50%, #ec4899 100%)',
            boxShadow: '0 -2px 10px rgba(96, 165, 250, 0.3)',
          }}
        />
        
        {/* Side decorative elements */}
        <div
          style={{
            position: 'absolute',
            left: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '4px',
            height: '100px',
            background: 'linear-gradient(180deg, #60a5fa 0%, #8b5cf6 100%)',
            borderRadius: '2px',
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '4px',
            height: '100px',
            background: 'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)',
            borderRadius: '2px',
            opacity: 0.6,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
} 