import { User, FoodPost, Notification, UserRole, FoodCategory } from "../types";
import { v4 as uuidv4 } from "@/utils/uuid";

// Storage keys
const USERS_KEY = "food_share_users";
const CURRENT_USER_KEY = "food_share_current_user";
const FOOD_POSTS_KEY = "food_share_posts";
const NOTIFICATIONS_KEY = "food_share_notifications";

// UUID generator
export function generateId(): string {
  return uuidv4();
}

// User storage
export function saveUser(user: User): User {
  const users = getUsers();
  const existingUserIndex = users.findIndex((u) => u.id === user.id);
  
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return user;
}

export function getUsers(): User[] {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
}

export function getUserById(userId: string): User | undefined {
  const users = getUsers();
  return users.find((user) => user.id === userId);
}

export function getUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find((user) => user.email === email);
}

export function setCurrentUser(userId: string): void {
  localStorage.setItem(CURRENT_USER_KEY, userId);
}

export function getCurrentUser(): User | null {
  const userId = localStorage.getItem(CURRENT_USER_KEY);
  if (!userId) return null;
  
  const user = getUserById(userId);
  return user || null;
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Food posts storage
export function saveFoodPost(post: FoodPost): FoodPost {
  const posts = getFoodPosts();
  const existingPostIndex = posts.findIndex((p) => p.id === post.id);
  
  if (existingPostIndex >= 0) {
    posts[existingPostIndex] = post;
  } else {
    posts.push(post);
  }
  
  localStorage.setItem(FOOD_POSTS_KEY, JSON.stringify(posts));
  return post;
}

export function getFoodPosts(): FoodPost[] {
  const postsJson = localStorage.getItem(FOOD_POSTS_KEY);
  const posts = postsJson ? JSON.parse(postsJson) : [];
  
  // Clean up expired posts that are more than 24 hours old
  return posts.filter((post: FoodPost) => {
    const expiryTime = new Date(post.expiresAt).getTime();
    const now = Date.now();
    // Keep posts that expire in the future or expired less than 24 hours ago
    return expiryTime > now || (now - expiryTime < 24 * 60 * 60 * 1000);
  });
}

export function getFoodPostById(postId: string): FoodPost | undefined {
  const posts = getFoodPosts();
  return posts.find((post) => post.id === postId);
}

export function deleteFoodPost(postId: string): void {
  const posts = getFoodPosts();
  const updatedPosts = posts.filter((post) => post.id !== postId);
  localStorage.setItem(FOOD_POSTS_KEY, JSON.stringify(updatedPosts));
}

export function getFoodPostsByBusiness(businessId: string): FoodPost[] {
  const posts = getFoodPosts();
  return posts.filter((post) => post.businessId === businessId);
}

export function getAvailableFoodPosts(): FoodPost[] {
  const posts = getFoodPosts();
  const now = new Date().toISOString();
  return posts.filter((post) => post.expiresAt > now && !post.claimed);
}

// Notifications storage
export function saveNotification(notification: Notification): Notification {
  const notifications = getNotifications();
  const existingNotifIndex = notifications.findIndex((n) => n.id === notification.id);
  
  if (existingNotifIndex >= 0) {
    notifications[existingNotifIndex] = notification;
  } else {
    notifications.push(notification);
  }
  
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  return notification;
}

export function getNotifications(): Notification[] {
  const notificationsJson = localStorage.getItem(NOTIFICATIONS_KEY);
  return notificationsJson ? JSON.parse(notificationsJson) : [];
}

export function getNotificationsByUser(userId: string): Notification[] {
  const notifications = getNotifications();
  return notifications.filter((notification) => notification.userId === userId);
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const notificationIndex = notifications.findIndex((n) => n.id === notificationId);
  
  if (notificationIndex >= 0) {
    notifications[notificationIndex].read = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
}

export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const updatedNotifications = notifications.filter((n) => n.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
}

// Clear test data
export function clearAll(): void {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(FOOD_POSTS_KEY);
  localStorage.removeItem(NOTIFICATIONS_KEY);
}

// Demo data initialization
export function initializeDemoData() {
  // Clear existing data first
  localStorage.clear();

  // Sample business locations around San Francisco
  const sampleBusinesses = [
    {
      id: "b1",
      name: "Green Spoon Café",
      role: "business" as UserRole,
      location: { lat: 37.7749, lng: -122.4194 },
      address: "123 Market St, San Francisco, CA",
      email: "greenspoon@example.com",
      preferences: { notificationEnabled: true }
    },
    {
      id: "b2",
      name: "Urban Harvest Market",
      role: "business" as UserRole,
      location: { lat: 37.7858, lng: -122.4319 },
      address: "456 Hayes St, San Francisco, CA",
      email: "urbanharvest@example.com",
      preferences: { notificationEnabled: true }
    },
    {
      id: "b3",
      name: "FreshMart Groceries",
      role: "business" as UserRole,
      location: { lat: 37.7599, lng: -122.4148 },
      address: "789 Mission St, San Francisco, CA",
      email: "freshmart@example.com",
      preferences: { notificationEnabled: true }
    },
    {
      id: "b4",
      name: "Bay Bakery",
      role: "business" as UserRole,
      location: { lat: 37.7982, lng: -122.4071 },
      address: "101 Columbus Ave, San Francisco, CA",
      email: "baybakery@example.com",
      preferences: { notificationEnabled: true }
    },
    {
      id: "b5",
      name: "Mission Community Kitchen",
      role: "business" as UserRole,
      location: { lat: 37.7639, lng: -122.4089 },
      address: "2000 Mission St, San Francisco, CA",
      email: "missionkitchen@example.com",
      preferences: { notificationEnabled: true }
    }
  ];

  // Sample charities
  const sampleCharities = [
    {
      id: "c1",
      name: "SF Food Bank",
      role: "charity" as UserRole,
      location: { lat: 37.7505, lng: -122.4103 },
      address: "900 Pennsylvania Ave, San Francisco, CA",
      email: "sffoodbank@example.com",
      preferences: { 
        notificationEnabled: true,
        foodCategories: ["produce", "bakery", "prepared", "dairy"],
        maxDistance: 10
      }
    }
  ];

  // Save sample businesses and charities
  [...sampleBusinesses, ...sampleCharities].forEach(user => saveUser(user));

  // Create sample food posts
  const samplePosts = [
    {
      id: "p1",
      businessId: "b1",
      businessName: "Green Spoon Café",
      foodName: "Hot Soup & Sandwiches",
      category: "prepared" as FoodCategory,
      quantity: "15 portions",
      description: "Vegetable soup and assorted sandwiches from lunch service",
      location: sampleBusinesses[0].location,
      address: sampleBusinesses[0].address,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      claimed: false
    },
    {
      id: "p2",
      businessId: "b2",
      businessName: "Urban Harvest Market",
      foodName: "Fresh Produce Box",
      category: "produce" as FoodCategory,
      quantity: "10 boxes",
      description: "Mixed vegetables and fruits including seasonal items",
      location: sampleBusinesses[1].location,
      address: sampleBusinesses[1].address,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      claimed: false
    },
    {
      id: "p3",
      businessId: "b3",
      businessName: "FreshMart Groceries",
      foodName: "Dairy Products",
      category: "dairy" as FoodCategory,
      quantity: "25 items",
      description: "Yogurt, milk, and cheese near best-by date",
      location: sampleBusinesses[2].location,
      address: sampleBusinesses[2].address,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      claimed: true,
      claimedBy: "c1"
    },
    {
      id: "p4",
      businessId: "b4",
      businessName: "Bay Bakery",
      foodName: "Assorted Pastries",
      category: "bakery" as FoodCategory,
      quantity: "30 pieces",
      description: "Mix of croissants, muffins, and danish pastries",
      location: sampleBusinesses[3].location,
      address: sampleBusinesses[3].address,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      claimed: false
    },
    {
      id: "p5",
      businessId: "b5",
      businessName: "Mission Community Kitchen",
      foodName: "Prepared Meals",
      category: "prepared" as FoodCategory,
      quantity: "20 meals",
      description: "Individual portions of rice, beans, and vegetables",
      location: sampleBusinesses[4].location,
      address: sampleBusinesses[4].address,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      claimed: false
    },
    {
      id: "p6",
      businessId: "b1",
      businessName: "Green Spoon Café",
      foodName: "Day-End Salads",
      category: "prepared" as FoodCategory,
      quantity: "8 portions",
      description: "Fresh salads with grilled chicken and vegetables",
      location: sampleBusinesses[0].location,
      address: sampleBusinesses[0].address,
      timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      claimed: false
    },
    {
      id: "p7",
      businessId: "b2",
      businessName: "Urban Harvest Market",
      foodName: "Bread Assortment",
      category: "bakery" as FoodCategory,
      quantity: "15 loaves",
      description: "Variety of fresh breads from local bakeries",
      location: sampleBusinesses[1].location,
      address: sampleBusinesses[1].address,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Already expired
      claimed: false
    },
    {
      id: "p8",
      businessId: "b3",
      businessName: "FreshMart Groceries",
      foodName: "Packaged Snacks",
      category: "other" as FoodCategory,
      quantity: "50 items",
      description: "Assorted chips, crackers, and granola bars",
      location: sampleBusinesses[2].location,
      address: sampleBusinesses[2].address,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      claimed: true,
      claimedBy: "c1"
    },
    {
      id: "p9",
      businessId: "b4",
      businessName: "Bay Bakery",
      foodName: "Specialty Breads",
      category: "bakery" as FoodCategory,
      quantity: "12 loaves",
      description: "Artisan sourdough and whole grain breads",
      location: sampleBusinesses[3].location,
      address: sampleBusinesses[3].address,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      claimed: false
    },
    {
      id: "p10",
      businessId: "b5",
      businessName: "Mission Community Kitchen",
      foodName: "Hot Entrees",
      category: "prepared" as FoodCategory,
      quantity: "25 portions",
      description: "Pasta dishes and vegetable curry",
      location: sampleBusinesses[4].location,
      address: sampleBusinesses[4].address,
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      claimed: false
    }
  ];

  // Save sample posts
  samplePosts.forEach(post => saveFoodPost(post));

  // Do not initialize any demo notifications
}
