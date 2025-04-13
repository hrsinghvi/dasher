
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodPost } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { MapPin, List } from "lucide-react";
import SimpleMapView from "@/components/map/SimpleMapView";
import { getFoodPosts } from "@/utils/storage";

const MapView: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load food posts
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
          
          // Calculate distance using the browser's distance calculation function
          // In a real app, use a proper distance calculation like Haversine formula
          // For simplicity, we'll use a random distance
          const distance = Math.random() * 30; // Mock distance calculation
          
          // Store distance on the post for sorting
          post.distance = distance;
          
          // Filter by maximum distance
          return distance <= maxDistance;
        });
      } else {
        // For businesses, show all posts
        filteredPosts = allPosts;
      }
    }
    
    setPosts(filteredPosts);
    setLoading(false);
  }, [user]);
  
  if (!user) return null;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Map View</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-pulse">Loading map data...</div>
            </div>
          ) : (
            <SimpleMapView 
              posts={posts}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
