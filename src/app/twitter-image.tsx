import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'StreamAI - Streaming AI Chat | streamai.nawin.xyz'
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
          background: 'linear-gradient(135deg, #1da1f2 0%, #0d8bd9 40%, #0a7bc4 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Twitter-optimized background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 30px 30px, rgba(255,255,255,0.12) 2px, transparent 0)',
            backgroundSize: '60px 60px',
            opacity: 0.5,
          }}
        />

        {/* Twitter handle badge */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            right: '40px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '700',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>🤖</span>
          @NawinScript
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
            maxWidth: '900px',
          }}
        >
          {/* AI Bot Icon */}
          <div
            style={{
              width: '100px',
              height: '100px',
              background: 'white',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              fontSize: '50px',
              fontWeight: 'bold',
              color: '#1da1f2',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '4px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            🤖
          </div>
          
          {/* Title with Twitter styling */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 12px 0',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            StreamAI
          </h1>
          
          {/* Subtitle with verification-style styling */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.95)',
                margin: '0',
                lineHeight: 1.2,
              }}
            >
              Streaming AI Chat
            </h2>
            <div
              style={{
                width: '24px',
                height: '24px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              ✓
            </div>
          </div>
          
          {/* Bio-style description */}
          <p
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '0 0 32px 0',
              maxWidth: '650px',
              lineHeight: 1.4,
              fontWeight: '500',
            }}
          >
            🚀 Next-gen AI chat with memory & RAG
            <br />
            💡 Personal AI assistant with custom tools
          </p>
          
          {/* Features in Twitter-style layout */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            {/* Primary features */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {[
                { name: 'Memory', emoji: '🧠' },
                { name: 'RAG', emoji: '📚' },
                { name: 'Tools', emoji: '🛠️' },
                { name: 'History', emoji: '💾' }
              ].map((feature) => (
                <span
                  key={feature.name}
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: 'white',
                    padding: '10px 18px',
                    borderRadius: '25px',
                    fontSize: '18px',
                    fontWeight: '700',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>{feature.emoji}</span>
                  {feature.name}
                </span>
              ))}
            </div>
            
            {/* Secondary features */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {[
                { name: 'Streaming', emoji: '⚡' },
                { name: 'Real-time', emoji: '🔄' },
                { name: 'Smart', emoji: '🤖' }
              ].map((feature) => (
                <span
                  key={feature.name}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{feature.emoji}</span>
                  {feature.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* Call to action */}
          <div
            style={{
              marginTop: '32px',
              background: 'white',
              color: '#1da1f2',
              padding: '12px 24px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: '700',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
            }}
          >
            🌐 streamai.nawin.xyz
          </div>
        </div>
        
        {/* Bottom Twitter-style accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'white',
            opacity: 0.8,
          }}
        />
        
        {/* Side AI elements */}
        <div
          style={{
            position: 'absolute',
            left: '40px',
            top: '60px',
            fontSize: '24px',
            opacity: 0.3,
          }}
        >
          🤖
        </div>
        <div
          style={{
            position: 'absolute',
            left: '40px',
            bottom: '60px',
            fontSize: '20px',
            opacity: 0.2,
          }}
        >
          ⚡
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
