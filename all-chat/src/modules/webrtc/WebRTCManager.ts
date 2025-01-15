import { useRef, useState, useEffect } from 'react';
import { logEvent } from '@/utils/logging';
import { safeSendWebSocket } from '@/utils/websocket';
import React from 'react';
import {
  getMediaDevices,
  switchCamera,
  getOptimizedConstraints,
  handleOrientationChange,
  MediaDeviceInfo
} from '@/modules/media/MobileMediaUtils';

export interface WebRTCState {
  peerConnections: { [key: string]: RTCPeerConnection };
  remoteVideos: React.RefObject<HTMLVideoElement>[];
}

// WebRTC configuration
const configuration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const useWebRTC = (currentUserId?: string) => {
  const [peerConnections, setPeerConnections] = useState<{ [key: string]: RTCPeerConnection }>({});
  const [remoteVideos, setRemoteVideos] = useState<React.RefObject<HTMLVideoElement>[]>([]);
  const [availableDevices, setAvailableDevices] = useState<{
    videoDevices: MediaDeviceInfo[];
    audioDevices: MediaDeviceInfo[];
  }>({ videoDevices: [], audioDevices: [] });
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  // Handle device enumeration
  useEffect(() => {
    const initializeDevices = async () => {
      try {
        const devices = await getMediaDevices();
        setAvailableDevices(devices);
      } catch (error) {
        logEvent('Error initializing devices', { error });
      }
    };

    initializeDevices();
  }, []);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientation = async () => {
      if (mediaStreamRef.current) {
        await handleOrientationChange(mediaStreamRef.current);
      }
    };

    window.addEventListener('orientationchange', handleOrientation);
    return () => window.removeEventListener('orientationchange', handleOrientation);
  }, []);

  const cleanupPeerConnection = (remoteUserId: string) => {
    logEvent('Cleaning up peer connection', { remoteUserId });
    const pc = peerConnections[remoteUserId];
    if (pc) {
      pc.close();
      const newConnections = { ...peerConnections };
      delete newConnections[remoteUserId];
      setPeerConnections(newConnections);
      
      // Remove associated video element
      setRemoteVideos(prev => prev.filter((_, index) => 
        index !== Object.keys(peerConnections).indexOf(remoteUserId)
      ));
    }
  };

  const createPeerConnection = (remoteUserId: string) => {
    logEvent('Creating peer connection', { remoteUserId });
    try {
      // Initialize RTCPeerConnection with ICE servers for WebRTC
      const peerConnection = new RTCPeerConnection(configuration);

      // Add local tracks to the peer connection
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          if (mediaStreamRef.current) {
            peerConnection.addTrack(track, mediaStreamRef.current);
            logEvent('Added local track to peer connection', { 
              remoteUserId, 
              trackKind: track.kind 
            });
          }
        });
      }

      peerConnection.onicecandidate = (event) => {
        handleIceCandidate(event, remoteUserId);
      };

      peerConnection.ontrack = (event) => {
        logEvent('Remote track received', { remoteUserId, trackType: event.track.kind });
        const [remoteStream] = event.streams;
        const newVideoRef = React.createRef<HTMLVideoElement>();
        setRemoteVideos(prev => [...prev, newVideoRef]);
        
        queueMicrotask(() => {
          if (newVideoRef.current) {
            newVideoRef.current.srcObject = remoteStream;
            newVideoRef.current.play().catch(err => {
              logEvent('Error playing remote stream', { error: err.message });
            });
            logEvent('Remote stream attached to video element', { remoteUserId });
          }
        });
      };

      peerConnection.onconnectionstatechange = () => {
        logEvent('Connection state changed', { 
          state: peerConnection.connectionState,
          remoteUserId 
        });
        
        switch (peerConnection.connectionState) {
          case 'connected':
            logEvent('Connected to peer', { remoteUserId });
            break;
          case 'disconnected':
          case 'failed':
            logEvent('Connection lost', { remoteUserId });
            cleanupPeerConnection(remoteUserId);
            break;
        }
      };

      // Store the peer connection
      setPeerConnections(prev => ({
        ...prev,
        [remoteUserId]: peerConnection
      }));

      return peerConnection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logEvent('Error creating peer connection', { error: errorMessage });
      return null;
    }
  };

  const handleIceCandidate = async (event: RTCPeerConnectionIceEvent, remoteUserId: string) => {
    try {
      if (event.candidate && websocket.current) {
        logEvent('ICE candidate generated', { remoteUserId });
        
        safeSendWebSocket(websocket.current, {
          type: 'ice-candidate',
          candidate: event.candidate,
          to: remoteUserId,
          from: currentUserId
        });
      }
    } catch (error) {
      logEvent('Error handling ICE candidate', { error, remoteUserId });
    }
  };

  const handleWebRTCSignaling = async (message: any) => {
    const { type, from, to, sdp, candidate } = message;
    
    if (to !== currentUserId) return;

    let pc = peerConnections[from];
    if (!pc) {
      logEvent('Creating new peer connection for signaling', { remoteUserId: from });
      const newPc = createPeerConnection(from);
      if (!newPc) {
        logEvent('Failed to create peer connection for signaling', { remoteUserId: from });
        return;
      }
      pc = newPc;
    }

    try {
      switch (type) {
        case 'offer':
          logEvent('Received offer', { from });
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          safeSendWebSocket(websocket.current, {
            type: 'answer',
            sdp: answer,
            to: from,
            from: currentUserId
          });
          break;
          
        case 'answer':
          logEvent('Received answer', { from });
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          break;
          
        case 'ice-candidate':
          logEvent('Received ICE candidate', { from });
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          break;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logEvent('Error in WebRTC signaling', { error: errorMessage });
    }
  };

  const initiateCall = async (remoteUserId: string) => {
    logEvent('Initiating call', { remoteUserId });
    const pc = createPeerConnection(remoteUserId);
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      safeSendWebSocket(websocket.current, {
        type: 'offer',
        sdp: offer,
        to: remoteUserId,
        from: currentUserId
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logEvent('Error creating offer', { error: errorMessage });
      cleanupPeerConnection(remoteUserId);
    }
  };

  const setMediaStream = async (stream: MediaStream) => {
    try {
      // Get optimized constraints based on network conditions
      const optimizedConstraints = await getOptimizedConstraints();
      
      // Apply optimized constraints to the stream
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        await videoTrack.applyConstraints(optimizedConstraints.video as MediaTrackConstraints);
      }

      mediaStreamRef.current = stream;
      
      // Update all peer connections with the new stream
      Object.values(peerConnections).forEach(pc => {
        const senders = pc.getSenders();
        senders.forEach(sender => {
          if (sender.track?.kind === 'video') {
            sender.replaceTrack(videoTrack);
          }
        });
      });
    } catch (error) {
      logEvent('Error setting media stream', { error });
    }
  };

  // Add new method for switching cameras
  const switchCameraDevice = async () => {
    try {
      if (!mediaStreamRef.current) {
        throw new Error('No media stream available');
      }

      const newStream = await switchCamera(mediaStreamRef.current);
      await setMediaStream(newStream);

      return newStream;
    } catch (error) {
      logEvent('Error switching camera', { error });
      throw error;
    }
  };

  const setWebSocket = (ws: WebSocket) => {
    websocket.current = ws;
  };

  const cleanup = () => {
    // Close all peer connections
    Object.keys(peerConnections).forEach(cleanupPeerConnection);
    
    // Stop all tracks in the media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  return {
    remoteVideos,
    handleWebRTCSignaling,
    initiateCall,
    setMediaStream,
    setWebSocket,
    cleanup,
    switchCameraDevice,
    availableDevices
  };
};
