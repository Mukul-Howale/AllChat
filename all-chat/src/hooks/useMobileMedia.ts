import { useState, useEffect } from 'react';
import { logEvent } from '@/utils/logging';
import {
  getMediaDevices,
  switchCamera,
  getOptimizedConstraints,
  MediaDeviceInfo
} from '@/modules/media/MobileMediaUtils';

interface UseMobileMediaProps {
  onError?: (error: Error) => void;
}

export const useMobileMedia = ({ onError }: UseMobileMediaProps = {}) => {
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  });

  const [devices, setDevices] = useState<{
    videoDevices: MediaDeviceInfo[];
    audioDevices: MediaDeviceInfo[];
  }>({ videoDevices: [], audioDevices: [] });

  const [currentCamera, setCurrentCamera] = useState<'user' | 'environment'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);

  // Check browser compatibility
  useEffect(() => {
    const checkBrowserSupport = () => {
      if (typeof window === 'undefined') return;
      
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      setBrowserSupported(hasMediaDevices);
      
      if (!hasMediaDevices) {
        const error = new Error('Your browser does not support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge.');
        logEvent('Browser media devices not supported', { error });
        onError?.(error);
      }
    };

    checkBrowserSupport();
  }, [onError]);

  // Initialize devices only if browser is supported
  useEffect(() => {
    const initDevices = async () => {
      if (!browserSupported) return;

      try {
        const mediaDevices = await getMediaDevices();
        setDevices(mediaDevices);
      } catch (error) {
        logEvent('Error initializing mobile media devices', { error });
        onError?.(error instanceof Error ? error : new Error('Failed to initialize devices'));
      }
    };

    if (isMobile) {
      initDevices();
    }
  }, [isMobile, browserSupported, onError]);

  // Get media stream with optimized constraints
  const getOptimizedStream = async () => {
    if (!browserSupported) {
      throw new Error('Browser does not support media devices');
    }

    setIsLoading(true);
    try {
      const constraints = await getOptimizedConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      logEvent('Error getting optimized stream', { error });
      onError?.(error instanceof Error ? error : new Error('Failed to get media stream'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Switch between front and back cameras
  const toggleCamera = async (currentStream: MediaStream) => {
    if (!browserSupported) {
      throw new Error('Browser does not support media devices');
    }

    setIsLoading(true);
    try {
      const newStream = await switchCamera(currentStream);
      setCurrentCamera(prev => prev === 'user' ? 'environment' : 'user');
      return newStream;
    } catch (error) {
      logEvent('Error toggling camera', { error });
      onError?.(error instanceof Error ? error : new Error('Failed to switch camera'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if device has multiple cameras
  const hasMultipleCameras = devices.videoDevices.length > 1;

  return {
    isMobile,
    isLoading,
    browserSupported,
    currentCamera,
    hasMultipleCameras,
    devices,
    getOptimizedStream,
    toggleCamera
  };
};
