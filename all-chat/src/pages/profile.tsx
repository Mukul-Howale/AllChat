import { useState } from 'react'
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, Bell, MessageSquare, Users } from 'lucide-react'
import Header from '@/layouts/Header'
import Footer from '@/layouts/Footer'

// This would typically come from your authentication system
const user = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe',
  friendsCount: 150,
  messages: 5,
  notifications: 3,
  phoneNumber: '',
  thumbsUp: 42,
  thumbsDown: 7,
  isPaidUser: true,
  isEmailVerified: false
}

export default function UserProfile() {
  const [username, setUsername] = useState(user.username)
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber)

  const handleSave = () => {
    // Here you would typically send an API request to update the user's information
    console.log('Saving user information:', { username, phoneNumber })
  }

  const handleVerifyEmail = () => {
    // Here you would typically send a verification email to the user
    console.log('Sending verification email to:', user.email)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl mx-auto bg-gray-700 border-gray-600">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <img
                  alt="User avatar"
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`}
                  style={{ width: '100%', height: '100%' }}
                />
              </Avatar>
              <div>
                <CardTitle className="text-white">{user.name}</CardTitle>
                <CardDescription className="text-gray-300">User Profile</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="flex items-center space-x-2">
                <Input id="email" value={user.email} disabled className="bg-gray-600 text-white border-gray-500" />
                {!user.isEmailVerified && (
                  <Button onClick={handleVerifyEmail} className="bg-blue-500 hover:bg-blue-600 text-white">Verify</Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-600 text-white border-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="bg-gray-600 text-white border-gray-500"
              />
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Users size={20} />
              <span>{user.friendsCount} friends</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <MessageSquare size={20} />
              <span>{user.messages} messages</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Bell size={20} />
              <span>{user.notifications} notifications</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-300">
              <div className="flex items-center space-x-2">
                <ThumbsUp size={20} />
                <span>{user.thumbsUp}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ThumbsDown size={20} />
                <span>{user.thumbsDown}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="paid-user" checked={user.isPaidUser} disabled />
              <Label htmlFor="paid-user" className="text-white">
                {user.isPaidUser ? 'Paid User' : 'Free User'}
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white">Save Changes</Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
