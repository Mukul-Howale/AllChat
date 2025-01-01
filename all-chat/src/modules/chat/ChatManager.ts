import { useState, useCallback } from 'react';
import { logEvent } from '@/utils/logging';

export interface ChatMessage {
  text: string;
  sender: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isChatActive: boolean;
  isWaiting: boolean;
  groupSize: number | 'any';
}

export const useChat = (onStartChat?: () => Promise<void>, onStopChat?: () => void) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [groupSize, setGroupSize] = useState<number | 'any'>(2);

  const startChat = useCallback(async () => {
    logEvent('Starting chat');
    try {
      setIsWaiting(true);
      if (onStartChat) {
        await onStartChat();
      }
      setIsChatActive(true);
      setMessages([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logEvent('Error starting chat', { error: errorMessage });
      throw err;
    } finally {
      setIsWaiting(false);
    }
  }, [onStartChat]);

  const stopChat = useCallback(() => {
    logEvent('Stopping chat');
    if (onStopChat) {
      onStopChat();
    }
    setIsChatActive(false);
    setIsWaiting(false);
  }, [onStopChat]);

  const nextChat = useCallback(() => {
    logEvent('Moving to next chat');
    stopChat();
    startChat();
  }, [startChat, stopChat]);

  const addMessage = useCallback((message: ChatMessage) => {
    logEvent('Adding message', { sender: message.sender });
    setMessages(prev => [...prev, message]);
  }, []);

  const addSystemMessage = useCallback((text: string) => {
    logEvent('Adding system message');
    addMessage({ text, sender: 'System' });
  }, [addMessage]);

  return {
    chatState: {
      messages,
      isChatActive,
      isWaiting,
      groupSize
    },
    startChat,
    stopChat,
    nextChat,
    setGroupSize,
    addMessage,
    addSystemMessage
  };
};
