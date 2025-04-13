
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { saveUser } from "@/utils/storage";
import { generateId } from "@/utils/storage";
import { getCurrentLocation } from "@/utils/geo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Building2, Utensils, Home, UserRound } from "lucide-react";

const LoginScreen: React.FC = () => {
  const { login } = useUser();
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("business");
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's location when component mounts
    const getLocation = async () => {
      try {
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    getLocation();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get location if not already obtained
      const userLocation = location || await getCurrentLocation();

      // Create new user
      const newUser = {
        id: generateId(),
        name: name.trim(),
        role,
        location: userLocation
      };

      // Save to local storage
      const savedUser = saveUser(newUser);
      
      // Log the user in
      login(savedUser);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-2">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Utensils className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Food Share Connect</CardTitle>
            <CardDescription className="text-center">
              Sign in to share or receive surplus food
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name or organization"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>I am a:</Label>
                  <Tabs defaultValue="business" onValueChange={(value) => setRole(value as UserRole)}>
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="business" className="flex gap-2 items-center">
                        <Store className="h-4 w-4" /> Food Business
                      </TabsTrigger>
                      <TabsTrigger value="charity" className="flex gap-2 items-center">
                        <Building2 className="h-4 w-4" /> Charity/Shelter
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="business" className="p-4 bg-muted/50 rounded-md mt-2">
                      <div className="flex items-start gap-3">
                        <Store className="h-5 w-5 text-food-green mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Food Business</h4>
                          <p className="text-sm text-muted-foreground">
                            Restaurants, cafes, bakeries, grocery stores with surplus food to share.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="charity" className="p-4 bg-muted/50 rounded-md mt-2">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-food-blue mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Charity/Shelter</h4>
                          <p className="text-sm text-muted-foreground">
                            Food banks, shelters, community fridges, and organizations that distribute food.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-xs text-center text-muted-foreground mt-2">
              By signing in, you'll get access to a network of local food sharing opportunities.
              <br />
              Your location will be used to connect you with nearby food resources.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
