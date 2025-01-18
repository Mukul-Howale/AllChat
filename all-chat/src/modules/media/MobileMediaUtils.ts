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
  if (!navigator.mediaDevices?.enumerateDevices) {
    throw new Error('Media devices API not supported');
  }

  try {
    // Request permissions first
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    // Then enumerate devices
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
    logEvent('Failed to get media devices', { error });
    throw error;
  }
};

// Switch camera (front/back)
export const switchCamera = async (currentStream: MediaStream): Promise<MediaStream> => {
  const currentTrack = currentStream.getVideoTracks()[0];
  const currentFacingMode = currentTrack.getSettings().facingMode;

  // Stop current track
  currentTrack.stop();

  // Request new stream with opposite facing mode
  const newConstraints: MediaConstraints = {
    ...defaultMobileConstraints,
    video: {
      ...defaultMobileConstraints.video as MediaTrackConstraints,
      facingMode: currentFacingMode === 'user' ? 'environment' : 'user'
    }
  };

  try {
    const newStream = await navigator.mediaDevices.getUserMedia(newConstraints);
    return newStream;
  } catch (error) {
    logEvent('Failed to switch camera', { error });
    throw error;
  }
};

// Optimize media constraints based on network conditions
export const getOptimizedConstraints = async (): Promise<MediaConstraints> => {
  // Start with default constraints
  const constraints = { ...defaultMobileConstraints };

  try {
    // Check connection type if available
    if ('connection' in navigator && navigator.connection) {
      const connection = (navigator as any).connection;
      
      if (connection.effectiveType === '4g') {
        // On good connections, allow higher quality
        (constraints.video as MediaTrackConstraints).width = { ideal: 1280 };
        (constraints.video as MediaTrackConstraints).height = { ideal: 720 };
        (constraints.video as MediaTrackConstraints).frameRate = { max: 30 };
      } else {
        // On slower connections, reduce quality further
        (constraints.video as MediaTrackConstraints).width = { ideal: 480 };
        (constraints.video as MediaTrackConstraints).height = { ideal: 360 };
        (constraints.video as MediaTrackConstraints).frameRate = { max: 15 };
      }
    }

    return constraints;
  } catch (error) {
    logEvent('Error optimizing constraints', { error });
    return defaultMobileConstraints;
  }
};

// Handle device orientation changes for video streams
export async function handleOrientationChange(stream: MediaStream): Promise<void> {
  if (!stream) return;
  
  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) return;

  try {
    // Get current constraints
    const constraints = videoTrack.getConstraints();
    
    // Apply the same constraints to trigger a re-initialization
    // This helps handle orientation changes properly
    await videoTrack.applyConstraints(constraints);
    
    logEvent('orientation_change_handled', { success: true });
  } catch (error) {
    logEvent('orientation_change_error', { error: (error as Error).message });
    console.error('Error handling orientation change:', error);
  }
}
