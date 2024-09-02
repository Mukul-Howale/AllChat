import React, { useState, useRef, useEffect, RefObject } from 'react';
import { io, Socket } from 'socket.io-client';
import useVideoChat from '../hooks/useVideoChat';

const VideoChat: React.FC = () => {
  const [isChatActive, setIsChatActive] = useState(false); // Track if the chat is active
  const [groupSize, setGroupSize] = useState<number | 'any'>(2); // Track selected group size (default is 2)
  const socketRef = useRef<Socket | null>(null);

  // Update the hook to match the new type of remoteVideoRefs
  const { localVideoRef, remoteVideoRefs, initializePeerConnection, startChat, stopChat, nextChat } = useVideoChat(socketRef, groupSize);

  // Update this useEffect hook
  useEffect(() => {
    if (groupSize !== 'any') {
      const newRefs: RefObject<HTMLVideoElement>[] = Array.from({ length: groupSize - 1 }, () => React.createRef<HTMLVideoElement>());
      remoteVideoRefs.current = newRefs;
    }
  }, [groupSize]);

  // Handler function for starting the chat
  const handleStartChat = async () => {
    try {
      socketRef.current = io('http://localhost:3000'); // Initialize Socket.io connection
      initializePeerConnection(); // Initialize WebRTC peer connection
      await startChat(); // Start the chat (offer/answer exchange)
      setIsChatActive(true); // Set chat status to active
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  // Handler function for stopping the chat
  const handleStopChat = () => {
    if (socketRef.current) {
      socketRef.current.disconnect(); // Disconnect Socket.io connection
    }
    stopChat(); // Stop WebRTC and clear streams
    setIsChatActive(false); // Set chat status to inactive
  };

  // Handler function for moving to the next chat group
  const handleNextChat = async () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room'); // Leave the current chat group
      await nextChat(); // Start a new chat group
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className={`w-full max-w-4xl grid gap-4 ${
        groupSize === 'any' ? 'grid-cols-2' :
        groupSize === 2 ? 'grid-cols-2' :
        groupSize === 3 ? 'grid-cols-3' :
        'grid-cols-2 md:grid-cols-4'
      }`}>
        {/* Local Video */}
        <div className="bg-black flex justify-center items-center rounded-lg p-4">
          <video ref={localVideoRef} className="w-full h-auto rounded-lg" autoPlay muted playsInline />
        </div>
        {/* Remote Videos */}
        {remoteVideoRefs.current.map((ref: RefObject<HTMLVideoElement>, index: number) => (
          <div key={index} className="bg-black flex justify-center items-center rounded-lg p-4">
            <video ref={ref} className="w-full h-auto rounded-lg" autoPlay playsInline />
          </div>
        ))}
      </div>
      <div className="mt-4 flex space-x-4">
        {/* Group Size Selection */}
        <select
          className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value === 'any' ? 'any' : parseInt(e.target.value))}
          disabled={isChatActive} // Disable selection while chat is active
        >
          <option value={2}>2 People</option>
          <option value={3}>3 People</option>
          <option value={4}>4 People</option>
          <option value="any">Any</option>
        </select>
        {/* Start/Stop Chat Buttons */}
        {!isChatActive ? (
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg" onClick={handleStartChat}>
            Start Chat
          </button>
        ) : (
          <button className="px-6 py-2 bg-red-600 text-white rounded-lg" onClick={handleStopChat}>
            Stop Chat
          </button>
        )}
        {/* Next Button (Only visible if chat is active) */}
        {isChatActive && (
          <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg" onClick={handleNextChat}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoChat;
