import React, { useState, useRef, useEffect, RefObject } from 'react';
import { io, Socket } from 'socket.io-client';
import useVideoChat from '../hooks/useVideoChat';
import Header from './Header';
import Footer from './Footer';
import VideoGrid from './VideoGrid';
import ChatControls from './ChatControls';
import TextChat from './TextChat';

const VideoChat: React.FC = () => {
  const [isChatActive, setIsChatActive] = useState(false);
  const [groupSize, setGroupSize] = useState<number | 'any'>(2);
  const [remoteVideos, setRemoteVideos] = useState<RefObject<HTMLVideoElement>[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);

  const { localVideoRef, remoteVideoRefs, initializePeerConnection, startChat, stopChat, nextChat } = useVideoChat(socketRef, groupSize);

  useEffect(() => {
    if (isChatActive) {
      updateRemoteVideos();
    }
  }, [groupSize, isChatActive]);

  const updateRemoteVideos = () => {
    const peerCount = groupSize === 'any' ? 1 : groupSize - 1;
    setRemoteVideos(remoteVideoRefs.current.slice(0, peerCount));
  };

  const handleStartChat = async () => {
    try {
      console.log('Starting chat...');
      socketRef.current = io('http://localhost:3000');
      initializePeerConnection();
      await startChat();
      console.log('Chat started successfully');
      setIsChatActive(true);
      setIsWaiting(true);
      // Simulating wait time for others to join
      setTimeout(() => {
        setIsWaiting(false);
        updateRemoteVideos();
      }, 5000); // Adjust time as needed
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleStopChat = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    stopChat();
    setIsChatActive(false);
    setRemoteVideos([]);
  };

  const handleNextChat = async () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
      await nextChat();
      updateRemoteVideos();
    }
  };

  const handleSendMessage = (message: string) => {
    const newMessage = { text: message, sender: 'You' };
    setMessages([...messages, newMessage]);
    // Here you would also send the message to other participants
    // For example: socket.emit('send-message', newMessage);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="flex w-full max-w-6xl">
          <div className="w-2/3 pr-4">
            <VideoGrid 
              groupSize={groupSize} 
              localVideoRef={localVideoRef} 
              remoteVideos={remoteVideos} 
              isChatActive={isChatActive}
            />
            <ChatControls
              groupSize={groupSize}
              setGroupSize={setGroupSize}
              isChatActive={isChatActive}
              handleStartChat={handleStartChat}
              handleStopChat={handleStopChat}
              handleNextChat={handleNextChat}
            />
          </div>
          <div className="w-1/3 bg-gray-200 p-4 rounded-lg">
            <TextChat
              isChatActive={isChatActive}
              onSendMessage={handleSendMessage}
              messages={messages}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoChat;