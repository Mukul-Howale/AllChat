interface User {
  id: string;
  name: string;
  email: string;
  username: string;  // Added username field
  passwordHash: string;  // Store a hashed version of the password
}

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const removeUser = (): void => {
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getUser();
};
