import React from 'react';
import { User } from 'lucide-react';

interface VideoGridProps {
  groupSize: number | 'any';
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideos: React.RefObject<HTMLVideoElement>[];
  isChatActive: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({ groupSize, localVideoRef, remoteVideos, isChatActive }) => {
  const totalWindows = typeof groupSize === 'number' ? groupSize : 2;
  
  let gridClass = 'grid-cols-1';
  if (totalWindows === 2) {
    gridClass = 'grid-cols-2';
  } else if (totalWindows > 2) {
    gridClass = 'grid-cols-2 grid-rows-2';
  }

  console.log('VideoGrid render - isChatActive:', isChatActive, 'totalWindows:', totalWindows);

  return (
    <div className={`grid ${gridClass} gap-2 w-full h-full`}>
      {Array.from({ length: totalWindows }, (_, index) => (
        <div key={index} className="bg-gray-800 rounded-lg overflow-hidden relative">
          {index === 0 ? (
            <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          ) : (
            isChatActive && remoteVideos[index - 1] ? (
              <video ref={remoteVideos[index - 1]} className="w-full h-full object-cover" autoPlay playsInline />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <User className="w-1/4 h-1/4 text-gray-400" />
              </div>
            )
          )}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
            {index === 0 ? 'You' : `Person ${index + 1}`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;