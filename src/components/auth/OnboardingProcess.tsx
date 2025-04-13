
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { FoodCategory, OnboardingStep, UserRole } from "@/types";
import { Building2, Building, MapPin } from "lucide-react";

const OnboardingProcess: React.FC = () => {
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(user?.role || null);
  const [name, setName] = useState(user?.name || "");
  const [allowLocation, setAllowLocation] = useState(false);
  const [address, setAddress] = useState(user?.address || "");
  const [maxDistance, setMaxDistance] = useState(user?.preferences?.maxDistance || 10);
  const [notificationEnabled, setNotificationEnabled] = useState(user?.preferences?.notificationEnabled !== false);
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>(
    user?.preferences?.foodCategories || []
  );
  const [categoryRatings, setCategoryRatings] = useState<Record<FoodCategory, number>>(
    user?.preferences?.categoryPreferences || {
      produce: 3,
      bakery: 3,
      prepared: 3,
      dairy: 3,
      other: 3
    }
  );
  
  const foodCategories: { value: FoodCategory; label: string }[] = [
    { value: "produce", label: "Fresh Produce" },
    { value: "bakery", label: "Bakery Items" },
    { value: "prepared", label: "Prepared Foods" },
    { value: "dairy", label: "Dairy Products" },
    { value: "other", label: "Other Items" }
  ];

  const handleNext = async () => {
    if (step === "role" && !selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose whether you're a food business or charity",
        variant: "destructive",
      });
      return;
    }

    if (step === "name" && !name.trim()) {
      toast({
        title: "Please enter a name",
        description: "Provide a name for your organization",
        variant: "destructive",
      });
      return;
    }

    if (step === "location") {
      if (allowLocation) {
        try {
          // Fixed geolocation handling with timeout and proper error management
          const position = await getCurrentPosition();
          const { latitude, longitude } = position.coords;
          
          updateUser({
            ...user!,
            role: selectedRole as UserRole,
            name,
            location: { lat: latitude, lng: longitude },
            address: address,
          });
        } catch (error) {
          console.error("Geolocation error:", error);
          toast({
            title: "Location error",
            description: "Couldn't access your location. Please try again or enter an address.",
            variant: "destructive",
          });
          return;
        }
      } else if (!address.trim()) {
        toast({
          title: "Address required",
          description: "Please enter your address if you don't want to share your location",
          variant: "destructive",
        });
        return;
      } else {
        // Mock location based on address
        // In a real app, you would use geocoding here
        updateUser({
          ...user!,
          role: selectedRole as UserRole,
          name,
          address,
          location: { lat: 40.7128, lng: -74.0060 }, // Example coordinates (NYC)
        });
      }
    }

    if (step === "preferences") {
      updateUser({
        ...user!,
        role: selectedRole as UserRole,
        name,
        preferences: {
          ...user?.preferences,
          foodCategories: selectedCategories,
          maxDistance,
          notificationEnabled,
          categoryPreferences: categoryRatings
        },
        onboardingCompleted: true
      });
      
      setStep("complete");
      return;
    }

    // Move to next step
    if (step === "role") setStep("name");
    else if (step === "name") setStep("location");
    else if (step === "location") setStep("preferences");
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        // Add timeout to handle slow geolocation responses
        const timeoutId = setTimeout(() => {
          reject(new Error("Geolocation request timed out"));
        }, 10000);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            resolve(position);
          },
          (error) => {
            clearTimeout(timeoutId);
            console.error("Geolocation error:", error.message);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }
    });
  };

  const handleCategoryRatingChange = (category: FoodCategory, value: number[]) => {
    setCategoryRatings(prev => ({
      ...prev,
      [category]: value[0]
    }));
  };

  const handleCategoryToggle = (category: FoodCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>
            {step === "role" && "Welcome to Dasher"}
            {step === "name" && "What's your name?"}
            {step === "location" && "Where are you located?"}
            {step === "preferences" && "Set your preferences"}
            {step === "complete" && "All set!"}
          </CardTitle>
          <CardDescription>
            {step === "role" && "Let's start by setting up your account"}
            {step === "name" && "What should we call your organization?"}
            {step === "location" && "This helps us connect you with nearby partners"}
            {step === "preferences" && "These help us match you with relevant food items"}
            {step === "complete" && "You're ready to start using Dasher"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === "role" && (
            <div className="grid gap-6">
              <Label>I am a:</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-colors ${
                    selectedRole === "business" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole("business")}
                >
                  <Building className="h-10 w-10 mb-2 mx-auto" />
                  <p className="font-medium">Food Business</p>
                  <p className="text-sm text-muted-foreground">Restaurant, cafe, grocery...</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-colors ${
                    selectedRole === "charity" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole("charity")}
                >
                  <Building2 className="h-10 w-10 mb-2 mx-auto" />
                  <p className="font-medium">Charity</p>
                  <p className="text-sm text-muted-foreground">Food bank, shelter, community fridge...</p>
                </div>
              </div>
            </div>
          )}
          
          {step === "name" && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your organization name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {step === "location" && (
            <div className="grid gap-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="location" 
                  checked={allowLocation}
                  onCheckedChange={setAllowLocation}
                />
                <Label htmlFor="location">Use my current location</Label>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={allowLocation}
                />
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Your location is only shared with partners when necessary</span>
              </div>
            </div>
          )}
          
          {step === "preferences" && (
            <div className="grid gap-6">
              {selectedRole === "charity" && (
                <>
                  <div className="grid gap-2">
                    <Label>Food Categories You Accept</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {foodCategories.map(category => (
                        <div key={category.value} className="flex items-center space-x-2">
                          <Switch 
                            id={`category-${category.value}`}
                            checked={selectedCategories.includes(category.value)}
                            onCheckedChange={() => handleCategoryToggle(category.value)}
                          />
                          <Label htmlFor={`category-${category.value}`}>{category.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <Label>Category Preferences (1-5)</Label>
                    {selectedCategories.map(category => (
                      <div key={`rating-${category}`} className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm">
                            {foodCategories.find(c => c.value === category)?.label}
                          </span>
                          <span className="text-sm font-medium">{categoryRatings[category]}</span>
                        </div>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[categoryRatings[category]]}
                          onValueChange={(value) => handleCategoryRatingChange(category, value)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        id="maxDistance"
                        min={1}
                        max={25}
                        step={1}
                        value={[maxDistance]}
                        onValueChange={(value) => setMaxDistance(value[0])}
                        className="flex-1"
                      />
                      <span className="font-medium">{maxDistance} km</span>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="notifications" 
                  checked={notificationEnabled}
                  onCheckedChange={setNotificationEnabled}
                />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </div>
          )}
          
          {step === "complete" && (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h3 className="text-lg font-medium">Onboarding Complete!</h3>
              <p className="text-muted-foreground mt-2">You're all set to start using Dasher</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step !== "role" && step !== "complete" && (
            <Button 
              variant="outline" 
              onClick={() => {
                if (step === "name") setStep("role");
                else if (step === "location") setStep("name");
                else if (step === "preferences") setStep("location");
              }}
            >
              Back
            </Button>
          )}
          
          {step !== "complete" ? (
            <Button 
              className={step === "role" ? "w-full" : ""} 
              onClick={handleNext}
            >
              {step === "preferences" ? "Complete Setup" : "Continue"}
            </Button>
          ) : (
            <Button className="w-full" onClick={() => window.location.reload()}>
              Get Started
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingProcess;
