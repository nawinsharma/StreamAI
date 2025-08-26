import Link from 'next/link'
import React from 'react'

export default function Logo() {
   return (
      <Link href="/" className="flex items-center gap-2 self-center font-bold text-3xl">
         <span className="inline-flex h-8 w-8 items-center justify-center">
            {/* Inline SVG synced with public/logo.svg */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true" role="img" aria-label="StreamAI logo">
               <defs>
                  {/* Tailwind purple-600 base with subtle depth */}
                  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                     <stop offset="0%" stopColor="#8b5cf6"/>
                     <stop offset="100%" stopColor="#7c3aed"/>
                  </linearGradient>
                  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25"/>
                     <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                  </linearGradient>
                  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                     <feGaussianBlur in="SourceGraphic" stdDeviation="0.6"/>
                  </filter>
               </defs>

               {/* Rounded tile */}
               <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#bg)"/>
               <path d="M6 14c6-6 46-6 52 0v0" stroke="url(#gloss)" strokeWidth="4" opacity="0.35"/>

               {/* Stylized chat bubble + stream mark */}
               <g>
                  <path d="M20 23c0-2.5 2.3-4.5 5.2-4.5h17.6c2.9 0 5.2 2 5.2 4.5v7.5c0 2.5-2.3 4.5-5.2 4.5H36l-7 5.6v-5.6h-3.8C22.3 35 20 33 20 30.5z" fill="#ffffff"/>
                  {/* flowing waves to suggest streaming/AI */}
                  <path d="M23 28.5c2.6 0 4.4-1.7 7-1.7s4.4 1.7 7 1.7 4.4-1.7 7-1.7" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M23 32c2.6 0 4.4-1.7 7-1.7s4.4 1.7 7 1.7 4.4-1.7 7-1.7" fill="none" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"/>
               </g>

               {/* Subtle spark accents */}
               <g filter="url(#soft)">
                  <circle cx="47" cy="17" r="1.8" fill="#ffffff"/>
                  <circle cx="18" cy="46" r="1.2" fill="#ddd6fe"/>
               </g>
            </svg>
         </span>
         StreamAI
      </Link>
   )
}
