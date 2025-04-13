
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { FoodPost } from "@/types";
import { calculateDistance } from "@/utils/geo";
import FoodPostCard from "@/components/food/FoodPostCard";
import { Card } from "@/components/ui/card";
import { MapPin, Search, List, MapIcon, Store, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { saveFoodPost } from "@/utils/storage";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "@/components/ui/use-toast";

interface SimpleMapViewProps {
  posts: FoodPost[];
  onOpenDetails?: (post: FoodPost) => void;
}

const SimpleMapView: React.FC<SimpleMapViewProps> = ({ posts, onOpenDetails }) => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [selectedPost, setSelectedPost] = useState<FoodPost | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mapMode, setMapMode] = useState<"map" | "list">("map");
  
  if (!user) return null;

  const postsWithDistance = posts.map(post => ({
    ...post,
    distance: calculateDistance(user.location, post.location)
  })).sort((a, b) => a.distance - b.distance);

  const handlePostClick = (post: FoodPost) => {
    setSelectedPost(post);
    setIsDetailOpen(true);
  };

  const handleClaimFood = (post: FoodPost) => {
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
    
    setIsDetailOpen(false);
    setSelectedPost(null);
  };
  
  // For simplicity, we're just showing a representation of the map
  // In a real app, we would integrate with Google Maps, Mapbox, or Leaflet
  
  return (
    <div className="h-full">
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
      
      {mapMode === "map" ? (
        <Card className="relative w-full aspect-[4/3] overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20">
            {/* Simplified map representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Map view would display here</p>
                <p className="text-sm">Using user location as center point</p>
              </div>
            </div>
            
            {/* User location pin */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="map-marker-pulse">
                <div className="flex items-center justify-center h-full">
                  {user.role === "business" ? (
                    <Store className="h-3 w-3 text-white" />
                  ) : (
                    <Building2 className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
              <p className="text-xs font-medium mt-1 text-center">You</p>
            </div>
            
            {/* Food post pins */}
            {postsWithDistance.map((post, index) => (
              <div 
                key={post.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  // Position pins in a circular pattern around the user
                  left: `${50 + 20 * Math.cos(index * (2 * Math.PI / posts.length))}%`,
                  top: `${50 + 20 * Math.sin(index * (2 * Math.PI / posts.length))}%`,
                }}
                onClick={() => handlePostClick(post)}
              >
                <div className="map-marker bg-food-green">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <p className="text-xs font-medium mt-1 text-center truncate max-w-20">
                  {post.foodName}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  {post.distance.toFixed(1)} km
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {postsWithDistance.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <Search className="h-8 w-8 mb-2 opacity-40" />
              <p>No food posts available nearby</p>
            </div>
          ) : (
            postsWithDistance.map(post => (
              <div key={post.id} onClick={() => handlePostClick(post)}>
                <FoodPostCard post={post} compact />
              </div>
            ))
          )}
        </div>
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
    </div>
  );
};

export default SimpleMapView;
