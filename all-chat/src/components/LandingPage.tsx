import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-gray-700">
        <Link className="flex items-center justify-center" href="#">
          <MessageSquare className="h-6 w-6" />
          <span className="ml-2 text-2xl font-bold">AllChat</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
            How It Works
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#about">
            About
          </Link>
        </nav>
      </header>
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
                <Button>Start Chatting</Button>
                <Button variant="outline">Learn More</Button>
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
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
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
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-700">
        <p className="text-xs text-gray-400">© 2024 AllChat. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}