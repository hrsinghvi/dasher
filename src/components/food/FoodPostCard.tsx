
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Store, 
  ExternalLink, 
  Trash2,
  CheckCircle2
} from "lucide-react";
import { formatDistanceToNow, differenceInHours, formatRelative } from "date-fns";
import { FoodPost } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface FoodPostCardProps {
  post: FoodPost;
  onView?: () => void;
  onClaim?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

const FoodPostCard: React.FC<FoodPostCardProps> = ({ 
  post, 
  onView, 
  onClaim, 
  onDelete,
  onEdit,
  compact = false
}) => {
  const { user } = useUser();
  const isExpired = new Date(post.expiresAt) < new Date();
  const isMine = user?.id === post.businessId;
  const isClaimed = post.claimed === true;
  
  // Calculate freshness based on expiry time
  const hoursUntilExpiry = differenceInHours(new Date(post.expiresAt), new Date());
  let freshnessTag;
  let freshnessClass;
  
  if (isExpired) {
    freshnessTag = "Expired";
    freshnessClass = "expired";
  } else if (hoursUntilExpiry <= 3) {
    freshnessTag = "Expires soon";
    freshnessClass = "expires-soon";
  } else {
    freshnessTag = "Fresh";
    freshnessClass = "fresh";
  }

  return (
    <Card className={cn(
      "border overflow-hidden card-hover", 
      isExpired && "opacity-70",
      isClaimed && "border-primary/30 bg-primary/5",
      compact ? "h-full" : ""
    )}>
      <CardHeader className={cn(
        "flex-row items-start justify-between space-y-0 gap-4 pb-2",
        compact && "p-3"
      )}>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold truncate",
              compact ? "text-sm" : "text-lg"
            )}>
              {post.foodName}
            </h3>
            <Badge variant="outline" className={cn("food-tag", freshnessClass)}>
              {freshnessTag}
            </Badge>
          </div>
          <p className={cn(
            "text-muted-foreground truncate",
            compact ? "text-xs" : "text-sm"
          )}>
            {post.quantity}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "space-y-2",
        compact ? "px-3 py-2" : "px-6"
      )}>
        {!compact && post.description && (
          <p className="text-sm text-muted-foreground">{post.description}</p>
        )}
        
        <div className="flex flex-col gap-1">
          <div className={cn(
            "flex items-center text-muted-foreground gap-1.5",
            compact ? "text-xs" : "text-sm"
          )}>
            <Store className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            <span className="truncate">{post.businessName}</span>
          </div>
          
          <div className={cn(
            "flex items-center text-muted-foreground gap-1.5",
            compact ? "text-xs" : "text-sm"
          )}>
            <MapPin className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            <span className="truncate">{post.address}</span>
          </div>
          
          <div className={cn(
            "flex items-center text-muted-foreground gap-1.5",
            compact ? "text-xs" : "text-sm"
          )}>
            <Clock className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{isExpired 
                    ? `Expired ${formatDistanceToNow(new Date(post.expiresAt))} ago` 
                    : `Expires ${formatDistanceToNow(new Date(post.expiresAt))} from now`}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {formatRelative(new Date(post.expiresAt), new Date())}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {isClaimed && (
            <div className={cn(
              "flex items-center gap-1.5 text-primary",
              compact ? "text-xs" : "text-sm"
            )}>
              <CheckCircle2 className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
              <span>Claimed</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {!compact && (
        <CardFooter className={cn(
          "flex gap-2",
          compact ? "px-3 py-2" : ""
        )}>
          {onView && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 gap-1" 
              onClick={onView}
            >
              <ExternalLink className="h-4 w-4" />
              View
            </Button>
          )}
          
          {user?.role === "charity" && !isExpired && !isClaimed && onClaim && (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 gap-1" 
              onClick={onClaim}
            >
              <ShoppingBag className="h-4 w-4" />
              Claim
            </Button>
          )}
          
          {isMine && onDelete && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-1" 
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              {compact ? "" : "Delete"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default FoodPostCard;
