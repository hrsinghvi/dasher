
import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, X, MapPin, Filter } from "lucide-react";
import FoodPostCard from "@/components/food/FoodPostCard";
import { FoodPost } from "@/types";
import { getFoodPosts, saveFoodPost } from "@/utils/storage";
import { calculateDistance } from "@/utils/geo";
import { useNotifications } from "@/contexts/NotificationContext";
import { Badge } from "@/components/ui/badge";
import { differenceInHours } from "date-fns";
import { toast } from "@/components/ui/use-toast";

const AvailableFood: React.FC = () => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<FoodPost | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "charity") return;

    // Get all available food posts
    const availablePosts = getFoodPosts()
      .filter(post => 
        !post.claimed && 
        new Date(post.expiresAt) > new Date()
      )
      .map(post => ({
        ...post,
        distance: calculateDistance(user.location, post.location)
      }))
      .sort((a, b) => a.distance - b.distance);
      
    setPosts(availablePosts);
  }, [user, refreshKey]);

  const filteredPosts = posts.filter(post => {
    if (searchTerm === "") return true;
    
    const term = searchTerm.toLowerCase();
    return (
      post.foodName.toLowerCase().includes(term) ||
      post.businessName.toLowerCase().includes(term) ||
      (post.description && post.description.toLowerCase().includes(term))
    );
  });

  // Filter posts for each tab
  const nearbyPosts = filteredPosts.filter(post => post.distance <= 5);
  const expiringSoonPosts = filteredPosts.filter(post => differenceInHours(new Date(post.expiresAt), new Date()) <= 3);
  const allPosts = filteredPosts;

  const handleClaimFood = (post: FoodPost) => {
    if (!user) return;
    
    // Update the post to mark it as claimed
    const updatedPost = {
      ...post,
      claimed: true,
      claimedBy: user.id
    };
    
    saveFoodPost(updatedPost);
    
    // Notify the business
    addNotification({
      userId: post.businessId,
      title: "Food claimed",
      message: `${user.name} has claimed your "${post.foodName}" listing.`,
      type: "claim",
      relatedPostId: post.id
    });
    
    // Notify the charity
    addNotification({
      userId: user.id,
      title: "Food claimed successfully",
      message: `You've claimed "${post.foodName}" from ${post.businessName}.`,
      type: "claim",
      relatedPostId: post.id
    });
    
    // Show success toast
    toast({
      title: "Food claimed successfully",
      description: "The business has been notified of your claim.",
    });
    
    setSelectedPost(null);
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (!user || user.role !== "charity") {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only charity accounts can access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Available Food</h1>
          <p className="text-muted-foreground">
            Find and claim food available for pickup
          </p>
        </div>
        
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
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all" className="relative">
            All
            {allPosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {allPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="nearby" className="relative">
            Nearby
            {nearbyPosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {nearbyPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="expiring" className="relative">
            Expiring Soon
            {expiringSoonPosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {expiringSoonPosts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {allPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No food available at the moment</p>
                <Button variant="outline" onClick={() => setRefreshKey(prevKey => prevKey + 1)}>
                  Refresh
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPosts.map(post => (
                <FoodPostCard 
                  key={post.id} 
                  post={post} 
                  onView={() => setSelectedPost(post)} 
                  onClaim={() => handleClaimFood(post)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="nearby">
          {nearbyPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No food available within 5km</p>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setRefreshKey(prevKey => prevKey + 1)}
                >
                  <MapPin className="h-4 w-4" />
                  Check Map View
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyPosts.map(post => (
                <FoodPostCard 
                  key={post.id} 
                  post={post} 
                  onView={() => setSelectedPost(post)} 
                  onClaim={() => handleClaimFood(post)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="expiring">
          {expiringSoonPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">No food expiring soon</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expiringSoonPosts.map(post => (
                <FoodPostCard 
                  key={post.id} 
                  post={post} 
                  onView={() => setSelectedPost(post)} 
                  onClaim={() => handleClaimFood(post)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-md">
          {selectedPost && (
            <div className="space-y-4">
              <FoodPostCard 
                post={selectedPost} 
                onClaim={() => handleClaimFood(selectedPost)}
              />
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedPost(null)}
                >
                  Close
                </Button>
                
                {!selectedPost.claimed && new Date(selectedPost.expiresAt) > new Date() && (
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

export default AvailableFood;
