import React from 'react';
import { Button } from "@/components/ui/button"
import { Users } from 'lucide-react';
import styles from '@/styles/shared.module.css';

interface ChatControlsProps {
  groupSize: number | 'any';
  setGroupSize: (size: number | 'any') => void;
  isChatActive: boolean;
  isWaiting: boolean;
  handleStartChat: () => void;
  handleStopChat: () => void;
  handleNextChat: () => void;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  groupSize,
  setGroupSize,
  isChatActive,
  isWaiting,
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
    <div className="flex justify-center items-center space-x-4 animate-fade-in">
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleDecrease}
          disabled={isChatActive || isWaiting || groupSize === 2}
          className="bg-primary-500 hover:bg-primary-600 text-white disabled:bg-surface-200 disabled:text-surface-500 elevation-1 button-hover focus-ring w-10 h-10 rounded-full"
          aria-label="Decrease group size"
        >
          -
        </Button>
        <span className="text-xl font-semibold flex items-center px-4 py-2 bg-surface-100 rounded-full elevation-1 animate-scale-in">
          <Users className="inline mr-2 text-primary-500" />
          <span className="text-theme-foreground">
            {groupSize === 'any' ? 'Any' : `${groupSize} People`}
          </span>
        </span>
        <Button
          onClick={handleIncrease}
          disabled={isChatActive || isWaiting || groupSize === 4}
          className="bg-primary-500 hover:bg-primary-600 text-white disabled:bg-surface-200 disabled:text-surface-500 elevation-1 button-hover focus-ring w-10 h-10 rounded-full"
          aria-label="Increase group size"
        >
          +
        </Button>
      </div>

      <div className="space-x-2">
        {!isChatActive && !isWaiting && (
          <Button
            onClick={handleStartChat}
            className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 font-medium elevation-1 button-hover focus-ring"
          >
            Start Chat
          </Button>
        )}
        {isWaiting && (
          <Button
            onClick={handleStopChat}
            className="bg-error-500 hover:bg-error-600 text-white px-6 font-medium elevation-1 button-hover focus-ring"
          >
            Cancel
          </Button>
        )}
        {isChatActive && (
          <>
            <Button
              onClick={handleNextChat}
              className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 font-medium elevation-1 button-hover focus-ring"
            >
              Next Chat
            </Button>
            <Button
              onClick={handleStopChat}
              className="bg-error-500 hover:bg-error-600 text-white px-6 font-medium elevation-1 button-hover focus-ring"
            >
              Leave Chat
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatControls;