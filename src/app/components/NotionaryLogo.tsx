import React from 'react';

interface NotionaryLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showText?: boolean;
  className?: string;
  isDark?: boolean;
}

export default function NotionaryLogo({ size = 'md', showText = true, className = '', isDark = false }: NotionaryLogoProps) {
  const sizeConfig = {
    sm: {
      iconSize: 24,
      textSize: 'text-lg',
      spacing: 'space-x-2'
    },
    md: {
      iconSize: 32,
      textSize: 'text-xl',
      spacing: 'space-x-3'
    },
    lg: {
      iconSize: 40,
      textSize: 'text-2xl',
      spacing: 'space-x-3'
    },
    xl: {
      iconSize: 48,
      textSize: 'text-3xl',
      spacing: 'space-x-4'
    },
    '2xl': {
      iconSize: 64,
      textSize: 'text-4xl',
      spacing: 'space-x-5'
    },
    '3xl': {
      iconSize: 80,
      textSize: 'text-5xl',
      spacing: 'space-x-6'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      {/* Modern Logo Icon */}
      <div className="relative">
        <svg
          width={config.iconSize}
          height={config.iconSize}
          viewBox="0 0 100 100"
          className="drop-shadow-lg"
        >
          <defs>
            {/* Modern High-Contrast Gradient definitions */}
            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="50%" stopColor="#3730A3" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#7DD3FC" />
            </linearGradient>
            <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A5B4FC" />
              <stop offset="100%" stopColor="#C7D2FE" />
            </linearGradient>
            {/* Shadow filter for depth */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Main container - modern rounded rectangle */}
          <rect
            x="15"
            y="20"
            width="70"
            height="60"
            rx="16"
            ry="16"
            fill="url(#primaryGradient)"
            className="drop-shadow-md"
          />
          
          {/* Modern floating accent element */}
          <circle
            cx="75"
            cy="30"
            r="8"
            fill="url(#accentGradient)"
            opacity="0.95"
            filter="url(#glow)"
          />
          
          {/* Task completion ring */}
          <circle
            cx="35"
            cy="40"
            r="6"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.9"
          />
          
          {/* Checkmark in the ring */}
          <path
            d="M 31 40 L 34 43 L 39 37"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.9"
          />
          
          {/* Modern text lines with varied lengths */}
          <rect x="47" y="36" width="25" height="2.5" rx="1.25" fill="white" opacity="0.8" />
          <rect x="47" y="42" width="30" height="2.5" rx="1.25" fill="white" opacity="0.7" />
          
          {/* Second task item */}
          <circle
            cx="35"
            cy="55"
            r="6"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.7"
          />
          
          {/* Text lines for second item */}
          <rect x="47" y="51" width="20" height="2.5" rx="1.25" fill="white" opacity="0.6" />
          <rect x="47" y="57" width="25" height="2.5" rx="1.25" fill="white" opacity="0.5" />
          
          {/* Modern highlight accent */}
          <rect
            x="15"
            y="20"
            width="70"
            height="12"
            rx="16"
            ry="6"
            fill="url(#highlightGradient)"
            opacity="0.4"
            filter="url(#glow)"
          />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span 
          className={`font-bold ${config.textSize} tracking-tight`}
          style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}
        >
          Notionary
        </span>
      )}
    </div>
  );
} 