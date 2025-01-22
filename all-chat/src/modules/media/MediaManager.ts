import { useState, useCallback } from 'react';
import { logEvent } from '@/utils/logging';
import { defaultMobileConstraints } from './MobileMediaUtils';

export interface MediaState {
  isVideoOn: boolean;
  isAudioOn: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  error: { type: 'media' | 'connection' | 'other'; message: string } | null;
}

export interface MediaStreamConfig {
  onError?: (error: { type: 'media' | 'connection' | 'other'; message: string }) => void;
}

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const useMediaStream = (config?: MediaStreamConfig) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const getAvailableMediaStream = useCallback(async () => {
    // Check if we're in a secure context
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const error = new Error('Media devices require a secure context (HTTPS or localhost). Please access the application through HTTPS or localhost.');
      logEvent('Not in secure context', { isSecure: window.isSecureContext });
      if (config?.onError) {
        config.onError({ type: 'media', message: error.message });
      }
      throw error;
    }

    // Check if MediaDevices API is supported
    if (!navigator.mediaDevices) {
      const error = new Error('MediaDevices API is not supported in this browser. Please use a modern browser with camera and microphone support.');
      logEvent('MediaDevices API not supported', { error: error.message });
      if (config?.onError) {
        config.onError({ type: 'media', message: error.message });
      }
      throw error;
    }

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices.getUserMedia) {
      const error = new Error('getUserMedia is not supported in this browser. Please use a modern browser with camera and microphone support.');
      logEvent('getUserMedia not supported', { error: error.message });
      if (config?.onError) {
        config.onError({ type: 'media', message: error.message });
      }
      throw error;
    }

    // Ensure at least one of video or audio is true
    const effectiveVideo = isVideoOn;
    const effectiveAudio = !isVideoOn || isAudioOn; // If video is off, force audio on

    logEvent('Attempting to get media stream', { video: effectiveVideo, audio: effectiveAudio, isMobile: isMobile() });

    // Use different constraints for mobile devices
    const constraints = isMobile() ? {
      video: effectiveVideo ? defaultMobileConstraints.video : false,
      audio: effectiveAudio ? defaultMobileConstraints.audio : false
    } : {
      video: effectiveVideo,
      audio: effectiveAudio
    };

    try {
      logEvent('Requesting media stream with constraints', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Update state based on available tracks
      const hasVideoTrack = stream.getVideoTracks().length > 0;
      const hasAudioTrack = stream.getAudioTracks().length > 0;
      setHasVideo(hasVideoTrack);
      setHasAudio(hasAudioTrack);
      setIsVideoOn(hasVideoTrack);
      setIsAudioOn(hasAudioTrack);

      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logEvent('Failed with initial constraints, trying fallbacks', { error: errorMessage });
      
      // Try with simpler constraints for mobile
      if (isMobile() && effectiveVideo) {
        try {
          logEvent('Attempting with basic mobile constraints');
          const mobileStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }, // Just try to get the front camera
            audio: true
          });
          setHasVideo(true);
          setHasAudio(true);
          setIsVideoOn(true);
          setIsAudioOn(true);
          return mobileStream;
        } catch (mobileErr) {
          logEvent('Failed with basic mobile constraints, trying audio only');
        }
      }

      // Try audio only as last resort
      try {
        logEvent('Attempting audio-only stream');
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          video: false, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        setIsVideoOn(false);
        setHasVideo(false);
        setHasAudio(true);
        setIsAudioOn(true);
        return audioStream;
      } catch (audioErr) {
        const audioErrorMessage = audioErr instanceof Error ? audioErr.message : 'Unknown error occurred';
        logEvent('Failed to get audio-only stream', { error: audioErrorMessage });
        throw new Error('Could not access any media devices. Please check your camera and microphone permissions and ensure your browser has access to media devices.');
      }
    }
  }, [isVideoOn, isAudioOn]);

  const toggleVideo = useCallback((stream?: MediaStream) => {
    logEvent('Toggling video');
    if (stream && hasVideo) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  }, [hasVideo]);

  const toggleAudio = useCallback((stream?: MediaStream) => {
    logEvent('Toggling audio');
    if (stream && hasAudio) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  }, [hasAudio]);

  const stopMediaStream = useCallback((stream?: MediaStream) => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        logEvent('Media track stopped', { kind: track.kind });
      });
    }
    setHasVideo(false);
    setHasAudio(false);
    setIsVideoOn(false);
    setIsAudioOn(false);
  }, []);

  return {
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
  };
};
