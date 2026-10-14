import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

// Candidates in public directory with cache-buster to prevent browser stale cache:
const LOGO_VERSION = 'v2';
const LOGO_CANDIDATES = [
  `/logo.png?${LOGO_VERSION}`,
  `/logo.jpeg?${LOGO_VERSION}`,
  `/logo.png.jpeg?${LOGO_VERSION}`,
  `/LOGO.jpeg?${LOGO_VERSION}`,
  `/LOGO.png?${LOGO_VERSION}`,
  `/logo.jpg?${LOGO_VERSION}`,
  `/logo.svg?${LOGO_VERSION}`,
  '/logo.png',
  '/logo.jpeg',
  '/logo.png.jpeg',
];

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const brandAssets = useAppSelector((state) => state.cms.brandAssets);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  // If user uploaded a custom logo URL in CMS, prioritize that, else use local public candidates
  const isCmsCustomLogo =
    brandAssets?.logoDarkUrl &&
    !brandAssets.logoDarkUrl.includes('unsplash.com') &&
    brandAssets.logoDarkUrl.trim() !== '';

  const currentSrc = isCmsCustomLogo
    ? brandAssets.logoDarkUrl
    : LOGO_CANDIDATES[candidateIndex];

  const handleImageError = () => {
    if (isCmsCustomLogo) {
      setAllFailed(true);
      return;
    }
    if (candidateIndex < LOGO_CANDIDATES.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-md',
    md: 'w-8 h-8 text-sm rounded-lg',
    lg: 'w-11 h-11 text-base rounded-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${sizeClasses[size]} bg-brand-black flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-neutral-800/80 transition-all`}
      >
        {!allFailed && currentSrc ? (
          <img
            src={currentSrc}
            alt="Logo Icon"
            className="w-full h-full object-contain p-0.5"
            onError={handleImageError}
          />
        ) : (
          <span className="font-black text-white select-none">I</span>
        )}
      </div>

      {showText && (
        <div>
          <div className="font-black text-sm tracking-tight text-neutral-950">
            INFLUVERSE
          </div>
          <p className="text-[10px] text-neutral-400 font-semibold">
            Dashboard
          </p>
        </div>
      )}
    </div>
  );
};
