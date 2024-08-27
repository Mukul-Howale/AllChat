import React, { useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client'; // Import Socket from 'socket.io-client'
import useVideoChat from '../hooks/useVideoChat';

const VideoChat: React.FC = () => {
  const [isChatActive, setIsChatActive] = useState(false); // State to track if the chat is active
  const socketRef = useRef<Socket | null>(null); // Ref to hold the Socket.io connection
  const { localVideoRef, remoteVideoRef, initializePeerConnection, startChat, stopChat } = useVideoChat(socketRef);

  // Handler function to start the video chat
  const handleStartChat = async () => {
    try {
      // Initialize Socket.io connection only when the Start Chat button is clicked
      socketRef.current = io('http://localhost:3000');

      // Initialize WebRTC peer connection
      initializePeerConnection();

      // Start the chat (exchange offers/answers)
      await startChat();
      setIsChatActive(true); // Update state to reflect chat status
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  // Handler function to stop the video chat
  const handleStopChat = () => {
    if (socketRef.current) {
      socketRef.current.disconnect(); // Disconnect the Socket.io connection
    }
    stopChat(); // Stop the WebRTC connection and video streams
    setIsChatActive(false); // Update state to reflect chat status
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-4xl grid grid-cols-2 gap-4">
        {/* Local Video */}
        <div className="bg-black flex justify-center items-center rounded-lg p-4">
          <video ref={localVideoRef} className="w-full h-auto rounded-lg" autoPlay muted playsInline />
        </div>
        {/* Remote Video */}
        <div className="bg-black flex justify-center items-center rounded-lg p-4">
          <video ref={remoteVideoRef} className="w-full h-auto rounded-lg" autoPlay playsInline />
        </div>
      </div>
      {/* Start/Stop Chat Buttons */}
      {!isChatActive ? (
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg" onClick={handleStartChat}>
          Start Chat
        </button>
      ) : (
        <button className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg" onClick={handleStopChat}>
          Stop Chat
        </button>
      )}
    </div>
  );
};

export default VideoChat;
