import React from 'react';

export function MosaicPatternBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Ambient jewel-tone glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      
      {/* Subtle tessellation mosaic grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mosaic-hex" width="48" height="83.14" patternUnits="userSpaceOnUse">
            <path
              d="M24 0 L48 13.86 L48 41.57 L24 55.43 L0 41.57 L0 13.86 Z M24 83.14 L48 69.28 L48 41.57 L24 55.43 L0 41.57 L0 69.28 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mosaic-hex)" />
      </svg>
    </div>
  );
}

export function MosaicTesseraIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10L14 4L22 9L12 15L4 10Z" fill="url(#tessera-g1)" />
      <path d="M14 4L28 10L20 16L12 15L14 4Z" fill="url(#tessera-g2)" />
      <path d="M12 15L20 16L28 22L18 28L12 15Z" fill="url(#tessera-g3)" />
      <path d="M4 10L12 15L18 28L8 22L4 10Z" fill="url(#tessera-g4)" />
      <defs>
        <linearGradient id="tessera-g1" x1="4" y1="4" x2="22" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="tessera-g2" x1="12" y1="4" x2="28" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="tessera-g3" x1="12" y1="15" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ec4899" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="tessera-g4" x1="4" y1="10" x2="18" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
    </svg>
  );
}
