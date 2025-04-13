
import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Package, ShoppingBag, Utensils } from "lucide-react";
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
      // For businesses, show their posts
      relevantPosts = getFoodPostsByBusiness(user.id).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } else {
      // For charities, show claimed posts
      relevantPosts = getFoodPosts()
        .filter(post => post.claimed && post.claimedBy === user.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    setPosts(relevantPosts);
  }, [user, refreshKey]);

  if (!user) return null;

  // Filter posts by time period
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayPosts = posts.filter(post => new Date(post.timestamp) >= today);
  const yesterdayPosts = posts.filter(post => 
    new Date(post.timestamp) >= yesterday && new Date(post.timestamp) < today
  );
  const thisWeekPosts = posts.filter(post => 
    new Date(post.timestamp) >= weekAgo && new Date(post.timestamp) < yesterday
  );
  const olderPosts = posts.filter(post => new Date(post.timestamp) < weekAgo);

  const groupPostsByDate = (posts: FoodPost[]) => {
    const grouped: { [date: string]: FoodPost[] } = {};

    posts.forEach(post => {
      const date = new Date(post.timestamp).toLocaleDateString();
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(post);
    });

    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  const renderPostsByTimePeriod = (postsGroup: FoodPost[]) => {
    if (postsGroup.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Clock className="h-8 w-8 mb-2 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">No activity in this time period</p>
          </CardContent>
        </Card>
      );
    }

    const groupedPosts = groupPostsByDate(postsGroup);

    return (
      <div className="space-y-6">
        {groupedPosts.map(([date, datePosts]) => (
          <div key={date} className="space-y-3">
            <h3 className="font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datePosts.map(post => (
                <FoodPostCard key={post.id} post={post} compact />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

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
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {user.role === "business" ? "Total Posts" : "Total Claims"}
                </p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {user.role === "business" ? "Claims Received" : "Active Pickups"}
                </p>
                <p className="text-2xl font-bold">
                  {user.role === "business" 
                    ? posts.filter(post => post.claimed).length
                    : posts.filter(post => new Date(post.expiresAt) > new Date()).length}
                </p>
              </div>
              <div className="p-2 rounded-full bg-food-green/10">
                <ShoppingBag className="h-5 w-5 text-food-green" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Last Activity
                </p>
                <p className="text-lg font-medium">
                  {posts.length > 0 
                    ? formatDistanceToNow(new Date(posts[0].timestamp), { addSuffix: true })
                    : "No activity yet"}
                </p>
              </div>
              <div className="p-2 rounded-full bg-food-blue/10">
                <Clock className="h-5 w-5 text-food-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="today">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="today" className="relative">
            Today
            {todayPosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {todayPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="yesterday" className="relative">
            Yesterday
            {yesterdayPosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {yesterdayPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="this-week" className="relative">
            This Week
            {thisWeekPosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {thisWeekPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="older" className="relative">
            Older
            {olderPosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {olderPosts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today">
          {renderPostsByTimePeriod(todayPosts)}
        </TabsContent>
        
        <TabsContent value="yesterday">
          {renderPostsByTimePeriod(yesterdayPosts)}
        </TabsContent>
        
        <TabsContent value="this-week">
          {renderPostsByTimePeriod(thisWeekPosts)}
        </TabsContent>
        
        <TabsContent value="older">
          {renderPostsByTimePeriod(olderPosts)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Activity;
