import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Store, 
  Building2, 
  ShoppingBag, 
  Clock, 
  CalendarRange,
  MapPin,
  ArrowRight
} from "lucide-react";
import FoodPostForm from "@/components/food/FoodPostForm";
import FoodPostCard from "@/components/food/FoodPostCard";
import LeafletMap from "@/components/map/LeafletMap";
import SimpleMapView from "@/components/map/SimpleMapView";
import { FoodPost } from "@/types";
import { getFoodPosts, getFoodPostsByBusiness, deleteFoodPost } from "@/utils/storage";
import { calculateDistance } from "@/utils/geo";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [myPosts, setMyPosts] = useState<FoodPost[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Get all available food posts
    const allPosts = getFoodPosts();
    const availablePosts = allPosts.filter(post => {
      const now = new Date();
      const expiryDate = new Date(post.expiresAt);
      return !post.claimed && expiryDate > now;
    });
    setPosts(availablePosts);

    // If user is a business, get their posts
    if (user.role === "business") {
      const businessPosts = getFoodPostsByBusiness(user.id);
      setMyPosts(businessPosts);
    } else if (user.role === "charity") {
      // For charities, get their claimed posts
      const claimedPosts = allPosts.filter(post => post.claimed && post.claimedBy === user.id);
      setMyPosts(claimedPosts);
    }
  }, [user, refreshKey]);

  const handleDeletePost = (postId: string) => {
    deleteFoodPost(postId);
    setRefreshKey(prevKey => prevKey + 1);
    
    toast({
      title: "Post Deleted",
      description: "Your food listing has been removed successfully.",
    });
  };

  const handlePostSuccess = () => {
    setIsPostDialogOpen(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  const getStatusCount = (type: 'Available' | 'Reserved' | 'Completed'): number => {
    return posts.filter(post => {
      const now = new Date();
      const expiryDate = new Date(post.expiresAt);
      switch (type) {
        case 'Available':
          return !post.claimed && expiryDate > now;
        case 'Reserved':
          return post.claimed;
        case 'Completed':
          return expiryDate <= now;
      }
    }).length;
  };

  const getNearbyLocationsCount = (): number => {
    if (!user) return 0;
    const maxDistance = user.preferences?.maxDistance || 10; // Default 10km radius
    
    return posts.filter(post => {
      if (user.role === "business" && post.businessId === user.id) return false;
      const distance = calculateDistance(user.location, post.location);
      return distance <= maxDistance;
    }).length;
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <section>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
                <p className="text-muted-foreground mt-1">
                  {user.role === "business" 
                    ? "Share your surplus food with local organizations"
                    : "Find and claim available food in your area"}
                </p>
              </div>
              
              {user.role === "business" && (
                <Button 
                  onClick={() => setIsPostDialogOpen(true)}
                  className="md:w-auto w-full gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
                >
                  <Plus className="h-4 w-4" /> 
                  Post Food
                </Button>
              )}

              {user.role === "charity" && (
                <Button 
                  onClick={() => navigate("/map")}
                  className="md:w-auto w-full gap-2"
                >
                  <MapPin className="h-4 w-4" /> 
                  Find Food
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overview Cards */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="card-hover">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {user.role === "business" ? "My Food Posts" : "Available Food"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-2xl font-bold">
                    {user.role === "business" ? myPosts.length : posts.length}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
                  navigate(user.role === "business" ? "/my-posts" : "/available");
                }}>
                  View <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {user.role === "business" ? "Active Listings" : "Recently Claimed"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-food-green/10">
                    <Clock className="h-4 w-4 text-food-green" />
                  </div>
                  <span className="text-2xl font-bold">
                    {user.role === "business" 
                      ? myPosts.filter(p => new Date(p.expiresAt) > new Date()).length
                      : posts.filter(p => p.claimed && p.claimedBy === user.id).length}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/activity")}>
                  View <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nearby Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-food-blue/10">
                    <MapPin className="h-4 w-4 text-food-blue" />
                  </div>
                  <span className="text-2xl font-bold">
                    {user.role === "business" 
                      ? posts.length // For businesses, show number of nearby charities (in real app)
                      : posts.filter(p => p.businessId !== user.id).length} 
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/map")}>
                  View <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Food Map and Listings */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>{user.role === "business" ? "Charities Near You" : "Available Food Near You"}</span>
                <Button variant="outline" size="sm" onClick={() => navigate("/map")}>View Map</Button>
              </CardTitle>
              <CardDescription>
                {user.role === "business" 
                  ? "Organizations that can receive your food donations"
                  : "Food available for pickup in your area"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[400px] w-full">
                <LeafletMap 
                  posts={posts.filter(post => post.businessId !== user.id)}
                  className="h-full w-full rounded-lg"
                  filterStatus={["Available"]}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          {user.role === "business" && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle>My Recent Posts</CardTitle>
                <CardDescription>
                  Food items you've recently shared
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {myPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground">You haven't posted any food yet</p>
                    <Button 
                      className="mt-4 bg-green-500 hover:bg-green-600"
                      onClick={() => setIsPostDialogOpen(true)}
                    >
                      Post Food Now
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myPosts.slice(0, 4).map(post => (
                      <FoodPostCard 
                        key={post.id} 
                        post={post} 
                        onDelete={() => handleDeletePost(post.id)}
                        compact 
                      />
                    ))}
                  </div>
                )}
                
                {myPosts.length > 0 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/my-posts")}
                    >
                      View All My Posts
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Available Food */}
          {user.role === "charity" && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle>Food Available Now</CardTitle>
                <CardDescription>
                  Food items ready for pickup
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground">No food posts available at the moment</p>
                    <Button 
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/map")}
                    >
                      Check the Map
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.slice(0, 4).map(post => (
                      <FoodPostCard 
                        key={post.id} 
                        post={post} 
                        onView={() => navigate(`/food/${post.id}`)}
                        compact 
                      />
                    ))}
                  </div>
                )}
                
                {posts.length > 0 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/available")}
                    >
                      View All Available Food
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Column */}
        <div className="md:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {user.role === "business" ? (
                  <>
                    <Button 
                      className="w-full justify-start gap-2 bg-green-500 hover:bg-green-600" 
                      onClick={() => setIsPostDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" /> Post New Food
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate("/my-posts")}
                    >
                      <ShoppingBag className="h-4 w-4" /> View My Posts
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate("/activity")}
                    >
                      <Clock className="h-4 w-4" /> View Activity
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate("/map")}
                    >
                      <MapPin className="h-4 w-4" /> Find Nearby Food
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate("/available")}
                    >
                      <ShoppingBag className="h-4 w-4" /> Browse Available
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate("/activity")}
                    >
                      <Clock className="h-4 w-4" /> View My Claims
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Tips and Info */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {user.role === "business" ? (
                  <>
                    <div className="flex gap-2">
                      <CalendarRange className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">Post food well before it expires to allow time for pickup</p>
                    </div>
                    <div className="flex gap-2">
                      <Store className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">Be specific about quantity to help organizations plan pickups</p>
                    </div>
                    <div className="flex gap-2">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">Add a generous window for pickup to reduce pressure</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">Check the map regularly for new food postings nearby</p>
                    </div>
                    <div className="flex gap-2">
                      <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">Claim food promptly to ensure availability for pickup</p>
                    </div>
                    <div className="flex gap-2">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">Prioritize soon-to-expire items to prevent food waste</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Post Food Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post Surplus Food</DialogTitle>
          </DialogHeader>
          <FoodPostForm onSuccess={handlePostSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
