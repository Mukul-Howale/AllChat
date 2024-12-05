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
    if (typeof window !== 'undefined') {
      this.loadUserFromLocalStorage();
    }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  clearUser() {
    this.currentUser = null;
    this.isAuthenticated = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  logout() {
    logout();
    this.clearUser();
  }

  login(user: User) {
    this.setUser(user);
  }

  loadUserFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          this.currentUser = parsedUser;
          this.isAuthenticated = true;
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
        }
      }
    }
  }

  updateProfile(updates: Partial<User>) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
    }
  }

  verifyEmail() {
    if (this.currentUser) {
      this.currentUser.isEmailVerified = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
    }
  }

  incrementFriends() {
    if (this.currentUser) {
      this.currentUser.friendsCount = (this.currentUser.friendsCount || 0) + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
    }
  }

  incrementMessages() {
    if (this.currentUser) {
      this.currentUser.messages = (this.currentUser.messages || 0) + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
    }
  }

  incrementNotifications() {
    if (this.currentUser) {
      this.currentUser.notifications = (this.currentUser.notifications || 0) + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
    }
  }

  incrementThumbsUp() {
    if (this.currentUser) {
      this.currentUser.thumbsUp = (this.currentUser.thumbsUp || 0) + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
    }
  }

  incrementThumbsDown() {
    if (this.currentUser) {
      this.currentUser.thumbsDown = (this.currentUser.thumbsDown || 0) + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
    }
  }
}
