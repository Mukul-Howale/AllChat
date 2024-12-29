import React from 'react';
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';

interface MediaControlsProps {
  isVideoOn: boolean;
  isAudioOn: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
  hasVideo: boolean;
  hasAudio: boolean;
}

const MediaControls: React.FC<MediaControlsProps> = ({
  isVideoOn,
  isAudioOn,
  toggleVideo,
  toggleAudio,
  hasVideo,
  hasAudio
}) => {
  return (
    <div className="flex space-x-3 animate-fade-in">
      <Button
        onClick={toggleVideo}
        disabled={!hasVideo}
        className={`p-3 rounded-full elevation-2 button-hover focus-ring ${
          !hasVideo 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : isVideoOn 
              ? 'bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700' 
              : 'bg-error-500 text-white hover:bg-error-600'
        } transition-all duration-200`}
        aria-label={!hasVideo ? 'No camera available' : isVideoOn ? 'Turn off video' : 'Turn on video'}
      >
        <div className="relative">
          {isVideoOn ? (
            <Video size={24} className={`animate-scale-in ${!hasVideo ? 'opacity-50' : ''}`} />
          ) : (
            <VideoOff size={24} className={`animate-scale-in ${!hasVideo ? 'opacity-50' : ''}`} />
          )}
          {hasVideo && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current animate-pulse" />}
        </div>
      </Button>
      <Button
        onClick={toggleAudio}
        disabled={!hasAudio}
        className={`p-3 rounded-full elevation-2 button-hover focus-ring ${
          !hasAudio 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : isAudioOn 
              ? 'bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700' 
              : 'bg-error-500 text-white hover:bg-error-600'
        } transition-all duration-200`}
        aria-label={!hasAudio ? 'No microphone available' : isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
      >
        <div className="relative">
          {isAudioOn ? (
            <Mic size={24} className={`animate-scale-in ${!hasAudio ? 'opacity-50' : ''}`} />
          ) : (
            <MicOff size={24} className={`animate-scale-in ${!hasAudio ? 'opacity-50' : ''}`} />
          )}
          {hasAudio && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current animate-pulse" />}
        </div>
      </Button>
    </div>
  );
};

export default MediaControls;