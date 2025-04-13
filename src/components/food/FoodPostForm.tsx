
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useUser } from "@/contexts/UserContext";
import { FoodPost, FoodCategory, User, RecommendedMatch } from "@/types";
import { v4 as uuidv4 } from "@/utils/uuid";
import { saveFoodPost, getUsers } from "@/utils/storage";
import { useNotifications } from "@/contexts/NotificationContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { detectDuplicatePost, findMatchingCharities } from "@/utils/ai";

interface FoodPostFormProps {
  onSuccess: () => void;
}

const FoodPostForm: React.FC<FoodPostFormProps> = ({ onSuccess }) => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState<FoodCategory>("other");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    new Date(Date.now() + 3 * 60 * 60 * 1000) // Default 3 hours from now
  );
  const [address, setAddress] = useState(user?.address || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [possibleDuplicate, setPossibleDuplicate] = useState(false);
  const [recommendedCharities, setRecommendedCharities] = useState<RecommendedMatch[]>([]);

  useEffect(() => {
    if (user && user.address) {
      setAddress(user.address);
    }
  }, [user]);

  const handleDateSelect = (date: Date | undefined) => {
    setExpiresAt(date);
  };

  const checkForDuplicates = () => {
    if (!foodName || !user) return;

    // Get all existing posts
    const existingPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    
    const newPost = {
      businessId: user.id,
      foodName,
      quantity,
      category
    };
    
    const isDuplicate = detectDuplicatePost(newPost, existingPosts);
    setPossibleDuplicate(isDuplicate);
  };

  useEffect(() => {
    if (foodName) {
      const debounce = setTimeout(() => {
        checkForDuplicates();
      }, 500);
      
      return () => clearTimeout(debounce);
    }
  }, [foodName, category]);

  const findRecommendedCharities = () => {
    if (!user) return [];
    
    // Construct a partial food post to use for matching
    const draftPost: FoodPost = {
      id: "",
      businessId: user.id,
      businessName: user.name,
      foodName,
      quantity,
      description,
      expiresAt: expiresAt?.toISOString() || new Date().toISOString(),
      location: user.location,
      address: address || "",
      timestamp: new Date().toISOString(),
      category
    };
    
    // Get all users
    const allUsers = getUsers();
    
    // Find matching charities
    const matches = findMatchingCharities(draftPost, allUsers);
    setRecommendedCharities(matches);
  };

  useEffect(() => {
    if (foodName && category && user) {
      const debounce = setTimeout(() => {
        findRecommendedCharities();
      }, 1000);
      
      return () => clearTimeout(debounce);
    }
  }, [foodName, category, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !expiresAt) return;

    setIsSubmitting(true);

    try {
      // Create new food post
      const newPost: FoodPost = {
        id: uuidv4(),
        businessId: user.id,
        businessName: user.name,
        foodName,
        quantity,
        description,
        expiresAt: expiresAt.toISOString(),
        location: user.location,
        address: address || "",
        timestamp: new Date().toISOString(),
        category
      };

      // Save to storage
      saveFoodPost(newPost);

      // Notify nearby charities (within 10km)
      const nearbyCharities = getUsers().filter(
        (charity) =>
          charity.role === "charity" &&
          charity.preferences?.notificationEnabled !== false
      );

      // Add notifications for charities
      nearbyCharities.forEach((charity) => {
        addNotification({
          userId: charity.id,
          title: "New Food Available",
          message: `${user.name} posted ${foodName} available for pickup.`,
          type: "new_post",
          relatedPostId: newPost.id
        });
      });

      // Notify the recommended charities with a more personalized message
      recommendedCharities.forEach(match => {
        addNotification({
          userId: match.charityId,
          title: "Recommended Food Match!",
          message: `${user.name} posted ${foodName} that matches your preferences (${match.matchReason.toLowerCase()}).`,
          type: "new_post",
          relatedPostId: newPost.id
        });
      });

      // Success callback
      onSuccess();
    } catch (error) {
      console.error("Error posting food:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="food-name">Food Item Name</Label>
        <Input
          id="food-name"
          placeholder="e.g., Fresh Bread, Produce Box"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="food-category">Category</Label>
        <Select value={category} onValueChange={(val) => setCategory(val as FoodCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="produce">Produce</SelectItem>
            <SelectItem value="bakery">Bakery</SelectItem>
            <SelectItem value="prepared">Prepared Food</SelectItem>
            <SelectItem value="dairy">Dairy</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          placeholder="e.g., 5 loaves, 3 kg, 2 trays"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Add any details about the food..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expires-at">Available Until</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !expiresAt && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {expiresAt ? format(expiresAt, "PPP p") : "Select date and time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={expiresAt}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Pickup Address</Label>
        <Input
          id="address"
          placeholder="Enter pickup address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      {possibleDuplicate && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Possible duplicate post</AlertTitle>
          <AlertDescription>
            You might have already posted a similar food item recently.
          </AlertDescription>
        </Alert>
      )}

      {recommendedCharities.length > 0 && (
        <div className="space-y-2 bg-accent/50 p-3 rounded-md">
          <h3 className="font-medium">Recommended Charities</h3>
          <p className="text-sm text-muted-foreground">
            These organizations might be interested in your donation:
          </p>
          <div className="space-y-2 mt-2">
            {recommendedCharities.map((match, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm p-2 bg-background rounded-md">
                <div>
                  <p className="font-medium">{match.charityName}</p>
                  <p className="text-xs text-muted-foreground">{match.matchReason}</p>
                </div>
                <span className="text-xs">{match.distance.toFixed(1)} km</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Posting..." : "Post Food"}
      </Button>
    </form>
  );
};

export default FoodPostForm;
