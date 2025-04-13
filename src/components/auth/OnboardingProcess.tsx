
import React, { useState, useEffect } from "react";
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
import { calculateDistance } from "@/utils/geo";

// Load Google Maps API script
const loadGoogleMapsScript = () => {
  const googleMapsApiKey = "AIzaSyBnOkQE4NWJlU1hvwjWl7v_-lPt8s4pj_4"; // This is just a placeholder for demo purposes
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  return new Promise((resolve) => {
    script.onload = resolve;
  });
};

const OnboardingProcess: React.FC = () => {
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>("location");
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
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const foodCategories: { value: FoodCategory; label: string }[] = [
    { value: "produce", label: "Fresh Produce" },
    { value: "bakery", label: "Bakery Items" },
    { value: "prepared", label: "Prepared Foods" },
    { value: "dairy", label: "Dairy Products" },
    { value: "other", label: "Other Items" }
  ];

  // Load Google Maps API on component mount
  useEffect(() => {
    const loadMaps = async () => {
      try {
        await loadGoogleMapsScript();
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    };
    
    loadMaps();
  }, []);

  // Initialize the Google Places Autocomplete when the input is available
  useEffect(() => {
    if (googleMapsLoaded && step === "location" && !allowLocation) {
      const addressInput = document.getElementById("address") as HTMLInputElement;
      if (!addressInput) return;

      const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        types: ["address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          console.error("No geometry available for this place");
          return;
        }

        const lat = place.geometry.location?.lat();
        const lng = place.geometry.location?.lng();
        if (lat && lng) {
          setAddress(place.formatted_address || "");
          // We'll use this location when submitting
        }
      });
    }
  }, [googleMapsLoaded, step, allowLocation]);

  const handleNext = async () => {
    if (step === "location") {
      if (allowLocation) {
        try {
          // Improved geolocation handling
          const position = await getCurrentPosition();
          const { latitude, longitude } = position.coords;
          
          // We already have name and role from signup
          updateUser({
            ...user!,
            location: { lat: latitude, lng: longitude },
            address: "Current Location",
          });
          
          setLocationError(null);
        } catch (error) {
          console.error("Geolocation error:", error);
          setLocationError("Couldn't access your location. Please try again or enter an address.");
          return;
        }
      } else if (!address.trim()) {
        toast({
          title: "Address required",
          description: "Please enter your address or enable location sharing",
          variant: "destructive",
        });
        return;
      } else {
        // For simplicity, we'll use a mock geocoding function
        // In a real app, you would use Google's Geocoding API
        const mockLocation = mockGeocodeAddress(address);
        
        updateUser({
          ...user!,
          address,
          location: mockLocation,
        });
      }
    }

    if (step === "preferences") {
      updateUser({
        ...user!,
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
    if (step === "location") setStep("preferences");
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

  // Mock geocoding function - in a real app, use Google Maps Geocoding API
  const mockGeocodeAddress = (address: string) => {
    // Generate a somewhat realistic location based on the address string
    // This is just for demo purposes
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to generate latitude and longitude in a realistic range
    const lat = 37.7749 + (hash % 10) / 100;
    const lng = -122.4194 + (hash % 20) / 100;
    
    return { lat, lng };
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
            {step === "location" && "Where are you located?"}
            {step === "preferences" && "Set your preferences"}
            {step === "complete" && "All set!"}
          </CardTitle>
          <CardDescription>
            {step === "location" && "This helps us connect you with nearby partners"}
            {step === "preferences" && "These help us match you with relevant food items"}
            {step === "complete" && "You're ready to start using Dasher"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
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
              
              {locationError && (
                <div className="text-red-500 text-sm p-2 rounded bg-red-100 dark:bg-red-900/20">
                  {locationError}
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={allowLocation}
                />
                <div className="text-xs text-muted-foreground">
                  Start typing and select from the dropdown for best results
                </div>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Your location is only shared with partners when necessary</span>
              </div>
            </div>
          )}
          
          {step === "preferences" && (
            <div className="grid gap-6">
              {user?.role === "charity" && (
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
                  onCheckedChange={(checked: boolean) => setNotificationEnabled(checked)}
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
          {step !== "location" && step !== "complete" && (
            <Button 
              variant="outline" 
              onClick={() => {
                if (step === "preferences") setStep("location");
              }}
            >
              Back
            </Button>
          )}
          
          {step !== "complete" ? (
            <Button 
              className={step === "location" ? "w-full" : ""} 
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
