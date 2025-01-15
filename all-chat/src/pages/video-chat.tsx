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
import { getWebSocketUrl } from '@/config/websocket';
import { safeSendWebSocket } from '@/utils/websocket';

const VideoChat: React.FC = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { currentUser } = store.userStore;
  const [isChatActive, setIsChatActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<string[]>([]);
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

  // Constants for chat configuration
  const MIN_GROUP_SIZE = 2;
  const MAX_GROUP_SIZE = 2;

  const handleStartChat = async () => {
    logEvent('Starting chat');
    if (!currentUser) {
      logEvent('No current user, redirecting to auth');
      router.push('/auth');
      return;
    }

    // Check for WebSocket connection
    logEvent('Checking WebSocket connection', { 
      wsConnected, 
      websocketExists: !!websocket.current,
      readyState: websocket.current?.readyState 
    });

    if (!wsConnected || !websocket.current || websocket.current.readyState !== WebSocket.OPEN) {
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
      setIsMatched(false);
      logEvent('Checking if getUserMedia is supported');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError({
          type: 'media',
          message: 'Your browser does not support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge.'
        });
        return;
      }

      logEvent('Getting media stream');
      const stream = await getAvailableMediaStream();
      mediaStreamRef.current = stream;
      
      logEvent('Setting local video stream');
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setMediaStream(stream);

      // Send looking-for-match signal to server
      logEvent('Sending looking-for-match', {
        websocketExists: !!websocket.current,
        readyState: websocket.current?.readyState,
        userId: currentUser.id
      });

      const message = JSON.stringify({
        type: 'looking-for-match',
        userId: currentUser.id
      });
      websocket.current.send(message);
      logEvent('Sent looking-for-match message successfully');

    } catch (err: any) {
      logEvent('Error starting chat', { error: err.message });
      setError({
        type: 'media',
        message: err.message || 'Failed to access media devices. Please check your camera and microphone permissions.'
      });
      setIsWaiting(false);
      setIsMatched(false);
      setIsChatActive(false);
    }
  };

  const handleCancelSearch = () => {
    logEvent('Canceling search');
    setIsWaiting(false);
  };

  const handleStopChat = () => {
    logEvent('Stopping chat');
    
    // Send end chat message to server
    if (isMatched) {
      safeSendWebSocket(websocket.current, {
        type: 'END_CHAT',
        userId: currentUser?.id
      });
    }

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
    setIsMatched(false);
    setMatchedUsers([]);
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
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-red-500 mb-4">{error.message}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (isWaiting) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-700">Looking for chat partners...</p>
          <button
            onClick={handleCancelSearch}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      );
    }

    if (!isChatActive) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <button
            onClick={handleStartChat}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-lg"
          >
            Start Chat
          </button>
        </div>
      );
    }

    return (
      <div className="relative h-full">
        <VideoGrid
          localVideoRef={localVideoRef}
          remoteVideos={remoteVideos}
          isChatActive={isChatActive}
          className="h-full"
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <MediaControls
            isVideoOn={isVideoOn}
            isAudioOn={isAudioOn}
            hasVideo={hasVideo}
            hasAudio={hasAudio}
            toggleVideo={handleToggleVideo}
            toggleAudio={handleToggleAudio}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!currentUser) {
      logEvent('No current user, redirecting to auth');
      router.push('/auth');
      return;
    }

    logEvent('Setting up WebSocket connection');
    const wsUrl = getWebSocketUrl();
    
    if (!wsUrl) {
      logEvent('Invalid WebSocket URL');
      setError({
        type: 'connection',
        message: 'Invalid WebSocket configuration'
      });
      return;
    }

    const fullUrl = `${wsUrl}?userId=${currentUser.id}`;
    logEvent('Creating WebSocket connection', { 
      url: fullUrl,
      userId: currentUser.id
    });
    
    let ws: WebSocket;
    try {
      ws = new WebSocket(fullUrl);
      setWebSocket(ws);
      websocket.current = ws;

      ws.onopen = () => {
        logEvent('WebSocket connection established', {
          url: fullUrl,
          readyState: ws.readyState
        });
        setError(null);
        setWsConnected(true);
        
        // If we're waiting for a match when the connection opens/reopens, resend the looking-for-match message
        if (isWaiting && !isMatched) {
          logEvent('Resending looking-for-match after connection established');
          ws.send(JSON.stringify({
            type: 'looking-for-match',
            userId: currentUser.id
          }));
        }
      };

      ws.onclose = (event) => {
        logEvent('WebSocket connection closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url: fullUrl,
          isChatActive
        });
        setWsConnected(false);

        // Don't show error for normal closures when chat is not active
        if (event.code === 1000 && !isChatActive) {
          return;
        }

        // Don't show error for normal closures during cleanup
        if (event.code === 1000 && event.wasClean) {
          return;
        }

        setError({
          type: 'connection',
          message: event.code === 1006 
            ? 'Connection lost unexpectedly. Please check your network connection.'
            : 'Connection to chat server lost. Please refresh the page.'
        });
      };

      ws.onerror = (error) => {
        logEvent('WebSocket error occurred', { 
          error,
          url: fullUrl,
          readyState: ws.readyState
        });
        setWsConnected(false);
        // Only set error if we're not already handling it in onclose
        if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
          setError({
            type: 'connection',
            message: 'Error connecting to chat server. Please check your connection and try again.'
          });
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          logEvent('Received WebSocket message', { 
            type: message.type,
            data: event.data
          });
          
          switch (message.type) {
            case 'chat':
              logEvent('Received chat message', { message: message.message });
              store.chatStore.addMessage(message.message);
              break;
              
            case 'match-found':
              logEvent('Match found', { users: message.users });
              setMatchedUsers(message.users);
              setIsMatched(true);
              setIsWaiting(false);
              setIsChatActive(true);
              // Initiate calls to all matched users
              message.users.forEach((userId: string) => {
                if (userId !== currentUser.id) {
                  initiateCall(userId);
                }
              });
              break;
              
            case 'match-cancelled':
              logEvent('Match cancelled');
              setIsMatched(false);
              setIsWaiting(false);
              setIsChatActive(false);
              setMatchedUsers([]);
              cleanupWebRTC();
              break;

            case 'user-left-match':
              logEvent('User left match', { userId: message.userId });
              setMatchedUsers(prev => prev.filter(id => id !== message.userId));
              // If not enough users remain, end the chat
              if (matchedUsers.length < MIN_GROUP_SIZE) {
                setIsMatched(false);
                setIsChatActive(false);
                setMatchedUsers([]);
                cleanupWebRTC();
              }
              break;

            case 'chat-ended':
              logEvent('Chat ended');
              setIsMatched(false);
              setIsChatActive(false);
              setMatchedUsers([]);
              cleanupWebRTC();
              break;

            case 'END_CHAT':
              if (message.userId !== currentUser?.id) {
                // Other user ended the chat
                handleStopChat();
                setIsWaiting(true);
                handleStartChat();
              }
              break;

            case 'offer':
            case 'answer':
            case 'ice-candidate':
              if (isChatActive && isMatched && matchedUsers.includes(message.from)) {
                handleWebRTCSignaling(message);
              } else {
                logEvent('Ignored WebRTC signal - invalid state or sender', {
                  isChatActive,
                  isMatched,
                  isValidSender: matchedUsers.includes(message.from)
                });
              }
              break;
              
            default:
              logEvent('Received unknown message type', { type: message.type });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          logEvent('Error parsing WebSocket message', { error: errorMessage });
        }
      };
    } catch (error) {
      logEvent('Error creating WebSocket', {
        error,
        url: fullUrl
      });
      setError({
        type: 'connection',
        message: 'Failed to connect to chat server. Please refresh and try again.'
      });
    }

    return () => {
      logEvent('Cleaning up video chat component');
      if (ws) {
        ws.close(1000, 'Chat ended normally');
      }
    };
  }, [currentUser, isWaiting, isMatched]);

  return (
    <div className="flex flex-col h-screen bg-theme-background text-theme-foreground">
      <Header/>
      <div className="flex flex-grow overflow-hidden p-4">
        <div className="flex flex-col w-3/4 pr-4">
          {renderVideoArea()}
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