import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Package, ShoppingBag, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoodPostCard from "@/components/food/FoodPostCard";
import { FoodPost } from "@/types";
import { getFoodPosts, getFoodPostsByBusiness } from "@/utils/storage";
import { formatDistanceToNow } from "date-fns";

const Activity: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    let relevantPosts: FoodPost[] = [];

    if (user.role === "business") {
      // For businesses, show all their posts
      relevantPosts = getFoodPostsByBusiness(user.id).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } else {
      // For charities, show claimed and available posts
      relevantPosts = getFoodPosts()
        .filter(post => {
          const now = new Date();
          const expiryDate = new Date(post.expiresAt);
          return (post.claimed && post.claimedBy === user.id) || (!post.claimed && expiryDate > now);
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    setPosts(relevantPosts);
  }, [user, refreshKey]);

  // Filter posts by time period
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const groupPostsByDate = () => {
    const groups = [
      {
        title: "Today",
        posts: posts.filter(post => new Date(post.timestamp) >= today)
      },
      {
        title: "Yesterday",
        posts: posts.filter(post => {
          const date = new Date(post.timestamp);
          return date >= yesterday && date < today;
        })
      },
      {
        title: "Earlier This Week",
        posts: posts.filter(post => {
          const date = new Date(post.timestamp);
          return date >= weekAgo && date < yesterday;
        })
      },
      {
        title: "Earlier This Month",
        posts: posts.filter(post => {
          const date = new Date(post.timestamp);
          return date >= monthAgo && date < weekAgo;
        })
      }
    ].filter(group => group.posts.length > 0);

    return groups;
  };

  const renderStatusSummary = () => {
    const availableCount = posts.filter(post => !post.claimed && new Date(post.expiresAt) > new Date()).length;
    const claimedCount = posts.filter(post => post.claimed).length;
    const expiredCount = posts.filter(post => new Date(post.expiresAt) <= new Date()).length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Available</p>
                <p className="text-2xl font-bold">{availableCount}</p>
              </div>
              <div className="p-2 rounded-full bg-green-500/10">
                <Package className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Claimed</p>
                <p className="text-2xl font-bold">{claimedCount}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-500/10">
                <Utensils className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Expired</p>
                <p className="text-2xl font-bold">{expiredCount}</p>
              </div>
              <div className="p-2 rounded-full bg-red-500/10">
                <Clock className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTimeline = () => {
    const groups = groupPostsByDate();

    return (
      <div className="space-y-8">
        {groups.map((group, index) => (
          <div key={index} className="space-y-4">
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
              <h3 className="font-medium">{group.title}</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {group.posts.map(post => (
                <FoodPostCard key={post.id} post={post} compact />
              ))}
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-3" />
            <p className="text-muted-foreground">No activity to show</p>
          </div>
        )}
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-muted-foreground">
          {user.role === "business" 
            ? "Track the food you've shared" 
            : "View your claimed food items"}
        </p>
      </div>
      
      {renderStatusSummary()}
      
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            {user.role === "business" 
              ? "All food items you've posted" 
              : "Food items you've claimed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTimeline()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Activity;
