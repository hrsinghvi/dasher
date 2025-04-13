
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Bell, Moon, LogOut, MapPin, User, Filter, Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { FoodCategory } from "@/types";
import { saveUser } from "@/utils/storage";

const Settings = () => {
  const { user, logout, login } = useUser();
  const { clearUserNotifications } = useNotifications();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notificationEnabled !== false
  );
  
  const [maxDistance, setMaxDistance] = useState(
    user?.preferences?.maxDistance || 10
  );
  
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>(
    user?.preferences?.foodCategories || []
  );
  
  if (!user) return null;
  
  const handleCategoryToggle = (category: FoodCategory) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
      
    setSelectedCategories(newCategories);
    
    if (user.preferences) {
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          foodCategories: newCategories
        }
      };
      
      saveUser(updatedUser);
      login(updatedUser);
    }
  };
  
  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    
    if (user.preferences) {
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          notificationEnabled: enabled
        }
      };
      
      saveUser(updatedUser);
      login(updatedUser);
      
      toast({
        title: enabled ? "Notifications enabled" : "Notifications disabled",
        description: enabled 
          ? "You'll receive notifications for relevant events" 
          : "You won't receive any notifications"
      });
    }
  };
  
  const handleDistanceChange = (value: number) => {
    setMaxDistance(value);
    
    if (user.preferences) {
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          maxDistance: value
        }
      };
      
      saveUser(updatedUser);
      login(updatedUser);
    }
  };
  
  const handleClearNotifications = () => {
    clearUserNotifications(user.id);
    toast({
      title: "Notifications cleared",
      description: "All your notifications have been cleared"
    });
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out"
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Account
            </CardTitle>
            <CardDescription>
              Manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm font-medium mt-1">{user.name}</p>
              </div>
              <div>
                <Label>Role</Label>
                <p className="text-sm font-medium mt-1 capitalize">{user.role}</p>
              </div>
            </div>
            
            <Separator />
            
            <Button 
              variant="destructive" 
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Log Out
            </Button>
          </CardContent>
        </Card>
        
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" /> Appearance
            </CardTitle>
            <CardDescription>
              Customize how Food Share Connect looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light, dark, or system theme
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notifications
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  {user.role === "business" 
                    ? "Get notified when your food is claimed" 
                    : "Get notified about new food available nearby"}
                </p>
              </div>
              <Switch 
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
              />
            </div>
            
            <Separator />
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleClearNotifications}
            >
              <Trash2 className="h-4 w-4" /> Clear All Notifications
            </Button>
          </CardContent>
        </Card>
        
        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> Preferences
            </CardTitle>
            <CardDescription>
              Set your food and distance preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Food Categories */}
            <div className="space-y-3">
              <Label>Food Categories</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(["produce", "bakery", "prepared", "dairy", "other"] as FoodCategory[]).map((category) => (
                  <div 
                    key={category}
                    className={`px-3 py-2 rounded-md border cursor-pointer transition-colors ${
                      selectedCategories.includes(category) 
                        ? "bg-primary/10 border-primary" 
                        : "bg-card border-input hover:bg-accent/50"
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <p className="font-medium capitalize">{category}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {user.role === "charity" && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="distance">Maximum Distance</Label>
                  <span className="text-sm text-muted-foreground">{maxDistance} km</span>
                </div>
                <Slider
                  id="distance"
                  min={1}
                  max={20}
                  step={1}
                  value={[maxDistance]}
                  onValueChange={(values) => handleDistanceChange(values[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Only show food posts within this distance
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
