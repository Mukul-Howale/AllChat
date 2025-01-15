import { logEvent } from '@/utils/logging';

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  type: 'videoinput' | 'audioinput';
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

// Default constraints for mobile devices
export const defaultMobileConstraints: MediaConstraints = {
  video: {
    facingMode: 'user', // Default to front camera
    width: { ideal: 640 }, // Reduced resolution for mobile
    height: { ideal: 480 },
    frameRate: { max: 24 } // Reduced framerate for better performance
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

// Get available media devices
export const getMediaDevices = async (): Promise<{
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
}> => {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();

    const videoDevices = devices
      .filter(device => device.kind === 'videoinput')
      .map(device => ({
        deviceId: device.deviceId,
        label: device.label,
        type: 'videoinput' as const
      }));

    const audioDevices = devices
      .filter(device => device.kind === 'audioinput')
      .map(device => ({
        deviceId: device.deviceId,
        label: device.label,
        type: 'audioinput' as const
      }));

    return { videoDevices, audioDevices };
  } catch (error) {
    logEvent('Error getting media devices', { error });
    throw error;
  }
};

// Switch camera (front/back)
export const switchCamera = async (currentStream: MediaStream): Promise<MediaStream> => {
  try {
    const currentVideoTrack = currentStream.getVideoTracks()[0];
    const currentFacingMode = currentVideoTrack.getSettings().facingMode;
    
    // Toggle between front and back camera
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: newFacingMode,
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { max: 24 }
      },
      audio: false // Keep existing audio track
    });

    // Stop old video track
    currentVideoTrack.stop();

    // Get the new video track
    const newVideoTrack = newStream.getVideoTracks()[0];

    // Replace the video track in the current stream
    const audioTrack = currentStream.getAudioTracks()[0];
    const combinedStream = new MediaStream([newVideoTrack, audioTrack]);

    return combinedStream;
  } catch (error) {
    logEvent('Error switching camera', { error });
    throw error;
  }
};

// Optimize media constraints based on network conditions
export const getOptimizedConstraints = async (): Promise<MediaConstraints> => {
  try {
    // Check if the connection is slow
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && 
      (connection.type === 'cellular' || connection.downlink < 1);

    if (isSlowConnection) {
      return {
        video: {
          facingMode: 'user',
          width: { ideal: 320 }, // Lower resolution for slow connections
          height: { ideal: 240 },
          frameRate: { max: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
    }

    return defaultMobileConstraints;
  } catch (error) {
    logEvent('Error getting optimized constraints', { error });
    return defaultMobileConstraints;
  }
};

// Handle orientation change
export const handleOrientationChange = async (stream: MediaStream): Promise<void> => {
  try {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    const isPortrait = window.innerHeight > window.innerWidth;
    await videoTrack.applyConstraints({
      width: { ideal: isPortrait ? 480 : 640 },
      height: { ideal: isPortrait ? 640 : 480 }
    });
  } catch (error) {
    logEvent('Error handling orientation change', { error });
  }
};
