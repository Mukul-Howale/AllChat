import { useState, useCallback } from 'react';
import { logEvent } from '@/utils/logging';

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

export const useMediaStream = (config?: MediaStreamConfig) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const getAvailableMediaStream = useCallback(async () => {
    // Ensure at least one of video or audio is true
    const effectiveVideo = isVideoOn;
    const effectiveAudio = !isVideoOn || isAudioOn; // If video is off, force audio on

    logEvent('Attempting to get media stream', { video: effectiveVideo, audio: effectiveAudio });
    const constraints = {
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
      
      // Try audio only if video fails
      if (effectiveVideo) {
        try {
          logEvent('Attempting audio-only stream');
          const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setIsVideoOn(false);
          setHasVideo(false);
          setHasAudio(true);
          setIsAudioOn(true);
          return audioStream;
        } catch (audioErr) {
          const audioErrorMessage = audioErr instanceof Error ? audioErr.message : 'Unknown error occurred';
          logEvent('Failed to get audio-only stream', { error: audioErrorMessage });
          throw audioErr;
        }
      }
      
      throw err;
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
