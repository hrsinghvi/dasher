
import { User, FoodPost, Notification } from "../types";
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
