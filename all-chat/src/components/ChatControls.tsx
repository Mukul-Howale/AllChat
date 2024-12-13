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
    <div className="flex justify-center items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleDecrease}
          disabled={isChatActive || isWaiting || groupSize === 2}
          variant="outline"
          className={`bg-theme-primary text-theme-primary-foreground hover:bg-theme-primary/90 ${styles.button}`}
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
          className={`bg-theme-primary text-theme-primary-foreground hover:bg-theme-primary/90 ${styles.button}`}
        >
          +
        </Button>
      </div>
      <div className="space-x-2">
        {!isChatActive && !isWaiting && (
          <Button
            onClick={handleStartChat}
            variant="default"
            className={`bg-theme-primary text-theme-primary-foreground hover:bg-theme-primary/90 ${styles.button}`}
          >
            Start Chat
          </Button>
        )}
        {isChatActive && (
          <>
            <Button
              onClick={handleNextChat}
              variant="outline"
              className={`bg-theme-surface text-theme-foreground hover:bg-theme-surface-100 ${styles.button}`}
            >
              Next
            </Button>
            <Button
              onClick={handleStopChat}
              variant="destructive"
              className={`bg-error-500 text-white hover:bg-error-600 ${styles.button}`}
            >
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatControls;