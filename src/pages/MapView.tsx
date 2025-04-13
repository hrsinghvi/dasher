
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodPost } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { MapPin, List, MapIcon } from "lucide-react";
import { calculateDistance } from "@/utils/geo";
import { getFoodPosts } from "@/utils/storage";
import FoodPostCard from "@/components/food/FoodPostCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveFoodPost } from "@/utils/storage";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "@/components/ui/use-toast";
import GoogleMap from "@/components/map/GoogleMap";

const MapView: React.FC = () => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<FoodPost | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mapMode, setMapMode] = useState<"map" | "list">("map");
  
  useEffect(() => {
    // Load food posts
    const loadPosts = () => {
      setLoading(true);
      const allPosts = getFoodPosts();
      
      // Filter posts based on user role and preferences
      let filteredPosts: FoodPost[] = [];
      
      if (user) {
        if (user.role === "charity") {
          // For charities, show only unclaimed posts within their preferred distance and categories
          const maxDistance = user.preferences?.maxDistance || 25; // Default 25km
          const preferredCategories = user.preferences?.foodCategories || [];
          
          filteredPosts = allPosts.filter(post => {
            // Skip claimed posts
            if (post.claimed) return false;
            
            // Skip expired posts
            if (new Date(post.expiresAt) < new Date()) return false;
            
            // If charity has category preferences and this post doesn't match, skip
            if (preferredCategories.length > 0 && !preferredCategories.includes(post.category)) {
              return false;
            }
            
            // Calculate actual distance using the distance calculation function
            const distance = calculateDistance(user.location, post.location);
            
            // Store distance on the post for sorting/display
            post.distance = distance;
            
            // Filter by maximum distance
            return distance <= maxDistance;
          });
        } else {
          // For businesses, show all posts with distances
          filteredPosts = allPosts.map(post => {
            post.distance = calculateDistance(user.location, post.location);
            return post;
          });
        }
      }
      
      // Sort by distance
      filteredPosts.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setPosts(filteredPosts);
      setLoading(false);
    };
    
    loadPosts();
    
    // Refresh posts every minute
    const interval = setInterval(loadPosts, 60000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  const handlePostClick = (post: FoodPost) => {
    setSelectedPost(post);
    setIsDetailOpen(true);
  };

  const handleClaimFood = (post: FoodPost) => {
    // Update the post to mark it as claimed
    const updatedPost = {
      ...post,
      claimed: true,
      claimedBy: user?.id
    };
    
    saveFoodPost(updatedPost);
    
    // Notify the business
    addNotification({
      userId: post.businessId,
      title: "Food claimed",
      message: `${user?.name} has claimed your "${post.foodName}" listing.`,
      type: "claim",
      relatedPostId: post.id
    });
    
    // Notify the charity
    addNotification({
      userId: user?.id || "",
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
    
    setIsDetailOpen(false);
    setSelectedPost(null);
    
    // Update the posts list
    const updatedPosts = posts.map(p => 
      p.id === post.id ? updatedPost : p
    ).filter(p => user?.role === "business" || !p.claimed);
    
    setPosts(updatedPosts);
  };
  
  if (!user) return null;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Map View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Food Near You</h2>
            <div className="flex gap-2">
              <Button
                variant={mapMode === "map" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setMapMode("map")}
                className="flex gap-1 items-center"
              >
                <MapIcon className="h-4 w-4" />
                Map
              </Button>
              <Button
                variant={mapMode === "list" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setMapMode("list")}
                className="flex gap-1 items-center"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-pulse">Loading map data...</div>
            </div>
          ) : (
            mapMode === "map" ? (
              <GoogleMap 
                posts={posts} 
                onSelectPost={handlePostClick} 
              />
            ) : (
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <MapPin className="h-8 w-8 mb-2 opacity-40" />
                    <p>No food posts available nearby</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} onClick={() => handlePostClick(post)}>
                      <FoodPostCard post={post} compact />
                    </div>
                  ))
                )}
              </div>
            )
          )}
          
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
