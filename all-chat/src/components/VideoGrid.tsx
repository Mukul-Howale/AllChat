import React from 'react';
import { User } from 'lucide-react';
import styles from '@/styles/shared.module.css';

interface VideoGridProps {
  groupSize: number | 'any';
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideos: React.RefObject<HTMLVideoElement>[];
  isChatActive: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({ groupSize, localVideoRef, remoteVideos, isChatActive }) => {
  const totalWindows = typeof groupSize === 'number' ? groupSize : 2;
  
  // Responsive grid classes based on screen size and number of participants
  const getGridClass = () => {
    if (totalWindows === 1) return 'grid-cols-1';
    if (totalWindows === 2) {
      return 'grid-cols-1 md:grid-cols-2'; // Stack vertically on mobile, side by side on desktop
    }
    return 'grid-cols-1 md:grid-cols-2 md:grid-rows-2'; // Stack on mobile, 2x2 on desktop
  };

  // Get video container class based on total windows
  const getVideoContainerClass = (index: number) => {
    const baseClass = 'relative rounded-lg overflow-hidden aspect-video md:aspect-square';
    if (totalWindows === 1 || (index === 0 && !isChatActive)) {
      return `${baseClass} col-span-1 md:col-span-2 md:row-span-2`; // Full width/height for single video
    }
    return baseClass;
  };

  return (
    <div className={`grid ${getGridClass()} gap-2 w-full h-full p-2 md:p-4`}>
      {Array.from({ length: totalWindows }, (_, index) => (
        <div 
          key={index} 
          className={`${getVideoContainerClass(index)} bg-gray-800 touch-none`}
        >
          {index === 0 ? (
            <video 
              ref={localVideoRef} 
              className="absolute inset-0 w-full h-full object-cover" 
              autoPlay 
              muted 
              playsInline 
            />
          ) : (
            isChatActive && remoteVideos[index - 1] ? (
              <video 
                ref={remoteVideos[index - 1]} 
                className="absolute inset-0 w-full h-full object-cover" 
                autoPlay 
                playsInline 
              />
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