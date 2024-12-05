import { makeAutoObservable } from 'mobx';
import { UserStore } from './UserStore';
import { ChatStore } from './ChatStore';

export class RootStore {
  userStore: UserStore;
  chatStore: ChatStore;

  constructor() {
    makeAutoObservable(this);
    this.userStore = new UserStore(this);
    this.chatStore = new ChatStore(this);
  }
}

// Create a singleton instance of the root store
export const rootStore = new RootStore();
