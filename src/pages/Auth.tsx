import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Rocket } from "lucide-react";
import { z } from "zod";

const usernameSchema = z.string().trim().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens");

const emailSchema = z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters");

const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters");

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      const emailValidation = emailSchema.safeParse(formData.email);
      if (!emailValidation.success) {
        toast.error(emailValidation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const passwordValidation = passwordSchema.safeParse(formData.password);
      if (!passwordValidation.success) {
        toast.error(passwordValidation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      if (!isLogin) {
        const usernameValidation = usernameSchema.safeParse(formData.username);
        if (!usernameValidation.success) {
          toast.error(usernameValidation.error.errors[0].message);
          setIsLoading(false);
          return;
        }
      }

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast.success("Welcome back to NeoChatX!");
        navigate("/chat");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            },
            emailRedirectTo: `${window.location.origin}/chat`,
          },
        });

        if (error) throw error;

        toast.success("Account created! Welcome to NeoChatX!");
        navigate("/chat");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center cosmic-gradient p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-float">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Rocket className="h-12 w-12 text-primary animate-pulse-glow" />
          </div>
          <h1 className="text-5xl font-bold text-glow-primary">NeoChatX</h1>
          <p className="text-muted-foreground mt-2">Cosmic Communication Platform</p>
        </div>

        <Card className="cosmic-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-glow-primary">
              {isLogin ? "Welcome Back" : "Join the Galaxy"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? "Enter your credentials to continue" : "Create your account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required={!isLogin}
                    className="cosmic-border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="cosmic-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="cosmic-border"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>{isLogin ? "Sign In" : "Sign Up"}</>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
