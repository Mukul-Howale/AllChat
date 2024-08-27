import React, { useState } from 'react';
import useVideoChat from '../hooks/useVideoChat';

const VideoChat: React.FC = () => {
  // Custom hook to handle WebRTC and Socket.io logic
  const { localVideoRef, remoteVideoRef, createOffer, stopChat } = useVideoChat();
  // State to track if the chat is active
  const [isChatActive, setIsChatActive] = useState(false);

  // Handler function to start the video chat
  const handleStartChat = async () => {
    await createOffer(); // Create an offer to start the chat
    setIsChatActive(true); // Set chat state to active
  };

  // Handler function to stop the video chat
  const handleStopChat = () => {
    stopChat(); // Stop the chat by calling the stopChat function from the custom hook
    setIsChatActive(false); // Set chat state to inactive
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-4xl grid grid-cols-2 gap-4">
        {/* Container for local video */}
        <div className="bg-black flex justify-center items-center rounded-lg p-4">
          <video
            ref={localVideoRef} // Reference to the local video stream
            className="w-full h-auto rounded-lg"
            autoPlay
            muted
            playsInline
          />
        </div>
        {/* Container for remote video */}
        <div className="bg-black flex justify-center items-center rounded-lg p-4">
          <video
            ref={remoteVideoRef} // Reference to the remote video stream
            className="w-full h-auto rounded-lg"
            autoPlay
            playsInline
          />
        </div>
      </div>
      {/* Conditionally render buttons based on chat state */}
      {!isChatActive ? (
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          onClick={handleStartChat} // Start chat on click
        >
          Start Chat
        </button>
      ) : (
        <button
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg"
          onClick={handleStopChat} // Stop chat on click
        >
          Stop Chat
        </button>
      )}
    </div>
  );
};

export default VideoChat;
