import { logEvent } from './logging';

export const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = process.env.NEXT_PUBLIC_WS_HOST;
  const port = process.env.NEXT_PUBLIC_WS_PORT;

  if (!hostname || !port) {
    logEvent('Missing WebSocket configuration', {
      hostname: process.env.NEXT_PUBLIC_WS_HOST,
      port: process.env.NEXT_PUBLIC_WS_PORT
    });
    return null;
  }

  const url = `${protocol}//${hostname}:${port}/ws`;
  logEvent('getWebSocketUrl:', {
    protocol,
    hostname,
    port,
    url,
    envHost: process.env.NEXT_PUBLIC_WS_HOST,
    envPort: process.env.NEXT_PUBLIC_WS_PORT
  });
  return url;
};

export const safeSendWebSocket = (ws: WebSocket | null, message: any): boolean => {
  if (!ws) {
    logEvent('Cannot send message, WebSocket is null');
    return false;
  }

  if (ws.readyState !== WebSocket.OPEN) {
    logEvent('Cannot send message, WebSocket not ready', {
      readyState: ws.readyState
    });
    return false;
  }

  try {
    ws.send(JSON.stringify(message));
    return true;
  } catch (error) {
    logEvent('Error sending WebSocket message', { error });
    return false;
  }
};

export const isWebSocketReady = (ws: WebSocket | null): boolean => {
  return ws !== null && ws.readyState === WebSocket.OPEN;
};
