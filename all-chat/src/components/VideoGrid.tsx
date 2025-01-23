import React from 'react';
import { User } from 'lucide-react';
import styles from '@/styles/shared.module.css';

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideos: React.RefObject<HTMLVideoElement>[];
  isChatActive: boolean;
  className?: string;
  localUsername?: string;
  remoteUsername?: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({ 
  localVideoRef, 
  remoteVideos, 
  isChatActive, 
  className,
  localUsername,
  remoteUsername 
}) => {
  // Always use 2-person layout
  const getGridClass = () => {
    return 'grid-cols-1 md:grid-cols-2'; // Stack vertically on mobile, side by side on desktop
  };

  // Get video container class based on active state
  const getVideoContainerClass = (index: number) => {
    const baseClass = 'relative rounded-lg overflow-hidden aspect-video md:aspect-square';
    if (index === 0 && !isChatActive) {
      return `${baseClass} col-span-1 md:col-span-2 md:row-span-2`; // Full width/height when solo
    }
    return baseClass;
  };

  return (
    <div className={`grid ${getGridClass()} gap-2 w-full h-full p-2 md:p-4 ${className}`}>
      {Array.from({ length: 2 }, (_, index) => (
        <div 
          key={index} 
          className={`${getVideoContainerClass(index)} bg-gray-800 touch-none`}
        >
          {index === 0 ? (
            <>
              <video 
                ref={localVideoRef} 
                className="absolute inset-0 w-full h-full object-cover" 
                autoPlay 
                muted 
                playsInline 
              />
              {localUsername && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
                  {localUsername}
                </div>
              )}
            </>
          ) : (
            isChatActive && remoteVideos[index - 1] ? (
              <>
                <video 
                  ref={remoteVideos[index - 1]} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  autoPlay 
                  playsInline 
                />
                {remoteUsername && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
                    {remoteUsername}
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <User className="w-16 h-16 md:w-24 md:h-24 text-gray-400" />
              </div>
            )
          )}
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm md:text-base">
            {index === 0 ? 'You' : `Person ${index}`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;