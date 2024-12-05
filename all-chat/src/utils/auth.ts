interface User {
  id: string;
  name: string;
  email: string;
  username: string;  // Added username field
  passwordHash?: string;  // Make passwordHash optional
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

export const loginUser = (userData: User): void => {
  if (isBrowser) {
    // Do NOT store user data during login
    localStorage.setItem('isLoggedIn', 'true');
  }
};

export const logout = (): void => {
  if (isBrowser) {
    // Do not remove user data, just update login status
    localStorage.setItem('isLoggedIn', 'false');
  }
};

export const signupUser = (userData: User): void => {
  if (isBrowser) {
    // Add user to the list of users without overwriting
    addUserToLocalStorage(userData);
    
    // Set current login status
    localStorage.setItem('isLoggedIn', 'true');
  }
};

export const checkUserSignedUp = (): boolean => {
  if (isBrowser) {
    return !!localStorage.getItem('user');
  }
  return false;
};

export const addUserToLocalStorage = (userData: User): void => {
  if (isBrowser) {
    // Retrieve existing users or initialize an empty array
    const existingUsersStr = localStorage.getItem('allUsers');
    const existingUsers: User[] = existingUsersStr ? JSON.parse(existingUsersStr) : [];

    // Check if user already exists by email
    const userExists = existingUsers.some(user => user.email === userData.email);

    // Add user only if not already exists
    if (!userExists) {
      existingUsers.push(userData);
      localStorage.setItem('allUsers', JSON.stringify(existingUsers));
    }
  }
};

export const removeUserFromLocalStorage = (email: string): void => {
  if (isBrowser) {
    const existingUsersStr = localStorage.getItem('allUsers');
    if (existingUsersStr) {
      let existingUsers: User[] = JSON.parse(existingUsersStr);
      // Remove the user with the specified email
      existingUsers = existingUsers.filter(user => user.email !== email);
      localStorage.setItem('allUsers', JSON.stringify(existingUsers));
    }
  }
};

export const getAllUsersFromLocalStorage = (): User[] => {
  if (isBrowser) {
    const existingUsersStr = localStorage.getItem('allUsers');
    return existingUsersStr ? JSON.parse(existingUsersStr) : [];
  }
  return [];
};
