// This component handles the video chat interface, with two video elements for local and remote streams.
import React from 'react';
import useVideoChat from '../hooks/useVideoChat';

const VideoChat: React.FC = () => {
  // Custom hook to handle the WebRTC and Socket.io logic
  const { localVideoRef, remoteVideoRef, createOffer } = useVideoChat();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
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
      {/* Button to start the video chat by creating an offer */}
      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
        onClick={createOffer}
      >
        Start Chat
      </button>
    </div>
  );
};

export default VideoChat;
