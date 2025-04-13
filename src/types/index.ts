
export type UserRole = "business" | "charity";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  location: { lat: number; lng: number };
  address?: string;
  onboardingCompleted?: boolean;
  preferences?: {
    foodCategories?: FoodCategory[];
    maxDistance?: number;
    notificationEnabled?: boolean;
    categoryPreferences?: Record<FoodCategory, number>; // 1-5 rating
  };
  reliability?: number; // 0-100 score based on pickup reliability
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
  category: FoodCategory;
  distance?: number; // Added for sorting/filtering
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

export type OnboardingStep = "role" | "name" | "location" | "preferences" | "complete";

export interface RecommendedMatch {
  charityId: string;
  charityName: string;
  score: number;
  distance: number;
  matchReason: string;
}

export type ThemeMode = "light" | "dark" | "system";
