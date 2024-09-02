import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  text: string;
  sender: string;
}

interface TextChatProps {
  isChatActive: boolean;
  onSendMessage: (message: string) => void;
  messages: Message[];
}

const TextChat: React.FC<TextChatProps> = ({ isChatActive, onSendMessage, messages }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4">Chat Window</h3>
      <div className="flex-grow overflow-y-auto mb-4 bg-white rounded p-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-semibold">{msg.sender}: </span>
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!isChatActive}
        />
        <Button type="submit" disabled={!isChatActive}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default TextChat;