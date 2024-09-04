import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'

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
    <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
      <Card className="w-[350px] bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">{isSignUp ? 'Create an account' : 'Log in'}</CardTitle>
          <CardDescription className="text-gray-300">
            {isSignUp 
              ? 'Enter your details below to create your account' 
              : 'Enter your details below to log in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Name</Label>
                  <Input id="name" type="text" required className="bg-gray-600 text-white border-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input id="username" type="text" required className="bg-gray-600 text-white border-gray-500" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input id="email" type="email" required className="bg-gray-600 text-white border-gray-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input id="password" type="password" required className="bg-gray-600 text-white border-gray-500" />
            </div>
            {isSignUp && (
              <p className="text-sm text-gray-300">
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
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              {isSignUp ? 'Sign Up' : 'Log In'}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-700 px-2 text-gray-400">
                Or
              </span>
            </div>
          </div>

          <Button onClick={handleGoogleAuth} variant="outline" className="w-full border-gray-500 text-white hover:bg-gray-600">
            {isSignUp ? 'Sign up' : 'Continue'} with Google
          </Button>
        </CardContent>
        <CardFooter>
          <Button 
            variant="link" 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="w-full text-blue-400"
          >
            {isSignUp 
              ? 'Already have an account? Log in' 
              : "Don't have an account? Sign up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
