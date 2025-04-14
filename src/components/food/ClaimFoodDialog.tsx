import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format, addHours, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { FoodPost } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/components/ui/use-toast";

interface ClaimFoodDialogProps {
  post: FoodPost;
  isOpen: boolean;
  onClose: () => void;
  onClaim: (pickupTime: Date, notes: string) => void;
}

export const ClaimFoodDialog: React.FC<ClaimFoodDialogProps> = ({
  post,
  isOpen,
  onClose,
  onClaim,
}) => {
  const { user } = useUser();
  const [pickupDate, setPickupDate] = useState<Date | undefined>(new Date());
  const [pickupTime, setPickupTime] = useState("12:00");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !pickupTime) {
      toast({
        title: "Missing information",
        description: "Please select both pickup date and time",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const [hours, minutes] = pickupTime.split(":").map(Number);
    const pickupDateTime = new Date(pickupDate);
    pickupDateTime.setHours(hours, minutes);

    // Validate pickup time is in the future
    if (isBefore(pickupDateTime, new Date())) {
      toast({
        title: "Invalid pickup time",
        description: "Pickup time must be in the future",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate pickup time is before expiry
    if (isBefore(new Date(post.expiresAt), pickupDateTime)) {
      toast({
        title: "Invalid pickup time",
        description: "Pickup must be scheduled before the food expires",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // All validation passed
    onClaim(pickupDateTime, notes);
    setIsSubmitting(false);
    onClose();
    
    toast({
      title: "Food claimed successfully",
      description: `Pickup scheduled for ${format(pickupDateTime, "PPP 'at' p")}`,
    });
  };

  const maxDate = new Date(post.expiresAt);
  const minTime = isBefore(new Date(), pickupDate!) ? "00:00" : format(addHours(new Date(), 1), "HH:mm");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Claim Food</DialogTitle>
          <DialogDescription>
            Schedule a pickup time for {post.foodName} from {post.businessName}. 
            Must be picked up before {format(new Date(post.expiresAt), "PPP 'at' p")}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Pickup Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !pickupDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={pickupDate}
                  onSelect={setPickupDate}
                  disabled={(date) =>
                    isBefore(date, new Date()) || isBefore(maxDate, date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Pickup Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                min={minTime}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes for the Business (Optional)</Label>
            <Textarea
              placeholder="Add any pickup instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !pickupDate}>
              {isSubmitting ? "Confirming..." : "Schedule Pickup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};