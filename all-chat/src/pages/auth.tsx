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
    if (isSignUp) {
      const passwordHash = await hashPassword(password)
      const newUser = { id: uuidv4(), name, email, username, passwordHash }
      setUser(newUser)
      loginUser() // Add this line
      setUserState({ name, email, username })
      console.log('User signed up:', newUser)
    } else {
      const storedUser = getUser()
      if (storedUser && storedUser.email === email) {
        const isPasswordValid = await comparePassword(password, storedUser.passwordHash)
        if (isPasswordValid) {
          loginUser() // Add this line
          setUserState({ name: storedUser.name, email: storedUser.email, username: storedUser.username })
          console.log('User logged in:', storedUser)
        } else {
          console.log('Login failed: Incorrect password')
          return
        }
      } else {
        console.log('Login failed: User not found')
        return
      }
    }
    router.push('/video-chat')
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
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Header hideNavigation={false} user={user} />
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-[800px] bg-gray-700 border-gray-600 flex flex-col md:flex-row">
          <div className="md:w-1/3 p-6 flex flex-col justify-center items-center border-r border-gray-600">
            <Button 
              onClick={handleGoogleAuth} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm h-10 mb-4"
            >
              {isSignUp ? 'Sign up' : 'Continue'} with Google
            </Button>
          </div>
          <div className="md:w-2/3 p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-white text-2xl">{isSignUp ? 'Create an account' : 'Log in'}</CardTitle>
              <CardDescription className="text-gray-300 text-sm">
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
                      <Label htmlFor="name" className="text-white text-sm">Name</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        required 
                        className="bg-gray-600 text-white border-gray-500 h-10 text-sm" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="username" className="text-white text-sm">Username</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        required 
                        className="bg-gray-600 text-white border-gray-500 h-10 text-sm" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-white text-sm">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    className="bg-gray-600 text-white border-gray-500 h-10 text-sm" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-white text-sm">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    className="bg-gray-600 text-white border-gray-500 h-10 text-sm" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {isSignUp && (
                  <p className="text-xs text-gray-300">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="underline text-blue-400">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="underline text-blue-400">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                )}
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm h-10">
                  {isSignUp ? 'Sign Up' : 'Log In'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="p-0 mt-4">
              <Button 
                variant="link" 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="w-full text-blue-400 text-sm"
              >
                {isSignUp 
                  ? 'Already have an account? Log in' 
                  : "Don't have an account? Sign up"}
              </Button>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  )
}
