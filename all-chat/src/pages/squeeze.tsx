import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/router'
import Header from '../layouts/Header'
import Footer from '../layouts/Footer'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/contexts/StoreContext'

const LandingPage = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { currentUser } = store.userStore;

  const handleStartChatting = () => {
    router.push('/video-chat');
  };

  // Render the landing page
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header user={currentUser ?? undefined} />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 border-b border-border">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connect with Strangers Instantly
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  AllChat lets you meet new people from around the world. Start a conversation with a random stranger now!
                </p>
              </div>
              <div className="space-x-4">
                <Button onClick={handleStartChatting} variant="default">Start Chatting</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="bg-card w-full py-12 md:py-24 lg:py-32 border-y border-border">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Why Choose AllChat?</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Meet New People</h3>
                <p className="text-muted-foreground">Connect with individuals from diverse backgrounds and cultures.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Zap className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Instant Connections</h3>
                <p className="text-muted-foreground">No waiting or swiping. Get matched with someone instantly.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Safe and Anonymous</h3>
                <p className="text-muted-foreground">Your privacy is our priority. Chat safely and anonymously.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 border-b border-border">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Click "Start Chatting"</h3>
                <p className="text-muted-foreground">Begin your journey with a single click.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Get Matched</h3>
                <p className="text-muted-foreground">Our system pairs you with a random stranger.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Start Chatting</h3>
                <p className="text-muted-foreground">Begin a conversation and make new connections.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="cta" className="bg-card w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Meet Someone New?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Join thousands of users already making connections. Start your chat adventure now!
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1 bg-card border-border text-foreground" placeholder="Enter your email" type="email" />
                  <Button type="submit">Sign Up</Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2 hover:text-primary" href="/terms">
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
  );
});

export default LandingPage;