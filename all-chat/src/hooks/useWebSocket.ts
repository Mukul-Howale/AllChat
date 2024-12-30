import { useEffect, useRef } from 'react';
import { WebSocketMessage } from '../types/chat';

interface WebSocketHookOptions {
  userId: string;
  onMessage: (data: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = ({
  userId,
  onMessage,
  onOpen,
  onClose,
  onError
}: WebSocketHookOptions) => {
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws?userId=${userId}`;
    
    websocket.current = new WebSocket(wsUrl);

    websocket.current.onopen = () => {
      onOpen?.();
    };

    websocket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    websocket.current.onclose = () => {
      onClose?.();
    };

    websocket.current.onerror = (error) => {
      onError?.(error);
    };

    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, [userId]);

  return websocket;
};
