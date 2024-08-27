import { useRef } from 'react';
import { Socket } from 'socket.io-client'; // Import the Socket type

const useVideoChat = (socketRef: React.MutableRefObject<Socket | null>) => {
  const localVideoRef = useRef<HTMLVideoElement>(null); // Ref for the local video element
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // Ref for the remote video element
  let peerConnection: RTCPeerConnection | null = null; // WebRTC peer connection

  // Function to initialize the WebRTC peer connection
  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // STUN server configuration
    };
    peerConnection = new RTCPeerConnection(configuration); // Create a new RTCPeerConnection

    // Handle ICE candidates and send them to the remote peer
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', event.candidate);
      }
    };

    // Set the remote stream to the remote video element when tracks are received
    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  };

  // Function to start the video chat
  const startChat = async () => {
    try {
      // Get the local media stream (video and audio)
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream; // Set the local video stream to the local video element
      }

      // Add local tracks to the peer connection
      localStream.getTracks().forEach((track) => {
        if (peerConnection) {
          peerConnection.addTrack(track, localStream);
        }
      });

      if (socketRef.current && peerConnection) {
        // Create an offer and set it as the local description
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socketRef.current.emit('offer', offer); // Send the offer to the remote peer

        // Listen for an answer from the remote peer
        socketRef.current.on('answer', async (answer) => {
          if (peerConnection) {
            await peerConnection.setRemoteDescription(answer); // Set the remote description with the received answer
          }
        });

        // Listen for ICE candidates from the remote peer
        socketRef.current.on('ice-candidate', async (candidate) => {
          if (peerConnection) {
            await peerConnection.addIceCandidate(candidate); // Add the received ICE candidate to the peer connection
          }
        });
      }
    } catch (error) {
      console.error('Error during startChat:', error);
    }
  };

  // Function to stop the video chat
  const stopChat = () => {
    if (peerConnection) {
      peerConnection.close(); // Close the peer connection
      peerConnection = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null; // Clear the local video element
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null; // Clear the remote video element
    }
  };

  return { localVideoRef, remoteVideoRef, initializePeerConnection, startChat, stopChat };
};

export default useVideoChat;
