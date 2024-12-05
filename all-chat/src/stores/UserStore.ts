import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { getUser, isAuthenticated, logout } from '@/utils/auth';

export interface User {
  id?: string;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  friendsCount?: number;
  messages?: number;
  notifications?: number;
  thumbsUp?: number;
  thumbsDown?: number;
  isPaidUser?: boolean;
  isEmailVerified?: boolean;
}

export class UserStore {
  rootStore: RootStore;
  currentUser: User | null = null;
  isAuthenticated: boolean = false;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    this.checkAuthentication();
    this.loadUserFromLocalStorage();
  }

  checkAuthentication() {
    if (isAuthenticated()) {
      const user = getUser();
      if (user) {
        this.setUser(user);
      }
    }
  }

  setUser(user: User) {
    this.currentUser = user;
    this.isAuthenticated = true;
  }

  clearUser() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  logout() {
    logout();
    this.clearUser();
    localStorage.removeItem('user');
  }

  login(user: User) {
    this.setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  loadUserFromLocalStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  updateProfile(updates: Partial<User>) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updates };
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  verifyEmail() {
    if (this.currentUser) {
      this.currentUser.isEmailVerified = true;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  incrementFriends() {
    if (this.currentUser) {
      this.currentUser.friendsCount = (this.currentUser.friendsCount || 0) + 1;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  incrementMessages() {
    if (this.currentUser) {
      this.currentUser.messages = (this.currentUser.messages || 0) + 1;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  incrementNotifications() {
    if (this.currentUser) {
      this.currentUser.notifications = (this.currentUser.notifications || 0) + 1;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  incrementThumbsUp() {
    if (this.currentUser) {
      this.currentUser.thumbsUp = (this.currentUser.thumbsUp || 0) + 1;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  incrementThumbsDown() {
    if (this.currentUser) {
      this.currentUser.thumbsDown = (this.currentUser.thumbsDown || 0) + 1;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }
}
