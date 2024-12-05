import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Header from '@/layouts/Header'
import { setUser, getUser, removeUser, isAuthenticated } from '@/utils/auth'
import { hashPassword, comparePassword } from '@/utils/crypt'
import { useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid';
import { loginUser } from '@/utils/auth';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [user, setUserState] = useState<{ name: string; email: string; username: string } | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      const authenticatedUser = getUser()
      if (authenticatedUser) {
        setUserState({ name: authenticatedUser.name, email: authenticatedUser.email, username: authenticatedUser.username })
      }
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      let response;
      if (isSignUp) {
        response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, username, password }),
        });
      } else {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUserState({ name, email, username });
        router.push('/video-chat');
      } else {
        console.error('Authentication failed');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  }

  const handleGoogleAuth = () => {
    const googleUser = { 
      id: uuidv4(), 
      name: 'Google User', 
      email: 'google@example.com', 
      username: 'googleuser',
      passwordHash: '' 
    }
    setUser(googleUser)
    setUserState({ name: googleUser.name, email: googleUser.email, username: googleUser.username })
    console.log('Google auth successful:', googleUser)
    router.push('/video-chat')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header hideNavigation={false} user={user} />
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
  )
}
