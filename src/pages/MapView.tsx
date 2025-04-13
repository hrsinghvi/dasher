
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Check, Filter, MapPin, Search, X, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/contexts/UserContext";
import { calculateDistance } from "@/utils/geo";
import { getFoodPosts } from "@/utils/storage";
import { FoodPost, FoodCategory } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FoodPostCard from "@/components/food/FoodPostCard";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// For Google Maps
interface GoogleMapProps {
  posts: FoodPost[];
  userLocation: { lat: number; lng: number };
  onPostClick: (post: FoodPost) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ posts, userLocation, onPostClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  const initializeMap = () => {
    if (!mapRef.current || !apiKey) return;
    
    try {
      // Create script element to load Google Maps API
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        try {
          // Create the map
          const map = new google.maps.Map(mapRef.current!, {
            center: userLocation,
            zoom: 12,
            styles: [
              {
                "featureType": "poi",
                "elementType": "labels",
                "stylers": [{ "visibility": "off" }]
              }
            ]
          });
          
          setMapInstance(map);
          
          // Add user marker
          new google.maps.Marker({
            position: userLocation,
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#38a169",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff"
            },
            title: "Your location"
          });
          
          // Add markers for posts
          const newMarkers = posts.map(post => {
            const marker = new google.maps.Marker({
              position: post.location,
              map,
              title: post.foodName,
              animation: google.maps.Animation.DROP
            });
            
            // Add click event to marker
            marker.addListener("click", () => {
              onPostClick(post);
            });
            
            return marker;
          });
          
          setMarkers(newMarkers);
          setMapLoaded(true);
          setMapError(null);
          
          // Hide API key input after successful load
          setShowApiKeyInput(false);
          localStorage.setItem("google_maps_api_key", apiKey);
        } catch (err) {
          console.error("Error initializing map:", err);
          setMapError("There was an error initializing the map. Please check your API key.");
        }
      };
      
      script.onerror = () => {
        setMapError("Failed to load Google Maps. Please check your API key and internet connection.");
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error("Error loading Google Maps:", error);
      setMapError("There was an error loading Google Maps.");
    }
  };

  useEffect(() => {
    // Check if API key is in localStorage
    const savedApiKey = localStorage.getItem("google_maps_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
    }
  }, []);

  useEffect(() => {
    if (apiKey && !mapLoaded && !mapError) {
      initializeMap();
    }
  }, [apiKey, mapLoaded, posts, userLocation]);

  // Update markers when posts change
  useEffect(() => {
    if (mapInstance && mapLoaded) {
      // Clear old markers
      markers.forEach(marker => marker.setMap(null));
      
      // Add new markers
      const newMarkers = posts.map(post => {
        const marker = new google.maps.Marker({
          position: post.location,
          map: mapInstance,
          title: post.foodName,
          animation: google.maps.Animation.DROP
        });
        
        // Add click event to marker
        marker.addListener("click", () => {
          onPostClick(post);
        });
        
        return marker;
      });
      
      setMarkers(newMarkers);
    }
  }, [posts, mapInstance, mapLoaded]);

  return (
    <div className="relative w-full h-[60vh] rounded-lg overflow-hidden border">
      {showApiKeyInput ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-muted/50">
          <div className="max-w-md w-full space-y-4 bg-card p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium">Google Maps API Key Required</h3>
            <p className="text-sm text-muted-foreground">
              To use the interactive map, please enter your Google Maps API key.
            </p>
            <Input 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Google Maps API Key"
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              <p>You can get an API key from the Google Cloud Console.</p>
              <p>Make sure to enable the Maps JavaScript API.</p>
            </div>
            <Button onClick={initializeMap} className="w-full">
              Load Map
            </Button>
          </div>
        </div>
      ) : mapError ? (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-muted/50">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Map</AlertTitle>
            <AlertDescription>{mapError}</AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setShowApiKeyInput(true)}
            >
              Update API Key
            </Button>
          </Alert>
        </div>
      ) : !mapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">Loading map...</div>
        </div>
      ) : null}
      <div ref={mapRef} className="w-full h-full"></div>
    </div>
  );
};

const MapView: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<FoodPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxDistance, setMaxDistance] = useState(10); // 10km default
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState(0);
  const [selectedPost, setSelectedPost] = useState<FoodPost | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Get all food posts
    const allPosts = getFoodPosts()
      .filter(post => 
        !post.claimed && 
        new Date(post.expiresAt) > new Date() &&
        (user.role === "charity" || post.businessId !== user.id) // Hide own posts for businesses
      )
      .map(post => ({
        ...post,
        distance: calculateDistance(user.location, post.location)
      }))
      .sort((a, b) => a.distance! - b.distance!);
      
    setPosts(allPosts);
  }, [user, refreshKey]);

  useEffect(() => {
    // Apply filters
    let filtered = posts;

    // Filter by distance
    filtered = filtered.filter(post => post.distance! <= maxDistance);

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.foodName.toLowerCase().includes(term) ||
        post.businessName.toLowerCase().includes(term) ||
        (post.description && post.description.toLowerCase().includes(term))
      );
    }

    // Filter by expiring soon (within 3 hours)
    if (showExpiringSoon) {
      const threeHoursFromNow = new Date();
      threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);
      filtered = filtered.filter(post => 
        new Date(post.expiresAt) <= threeHoursFromNow
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setVisiblePosts(filtered);

    // Count active filters
    let count = 0;
    if (maxDistance < 10) count++;
    if (searchTerm) count++;
    if (showExpiringSoon) count++;
    if (selectedCategory !== "all") count++;
    setActiveFilters(count);
  }, [posts, searchTerm, maxDistance, showExpiringSoon, selectedCategory]);

  const resetFilters = () => {
    setSearchTerm("");
    setMaxDistance(10);
    setShowExpiringSoon(false);
    setSelectedCategory("all");
  };

  const handleClaimFood = (post: FoodPost) => {
    setIsDetailOpen(false);
    toast({
      title: "Food Claimed",
      description: `You've claimed ${post.foodName} from ${post.businessName}.`
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Food Map</h1>
          <p className="text-muted-foreground">
            Explore food available near you
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search food or business..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {activeFilters > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Food Posts</SheetTitle>
                <SheetDescription>
                  Narrow down food posts based on your preferences
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="distance">Maximum Distance: {maxDistance} km</Label>
                  <Slider
                    id="distance"
                    defaultValue={[maxDistance]}
                    max={20}
                    min={1}
                    step={1}
                    onValueChange={(values) => setMaxDistance(values[0])}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label>Food Categories</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      className="h-9"
                      onClick={() => setSelectedCategory("all")}
                    >
                      All
                    </Button>
                    {(["produce", "bakery", "prepared", "dairy", "other"] as FoodCategory[]).map(
                      (category) => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category ? "default" : "outline"
                          }
                          className="h-9 capitalize"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="expiring">Expiring Soon</Label>
                    <p className="text-sm text-muted-foreground">
                      Food expiring within 3 hours
                    </p>
                  </div>
                  <Switch
                    id="expiring"
                    checked={showExpiringSoon}
                    onCheckedChange={setShowExpiringSoon}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={() => {
                      // Apply filters
                      setRefreshKey(prevKey => prevKey + 1);
                    }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Food Near You</CardTitle>
              <CardDescription>
                {visiblePosts.length} {visiblePosts.length === 1 ? 'item' : 'items'} within {maxDistance}km
              </CardDescription>
            </div>
            
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={resetFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <GoogleMap 
            posts={visiblePosts} 
            userLocation={user.location}
            onPostClick={(post) => {
              setSelectedPost(post);
              setIsDetailOpen(true);
            }}
          />
          
          {/* List view of available food */}
          <div className="mt-6 space-y-4">
            <h3 className="font-medium">Available Food</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visiblePosts.length === 0 ? (
                <div className="col-span-full py-4 text-center text-muted-foreground">
                  No food available with current filters
                </div>
              ) : (
                visiblePosts.slice(0, 4).map(post => (
                  <FoodPostCard 
                    key={post.id} 
                    post={post} 
                    compact
                    onView={() => {
                      setSelectedPost(post);
                      setIsDetailOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Post Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Food Details</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              <FoodPostCard 
                post={selectedPost} 
                onClaim={() => handleClaimFood(selectedPost)}
              />
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
                
                {user.role === "charity" && !selectedPost.claimed && new Date(selectedPost.expiresAt) > new Date() && (
                  <Button onClick={() => handleClaimFood(selectedPost)}>
                    Claim Food
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapView;
