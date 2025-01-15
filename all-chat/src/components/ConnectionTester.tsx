import React, { useEffect, useState } from 'react';
import { getWebSocketUrl } from '@/config/websocket';
import { useStore } from '@/contexts/StoreContext';
import { logEvent } from '@/utils/logging';

const ConnectionTester: React.FC = () => {
  const [status, setStatus] = useState<string>('Not connected');
  const [lastMessage, setLastMessage] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const { userStore } = useStore();
  const { currentUser } = userStore;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !currentUser) return;

    const url = getWebSocketUrl();
    setWsUrl(url);
    
    if (!url) return; // Don't connect if URL is empty (server-side)
    
    const fullUrl = `${url}?userId=${currentUser.id}`;
    
    logEvent('Testing WebSocket connection', { url: fullUrl });
    const ws = new WebSocket(fullUrl);

    ws.onopen = () => {
      setStatus('Connected');
      logEvent('WebSocket connection established');
      
      // Send a test message
      ws.send(JSON.stringify({
        type: 'test-connection',
        userId: currentUser.id,
        timestamp: new Date().toISOString()
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastMessage(JSON.stringify(message, null, 2));
      logEvent('Received WebSocket message', { type: message.type });
    };

    ws.onerror = (error) => {
      setStatus('Error connecting');
      logEvent('WebSocket error', { error });
    };

    ws.onclose = () => {
      setStatus('Connection closed');
      logEvent('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, [currentUser, isMounted]);

  if (!isMounted) {
    return null; // Don't render anything during server-side rendering
  }

  return (
    <div className="p-4 bg-background border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Connection Tester</h2>
      <div className="space-y-2">
        <div>
          <span className="font-medium">WebSocket URL: </span>
          <span className="font-mono text-sm">{wsUrl}</span>
        </div>
        <div>
          <span className="font-medium">Status: </span>
          <span className={`${status === 'Connected' ? 'text-green-500' : 'text-red-500'}`}>
            {status}
          </span>
        </div>
        {lastMessage && (
          <div>
            <span className="font-medium">Last Message: </span>
            <pre className="bg-muted p-2 rounded mt-1 text-sm overflow-auto">
              {lastMessage}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionTester;
