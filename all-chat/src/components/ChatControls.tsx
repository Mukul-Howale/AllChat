import React from 'react';
import { Button } from "@/components/ui/button"
import { Users, Minus, Plus } from 'lucide-react';
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
    <div className="fixed bottom-0 left-0 right-0 md:relative flex flex-col md:flex-row justify-center items-center gap-4 p-4 bg-theme-background/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleDecrease}
          disabled={isChatActive || isWaiting || groupSize === 2}
          className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white disabled:bg-surface-200 disabled:text-surface-500"
          aria-label="Decrease group size"
        >
          <Minus className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center px-4 py-2 bg-surface-100 rounded-full">
          <Users className="hidden md:inline mr-2 text-primary-500" />
          <span className="text-lg md:text-base font-medium text-theme-foreground">
            {groupSize === 'any' ? 'Any' : `${groupSize} People`}
          </span>
        </div>

        <Button
          onClick={handleIncrease}
          disabled={isChatActive || isWaiting || groupSize === 4}
          className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white disabled:bg-surface-200 disabled:text-surface-500"
          aria-label="Increase group size"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0">
        {!isChatActive && !isWaiting && (
          <Button
            onClick={handleStartChat}
            className="w-full md:w-auto px-8 py-3 md:py-2 text-lg md:text-base font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-full"
          >
            Start Chat
          </Button>
        )}

        {isWaiting && (
          <Button
            onClick={handleStopChat}
            className="w-full md:w-auto px-8 py-3 md:py-2 text-lg md:text-base font-medium bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            Cancel
          </Button>
        )}

        {isChatActive && (
          <>
            <Button
              onClick={handleNextChat}
              className="w-full md:w-auto px-8 py-3 md:py-2 text-lg md:text-base font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-full"
            >
              Next Chat
            </Button>
            <Button
              onClick={handleStopChat}
              className="w-full md:w-auto px-8 py-3 md:py-2 text-lg md:text-base font-medium bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              Leave
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatControls;