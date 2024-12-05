import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

export class ChatStore {
  rootStore: RootStore;
  messages: ChatMessage[] = [];
  currentChatPartner: string | null = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  addMessage(message: ChatMessage) {
    this.messages.push(message);
  }

  clearMessages() {
    this.messages = [];
  }

  setChatPartner(partnerId: string) {
    this.currentChatPartner = partnerId;
  }

  clearChatPartner() {
    this.currentChatPartner = null;
  }
}
