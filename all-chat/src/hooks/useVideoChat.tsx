import React, { useRef, useState, RefObject, useEffect } from 'react';
import { Socket } from 'socket.io-client';

// Custom hook for managing video chat
const useVideoChat = (
  socketRef: React.MutableRefObject<Socket | null>,
  groupSize: number | 'any'
) => {
  // Reference for the local video element
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // References for the remote video elements
  const remoteVideoRefs = useRef<RefObject<HTMLVideoElement>[]>([]);

  // State for storing the WebRTC peer connections
  const [peerConnections, setPeerConnections] = useState<RTCPeerConnection[]>([]);

  useEffect(() => {
    // Update remoteVideoRefs when groupSize changes
    const peerCount = groupSize === 'any' ? 1 : groupSize - 1;
    remoteVideoRefs.current = Array.from({ length: peerCount }, () => React.createRef<HTMLVideoElement>());
  }, [groupSize]);

  // Initialize WebRTC Peer Connection for each participant
  const initializePeerConnection = () => {
    const peerCount = groupSize === 'any' ? 1 : groupSize - 1;
    const newPeerConnections = Array.from({ length: peerCount }, () => new RTCPeerConnection());

    setPeerConnections(newPeerConnections);

    newPeerConnections.forEach((peerConnection, index) => {
      peerConnection.ontrack = (event) => {
        if (remoteVideoRefs.current[index]?.current) {
          remoteVideoRefs.current[index]!.current!.srcObject = event.streams[0];
        }
      };
    });
  };

  // Function to start the video chat
  const startChat = async () => {
    console.log('Getting local stream...');
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => {
        console.warn('Unable to access video and audio. Falling back to audio only.');
        return navigator.mediaDevices.getUserMedia({ audio: true });
      }).catch(() => {
        console.warn('Unable to access audio. Proceeding with empty stream.');
        return new MediaStream();
      });
      console.log('Local stream obtained');

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        console.log('Local video stream set');
      } else {
        console.warn('Local video ref is null');
      }

      // Add the local stream to each peer connection
      peerConnections.forEach((peerConnection) => {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      });

      // Simulating peer connections for demonstration purposes
      // In a real application, this would be handled by your signaling server
      setTimeout(() => {
        peerConnections.forEach((_, index) => {
          const fakeRemoteStream = new MediaStream();
          if (remoteVideoRefs.current[index]?.current) {
            remoteVideoRefs.current[index]!.current!.srcObject = fakeRemoteStream;
          }
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error; // Re-throw the error to be caught in the component
    }
  };

  // Function to stop the video chat
  const stopChat = () => {
    peerConnections.forEach((peerConnection) => {
      peerConnection.close();
    });

    // Clear the local video stream
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }

    // Clear the remote video elements
    remoteVideoRefs.current.forEach((ref) => {
      if (ref.current && ref.current.srcObject) {
        const stream = ref.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        ref.current.srcObject = null;
      }
    });

    setPeerConnections([]); // Reset peer connections
  };

  // Function to handle the "Next" button (switching groups)
  const nextChat = async () => {
    stopChat(); // Stop the current chat
    initializePeerConnection(); // Re-initialize peer connections
    await startChat(); // Start the new chat
  };

  return {
    localVideoRef,
    remoteVideoRefs,
    initializePeerConnection,
    startChat,
    stopChat,
    nextChat,
  };
};

export default useVideoChat;
