
import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, X, Clock, AlertCircle, ShoppingBag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Notification } from "@/types";

interface NotificationPanelProps {
  onClose?: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case "new_post":
        return <ShoppingBag className="h-5 w-5 text-food-green" />;
      case "claim":
        return <Check className="h-5 w-5 text-food-blue" />;
      case "expiry":
        return <Clock className="h-5 w-5 text-food-amber" />;
      case "system":
      default:
        return <Bell className="h-5 w-5 text-food-gray" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex gap-2">
          {notifications.some(n => !n.read) && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-40" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2 pr-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg transition-colors ${
                  notification.read ? 'bg-secondary/40' : 'bg-secondary'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    
                    {notification.relatedPostId && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                          // Navigate to the post detail
                          // In a real app, we would use navigate()
                          console.log(`Navigate to post ${notification.relatedPostId}`);
                        }}
                      >
                        View details
                      </Button>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationPanel;
