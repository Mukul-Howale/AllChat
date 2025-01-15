// WebSocket configuration
export const getWebSocketUrl = () => {
  // Check if we're running on the client side
  if (typeof window === 'undefined') {
    console.log('getWebSocketUrl: Server-side rendering detected');
    return ''; // Return empty string during server-side rendering
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = process.env.NEXT_PUBLIC_WS_HOST || window.location.hostname;
  const port = process.env.NEXT_PUBLIC_WS_PORT || '8093';
  
  const url = `${protocol}//${hostname}:${port}/ws`;
  console.log('getWebSocketUrl:', {
    protocol,
    hostname,
    port,
    url,
    envHost: process.env.NEXT_PUBLIC_WS_HOST,
    envPort: process.env.NEXT_PUBLIC_WS_PORT,
    locationHostname: window.location.hostname
  });
  
  return url;
};
