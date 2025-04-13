
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { getUserByEmail, saveUser } from "@/utils/storage";
import { generateId } from "@/utils/storage";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get users from local storage and find by email
      const users = localStorage.getItem("food_share_users") ? 
        JSON.parse(localStorage.getItem("food_share_users")!) : [];
      
      const user = users.find((u: any) => u.email === email);
      
      if (!user || user.password !== password) {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Login user
      login(user);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block mb-8 text-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Dasher</h1>
        </Link>
        
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Log in</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-cyan-500 hover:text-cyan-400">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
