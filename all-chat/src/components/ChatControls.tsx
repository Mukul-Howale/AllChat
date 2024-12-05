import React from 'react';
import { Button } from "@/components/ui/button"
import { Users } from 'lucide-react';

interface ChatControlsProps {
  groupSize: number | 'any';
  setGroupSize: (size: number | 'any') => void;
  isChatActive: boolean;
  isWaiting: boolean; // New prop
  handleStartChat: () => void;
  handleStopChat: () => void;
  handleNextChat: () => void;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  groupSize,
  setGroupSize,
  isChatActive,
  isWaiting, // New prop
  handleStartChat,
  handleStopChat,
  handleNextChat
}) => {
  const handleDecrease = () => {
    if (typeof groupSize === 'number' && groupSize > 2) {
      setGroupSize(groupSize - 1);
    }
  };

  const handleIncrease = () => {
    if (typeof groupSize === 'number' && groupSize < 4) {
      setGroupSize(groupSize + 1);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleDecrease}
          disabled={isChatActive || isWaiting || groupSize === 2}
          variant="outline"
          className="bg-theme-primary text-theme-primary-foreground hover:bg-theme-primary/90"
        >
          -
        </Button>
        <span className="text-xl font-semibold flex items-center">
          <Users className="inline mr-2 text-theme-primary" />
          <span className="text-theme-foreground">
            {groupSize === 'any' ? 'Any' : `${groupSize} People`}
          </span>
        </span>
        <Button
          onClick={handleIncrease}
          disabled={isChatActive || isWaiting || groupSize === 4}
          variant="outline"
          className="bg-theme-primary text-theme-primary-foreground hover:bg-theme-primary/90"
        >
          +
        </Button>
      </div>
      <Button 
        className={`px-6 py-2 font-medium ${
          isChatActive || isWaiting 
            ? 'bg-theme-destructive text-theme-destructive-foreground hover:bg-theme-destructive/90' 
            : 'bg-theme-primary text-theme-primary-foreground hover:bg-theme-primary/90'
        }`}
        onClick={isChatActive || isWaiting ? handleStopChat : handleStartChat}
      >
        {isChatActive ? 'Stop Chat' : isWaiting ? 'Cancel' : 'Start Chat'}
      </Button>
      {isChatActive && (
        <Button 
          className="px-6 py-2 bg-theme-secondary text-theme-secondary-foreground hover:bg-theme-secondary/90 font-medium" 
          onClick={handleNextChat}
        >
          Next
        </Button>
      )}
    </div>
  );
};

export default ChatControls;