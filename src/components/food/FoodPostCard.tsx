import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarRange, 
  Clock, 
  MapPin, 
  Store, 
  Trash2, 
  ShoppingBag,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { FoodPost } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { ClaimFoodDialog } from "./ClaimFoodDialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { saveFoodPost } from "@/utils/storage";
import { toast } from "@/components/ui/use-toast";

interface FoodPostCardProps {
  post: FoodPost;
  onDelete?: () => void;
  onClaim?: (pickupTime: Date) => void;
  onView?: () => void;
  compact?: boolean;
}

const FoodPostCard: React.FC<FoodPostCardProps> = ({ 
  post, 
  onDelete, 
  onClaim, 
  onView,
  compact = false 
}) => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  
  // Calculate time to expiry
  const expiryDate = new Date(post.expiresAt);
  const now = new Date();
  const isExpired = expiryDate < now;
  const timeToExpiry = formatDistanceToNow(expiryDate, { addSuffix: true });

  const handleClaim = (pickupTime: Date, notes: string) => {
    if (!user) return;

    // Validate the pickup time again as a safeguard
    if (pickupTime < now || pickupTime > expiryDate) {
      toast({
        title: "Invalid pickup time",
        description: "Please select a valid pickup time",
        variant: "destructive",
      });
      return;
    }

    // Update the post
    const updatedPost = {
      ...post,
      claimed: true,
      claimedBy: user.id,
      claimedAt: new Date().toISOString(),
      pickupTime: pickupTime.toISOString(),
      pickupNotes: notes
    };
    
    // Save the updated post
    saveFoodPost(updatedPost);

    // Send notifications
    // Notify the business with pickup details
    addNotification({
      userId: post.businessId,
      title: "Food Item Claimed",
      message: `${user.name} has claimed "${post.foodName}" for pickup ${format(pickupTime, "PPP 'at' p")}${notes ? ". Notes: " + notes : ""}`,
      type: "claim",
      relatedPostId: post.id
    });

    // Notify the charity with confirmation and pickup reminder
    addNotification({
      userId: user.id,
      title: "Pickup Scheduled",
      message: `You've scheduled to pick up "${post.foodName}" from ${post.businessName} on ${format(pickupTime, "PPP 'at' p")}. Please arrive on time.`,
      type: "claim",
      relatedPostId: post.id
    });

    // Show success toast
    toast({
      title: "Food claimed successfully",
      description: "The business has been notified of your pickup time.",
    });

    // Call the parent's onClaim handler if provided
    if (onClaim) {
      onClaim(pickupTime);
    }

    setIsClaimDialogOpen(false);
  };
  
  // Determine status for UI
  const getPostStatus = () => {
    if (post.claimed) return "Reserved";
    if (isExpired) return "Completed";
    return "Available";
  };

  // Determine tag style
  const getExpiryTagClass = () => {
    if (isExpired) return "expired";
    
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    return diffHrs <= 3 ? "expires-soon" : "fresh";
  };
  
  // Determine color based on food category
  const getCategoryColor = () => {
    switch (post.category) {
      case "produce": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "bakery": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "prepared": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "dairy": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };
  
  if (!user) return null;
  
  return (
    <Card className={compact ? "" : "h-full"}>
      <CardHeader className={compact ? "p-3" : "p-4"}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={compact ? "text-base" : "text-lg"}>
              {post.foodName}
            </CardTitle>
            <p className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"} mt-1`}>
              {post.businessName}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge className={`${getCategoryColor()} capitalize`}>
              {post.category}
            </Badge>
            
            <span className={`food-tag ${getExpiryTagClass()} ${compact ? "text-xs" : ""}`}>
              {isExpired ? "Expired" : timeToExpiry}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={compact ? "p-3 pt-0" : "p-4 pt-0"}>
        {!compact && post.description && (
          <div className="mb-3">
            <p className="text-sm">{post.description}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <span className={compact ? "text-xs" : "text-sm"}>
              {post.quantity}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className={compact ? "text-xs" : "text-sm"}>
              {post.address}
              {post.distance !== undefined && (
                <span className="ml-1 text-muted-foreground">
                  ({post.distance.toFixed(1)} km away)
                </span>
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={compact ? "text-xs" : "text-sm"}>
              {isExpired ? (
                <span className="text-muted-foreground">Expired {timeToExpiry}</span>
              ) : (
                <span>Available until {expiryDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className={compact ? "p-3 pt-2" : "p-4 pt-2"}>
        <div className="w-full">
          {!compact && <Separator className="mb-3" />}
          
          <div className="flex gap-2 justify-end">
            {user.role === "charity" && !post.claimed && !isExpired && (
              <Button 
                onClick={() => setIsClaimDialogOpen(true)}
                className={compact ? "h-8 text-xs" : ""}
              >
                Claim
              </Button>
            )}
            
            {user.role === "business" && post.businessId === user.id && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`${compact ? "h-8 text-xs" : ""} gap-1`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {!compact && "Delete"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this food post.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {onView && (
              <Button 
                variant={user.role === "charity" && !isExpired ? "outline" : "default"}
                className={compact ? "h-8 text-xs" : ""}
                onClick={onView}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardFooter>

      {/* Claim Dialog */}
      <ClaimFoodDialog
        post={post}
        isOpen={isClaimDialogOpen}
        onClose={() => setIsClaimDialogOpen(false)}
        onClaim={handleClaim}
      />
    </Card>
  );
};

export default FoodPostCard;
