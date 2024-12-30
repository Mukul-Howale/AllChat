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
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [remoteVideos, setRemoteVideos] = useState<React.RefObject<HTMLVideoElement>[]>([]);
  const websocket = useRef<WebSocket | null>(null);
  const [peerConnections, setPeerConnections] = useState<{ [key: string]: RTCPeerConnection }>({});

  // WebRTC configuration
  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  const getAvailableMediaStream = async () => {
    const constraints = {
      video: isVideoOn,
      audio: isAudioOn
    };

    try {
      // First try with current constraints
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.log('Failed with initial constraints, trying fallbacks...');
      
      // If both failed, try video only
      if (isVideoOn && isAudioOn) {
        try {
          console.log('Trying video only...');
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setIsAudioOn(false);
          setHasAudio(false);
          setError({
            type: 'media',
            message: 'Microphone not available. Video-only mode enabled.'
          });
          return videoStream;
        } catch (videoErr) {
          console.log('Video-only failed, trying audio only...');
        }
      }

      // If video-only failed or if only audio was requested, try audio only
      if (isAudioOn) {
        try {
          console.log('Trying audio only...');
          const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setIsVideoOn(false);
          setHasVideo(false);
          setError({
            type: 'media',
            message: 'Camera not available. Audio-only mode enabled.'
          });
          return audioStream;
        } catch (audioErr) {
          console.log('Audio-only failed');
        }
      }

      // If all attempts failed
      throw new Error('No media devices available. Please connect a camera or microphone.');
    }
  };

  const createPeerConnection = (remoteUserId: string) => {
    try {
      const peerConnection = new RTCPeerConnection(configuration);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && websocket.current) {
          websocket.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            to: remoteUserId,
            from: currentUser?.id
          }));
        }
      };

      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        const newVideoRef = React.createRef<HTMLVideoElement>();
        setRemoteVideos(prev => [...prev, newVideoRef]);
        
        // Schedule a micro-task to ensure the ref is available
        queueMicrotask(() => {
          if (newVideoRef.current) {
            newVideoRef.current.srcObject = remoteStream;
          }
        });
      };

      // Add local tracks to the peer connection if available
      if (mediaStreamRef.current) {
        const tracks = mediaStreamRef.current.getTracks();
        if (tracks.length > 0) {
          tracks.forEach(track => {
            if (mediaStreamRef.current) {
              peerConnection.addTrack(track, mediaStreamRef.current);
            }
          });
        }
      }

      setPeerConnections(prev => ({
        ...prev,
        [remoteUserId]: peerConnection
      }));

      return peerConnection;
    } catch (err) {
      console.error('Error creating peer connection:', err);
      setError({
        type: 'connection',
        message: 'Failed to create peer connection'
      });
      return null;
    }
  };

  const handleWebRTCSignaling = async (data: any) => {
    const { type, from, to, sdp, candidate } = data;

    if (to !== currentUser?.id) return;

    let pc = peerConnections[from];
    if (!pc) {
      pc = createPeerConnection(from);
      if (!pc) return;
    }

    try {
      switch (type) {
        case 'offer':
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          if (websocket.current) {
            websocket.current.send(JSON.stringify({
              type: 'answer',
              sdp: answer,
              to: from,
              from: currentUser?.id
            }));
          }
          break;

        case 'answer':
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          break;

        case 'ice-candidate':
          if (candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          break;
      }
    } catch (err) {
      console.error('Error handling WebRTC signaling:', err);
      setError({
        type: 'connection',
        message: 'WebRTC signaling failed'
      });
    }
  };

  const initiateCall = async (remoteUserId: string) => {
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
          from: currentUser?.id
        }));
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      setError({
        type: 'connection',
        message: 'Failed to initiate call'
      });
    }
  };

  const handleStartChat = async () => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    try {
      setIsWaiting(true);
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError({
          type: 'media',
          message: 'Your browser does not support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge.'
        });
        return;
      }

      // Get media stream with fallbacks
      const stream = await getAvailableMediaStream();
      
      // Update UI based on what we got
      const hasVideoTrack = stream.getVideoTracks().length > 0;
      const hasAudioTrack = stream.getAudioTracks().length > 0;
      setHasVideo(hasVideoTrack);
      setHasAudio(hasAudioTrack);
      setIsVideoOn(hasVideoTrack);
      setIsAudioOn(hasAudioTrack);

      // Attach stream to video element if we have video
      if (localVideoRef.current && hasVideoTrack) {
        localVideoRef.current.srcObject = stream;
      }

      mediaStreamRef.current = stream;
      setIsChatActive(true);
      setIsWaiting(false);

      // Clear any previous error if we successfully got at least one type of media
      if (hasVideoTrack || hasAudioTrack) {
        setError(null);
      }

    } catch (err: any) {
      console.error('Error starting chat:', err);
      setError({
        type: 'media',
        message: err.message || 'Failed to access media devices. Please check your camera and microphone permissions.'
      });
      setIsWaiting(false);
      setIsChatActive(false);
    }
  };

  const handleStopChat = () => {
    // Stop WebRTC connections
    Object.values(peerConnections).forEach(pc => pc.close());
    setPeerConnections({});

    // Stop media streams
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setIsChatActive(false);
    setIsWaiting(false);
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
    const stream = mediaStreamRef.current;
    if (stream && hasVideo) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    const stream = mediaStreamRef.current;
    if (stream && hasAudio) {
      const audioTrack = stream.getAudioTracks()[0];
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

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    // Setup WebSocket connection when the page loads
    websocket.current = setupWebSocket();

    // Cleanup function to handle page leave
    return () => {
      if (websocket.current) {
        websocket.current.close();
        websocket.current = null;
      }
      // Clean up WebRTC if active
      if (isChatActive) {
        handleStopChat();
      }
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
            if (isChatActive && data.userId !== currentUser.id) {
              initiateCall(data.userId);
            }
            break;
          case 'userLeft':
            // Handle user leaving
            if (peerConnections[data.userId]) {
              peerConnections[data.userId].close();
              setPeerConnections(prev => {
                const newConnections = { ...prev };
                delete newConnections[data.userId];
                return newConnections;
              });
            }
            break;
          case 'offer':
          case 'answer':
          case 'ice-candidate':
            handleWebRTCSignaling(data);
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
              hasVideo={hasVideo}
              hasAudio={hasAudio}
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