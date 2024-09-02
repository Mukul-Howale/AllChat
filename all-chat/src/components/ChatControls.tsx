import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Users } from 'lucide-react'; // Add this import for the Users icon

interface ChatControlsProps {
  groupSize: number | 'any';
  setGroupSize: (size: number | 'any') => void;
  isChatActive: boolean;
  handleStartChat: () => void;
  handleStopChat: () => void;
  handleNextChat: () => void;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  groupSize,
  setGroupSize,
  isChatActive,
  handleStartChat,
  handleStopChat,
  handleNextChat
}) => {
  const [peopleCount, setPeopleCount] = useState(2);

  return (
    <div className="mt-4 flex space-x-4">
      <select
        className="px-4 py-2 bg-gray-700 text-white rounded-lg"
        value={groupSize}
        onChange={(e) => setGroupSize(e.target.value === 'any' ? 'any' : parseInt(e.target.value))}
        disabled={isChatActive}
      >
        <option value={2}>2 People</option>
        <option value={3}>3 People</option>
        <option value={4}>4 People</option>
        <option value="any">Any</option>
      </select>
      <button 
        className={`px-6 py-2 text-white rounded-lg ${
          isChatActive ? 'bg-red-600' : 'bg-blue-600'
        }`}
        onClick={isChatActive ? handleStopChat : handleStartChat}
      >
        {isChatActive ? 'Stop Chat' : 'Start Chat'}
      </button>
      {isChatActive && (
        <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg" onClick={handleNextChat}>
          Next
        </button>
      )}
      <Button
        onClick={() => setPeopleCount(Math.max(2, peopleCount - 1))}
        disabled={peopleCount === 2}
      >
        -
      </Button>
      <span className="text-xl font-semibold">
        <Users className="inline mr-2" />
        {peopleCount} People
      </span>
      <Button
        onClick={() => setPeopleCount(Math.min(4, peopleCount + 1))}
        disabled={peopleCount === 4}
      >
        +
      </Button>
    </div>
  );
};

export default ChatControls;