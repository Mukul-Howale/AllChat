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

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
};

export const getUser = (): User | null => {
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
  return null;
};

export const removeUser = (): void => {
  // Instead of removing the user, just set the logged in state to false
  localStorage.setItem('isLoggedIn', 'false');
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const logoutUser = (): void => {
  localStorage.setItem('isLoggedIn', 'false');
};

export const loginUser = (): void => {
  localStorage.setItem('isLoggedIn', 'true');
};
