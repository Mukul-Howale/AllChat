import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TextChatProps {
  isChatActive: boolean;
  onSendMessage: (message: string) => void;
  messages: { text: string; sender: string }[];
}

const TextChat: React.FC<TextChatProps> = ({ isChatActive, onSendMessage, messages }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
            <span className="inline-block bg-gray-700 rounded-lg px-3 py-2 text-sm">
              <strong>{msg.sender}: </strong>{msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!isChatActive}
            className="flex-grow bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500"
          />
          <Button onClick={handleSend} disabled={!isChatActive}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextChat;