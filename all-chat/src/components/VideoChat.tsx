import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import VideoGrid from './VideoGrid';
import ChatControls from './ChatControls';
import TextChat from './TextChat';
import MediaControls from './MediaControls';

const VideoChat: React.FC = () => {
  const [groupSize, setGroupSize] = useState<number | 'any'>(2);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteVideos, setRemoteVideos] = useState<React.RefObject<HTMLVideoElement>[]>([]);

  useEffect(() => {
    const newRemoteVideos = Array(typeof groupSize === 'number' ? groupSize - 1 : 1)
      .fill(null)
      .map(() => React.createRef<HTMLVideoElement>());
    setRemoteVideos(newRemoteVideos);
  }, [groupSize]);

  const handleStartChat = async () => {
    setIsWaiting(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }

    setTimeout(() => {
      setIsWaiting(false);
      setIsChatActive(true);
    }, 5000);
  };

  const handleStopChat = () => {
    setIsChatActive(false);
    setMessages([]);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleNextChat = () => {
    // Implement logic for moving to next chat
  };

  const handleSendMessage = (message: string) => {
    const newMessage = { text: message, sender: 'You' };
    setMessages([...messages, newMessage]);
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const videoTrack = (localVideoRef.current.srcObject as MediaStream)
        .getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const audioTrack = (localVideoRef.current.srcObject as MediaStream)
        .getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const renderVideoArea = () => {
    if (isWaiting) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
          <Clock className="w-16 h-16 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold text-center text-white">Waiting for others to join...</h2>
          <p className="text-center text-gray-300 text-sm">
            {typeof groupSize === 'number' ? `${groupSize - 1} more ${groupSize - 1 === 1 ? 'person' : 'people'} needed` : 'Waiting for others'} to start the chat
          </p>
        </div>
      );
    } else if (isChatActive) {
      return (
        <VideoGrid 
          groupSize={groupSize} 
          localVideoRef={localVideoRef} 
          remoteVideos={remoteVideos} 
          isChatActive={isChatActive}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
          <h2 className="text-2xl font-bold text-center text-white">Ready to start a new chat?</h2>
          <p className="text-center text-gray-300 text-sm">
            Select the number of participants and click "Start Chat" when you're ready.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      <div className="flex flex-col w-3/4 p-4">
        <div className="flex-grow bg-gray-800 rounded-lg overflow-hidden">
          <div className="w-full h-full">
            {renderVideoArea()}
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="w-1/4">
            <MediaControls
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
              toggleVideo={toggleVideo}
              toggleAudio={toggleAudio}
            />
          </div>
          <div className="w-1/2 flex justify-center">
            <ChatControls
              groupSize={groupSize}
              setGroupSize={setGroupSize}
              isChatActive={isChatActive}
              isWaiting={isWaiting}
              handleStartChat={handleStartChat}
              handleStopChat={handleStopChat}
              handleNextChat={handleNextChat}
            />
          </div>
          <div className="w-1/4"></div>
        </div>
      </div>
      <div className="w-1/4 bg-gray-800 p-4">
        <TextChat
          isChatActive={isChatActive}
          onSendMessage={handleSendMessage}
          messages={messages}
        />
      </div>
    </div>
  );
};

export default VideoChat;