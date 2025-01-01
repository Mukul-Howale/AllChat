import { useRef, useState } from 'react';
import { logEvent } from '@/utils/logging';
import React from 'react';

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
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  const createPeerConnection = (remoteUserId: string) => {
    logEvent('Creating peer connection', { remoteUserId });
    try {
      // Initialize RTCPeerConnection with ICE servers for WebRTC
      const peerConnection = new RTCPeerConnection(configuration);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && websocket.current) {
          logEvent('ICE candidate generated', { remoteUserId });
          websocket.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            to: remoteUserId,
            from: currentUserId
          }));
        }
      };

      peerConnection.ontrack = (event) => {
        logEvent('Remote track received', { remoteUserId, trackType: event.track.kind });
        const [remoteStream] = event.streams;
        const newVideoRef = React.createRef<HTMLVideoElement>();
        setRemoteVideos(prev => [...prev, newVideoRef]);
        
        queueMicrotask(() => {
          if (newVideoRef.current) {
            newVideoRef.current.srcObject = remoteStream;
            logEvent('Remote stream attached to video element', { remoteUserId });
          }
        });
      };

      peerConnection.onconnectionstatechange = () => {
        logEvent('Peer connection state changed', { 
          remoteUserId, 
          state: peerConnection.connectionState 
        });
      };

      peerConnection.oniceconnectionstatechange = () => {
        logEvent('ICE connection state changed', {
          remoteUserId,
          state: peerConnection.iceConnectionState
        });
      };

      if (mediaStreamRef.current) {
        const tracks = mediaStreamRef.current.getTracks();
        logEvent('Adding local tracks to peer connection', { 
          remoteUserId, 
          trackCount: tracks.length 
        });
        tracks.forEach(track => {
          if (mediaStreamRef.current) {
            peerConnection.addTrack(track, mediaStreamRef.current);
          }
        });
      }

      setPeerConnections(prev => ({
        ...prev,
        [remoteUserId]: peerConnection
      }));

      return peerConnection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logEvent('Error creating peer connection', { 
        remoteUserId, 
        error: errorMessage 
      });
      return null;
    }
  };

  const handleWebRTCSignaling = async (data: any) => {
    const { type, from, to, sdp, candidate } = data;
    logEvent('Received WebRTC signal', { type, from, to });

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
      if (type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (websocket.current) {
          websocket.current.send(JSON.stringify({
            type: 'answer',
            sdp: answer,
            to: from,
            from: currentUserId
          }));
        }
      } else if (type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } else if (type === 'ice-candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logEvent('Error handling WebRTC signaling', { 
        type, 
        error: errorMessage 
      });
    }
  };

  const initiateCall = async (remoteUserId: string) => {
    logEvent('Initiating call', { remoteUserId });
    const pc = createPeerConnection(remoteUserId);
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (websocket.current) {
        websocket.current.send(JSON.stringify({
          type: 'offer',
          sdp: offer,
          to: remoteUserId,
          from: currentUserId
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logEvent('Error initiating call', { 
        remoteUserId, 
        error: errorMessage 
      });
    }
  };

  const setMediaStream = (stream: MediaStream) => {
    mediaStreamRef.current = stream;
  };

  const setWebSocket = (ws: WebSocket) => {
    websocket.current = ws;
  };

  const cleanup = () => {
    Object.values(peerConnections).forEach(pc => pc.close());
    setPeerConnections({});
    setRemoteVideos([]);
    mediaStreamRef.current = null;
  };

  return {
    peerConnections,
    remoteVideos,
    createPeerConnection,
    handleWebRTCSignaling,
    initiateCall,
    setMediaStream,
    setWebSocket,
    cleanup
  };
};
