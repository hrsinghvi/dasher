
export type UserRole = "business" | "charity";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  location: { lat: number; lng: number };
  address?: string;
};

export type FoodPost = {
  id: string;
  businessId: string;
  businessName: string;
  foodName: string;
  quantity: string;
  description?: string;
  expiresAt: string; // ISO string
  location: { lat: number; lng: number };
  address: string;
  timestamp: string;
  claimed?: boolean;
  claimedBy?: string;
};

export type FoodCategory = "produce" | "bakery" | "prepared" | "dairy" | "other";

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  relatedPostId?: string;
  type: "new_post" | "claim" | "expiry" | "system";
};
