import React, { createContext, useState, useEffect, useContext } from "react";
import { Notification } from "../types";
import { getNotificationsByUser, markNotificationAsRead, saveNotification } from "../utils/storage";
import { useUser } from "./UserContext";
import { generateId } from "../utils/storage";
import { useToast } from "@/components/ui/use-toast";

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refetchNotifications: () => void;
  clearUserNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  refetchNotifications: () => {},
  clearUserNotifications: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const loadNotifications = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    
    const userNotifications = getNotificationsByUser(user.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setNotifications(userNotifications);
  };

  useEffect(() => {
    loadNotifications();
    
    // Set up polling for new notifications
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    if (!user) return;
    
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    saveNotification(newNotification);
    loadNotifications();
    
    // Show toast for new notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
      duration: 5000
    });
  };

  const markAsRead = (id: string) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
    loadNotifications();
  };

  const clearUserNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        addNotification, 
        markAsRead, 
        markAllAsRead,
        refetchNotifications: loadNotifications,
        clearUserNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
