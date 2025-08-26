'use client';

interface StructuredDataProps {
  type: 'website' | 'webapplication' | 'organization';
  data?: Record<string, unknown>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = 'https://streamai.nawin.xyz';
  
  const getStructuredData = (): Record<string, unknown> => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "StreamAI",
          "description": "A streaming AI chat with personal long-term memory, RAG, different custom tools , persistent chat history with top class experience",
          "url": baseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `/`
            },
            "query-input": "required name=search_term_string"
          },
          "sameAs": [
            "https://x.com/nawinscript",
            "https://github.com/nawinsharma/streamai"
          ]
        };
        
      case 'webapplication':
        return {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "StreamAI",
          "description": "A streaming AI chat with personal long-term memory, RAG, different custom tools , persistent chat history with top class experience",
          "url": baseUrl,
          "applicationCategory": "ProductivityApplication",
          "operatingSystem": "Web Browser",
          "browserRequirements": "Requires JavaScript. Requires HTML5.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "portfolio"
          ],
          "screenshot": `${baseUrl}/og-image.png`,
          "softwareVersion": "1.0.0",
          "author": {
            "@type": "Organization",
            "name": "Nawin"
          }
        };
        
      case 'organization':
        return {
          "@context": "https://schema.org", 
          "@type": "Organization",
          "name": "StreamAI",
          "description": "A streaming AI chat with personal long-term memory, RAG, different custom tools , persistent chat history with top class experience",
          "url": baseUrl,
          "logo": `${baseUrl}/favicon.png`,
          "sameAs": [
            "https://x.com/nawinscript",
            "https://github.com/nawinsharma/streamai"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "nawinsharma60@gmail.com"
          }
        };
        
      default:
        return {};
    }
  };

  const structuredData = data || getStructuredData();

  if (!structuredData || Object.keys(structuredData).length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
} 