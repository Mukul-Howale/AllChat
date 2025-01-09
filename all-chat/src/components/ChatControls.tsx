import React from 'react';
import { Button } from "@/components/ui/button"
import { Users, Minus, Plus } from 'lucide-react';

interface ChatControlsProps {
  isChatActive: boolean;
  isWaiting: boolean;
  handleStartChat: () => void;
  handleStopChat?: () => void;
  handleNextChat?: () => void;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  isChatActive,
  isWaiting,
  handleStartChat,
  handleStopChat,
  handleNextChat
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:relative flex flex-col md:flex-row justify-center items-center gap-4 p-4 bg-theme-background/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleStartChat}
          disabled={isChatActive || isWaiting}
          className="w-full md:w-auto px-8 py-3 md:py-2 text-lg md:text-base font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-full"
        >
          Start Chat
        </Button>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0">
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