import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/contexts/StoreContext';
import VideoGrid from '../components/VideoGrid';
import ChatControls from '../components/ChatControls';
import TextChat from '../components/TextChat';
import MediaControls from '../components/MediaControls';
import Header from '../layouts/Header';
import { useRouter } from 'next/router';
import styles from '@/styles/shared.module.css';
import { useWebRTC } from '@/modules/webrtc/WebRTCManager';
import { useMediaStream } from '@/modules/media/MediaManager';
import { logEvent } from '@/utils/logging';

const VideoChat: React.FC = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { currentUser } = store.userStore;
  const [isChatActive, setIsChatActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState<{ content: string; sender: string; id: string; timestamp: Date }[]>([]);
  const [error, setError] = useState<{ type: 'media' | 'connection' | 'other'; message: string } | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  const {
    remoteVideos,
    handleWebRTCSignaling,
    initiateCall,
    setMediaStream,
    setWebSocket,
    cleanup: cleanupWebRTC
  } = useWebRTC(currentUser?.id);

  const {
    mediaState: {
      isVideoOn,
      isAudioOn,
      hasVideo,
      hasAudio
    },
    getAvailableMediaStream,
    toggleVideo,
    toggleAudio,
    stopMediaStream
  } = useMediaStream({
    onError: setError
  });

  const handleStartChat = async () => {
    logEvent('Starting chat');
    if (!currentUser) {
      logEvent('No current user, redirecting to auth');
      router.push('/auth');
      return;
    }

    // Check for WebSocket connection
    if (!wsConnected) {
      logEvent('Cannot start chat - WebSocket not connected');
      setError({
        type: 'connection',
        message: 'Not connected to chat server. Please wait or refresh the page.'
      });
      return;
    }

    // Check for WebSocket connection error
    if (error?.type === 'connection') {
      logEvent('Cannot start chat due to WebSocket connection error');
      return;
    }

    try {
      setIsWaiting(true);
      logEvent('Checking if getUserMedia is supported');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError({
          type: 'media',
          message: 'Your browser does not support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge.'
        });
        return;
      }

      const stream = await getAvailableMediaStream();
      mediaStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setMediaStream(stream);
      setIsChatActive(true);
      setIsWaiting(false);

      // Send ready signal to server
      if (websocket.current) {
        websocket.current.send(JSON.stringify({
          type: 'ready'
        }));
      }
    } catch (err: any) {
      logEvent('Error starting chat', { error: err.message });
      setError({
        type: 'media',
        message: err.message || 'Failed to access media devices. Please check your camera and microphone permissions.'
      });
      setIsWaiting(false);
      setIsChatActive(false);
    }
  };

  const handleStopChat = () => {
    logEvent('Stopping chat');
    cleanupWebRTC();

    // Stop media streams
    if (mediaStreamRef.current) {
      // Stop all tracks before clearing the stream
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
        logEvent('Media track stopped', { kind: track.kind });
      });
      mediaStreamRef.current = null;
    }

    // Clear video element source
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Reset media state
    stopMediaStream();
    setIsChatActive(false);
    setIsWaiting(false);
  };

  const handleNextChat = async () => {
    handleStopChat();
    // Add a small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 500));
    handleStartChat();
  };

  const handleToggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        toggleVideo();
        logEvent('Video track toggled', { enabled: !isVideoOn });
      }
    }
  };

  const handleToggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        toggleAudio();
        logEvent('Audio track toggled', { enabled: !isAudioOn });
      }
    }
  };

  const handleSendMessage = (message: string) => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify({
        type: 'chat',
        message: {
          content: message,
          sender: currentUser?.name || 'You',
          id: crypto.randomUUID(),
          timestamp: new Date()
        }
      }));
      store.chatStore.addMessage({
        content: message,
        sender: 'You',
        id: crypto.randomUUID(),
        timestamp: new Date()
      });
    }
  };

  const renderVideoArea = () => {
    if (isWaiting) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
          <Clock className="w-16 h-16 text-theme-primary animate-pulse" />
          <h2 className="text-2xl font-bold text-center text-theme-foreground">Waiting for others to join...</h2>
          <p className="text-center text-theme-muted-foreground text-sm">
            Waiting for others to start the chat
          </p>
        </div>
      );
    } else if (isChatActive) {
      return (
        <VideoGrid 
          localVideoRef={localVideoRef} 
          remoteVideos={remoteVideos} 
          isChatActive={isChatActive}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
          <h2 className="text-2xl font-bold text-center text-theme-foreground">Ready to start a new chat?</h2>
          <p className="text-center text-theme-muted-foreground text-sm">
            Click "Start Chat" when you're ready.
          </p>
        </div>
      );
    }
  };

  useEffect(() => {
    if (!currentUser) {
      logEvent('No current user, redirecting to auth');
      router.push('/auth');
      return;
    }

    logEvent('Setting up WebSocket connection');
    const ws = new WebSocket(`ws://localhost:8093/ws?userId=${currentUser.id}`);
    setWebSocket(ws);

    ws.onopen = () => {
      logEvent('WebSocket connection established');
      setError(null);
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        logEvent('Received WebSocket message', { type: message.type });
        
        switch (message.type) {
          case 'chat':
            logEvent('Received chat message', { message: message.message });
            store.chatStore.addMessage(message.message);
            break;
            
          case 'userJoined':
            logEvent('User joined', { userId: message.userId });
            if (isChatActive && message.userId !== currentUser.id) {
              initiateCall(message.userId);
            }
            break;
            
          case 'userLeft':
            logEvent('User left', { userId: message.userId });
            break;
            
          case 'offer':
          case 'answer':
          case 'ice-candidate':
            if (isChatActive) {
              handleWebRTCSignaling(message);
            }
            break;
            
          default:
            logEvent('Received unknown message type', { type: message.type });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        logEvent('Error parsing WebSocket message', { error: errorMessage });
      }
    };

    ws.onclose = (event) => {
      logEvent('WebSocket connection closed', { 
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean 
      });
      setWsConnected(false);
      if (isChatActive && !event.wasClean) {
        setError({
          type: 'connection',
          message: 'Connection to chat server lost. Please refresh the page.'
        });
      }
    };

    ws.onerror = () => {
      logEvent('WebSocket connection error');
      setError({
        type: 'connection',
        message: 'Failed to connect to chat server. Please check your connection and try again.'
      });
    };

    return () => {
      logEvent('Cleaning up video chat component');
      if (ws) {
        ws.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentUser]);

  return (
    <div className="flex flex-col h-screen bg-theme-background text-theme-foreground">
      <Header/>
      <div className="flex flex-grow overflow-hidden p-4">
        <div className="flex flex-col w-3/4 pr-4">
          {isWaiting && (
            <div className="flex items-center justify-center h-full">
              <div className={`flex flex-col items-center bg-theme-surface p-6 elevation-2 ${styles.container}`}>
                <Clock className="w-12 h-12 text-theme-primary mb-4" />
                <p className="text-theme-foreground text-lg font-medium">
                  Waiting for a chat partner...
                </p>
              </div>
            </div>
          )}
          <div className={`flex-grow bg-theme-surface overflow-hidden mb-4 elevation-1 ${styles.container}`}>
            {renderVideoArea()}
          </div>
          <div className={`flex items-center justify-between p-2 bg-theme-surface elevation-1 ${styles.container}`}>
            <MediaControls
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
              toggleVideo={handleToggleVideo}
              toggleAudio={handleToggleAudio}
              hasVideo={hasVideo}
              hasAudio={hasAudio}
            />
            <ChatControls
              isChatActive={isChatActive}
              isWaiting={isWaiting}
              handleStartChat={handleStartChat}
              handleStopChat={handleStopChat}
              handleNextChat={handleNextChat}
            />
            <div className="w-1/4"></div>
          </div>
        </div>
        <div className="w-1/4 flex flex-col">
          <div className={`flex-grow bg-theme-surface overflow-hidden elevation-1 ${styles.container}`}>
            <TextChat
              isChatActive={isChatActive}
              onSendMessage={handleSendMessage}
              messages={messages.map(msg => ({ text: msg.content, sender: msg.sender }))}
              className="bg-theme-surface text-theme-foreground"
            />
          </div>
        </div>
      </div>
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-theme-surface p-6 rounded-lg shadow-lg max-w-md ${styles.container}`}>
            {error.type === 'media' ? (
              <>
                <h3 className="text-error-500 font-semibold text-lg mb-2">Camera/Microphone Access Required</h3>
                <p className="text-theme-foreground mb-4">{error.message}</p>
                <div className="text-theme-foreground text-sm">
                  <p className="mb-2">Please try the following:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Check if your camera and microphone are properly connected</li>
                    <li>Allow browser permissions for camera and microphone access</li>
                    <li>Close other applications that might be using your camera</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-error-500 font-semibold text-lg mb-2">Connection Error</h3>
                <p className="text-theme-foreground mb-4">{error.message}</p>
                <div className="text-theme-foreground text-sm">
                  <p className="mb-2">Please try the following:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Check your internet connection</li>
                    <li>Make sure the chat server is running</li>
                    <li>Try refreshing the page</li>
                  </ul>
                </div>
              </>
            )}
            <button 
              onClick={() => setError(null)} 
              className="mt-4 px-4 py-2 bg-theme-primary text-white rounded hover:bg-opacity-90"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoChat;