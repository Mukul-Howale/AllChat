interface User {
  id: string;
  name: string;
  email: string;
  username: string;  // Added username field
  passwordHash: string;  // Store a hashed version of the password
  phoneNumber?: string;
  friendsCount?: number;
  messages?: number;
  notifications?: number;
  thumbsUp?: number;
  thumbsDown?: number;
  isPaidUser?: boolean;
  isEmailVerified?: boolean;
}

const isBrowser = typeof window !== 'undefined';

export const setUser = (user: User): void => {
  if (isBrowser) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
  }
};

export const getUser = (): User | null => {
  if (isBrowser) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        ...user,
        phoneNumber: user.phoneNumber || '',
        friendsCount: user.friendsCount || 0,
        messages: user.messages || 0,
        notifications: user.notifications || 0,
        thumbsUp: user.thumbsUp || 0,
        thumbsDown: user.thumbsDown || 0,
        isPaidUser: user.isPaidUser || false,
        isEmailVerified: user.isEmailVerified || false,
      };
    }
  }
  return null;
};

export const removeUser = (): void => {
  if (isBrowser) {
    localStorage.setItem('isLoggedIn', 'false');
  }
};

export const isAuthenticated = (): boolean => {
  if (isBrowser) {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
  return false;
};

export const logoutUser = (): void => {
  if (isBrowser) {
    localStorage.setItem('isLoggedIn', 'false');
  }
};

export const loginUser = (): void => {
  if (isBrowser) {
    localStorage.setItem('isLoggedIn', 'true');
  }
};
