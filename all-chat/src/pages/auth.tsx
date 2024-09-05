import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import Header from '@/layouts/Header'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Here you would typically handle the form submission
    console.log('Form submitted')
  }

  const handleGoogleAuth = () => {
    // Here you would typically initiate Google authentication
    console.log('Google auth initiated')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Header hideNavigation={true} />
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-[800px] bg-gray-700 border-gray-600 flex flex-col md:flex-row">
          <div className="md:w-1/3 p-6 flex flex-col justify-center items-center border-r border-gray-600">
            <Button 
              onClick={handleGoogleAuth} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm h-10 mb-4"
            >
              {isSignUp ? 'Sign up' : 'Continue'} with Google
            </Button>
            {/* Add more social login options here if needed */}
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
                      <Input id="name" type="text" required className="bg-gray-600 text-white border-gray-500 h-10 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="username" className="text-white text-sm">Username</Label>
                      <Input id="username" type="text" required className="bg-gray-600 text-white border-gray-500 h-10 text-sm" />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-white text-sm">Email</Label>
                  <Input id="email" type="email" required className="bg-gray-600 text-white border-gray-500 h-10 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-white text-sm">Password</Label>
                  <Input id="password" type="password" required className="bg-gray-600 text-white border-gray-500 h-10 text-sm" />
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
                className="w-full text-blue-400 text-sm">
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
