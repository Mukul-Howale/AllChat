import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/router'
import Header from '../layouts/Header'
import Footer from '../layouts/Footer'
import { getUser, isAuthenticated } from '@/utils/auth'

export default function LandingPage() {
  const router = useRouter();
  // State variable for user information
  const [user, setUser] = useState<{ name: string; email: string; username: string } | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated and set user state
      if (isAuthenticated()) {
        const authenticatedUser = getUser();
        if (authenticatedUser) {
          setUser({ name: authenticatedUser.name, email: authenticatedUser.email, username: authenticatedUser.username });
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();

    // Add event listener for storage events
    window.addEventListener('storage', checkAuth);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleStartChatting = () => {
    router.push('/video-chat');
  };

  // Render the landing page
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Header user={user} />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 border-b border-gray-700">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connect with Strangers Instantly
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
                  AllChat lets you meet new people from around the world. Start a conversation with a random stranger now!
                </p>
              </div>
              <div className="space-x-4">
                <Button onClick={handleStartChatting}>Start Chatting</Button>
                <Button>Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="bg-gray-700 w-full py-12 md:py-24 lg:py-32 border-b border-gray-700">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Why Choose AllChat?</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 mb-4 text-blue-400" />
                <h3 className="text-xl font-bold mb-2">Meet New People</h3>
                <p className="text-gray-300">Connect with individuals from diverse backgrounds and cultures.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Zap className="h-12 w-12 mb-4 text-blue-400" />
                <h3 className="text-xl font-bold mb-2">Instant Connections</h3>
                <p className="text-gray-300">No waiting or swiping. Get matched with someone instantly.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="h-12 w-12 mb-4 text-blue-400" />
                <h3 className="text-xl font-bold mb-2">Safe and Anonymous</h3>
                <p className="text-gray-300">Your privacy is our priority. Chat safely and anonymously.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 border-b border-gray-600">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Click "Start Chatting"</h3>
                <p className="text-gray-300">Begin your journey with a single click.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Get Matched</h3>
                <p className="text-gray-300">Our system pairs you with a random stranger.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Start Conversing</h3>
                <p className="text-gray-300">Chat, share, and make new friends!</p>
              </div>
            </div>
          </div>
        </section>
        <section id="cta" className="bg-gray-700 w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Meet Someone New?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl">
                  Join thousands of users already making connections. Start your chat adventure now!
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1 bg-gray-700 border-gray-600 text-white" placeholder="Enter your email" type="email" />
                  <Button type="submit">Sign Up</Button>
                </form>
                <p className="text-xs text-gray-400">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2 hover:text-blue-400" href="#">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}