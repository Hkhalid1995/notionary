import React from 'react';

interface NotionaryLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function NotionaryLogo({ size = 'md', showText = true, className = '' }: NotionaryLogoProps) {
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
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <svg
          width={config.iconSize}
          height={config.iconSize}
          viewBox="0 0 100 100"
          className="drop-shadow-sm"
        >
          {/* Main document background with rounded corners */}
          <rect
            x="10"
            y="15"
            width="65"
            height="75"
            rx="12"
            ry="12"
            fill="#4F46E5"
            className="drop-shadow-md"
          />
          
          {/* Indigo accent folded corner */}
          <path
            d="M 60 15 L 75 15 L 75 30 L 60 15 Z"
            fill="#6366F1"
          />
          
          {/* White checkmark */}
          <path
            d="M 25 45 L 35 55 L 55 35"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* White horizontal lines to represent text */}
          <rect x="25" y="65" width="25" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="25" y="70" width="35" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="25" y="75" width="20" height="2" rx="1" fill="white" opacity="0.9" />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`font-bold ${config.textSize} text-gray-900 dark:text-white tracking-tight`}>
          Notionary
        </span>
      )}
    </div>
  );
} 