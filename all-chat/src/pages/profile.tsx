import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MessageSquare, Bell, ThumbsUp, ThumbsDown, Download, Clock, Star } from 'lucide-react';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/contexts/StoreContext';
import styles from '@/styles/profile.module.css';

const UserProfile = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { currentUser, logout } = store.userStore;
  const [isClient, setIsClient] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [friendsCount, setFriendsCount] = useState(0);
  const [messages, setMessages] = useState(0);
  const [notifications, setNotifications] = useState<number>(0);
  const [thumbsUp, setThumbsUp] = useState(0);
  const [thumbsDown, setThumbsDown] = useState(0);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [rating, setRating] = useState('4.5');
  const [joinDate, setJoinDate] = useState('2 months');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [privacy, setPrivacy] = useState('public');

  useEffect(() => {
    setIsClient(true);
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    
    // Initialize state with currentUser data
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setUsername(currentUser.username || '');
    setPhoneNumber(currentUser.phoneNumber || '');
    setFriendsCount(currentUser.friendsCount || 0);
    setMessages(currentUser.messages || 0);
    setNotifications(currentUser.notifications || 0);
    setThumbsUp(currentUser.thumbsUp || 0);
    setThumbsDown(currentUser.thumbsDown || 0);
    setIsPaidUser(currentUser.isPaidUser || false);
    setIsEmailVerified(currentUser.isEmailVerified || false);
  }, [currentUser, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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

  const handleExportData = () => {
    // Implement data export logic here
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic here
  };

  if (!isClient || !currentUser) return null;

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Profile Header */}
            <div className="bg-theme-surface rounded-lg p-6 elevation-2 card-hover">
              <h1 className="text-3xl font-bold text-theme-foreground mb-4">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="gradient-primary rounded-lg p-6 text-white elevation-2 animate-scale-in">
                <h3 className="text-lg font-semibold mb-2">Total Chats</h3>
                <p className="text-3xl font-bold">{messages}</p>
              </div>
              <div className="gradient-secondary rounded-lg p-6 text-white elevation-2 animate-scale-in">
                <h3 className="text-lg font-semibold mb-2">Friends Made</h3>
                <p className="text-3xl font-bold">{friendsCount}</p>
              </div>
              <div className="bg-surface-700 rounded-lg p-6 text-white elevation-2 animate-scale-in">
                <h3 className="text-lg font-semibold mb-2">Time Spent</h3>
                <p className="text-3xl font-bold">127h</p>
              </div>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="bg-theme-surface rounded-lg p-6 elevation-2">
                <h2 className="text-2xl font-semibold text-theme-foreground mb-6">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-theme-foreground mb-2">
                      Username
                    </label>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-background border border-input input-focus"
                      placeholder="Enter your username"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-theme-foreground mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-background border border-input input-focus"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-theme-foreground mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-background border border-input input-focus"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-theme-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="text"
                      id="phone"
                      name="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-background border border-input input-focus"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-theme-surface rounded-lg p-6 elevation-2">
                <h2 className="text-2xl font-semibold text-theme-foreground mb-6">Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-theme-foreground">Dark Mode</h3>
                      <p className="text-sm text-muted-foreground">Enable dark mode for better night viewing</p>
                    </div>
                    <Switch
                      checked={isPaidUser}
                      onCheckedChange={setIsPaidUser}
                      className="focus-ring"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-theme-foreground">Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
                    </div>
                    <Input
                      type="number"
                      value={notifications}
                      onChange={(e) => setNotifications(Number(e.target.value))}
                      className="w-20 px-4 py-2 rounded-md bg-background border border-input input-focus"
                    />
                  </div>
                </div>
              </div>

              {/* Account Management Section */}
              <div className="bg-theme-surface rounded-lg p-6 elevation-2">
                <h2 className="text-2xl font-semibold text-theme-foreground mb-6">Account Management</h2>
                
                {/* Account Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-surface-100 p-4 rounded-lg text-center elevation-1">
                    <ThumbsUp className="mx-auto h-6 w-6 text-primary-500 mb-2" />
                    <div className="text-xl font-semibold text-theme-foreground">{likes || 0}</div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </div>
                  <div className="bg-surface-100 p-4 rounded-lg text-center elevation-1">
                    <ThumbsDown className="mx-auto h-6 w-6 text-error-500 mb-2" />
                    <div className="text-xl font-semibold text-theme-foreground">{dislikes || 0}</div>
                    <div className="text-sm text-muted-foreground">Dislikes</div>
                  </div>
                  <div className="bg-surface-100 p-4 rounded-lg text-center elevation-1">
                    <Star className="mx-auto h-6 w-6 text-secondary-500 mb-2" />
                    <div className="text-xl font-semibold text-theme-foreground">{rating || '4.5'}</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div className="bg-surface-100 p-4 rounded-lg text-center elevation-1">
                    <Clock className="mx-auto h-6 w-6 text-primary-500 mb-2" />
                    <div className="text-xl font-semibold text-theme-foreground">{joinDate || '2 months'}</div>
                    <div className="text-sm text-muted-foreground">Member Since</div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4">
                  {/* Export Data */}
                  <div className="flex items-center justify-between p-4 bg-surface-100 rounded-lg">
                    <div>
                      <h3 className="text-lg font-medium text-theme-foreground">Export Your Data</h3>
                      <p className="text-sm text-muted-foreground">Download a copy of your chat history and preferences</p>
                    </div>
                    <Button
                      onClick={handleExportData}
                      className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 button-hover focus-ring"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  {/* Privacy Settings */}
                  <div className="flex items-center justify-between p-4 bg-surface-100 rounded-lg">
                    <div>
                      <h3 className="text-lg font-medium text-theme-foreground">Profile Visibility</h3>
                      <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
                    </div>
                    <div className="w-40">
                      <Select
                        value={privacy}
                        onValueChange={setPrivacy}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Account Deletion */}
                  <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-error-800">Delete Account Permanently</h3>
                        <p className="text-sm text-error-600">This action cannot be undone. Please be certain.</p>
                      </div>
                      
                      {showDeleteConfirm ? (
                        <div className="space-y-4 animate-fade-in">
                          <Input
                            type="text"
                            placeholder="Type 'DELETE' to confirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full border-error-200 focus:border-error-500 focus:ring-error-500"
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setShowDeleteConfirm(false)}
                              variant="outline"
                              className="hover:bg-error-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleDeleteAccount}
                              disabled={deleteConfirmText !== 'DELETE'}
                              className="bg-error-500 hover:bg-error-600 text-white disabled:bg-error-300"
                            >
                              Confirm Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="bg-error-500 hover:bg-error-600 text-white"
                        >
                          Delete Account
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  className="px-6 py-2 button-hover focus-ring"
                >
                  Logout
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-500 text-white px-6 py-2 button-hover focus-ring"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default UserProfile;
