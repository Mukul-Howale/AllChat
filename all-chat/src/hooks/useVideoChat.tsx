// This custom hook manages the WebRTC connection and communication via Socket.io.
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// ICE servers configuration for WebRTC
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const useVideoChat = () => {
  // References to the video elements for local and remote streams
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  // Reference to the RTCPeerConnection instance
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  // Reference to the Socket.io client
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Socket.io connection to the server
    socketRef.current = io('http://localhost:3000');

    // Listen for incoming offer from another peer
    socketRef.current.on('offer', async (offer: RTCSessionDescriptionInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socketRef.current.emit('answer', answer); // Send answer back to the peer
      }
    });

    // Listen for incoming answer from the peer
    socketRef.current.on('answer', async (answer: RTCSessionDescriptionInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Listen for incoming ICE candidates
    socketRef.current.on('ice-candidate', async (candidate: RTCIceCandidate) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error adding received ice candidate', error);
      }
    });

    // Create a new RTCPeerConnection instance with the provided ICE servers
    peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

    // Send any ICE candidates to the peer
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', event.candidate);
      }
    };

    // Add the remote stream to the remote video element when it arrives
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Get user media (local video and audio stream)
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        // Add tracks to the RTCPeerConnection
        stream.getTracks().forEach((track) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, stream);
          }
        });
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    // Call the getUserMedia function to access the user's camera and microphone
    getUserMedia();

    // Cleanup on component unmount
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Function to create and send an offer to the peer
  const createOffer = async () => {
    if (peerConnectionRef.current) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current.emit('offer', offer); // Send offer to the peer
    }
  };

  // Return the video element references and the createOffer function
  return { localVideoRef, remoteVideoRef, createOffer };
};

export default useVideoChat;
