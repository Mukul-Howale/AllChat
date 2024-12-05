import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Users, MessageSquare, Bell, ThumbsUp, ThumbsDown } from 'lucide-react';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/contexts/StoreContext';

const UserProfile = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { currentUser, logout } = store.userStore;

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [friendsCount, setFriendsCount] = useState(currentUser?.friendsCount || 0);
  const [messages, setMessages] = useState(currentUser?.messages || 0);
  const [notifications, setNotifications] = useState(currentUser?.notifications || 0);
  const [thumbsUp, setThumbsUp] = useState(currentUser?.thumbsUp || 0);
  const [thumbsDown, setThumbsDown] = useState(currentUser?.thumbsDown || 0);
  const [isPaidUser, setIsPaidUser] = useState(currentUser?.isPaidUser || false);
  const [isEmailVerified, setIsEmailVerified] = useState(currentUser?.isEmailVerified || false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
    }
  }, [currentUser, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulated profile update logic
      store.userStore.updateProfile({
        name,
        email,
        username,
        phoneNumber,
        friendsCount,
        messages,
        notifications,
        thumbsUp,
        thumbsDown,
        isPaidUser,
        isEmailVerified
      });
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!currentUser) return null;

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
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${currentUser.name}`}
                  style={{ width: '100%', height: '100%' }}
                />
              </Avatar>
              <div>
                <CardTitle className="text-white">{currentUser.name}</CardTitle>
                <CardDescription className="text-gray-300">User Profile</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-600 text-white border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-600 text-white border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  type="text"
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
                <span>{friendsCount} friends</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MessageSquare size={20} />
                <span>{messages} messages</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Bell size={20} />
                <span>{notifications} notifications</span>
              </div>
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <ThumbsUp size={20} />
                  <span>{thumbsUp}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ThumbsDown size={20} />
                  <span>{thumbsDown}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="paid-user" checked={isPaidUser} disabled />
                <Label htmlFor="paid-user" className="text-white">
                  {isPaidUser ? 'Paid User' : 'Free User'}
                </Label>
              </div>
              <div className="flex space-x-4">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Save Profile</Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
});

export default UserProfile;
