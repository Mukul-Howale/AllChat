interface MediaStreamOptions {
  isVideoOn: boolean;
  isAudioOn: boolean;
  onMediaError: (type: 'media' | 'connection' | 'other', message: string) => void;
  onMediaStateChange: (hasVideo: boolean, hasAudio: boolean) => void;
}

export const getAvailableMediaStream = async ({
  isVideoOn,
  isAudioOn,
  onMediaError,
  onMediaStateChange
}: MediaStreamOptions): Promise<MediaStream | null> => {
  const constraints = {
    video: isVideoOn,
    audio: isAudioOn
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (err) {
    // Try video-only if both failed
    if (isVideoOn && isAudioOn) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        onMediaStateChange(true, false);
        onMediaError('media', 'Microphone not available. Video-only mode enabled.');
        return videoStream;
      } catch (videoErr) {
        // Continue to audio-only attempt
      }
    }

    // Try audio-only
    if (isAudioOn) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        onMediaStateChange(false, true);
        onMediaError('media', 'Camera not available. Audio-only mode enabled.');
        return audioStream;
      } catch (audioErr) {
        // All attempts failed
      }
    }

    onMediaError('media', 'No media devices available. Please connect a camera or microphone.');
    return null;
  }
};
