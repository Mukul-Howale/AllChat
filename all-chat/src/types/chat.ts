export interface WebSocketMessage {
  type: 'chat' | 'userJoined' | 'userLeft' | 'offer' | 'answer' | 'ice-candidate';
  message?: { text: string; sender: string };
  userId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  to?: string;
  from?: string;
}

export interface LogMessage {
  timestamp: string;
  category: string;
  event: string;
  data?: any;
}

export interface ChatMessage {
  text: string;
  sender: string;
}
