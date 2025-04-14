export type UserRole = "business" | "charity";

export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string;
  role?: UserRole;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
  onboardingCompleted?: boolean;
  reliability?: number; // Added reliability property
  preferences?: {
    foodCategories?: FoodCategory[];
    maxDistance?: number;
    notificationEnabled?: boolean;
    categoryPreferences?: Record<FoodCategory, number>;
  };
}

export type FoodCategory = "produce" | "bakery" | "prepared" | "dairy" | "other";

export interface FoodPost {
  id: string;
  businessId: string;
  businessName: string;
  foodName: string;
  category: FoodCategory;
  quantity: string;
  description?: string;
  location: { lat: number; lng: number };
  address: string;
  timestamp: string;
  expiresAt: string;
  claimed?: boolean;
  claimedBy?: string;
  claimedAt?: string;
  pickupTime?: string;
  pickupNotes?: string;
  distance?: number;
}

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
