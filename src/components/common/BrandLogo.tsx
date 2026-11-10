import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const dimensionClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group shrink-0 select-none ${className}`}>
      {/* Bold, Ultra-Legible Precision "Z" Emblem */}
      <div
        className={`relative ${dimensionClasses} rounded-xl p-1.5 flex items-center justify-center bg-gradient-to-br from-[#12223b] via-[#0c192d] to-[#07101e] border border-blue-400/50 shadow-lg shadow-blue-500/25 group-hover:shadow-cyan-400/40 group-hover:border-cyan-300 transition-all duration-300 group-hover:scale-105 shrink-0`}
      >
        {/* Crisp, Bold, High-Contrast "Z" Monogram Vector */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Main Solid Bold Z with razor-sharp edge */}
          <path
            d="M9 10H39V17.5L22 32.5H39V40H9V32.5L26 17.5H9V10Z"
            fill="url(#zt_blue_main)"
            stroke="#93C5FD"
            strokeWidth="0.75"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_12px_rgba(37,99,235,0.7)]"
          />

          {/* Upper Precision Specular Highlight on Z */}
          <path
            d="M9.5 10.5H38.5L34 14.5H13.5L9.5 10.5Z"
            fill="#FFFFFF"
            fillOpacity="0.55"
          />

          {/* Diagonal Speed Shimmer */}
          <path
            d="M26 17.5L22 32.5L25 32.5L29 17.5H26Z"
            fill="url(#zt_blue_shimmer)"
            fillOpacity="0.85"
          />

          {/* Radiant Ziyo Center Spark */}
          <circle
            cx="24"
            cy="25"
            r="2.2"
            fill="#38BDF8"
            className="animate-pulse"
          />
          <circle
            cx="24"
            cy="25"
            r="1"
            fill="#FFFFFF"
          />

          <defs>
            <linearGradient id="zt_blue_main" x1="9" y1="10" x2="39" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#67E8F9" />
              <stop offset="0.3" stopColor="#38BDF8" />
              <stop offset="0.7" stopColor="#2563EB" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="zt_blue_shimmer" x1="22" y1="17.5" x2="29" y2="32.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#93C5FD" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <span className={`${textSizeClasses} font-extrabold tracking-tight text-white font-sans flex items-center`}>
          <span>Ziyo</span>
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-200 bg-clip-text text-transparent">
            Tech
          </span>
        </span>
      )}
    </div>
  );
};
