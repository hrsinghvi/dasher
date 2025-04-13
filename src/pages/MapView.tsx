
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Check, Filter, MapPin, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import SimpleMapView from "@/components/map/SimpleMapView";
import { useUser } from "@/contexts/UserContext";
import { calculateDistance } from "@/utils/geo";
import { getFoodPosts } from "@/utils/storage";
import { FoodPost } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const MapView: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<FoodPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxDistance, setMaxDistance] = useState(10); // 10km default
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState(0);

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
      .sort((a, b) => a.distance - b.distance);
      
    setPosts(allPosts);
  }, [user, refreshKey]);

  useEffect(() => {
    // Apply filters
    let filtered = posts;

    // Filter by distance
    filtered = filtered.filter(post => post.distance <= maxDistance);

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

    setVisiblePosts(filtered);

    // Count active filters
    let count = 0;
    if (maxDistance < 10) count++;
    if (searchTerm) count++;
    if (showExpiringSoon) count++;
    setActiveFilters(count);
  }, [posts, searchTerm, maxDistance, showExpiringSoon]);

  const resetFilters = () => {
    setSearchTerm("");
    setMaxDistance(10);
    setShowExpiringSoon(false);
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
                    max={10}
                    min={1}
                    step={1}
                    onValueChange={(values) => setMaxDistance(values[0])}
                  />
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
          <SimpleMapView posts={visiblePosts} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
