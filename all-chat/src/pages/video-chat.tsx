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
  const [error, setError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteVideos, setRemoteVideos] = useState<React.RefObject<HTMLVideoElement>[]>([]);
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    // Establish WebSocket connection with user authentication
    try {
      websocket.current = new WebSocket(`ws://localhost:8080/ws/chat?userId=${currentUser.id}`);

      if (websocket.current) {
        websocket.current.onopen = () => {
          console.log('WebSocket connection established');
          setError(null);
        };

        websocket.current.onmessage = (event) => {
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

        websocket.current.onclose = () => {
          console.log('WebSocket connection closed');
          setError('Connection closed. Please try reconnecting.');
        };

        websocket.current.onerror = () => {
          setError('WebSocket connection error. Please try again.');
        };
      }
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError('Failed to establish connection. Please try again.');
    }

    // Cleanup function
    return () => {      
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, [currentUser, router]);

  const handleStartChat = async () => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    setIsWaiting(true);
    setError(null);

    try {
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

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }

      setTimeout(() => {
        setIsWaiting(false);
        setIsChatActive(true);
      }, 5000);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleStopChat = () => {
    setIsChatActive(false);
    setMessages([]);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
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
        <div className={`absolute bottom-4 right-4 bg-error-500 text-white px-4 py-2 elevation-2 ${styles.container}`}>
          {error}
        </div>
      )}
    </div>
  );
});

export default VideoChat;