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

const AuthPage = observer(() => {
  const router = useRouter();
  const store = useStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
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
          setIsSignUp(true);
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleGoogleAuth = () => {
    if (isSignUp) {
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
        setIsSignUp(true);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-[800px] bg-card border-border flex flex-col md:flex-row">
          <div className="md:w-1/3 p-6 flex flex-col justify-center items-center border-r border-border">
            <Button 
              onClick={handleGoogleAuth} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-10 mb-4"
            >
              {isSignUp ? 'Sign up' : 'Continue'} with Google
            </Button>
          </div>
          <div className="md:w-2/3 p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle>{isSignUp ? 'Create an account' : 'Log in'}</CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Enter your details below to create your account' 
                  : 'Enter your details below to log in to your account'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <form onSubmit={handleSubmit} className="space-y-3">
                {isSignUp && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        required 
                        className="bg-background border-input h-10 text-sm" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        required 
                        className="bg-background border-input h-10 text-sm" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    className="bg-background border-input h-10 text-sm" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    className="bg-background border-input h-10 text-sm" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isSignUp ? 'Create Account' : 'Log In'}
                </Button>
              </form>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
});

export default AuthPage;
