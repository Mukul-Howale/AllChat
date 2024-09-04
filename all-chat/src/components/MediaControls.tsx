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
    <div className="flex space-x-2">
      <Button
        onClick={toggleVideo}
        variant="outline"
        className="bg-gray-700 text-white hover:bg-gray-600"
      >
        {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
      </Button>
      <Button
        onClick={toggleAudio}
        variant="outline"
        className="bg-gray-700 text-white hover:bg-gray-600"
      >
        {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
      </Button>
    </div>
  );
};

export default MediaControls;