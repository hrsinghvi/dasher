
import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import FoodPostForm from "@/components/food/FoodPostForm";
import FoodPostCard from "@/components/food/FoodPostCard";
import { FoodPost } from "@/types";
import { getFoodPostsByBusiness, deleteFoodPost } from "@/utils/storage";
import { toast } from "@/components/ui/use-toast";

const MyPosts: React.FC = () => {
  const { user } = useUser();
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "business") return;

    // Get business posts
    const businessPosts = getFoodPostsByBusiness(user.id);
    setPosts(businessPosts);
  }, [user, refreshKey]);

  const handleDeletePost = (postId: string) => {
    setDeletePostId(postId);
  };

  const confirmDeletePost = () => {
    if (!deletePostId) return;
    
    deleteFoodPost(deletePostId);
    setRefreshKey(prevKey => prevKey + 1);
    setDeletePostId(null);
    
    toast({
      title: "Post Deleted",
      description: "Your food listing has been removed successfully.",
    });
  };

  const handlePostSuccess = () => {
    setIsPostDialogOpen(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (!user || user.role !== "business") {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only business accounts can access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter posts for each tab
  const activePosts = posts.filter(post => new Date(post.expiresAt) > new Date() && !post.claimed);
  const claimedPosts = posts.filter(post => post.claimed);
  const expiredPosts = posts.filter(post => new Date(post.expiresAt) <= new Date() && !post.claimed);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Food Posts</h1>
          <p className="text-muted-foreground">
            Manage the food items you've shared
          </p>
        </div>
        
        <Button 
          onClick={() => setIsPostDialogOpen(true)}
          className="sm:w-auto w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="active" className="relative">
            Active
            {activePosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {activePosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="claimed" className="relative">
            Claimed
            {claimedPosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {claimedPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired" className="relative">
            Expired
            {expiredPosts.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {expiredPosts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activePosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">You don't have any active food posts</p>
                <Button onClick={() => setIsPostDialogOpen(true)}>
                  Post Food Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePosts.map(post => (
                <FoodPostCard 
                  key={post.id} 
                  post={post} 
                  onDelete={() => handleDeletePost(post.id)} 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="claimed">
          {claimedPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">No food has been claimed yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claimedPosts.map(post => (
                <FoodPostCard 
                  key={post.id} 
                  post={post} 
                  onDelete={() => handleDeletePost(post.id)} 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="expired">
          {expiredPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">No expired food posts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expiredPosts.map(post => (
                <FoodPostCard 
                  key={post.id} 
                  post={post} 
                  onDelete={() => handleDeletePost(post.id)} 
                />
              ))}
              
              {expiredPosts.length > 0 && (
                <div className="col-span-full flex justify-end mt-4">
                  <Button 
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      // Delete all expired posts
                      expiredPosts.forEach(post => deleteFoodPost(post.id));
                      setRefreshKey(prevKey => prevKey + 1);
                      
                      toast({
                        title: "Cleared Expired Posts",
                        description: `${expiredPosts.length} expired post${expiredPosts.length !== 1 ? 's' : ''} removed successfully.`,
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Expired
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Post Food Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post Surplus Food</DialogTitle>
          </DialogHeader>
          <FoodPostForm onSuccess={handlePostSuccess} />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this food post. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePost}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyPosts;
