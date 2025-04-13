
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { getCurrentLocation } from "@/utils/geo";
import { saveUser } from "@/utils/storage";
import { generateId } from "@/utils/storage";

const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get users from local storage and check if email exists
      const users = localStorage.getItem("food_share_users") ? 
        JSON.parse(localStorage.getItem("food_share_users")!) : [];
      
      if (users.some((u: any) => u.email === email)) {
        toast({
          title: "Email already exists",
          description: "Please use a different email or log in",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Get user's location
      let userLocation;
      try {
        userLocation = await getCurrentLocation();
      } catch (error) {
        console.error("Error getting location:", error);
        userLocation = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
      }
      
      // Create new user
      const newUser = {
        id: generateId(),
        name: name.trim(),
        email: email.trim(),
        password: password, // In a real app, you would hash this!
        onboardingCompleted: false,
        location: userLocation
      };
      
      // Save user to local storage
      const savedUser = saveUser(newUser);
      
      // Login the user
      login(savedUser);
      
      toast({
        title: "Account created",
        description: "Welcome to Dasher!",
      });
      
      // Navigate to homepage/dashboard
      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Sign up failed",
        description: "An error occurred during sign up",
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
            <CardTitle className="text-white text-2xl">Sign up</CardTitle>
            <CardDescription className="text-gray-400">
              Create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Organization Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your organization name"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
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
                  placeholder="Create a password"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-cyan-500 hover:text-cyan-400">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
