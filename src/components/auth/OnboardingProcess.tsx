
import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { OnboardingStep, UserRole, FoodCategory, User } from "@/types";
import { getCurrentLocation } from "@/utils/geo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Building2, Utensils, Home, UserRound, ArrowRight, MapPin, Bell, Filter } from "lucide-react";
import { saveUser } from "@/utils/storage";
import { toast } from "@/components/ui/use-toast";

const OnboardingProcess: React.FC = () => {
  const { user, login } = useUser();
  const [step, setStep] = useState<OnboardingStep>("role");
  const [name, setName] = useState(user?.name || "");
  const [role, setRole] = useState<UserRole>(user?.role || "business");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    user?.location || null
  );
  const [address, setAddress] = useState<string>(user?.address || "");
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>(
    user?.preferences?.foodCategories || []
  );
  const [maxDistance, setMaxDistance] = useState<number>(
    user?.preferences?.maxDistance || 10
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    user?.preferences?.notificationEnabled !== false
  );
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (user && !location) {
      fetchUserLocation();
    }
  }, []);

  const fetchUserLocation = async () => {
    setLocationLoading(true);
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        title: "Location Error",
        description: "We couldn't get your location. Please enter it manually.",
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCategoryToggle = (category: FoodCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleNextStep = () => {
    // Validate current step
    if (step === "role" && !role) return;
    if (step === "name" && !name.trim()) return;
    if (step === "location" && !location) return;

    // Move to next step
    switch (step) {
      case "role":
        setStep("name");
        break;
      case "name":
        setStep("location");
        break;
      case "location":
        setStep("preferences");
        break;
      case "preferences":
        completeOnboarding();
        break;
      default:
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (step) {
      case "name":
        setStep("role");
        break;
      case "location":
        setStep("name");
        break;
      case "preferences":
        setStep("location");
        break;
      default:
        break;
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      if (!user || !location) return;

      // Create updated user with onboarding data
      const updatedUser: User = {
        ...user,
        name: name.trim(),
        role,
        location,
        address,
        onboardingCompleted: true,
        preferences: {
          foodCategories: selectedCategories,
          maxDistance,
          notificationEnabled: notificationsEnabled,
          categoryPreferences: {},
        },
        reliability: user.reliability || 80, // Default reliability score
      };

      // Save to storage and update context
      const savedUser = saveUser(updatedUser);
      login(savedUser);

      // Set step to complete
      setStep("complete");
      
      toast({
        title: "Onboarding Complete!",
        description: "Your profile has been set up successfully.",
      });
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: "There was a problem completing your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case "role":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Utensils className="h-12 w-12 mx-auto mb-2 text-primary" />
              <h2 className="text-2xl font-bold">Welcome to Food Share Connect</h2>
              <p className="text-muted-foreground">Let's start by selecting your role</p>
            </div>
            
            <Tabs defaultValue={role} onValueChange={(value) => setRole(value as UserRole)} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="business" className="flex gap-2 items-center">
                  <Store className="h-4 w-4" /> Food Business
                </TabsTrigger>
                <TabsTrigger value="charity" className="flex gap-2 items-center">
                  <Building2 className="h-4 w-4" /> Charity/Shelter
                </TabsTrigger>
              </TabsList>
              <TabsContent value="business" className="p-4 mt-4 bg-muted/50 rounded-md">
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Food Business</h4>
                    <p className="text-sm text-muted-foreground">
                      Restaurants, cafes, bakeries, grocery stores with surplus food to share.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="charity" className="p-4 mt-4 bg-muted/50 rounded-md">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
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
        );
      
      case "name":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <UserRound className="h-12 w-12 mx-auto mb-2 text-primary" />
              <h2 className="text-2xl font-bold">What's your name?</h2>
              <p className="text-muted-foreground">
                Tell us what to call you or your organization
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name or Organization</Label>
              <Input
                id="name"
                placeholder={role === "business" ? "Restaurant or Store Name" : "Organization Name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        );
      
      case "location":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-primary" />
              <h2 className="text-2xl font-bold">Set your location</h2>
              <p className="text-muted-foreground">
                {role === "business" 
                  ? "This helps charities find your food donations" 
                  : "This helps you find nearby food donations"}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="relative bg-muted rounded-md p-4 text-center">
                {locationLoading ? (
                  <div className="py-8">
                    <div className="animate-pulse h-4 w-4 bg-primary mx-auto rounded-full"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Getting your location...</p>
                  </div>
                ) : location ? (
                  <div className="py-2">
                    <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Location detected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <div className="py-6">
                    <MapPin className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-40" />
                    <p className="text-sm text-muted-foreground">No location set</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={fetchUserLocation} 
                variant="outline" 
                className="w-full"
                disabled={locationLoading}
              >
                {location ? "Update Location" : "Get Current Location"}
              </Button>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  placeholder="Street address, city, state"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This helps with pickup/delivery instructions
                </p>
              </div>
            </div>
          </div>
        );
      
      case "preferences":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Filter className="h-12 w-12 mx-auto mb-2 text-primary" />
              <h2 className="text-2xl font-bold">Set your preferences</h2>
              <p className="text-muted-foreground">
                {role === "business" 
                  ? "Tell us what types of food you typically share" 
                  : "Tell us what types of food you're looking for"}
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Food Categories */}
              <div className="space-y-3">
                <Label>Food Categories</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["produce", "bakery", "prepared", "dairy", "other"] as FoodCategory[]).map((category) => (
                    <div key={category} className="flex items-start space-x-2">
                      <Checkbox 
                        id={category} 
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={category} className="capitalize">{category}</Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Distance Preference (for charities) */}
              {role === "charity" && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="distance">Maximum Distance</Label>
                    <span className="text-sm text-muted-foreground">{maxDistance} km</span>
                  </div>
                  <Slider
                    id="distance"
                    min={1}
                    max={20}
                    step={1}
                    value={[maxDistance]}
                    onValueChange={(values) => setMaxDistance(values[0])}
                  />
                </div>
              )}
              
              {/* Notifications */}
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="notifications" 
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => setNotificationsEnabled(!!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    {role === "business" 
                      ? "Get notified when your food is claimed" 
                      : "Get notified when new food is available nearby"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "complete":
        return (
          <div className="space-y-6 text-center">
            <div className="py-6">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Utensils className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">You're all set!</h2>
            <p className="text-muted-foreground">
              {role === "business" 
                ? "You can now start sharing surplus food with local organizations." 
                : "You can now start finding available food in your area."}
            </p>
            <Button onClick={() => window.location.reload()} className="w-full mt-4">
              Go to Dashboard
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps: OnboardingStep[] = ["role", "name", "location", "preferences"];
    const currentIndex = steps.indexOf(step);
    
    if (step === "complete") return null;
    
    return (
      <div className="flex justify-center my-6">
        {steps.map((s, index) => (
          <React.Fragment key={s}>
            <div 
              className={`w-3 h-3 rounded-full ${
                index <= currentIndex ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
            {index < steps.length - 1 && (
              <div 
                className={`w-10 h-0.5 my-auto mx-1 ${
                  index < currentIndex ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-2">
          <CardHeader className="pb-3">
            {renderStepIndicator()}
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step !== "role" && step !== "complete" && (
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            {step !== "complete" && (
              <Button 
                className={step === "role" ? "w-full" : ""}
                onClick={handleNextStep}
                disabled={isLoading}
              >
                {step === "preferences" ? (
                  isLoading ? "Saving..." : "Complete Setup"
                ) : (
                  <span className="flex items-center">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingProcess;
