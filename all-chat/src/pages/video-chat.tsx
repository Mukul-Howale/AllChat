import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/contexts/StoreContext';
import { useRouter } from 'next/router';
import VideoGrid from '../components/VideoGrid';
import ChatControls from '../components/ChatControls';
import TextChat from '../components/TextChat';
import MediaControls from '../components/MediaControls';
import Header from '../layouts/Header';
import { WebSocketMessage, ChatMessage } from '../types/chat';
import { createPeerConnection, initiateCall, RTCConfiguration } from '../utils/webrtc';
import { getAvailableMediaStream } from '../utils/media';
import { useWebSocket } from '../hooks/useWebSocket';

const VideoChat: React.FC = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { currentUser } = store.userStore;
  const [groupSize, setGroupSize] = useState<number | 'any'>(2);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [error, setError] = useState<{ type: 'media' | 'connection' | 'other'; message: string } | null>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [remoteVideos, setRemoteVideos] = useState<React.RefObject<HTMLVideoElement>[]>([]);
  const [peerConnections, setPeerConnections] = useState<{ [key: string]: RTCPeerConnection }>({});

  const handleTrack = (stream: MediaStream, ref: React.RefObject<HTMLVideoElement>) => {
    setRemoteVideos(prev => [...prev, ref]);
    queueMicrotask(() => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  };

  const handleConnectionStateChange = (state: RTCPeerConnectionState, userId: string) => {
    if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      setPeerConnections(prev => {
        const newConnections = { ...prev };
        delete newConnections[userId];
        return newConnections;
      });
    }
  };

  const handleWebRTCSignaling = async (data: WebSocketMessage) => {
    if (!currentUser) return;

    const peerConnection = peerConnections[data.from!] ||
      createPeerConnection(data.from!, currentUser.id, websocket.current!, handleTrack, handleConnectionStateChange);

    if (!peerConnections[data.from!]) {
      setPeerConnections(prev => ({ ...prev, [data.from!]: peerConnection }));
    }

    switch (data.type) {
      case 'offer':
        if (!data.sdp) {
          console.error('Received offer without SDP');
          return;
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => {
            peerConnection.addTrack(track, mediaStreamRef.current!);
          });
        }
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        websocket.current?.send(JSON.stringify({
          type: 'answer',
          sdp: answer,
          to: data.from,
          from: currentUser.id
        }));
        break;

      case 'answer':
        if (!data.sdp) {
          console.error('Received answer without SDP');
          return;
        }
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        break;

      case 'ice-candidate':
        if (data.candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        break;
    }
  };

  const websocket = useWebSocket({
    userId: currentUser?.id || '',
    onMessage: async (data: WebSocketMessage) => {
      switch (data.type) {
        case 'chat':
          if (data.message) {
            setMessages(prev => [...prev, data.message].filter((msg): msg is ChatMessage => msg !== undefined));
          }
          break;
        case 'userJoined':
          if (data.userId && currentUser) {
            await initiateCall(
              createPeerConnection(data.userId, currentUser.id, websocket.current!, handleTrack, handleConnectionStateChange),
              mediaStreamRef.current!,
              websocket.current!,
              currentUser.id,
              data.userId
            );
          }
          break;
        case 'userLeft':
          if (data.userId) {
            setPeerConnections(prev => {
              const newConnections = { ...prev };
              delete newConnections[data.userId!];
              return newConnections;
            });
          }
          break;
        default:
          await handleWebRTCSignaling(data);
      }
    },
    onError: () => setError({ type: 'connection', message: 'Connection error occurred' })
  });

  const handleStartChat = async () => {
    try {
      const stream = await getAvailableMediaStream({
        isVideoOn,
        isAudioOn,
        onMediaError: (type, message) => setError({ type, message }),
        onMediaStateChange: (video, audio) => {
          setHasVideo(video);
          setHasAudio(audio);
        }
      });

      if (stream && localVideoRef.current) {
        mediaStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;
        setIsChatActive(true);
        setIsWaiting(true);
      }
    } catch (err) {
      setError({
        type: 'media',
        message: 'Failed to access media devices'
      });
    }
  };

  const handleStopChat = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    Object.values(peerConnections).forEach(pc => pc.close());
    setPeerConnections({});
    setRemoteVideos([]);
    setIsChatActive(false);
    setIsWaiting(false);
    websocket.current?.close();
  };

  const handleSendMessage = (text: string) => {
    if (websocket.current && currentUser) {
      const message: WebSocketMessage = {
        type: 'chat',
        message: { text, sender: currentUser.id }
      };
      websocket.current.send(JSON.stringify(message));
    }
  };

  const handleNextChat = () => {
    handleStopChat();  // Clean up current chat
    handleStartChat(); // Start a new chat
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isAudioOn;
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
    }
  }, [currentUser, router]);
  
  return (
    <div className="flex flex-col h-screen bg-theme-background text-theme-foreground">
      <Header/>
      <div className="flex flex-grow overflow-hidden p-4">
        <div className="flex-grow flex flex-col space-y-4">
          <div className="flex-grow bg-theme-background-light rounded-lg p-4 relative">
            {error && (
              <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-2 rounded">
                {error.message}
              </div>
            )}
            {isWaiting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-white flex items-center space-x-2">
                  <Clock className="animate-spin" />
                  <span>Waiting for others to join...</span>
                </div>
              </div>
            )}
            <VideoGrid
              localVideoRef={localVideoRef}
              remoteVideos={remoteVideos}
              groupSize="any"
              isChatActive={false}
            />
          </div>
          <MediaControls
            isVideoOn={isVideoOn}
            isAudioOn={isAudioOn}
            toggleVideo={toggleVideo}
            toggleAudio={toggleAudio}
            hasAudio={hasAudio}
            hasVideo={hasVideo}
          />
        </div>
        <div className="w-80 ml-4 flex flex-col">
          <TextChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isChatActive={isChatActive}
          />
          <ChatControls
            isChatActive={isChatActive}
            groupSize={groupSize}
            setGroupSize={setGroupSize}
            handleStartChat={handleStartChat}
            handleStopChat={handleStopChat}
            handleNextChat={handleNextChat}
            isWaiting={isWaiting}
          />
        </div>
      </div>
    </div>
  );
});

export default VideoChat;