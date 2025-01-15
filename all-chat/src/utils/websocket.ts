import { logEvent } from './logging';

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
