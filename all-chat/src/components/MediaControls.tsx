import React from 'react';
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';

interface MediaControlsProps {
  isVideoOn: boolean;
  isAudioOn: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

const MediaControls: React.FC<MediaControlsProps> = ({
  isVideoOn,
  isAudioOn,
  toggleVideo,
  toggleAudio
}) => {
  return (
    <div className="flex space-x-3 animate-fade-in">
      <Button
        onClick={toggleVideo}
        className={`p-3 rounded-full elevation-2 button-hover focus-ring ${
          isVideoOn 
            ? 'bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700' 
            : 'bg-error-500 text-white hover:bg-error-600'
        } transition-all duration-200`}
        aria-label={isVideoOn ? 'Turn off video' : 'Turn on video'}
      >
        <div className="relative">
          {isVideoOn ? (
            <Video size={24} className="animate-scale-in" />
          ) : (
            <VideoOff size={24} className="animate-scale-in" />
          )}
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current animate-pulse" />
        </div>
      </Button>
      <Button
        onClick={toggleAudio}
        className={`p-3 rounded-full elevation-2 button-hover focus-ring ${
          isAudioOn 
            ? 'bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700' 
            : 'bg-error-500 text-white hover:bg-error-600'
        } transition-all duration-200`}
        aria-label={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
      >
        <div className="relative">
          {isAudioOn ? (
            <Mic size={24} className="animate-scale-in" />
          ) : (
            <MicOff size={24} className="animate-scale-in" />
          )}
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current animate-pulse" />
        </div>
      </Button>
    </div>
  );
};

export default MediaControls;