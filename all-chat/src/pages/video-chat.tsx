import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import VideoGrid from '../components/VideoGrid';
import ChatControls from '../components/ChatControls';
import TextChat from '../components/TextChat';
import MediaControls from '../components/MediaControls';
import Header from '../layouts/Header';
import { useRouter } from 'next/router';
import { getUser, isAuthenticated } from '@/utils/auth';

const VideoChat: React.FC = () => {
  const router = useRouter();
  const [groupSize, setGroupSize] = useState<number | 'any'>(2);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteVideos, setRemoteVideos] = useState<React.RefObject<HTMLVideoElement>[]>([]);
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Establish WebSocket connection
    const token = localStorage.getItem('token');
    if(token) {
      websocket.current = new WebSocket(`ws://localhost:8080/ws/chat?token=${token}`);

    if (websocket.current) {
      websocket.current.onopen = () => {
        console.log('WebSocket connection established');
      };

      websocket.current.onmessage = (event) => {
        // Handle incoming messages
        console.log('Received message:', event.data);
        // You might want to update your chat state here
        // For example:
        // const newMessage = JSON.parse(event.data);
        // setMessages(prevMessages => [...prevMessages, newMessage]);
      };

      websocket.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
    }

    // Cleanup function
    return () => {      
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }
  else {
    router.push('/auth');
  }
  }, [router, isChatActive]);

  const handleStartChat = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
    setIsWaiting(true);
    try {
      const response = await fetch('/api/chat/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ groupSize }),
      });
      // ... rest of your handleStartChat logic
    } catch (error) {
      console.error('Error starting chat:', error);
    }
    
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
    
    // Send message through WebSocket
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify(newMessage));
    }
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
    <div className="flex flex-col h-screen bg-gray-900">
      <Header/>
      <div className="flex flex-grow overflow-hidden p-4">
        <div className="flex flex-col w-3/4 pr-4">
          <div className="flex-grow bg-gray-800 rounded-lg overflow-hidden mb-4">
            {renderVideoArea()}
          </div>
          <div className="flex items-center justify-between">
            <MediaControls
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
              toggleVideo={toggleVideo}
              toggleAudio={toggleAudio}
            />
            <ChatControls
              groupSize={groupSize}
              setGroupSize={setGroupSize}
              isChatActive={isChatActive}
              isWaiting={isWaiting}
              handleStartChat={handleStartChat}
              handleStopChat={handleStopChat}
              handleNextChat={handleNextChat}
            />
            <div className="w-1/4"></div> {/* Spacer for alignment */}
          </div>
        </div>
        <div className="w-1/4 flex flex-col">
          <div className="flex-grow bg-gray-800 rounded-lg overflow-hidden">
            <TextChat
              isChatActive={isChatActive}
              onSendMessage={handleSendMessage}
              messages={messages}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;