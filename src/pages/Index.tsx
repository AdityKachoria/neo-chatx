import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Rocket, MessageSquare, Users, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/chat");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen cosmic-gradient flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl animate-float">
          <div className="flex items-center justify-center mb-6">
            <Rocket className="h-24 w-24 text-primary animate-pulse-glow" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-glow-primary">
            NeoChatX
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
            Experience the future of communication. Connect across the cosmos with real-time messaging.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg"
            >
              Get Started
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full">
          <div className="cosmic-border rounded-lg p-6 text-center space-y-4 hover:scale-105 transition-transform">
            <MessageSquare className="h-12 w-12 text-primary mx-auto animate-pulse-glow" />
            <h3 className="text-xl font-semibold text-glow-primary">Real-Time Chat</h3>
            <p className="text-muted-foreground">
              Instant messaging with live updates and typing indicators
            </p>
          </div>

          <div className="cosmic-border rounded-lg p-6 text-center space-y-4 hover:scale-105 transition-transform">
            <Users className="h-12 w-12 text-secondary mx-auto glow-secondary" />
            <h3 className="text-xl font-semibold text-glow-secondary">User Discovery</h3>
            <p className="text-muted-foreground">
              Search and connect with users across the platform
            </p>
          </div>

          <div className="cosmic-border rounded-lg p-6 text-center space-y-4 hover:scale-105 transition-transform">
            <Zap className="h-12 w-12 text-accent mx-auto glow-accent" />
            <h3 className="text-xl font-semibold" style={{ textShadow: "0 0 10px hsl(var(--accent) / 0.7)" }}>
              Lightning Fast
            </h3>
            <p className="text-muted-foreground">
              Powered by cutting-edge technology for seamless performance
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/30 py-6 text-center">
        <p className="text-muted-foreground">
          NeoChatX - Cosmic Communication Platform
        </p>
      </footer>
    </div>
  );
};

export default Index;
