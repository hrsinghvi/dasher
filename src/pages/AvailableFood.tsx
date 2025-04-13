
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, MapPin, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";
import { getFoodPosts } from "@/utils/storage";
import { FoodPost, FoodCategory } from "@/types";
import FoodPostCard from "@/components/food/FoodPostCard";
import { calculateDistance } from "@/utils/geo";

const AvailableFood: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FoodPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "expiry" | "recent">("distance");
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "all">("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Get all food posts
    const allPosts = getFoodPosts()
      .filter(post => !post.claimed && new Date(post.expiresAt) > new Date())
      .map(post => ({
        ...post,
        distance: calculateDistance(user.location, post.location)
      }));
      
    setPosts(allPosts);
  }, [user, refreshTrigger]);

  useEffect(() => {
    if (!posts.length) return;

    let filtered = [...posts];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.foodName.toLowerCase().includes(term) ||
        post.businessName.toLowerCase().includes(term) ||
        (post.description && post.description.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case "distance":
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case "expiry":
        filtered.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
        break;
      case "recent":
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, sortBy, selectedCategory]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Available Food</h1>
          <p className="text-muted-foreground">
            Browse surplus food ready for pickup
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search food or business..."
            className="pl-8"
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

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Distance
              </div>
            </SelectItem>
            <SelectItem value="expiry">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Expiring Soon
              </div>
            </SelectItem>
            <SelectItem value="recent">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Recently Added
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Food</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Food Categories</h3>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">No available food found</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <FoodPostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="w-full">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Available Food</CardTitle>
              <CardDescription>
                {filteredPosts.length} items found
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No available food found</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <FoodPostCard key={post.id} post={post} compact />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AvailableFood;
