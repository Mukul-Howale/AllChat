import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Header from '../layouts/Header';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/contexts/StoreContext';
import { v4 as uuidv4 } from 'uuid';
import { checkUserSignedUp, getAllUsersFromLocalStorage } from '@/utils/auth';
import { MessageSquare, Chrome } from '@/components/icons';

const AuthPage = observer(() => {
  const router = useRouter();
  const store = useStore();

  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!isLogin) {
        // Signup process - store user data in local storage
        const userData = {
          id: uuidv4(),
          name: name || 'User',
          email,
          username: username || email.split('@')[0],
          passwordHash: password, // Store password hash
        };

        store.userStore.signup(userData);
        router.push('/video-chat');
      } else {
        // Login process
        const allUsers = getAllUsersFromLocalStorage();
        const existingUser = allUsers.find(user => user.email === email);

        if (existingUser) {
          // User exists, log them in
          store.userStore.login(existingUser);
          router.push('/video-chat');
        } else {
          // User not signed up, redirect to signup
          setIsLogin(false);
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleGoogleSignIn = () => {
    if (!isLogin) {
      const googleUser = { 
        id: uuidv4(), 
        name: 'Google User', 
        email: 'google@example.com', 
        username: 'googleuser',
        passwordHash: '', // No password for Google auth
      };
      
      store.userStore.signup(googleUser);
      router.push('/video-chat');
    } else {
      const allUsers = getAllUsersFromLocalStorage();
      const existingUser = allUsers.find(user => user.email === 'google@example.com');

      if (existingUser) {
        store.userStore.login(existingUser);
        router.push('/video-chat');
      } else {
        setIsLogin(false);
      }
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-theme-surface p-10 text-theme-foreground dark:border-r lg:flex elevation-1">
        <div className="absolute inset-0 bg-theme-surface-100" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <MessageSquare className="mr-2 h-6 w-6 text-theme-primary" />
          AllChat
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-theme-foreground/90">
              Connect with anyone, anywhere, instantly. Experience seamless video chat with AllChat.
            </p>
            <footer className="text-sm text-theme-foreground/60">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-theme-foreground">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-sm text-theme-foreground/60">
              {isLogin ? 'Enter your credentials to continue' : 'Enter your information to get started'}
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                {!isLogin && (
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-theme-foreground/90">Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-theme-surface border-theme-border focus:border-theme-primary"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-theme-foreground/90">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-theme-surface border-theme-border focus:border-theme-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-theme-foreground/90">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-theme-surface border-theme-border focus:border-theme-primary"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-theme-primary text-theme-surface hover:bg-theme-primary-600 transition-colors elevation-1"
                >
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Button>
              </div>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-theme-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-theme-surface px-2 text-theme-foreground/60">
                  Or continue with
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleGoogleSignIn}
              className="bg-theme-surface border-theme-border hover:bg-theme-surface-100 transition-colors elevation-1"
            >
              <Chrome className="mr-2 h-4 w-4 text-theme-primary" />
              Google
            </Button>
          </div>
          <p className="px-8 text-center text-sm text-theme-foreground/60">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="underline text-theme-primary hover:text-theme-primary-600 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
});

export default AuthPage;
