
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Store, MapPin, Package, AlarmClock, Clock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { generateId, saveFoodPost } from "@/utils/storage";
import { useNotifications } from "@/contexts/NotificationContext";
import { FoodPost } from "@/types";
import { getAddressFromCoordinates } from "@/utils/geo";
import { toast } from "@/components/ui/use-toast";

// Form validation schema
const foodPostSchema = z.object({
  foodName: z.string().min(3, { message: "Food name must be at least 3 characters" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  description: z.string().optional(),
  expiryHours: z.coerce.number().min(1, { message: "Expiry time must be at least 1 hour" }).max(72, { message: "Expiry time cannot exceed 72 hours" }),
});

type FoodPostFormValues = z.infer<typeof foodPostSchema>;

interface FoodPostFormProps {
  onSuccess?: () => void;
}

const FoodPostForm: React.FC<FoodPostFormProps> = ({ onSuccess }) => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FoodPostFormValues>({
    resolver: zodResolver(foodPostSchema),
    defaultValues: {
      foodName: "",
      quantity: "",
      description: "",
      expiryHours: 24,
    },
  });

  const onSubmit = async (data: FoodPostFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Get current time and calculate expiry time
      const now = new Date();
      const expiryTime = new Date(now.getTime() + data.expiryHours * 60 * 60 * 1000);
      
      // Get address from user's coordinates
      const address = await getAddressFromCoordinates(user.location);
      
      // Create new food post
      const newPost: FoodPost = {
        id: generateId(),
        businessId: user.id,
        businessName: user.name,
        foodName: data.foodName,
        quantity: data.quantity,
        description: data.description,
        expiresAt: expiryTime.toISOString(),
        location: user.location,
        address,
        timestamp: now.toISOString(),
      };
      
      // Save to local storage
      saveFoodPost(newPost);
      
      // Create notification for the business
      addNotification({
        userId: user.id,
        title: "Food post created",
        message: `Your listing for "${data.foodName}" has been posted successfully.`,
        type: "new_post",
        relatedPostId: newPost.id,
      });
      
      // Reset form
      form.reset();
      
      // Show success toast
      toast({
        title: "Food posted successfully",
        description: "Your food listing has been shared with nearby charities.",
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error posting food:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post food. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== "business") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Only businesses can post food listings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="foodName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food Name</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., Fresh bread, Produce, Prepared meals" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  What food items are you sharing?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., 5 loaves, 3kg, 10 portions" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  How much food is available?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional details about the food (dietary info, storage needs, etc.)" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="expiryHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires In (Hours)</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input type="number" min={1} max={72} {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  How many hours until this food should be picked up?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormItem>
            <FormLabel>Pickup Location</FormLabel>
            <div className="flex items-center space-x-2 h-10 px-3 border rounded-md bg-muted/40">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">Using your current location</span>
            </div>
            <FormDescription>
              Food will be available at your current location
            </FormDescription>
          </FormItem>
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Posting..." : "Post Food"}
        </Button>
      </form>
    </Form>
  );
};

export default FoodPostForm;
