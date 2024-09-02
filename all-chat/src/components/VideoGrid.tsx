import React, { RefObject } from 'react';

interface VideoGridProps {
  groupSize: number | 'any';
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideos: RefObject<HTMLVideoElement>[];
  isChatActive: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({ groupSize, localVideoRef, remoteVideos, isChatActive }) => {
  console.log('VideoGrid render:', { groupSize, isChatActive, remoteVideosCount: remoteVideos.length });
  
  const renderParticipantWindows = () => {
    const size = groupSize === 'any' ? remoteVideos.length + 1 : groupSize;
    return Array.from({ length: size }, (_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
          {index === 0 ? (
            <video ref={localVideoRef} className="w-full h-full object-cover rounded-full" autoPlay muted playsInline />
          ) : (
            <video ref={remoteVideos[index - 1]} className="w-full h-full object-cover rounded-full" autoPlay playsInline />
          )}
        </div>
        <span className="text-sm font-medium">
          {index === 0 ? 'You' : `Person ${index + 1}`}
        </span>
      </div>
    ));
  };

  return (
    <div className="w-full max-w-4xl bg-gray-800 rounded-lg p-4 shadow-lg">
      {isChatActive ? (
        <div className={`grid gap-4 ${
          groupSize === 'any' ? 'grid-cols-2' :
          groupSize === 2 ? 'grid-cols-2' :
          groupSize === 3 ? 'grid-cols-3' :
          'grid-cols-2 md:grid-cols-4'
        }`}>
          {/* Local Video */}
          <div className="bg-black flex justify-center items-center rounded-lg overflow-hidden">
            <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          </div>
          {/* Remote Videos */}
          {remoteVideos.map((ref, index) => (
            <div key={index} className="bg-black flex justify-center items-center rounded-lg overflow-hidden">
              <video ref={ref} className="w-full h-full object-cover" autoPlay playsInline />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {renderParticipantWindows()}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 text-white">
          <p className="text-xl">Start a chat to begin random video call</p>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;