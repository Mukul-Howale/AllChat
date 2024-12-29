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

const VideoChat: React.FC = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { currentUser } = store.userStore;
  const [groupSize, setGroupSize] = useState<number | 'any'>(2);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [error, setError] = useState<{ type: 'media' | 'connection' | 'other'; message: string } | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteVideos, setRemoteVideos] = useState<React.RefObject<HTMLVideoElement>[]>([]);
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    // Cleanup function to handle page leave
    return () => {
      handleStopChat();
    };
  }, [currentUser, router]);

  const setupWebSocket = () => {
    if (!currentUser) return null;

    const ws = new WebSocket(`ws://localhost:8093/ws?userId=${currentUser.id}`);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'chat':
            setMessages(prevMessages => [...prevMessages, data.message]);
            break;
          case 'userJoined':
            // Handle new user joining
            break;
          case 'userLeft':
            // Handle user leaving
            break;
          default:
            console.log('Received message:', data);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed');
      if (isChatActive && !event.wasClean) {
        setError({
          type: 'connection',
          message: 'Connection closed unexpectedly. Please try reconnecting.'
        });
      }
    };

    ws.onerror = () => {
      setError({
        type: 'connection',
        message: 'WebSocket connection error. Please try again.'
      });
    };

    return ws;
  };

  const handleStartChat = async () => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError({
        type: 'media',
        message: 'Your browser does not support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge.'
      });
      return;
    }

    // First ensure any existing connection is closed
    if (websocket.current) {
      websocket.current.close();
      websocket.current = null;
    }

    setIsWaiting(true);
    setError(null);

    try {
      // First try to access media devices before establishing connection
      let stream;
      try {
        console.log('Requesting media permissions...');
        try {
          // First try both video and audio
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }, 
            audio: true 
          });
          console.log('Got both video and audio');
        } catch (err) {
          // If that fails, try video only
          try {
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
              audio: false
            });
            console.log('Got video only');
            setError({
              type: 'media',
              message: 'No microphone found. Video chat will work but you won\'t be able to speak.'
            });
          } catch {
            // If video fails, try audio only
            try {
              stream = await navigator.mediaDevices.getUserMedia({ 
                video: false,
                audio: true
              });
              console.log('Got audio only');
              setError({
                type: 'media',
                message: 'No camera found. Voice chat will work but others won\'t be able to see you.'
              });
            } catch {
              // If both individual attempts fail, throw the original error
              throw err;
            }
          }
        }
        
        console.log('Media permissions granted:', stream.getTracks().map(track => ({ kind: track.kind, label: track.label })));
        
        // Attach the stream to the local video element if we have video
        if (localVideoRef.current && stream.getVideoTracks().length > 0) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play().catch(error => {
            console.error('Error playing local video:', error);
          });
        }

        // Update UI state based on what we got
        setIsVideoOn(stream.getVideoTracks().length > 0);
        setIsAudioOn(stream.getAudioTracks().length > 0);

      } catch (error: any) {
        console.error('Media access error:', error.name, error.message);
        setIsWaiting(false);
        if (error.name === 'NotFoundError') {
          setError({
            type: 'media',
            message: 'No camera or microphone found. Please connect at least one device and try again.'
          });
        } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError({
            type: 'media',
            message: 'Camera/microphone access denied. Please check your browser settings and ensure the permissions are not blocked.'
          });
        } else if (error.name === 'NotReadableError') {
          setError({
            type: 'media',
            message: 'Could not access your camera/microphone. They might be in use by another application.'
          });
        } else {
          setError({
            type: 'media',
            message: `Failed to access camera or microphone: ${error.message}`
          });
        }
        return;
      }

      // Establish new WebSocket connection
      websocket.current = setupWebSocket();
      if (!websocket.current) {
        setIsWaiting(false);
        setError({
          type: 'connection',
          message: 'Failed to establish connection. Please try again.'
        });
        return;
      }

      // Wait for the WebSocket connection to be established
      await new Promise((resolve, reject) => {
        if (!websocket.current) {
          reject(new Error('WebSocket connection failed'));
          return;
        }

        const ws = websocket.current;
        const timeout = setTimeout(() => {
          ws.removeEventListener('open', onOpen);
          ws.removeEventListener('error', onError);
          reject(new Error('WebSocket connection timeout'));
        }, 5000); // 5 second timeout
        
        const onOpen = () => {
          clearTimeout(timeout);
          ws.removeEventListener('open', onOpen);
          ws.removeEventListener('error', onError);
          resolve(true);
        };

        const onError = (error: Event) => {
          clearTimeout(timeout);
          ws.removeEventListener('open', onOpen);
          ws.removeEventListener('error', onError);
          reject(new Error('WebSocket connection failed'));
        };

        if (ws.readyState === WebSocket.OPEN) {
          clearTimeout(timeout);
          resolve(true);
        } else {
          ws.addEventListener('open', onOpen);
          ws.addEventListener('error', onError);
        }
      });

      const response = await fetch('/api/chat/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({ 
          groupSize,
          userId: currentUser.id,
          username: currentUser.username
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join chat');
      }

      setIsChatActive(true);
      setIsWaiting(false);
    } catch (err) {
      console.error('Error starting chat:', err);
      setIsWaiting(false);
      
      if (err instanceof Error) {
        if (err.message.includes('WebSocket')) {
          setError({
            type: 'connection',
            message: 'Failed to establish connection. Please check your internet connection and try again.'
          });
        } else {
          setError({
            type: 'connection',
            message: err.message
          });
        }
      } else {
        setError({
          type: 'other',
          message: 'Failed to start chat. Please try again.'
        });
      }
      
      await handleStopChat();
    }
  };

  const handleStopChat = () => {
    // Stop all tracks in the local stream
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    // Stop all tracks in remote streams
    remoteVideos.forEach(ref => {
      if (ref.current && ref.current.srcObject) {
        const stream = ref.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        ref.current.srcObject = null;
      }
    });

    // Close WebSocket connection
    if (websocket.current) {
      websocket.current.close();
      websocket.current = null;
    }

    setIsChatActive(false);
    setIsWaiting(false);
    setMessages([]);
    setRemoteVideos([]);
  };

  const handleNextChat = () => {
    // Implement logic for moving to next chat
  };

  const handleSendMessage = (message: string) => {
    const newMessage = { text: message, sender: 'You' };
    setMessages([...messages, newMessage]);
    
    // Send message through WebSocket
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify(newMessage));
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const videoTrack = (localVideoRef.current.srcObject as MediaStream)
        .getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const audioTrack = (localVideoRef.current.srcObject as MediaStream)
        .getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const renderVideoArea = () => {
    if (isWaiting) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
          <Clock className="w-16 h-16 text-theme-primary animate-pulse" />
          <h2 className="text-2xl font-bold text-center text-theme-foreground">Waiting for others to join...</h2>
          <p className="text-center text-theme-muted-foreground text-sm">
            {typeof groupSize === 'number' ? `${groupSize - 1} more ${groupSize - 1 === 1 ? 'person' : 'people'} needed` : 'Waiting for others'} to start the chat
          </p>
        </div>
      );
    } else if (isChatActive) {
      return (
        <VideoGrid 
          groupSize={groupSize} 
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
            Select the number of participants and click "Start Chat" when you're ready.
          </p>
        </div>
      );
    }
  };

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
              toggleVideo={toggleVideo}
              toggleAudio={toggleAudio}
            />
            <ChatControls
              groupSize={groupSize}
              setGroupSize={setGroupSize}
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
              messages={messages}
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