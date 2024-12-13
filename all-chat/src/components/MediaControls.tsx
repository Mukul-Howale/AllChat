import React from 'react';
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';
import styles from '@/styles/shared.module.css';

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
    <div className="flex space-x-2">
      <Button
        onClick={toggleVideo}
        variant="outline"
        className={`elevation-1 ${styles.button} ${
          isVideoOn 
            ? 'bg-theme-surface text-theme-foreground hover:bg-theme-surface-200' 
            : 'bg-theme-surface-800 text-error-200 hover:bg-theme-surface-700'
        }`}
      >
        {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
      </Button>
      <Button
        onClick={toggleAudio}
        variant="outline"
        className={`elevation-1 ${styles.button} ${
          isAudioOn 
            ? 'bg-theme-surface text-theme-foreground hover:bg-theme-surface-200' 
            : 'bg-theme-surface-800 text-error-200 hover:bg-theme-surface-700'
        }`}
      >
        {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
      </Button>
    </div>
  );
};

export default MediaControls;