import React from 'react';
import { WebSocketMessage } from '../types/chat';

export const RTCConfiguration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const createPeerConnection = (
  remoteUserId: string,
  currentUserId: string,
  websocket: WebSocket,
  onTrack: (stream: MediaStream, ref: React.RefObject<HTMLVideoElement>) => void,
  onConnectionStateChange: (state: RTCPeerConnectionState, userId: string) => void
): RTCPeerConnection => {
  const peerConnection = new RTCPeerConnection(RTCConfiguration);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && websocket) {
      const message: WebSocketMessage = {
        type: 'ice-candidate',
        candidate: event.candidate.toJSON(),
        to: remoteUserId,
        from: currentUserId
      };
      websocket.send(JSON.stringify(message));
    }
  };

  peerConnection.ontrack = (event) => {
    const [remoteStream] = event.streams;
    const newVideoRef = React.createRef<HTMLVideoElement>();
    onTrack(remoteStream, newVideoRef);
  };

  peerConnection.onconnectionstatechange = () => {
    onConnectionStateChange(peerConnection.connectionState, remoteUserId);
  };

  return peerConnection;
};

export const initiateCall = async (
  peerConnection: RTCPeerConnection,
  mediaStream: MediaStream,
  websocket: WebSocket,
  currentUserId: string,
  remoteUserId: string
) => {
  mediaStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, mediaStream);
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const message: WebSocketMessage = {
    type: 'offer',
    sdp: offer,
    to: remoteUserId,
    from: currentUserId
  };
  websocket.send(JSON.stringify(message));
};
