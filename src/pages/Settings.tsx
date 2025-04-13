
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  MapPin, 
  Save, 
  Settings as SettingsIcon, 
  Trash2,
  UserRound
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { clearAll, saveUser } from "@/utils/storage";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

const Settings: React.FC = () => {
  const { user, logout } = useUser();
  const { addNotification } = useNotifications();
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [notifications, setNotifications] = useState({
    newFood: true,
    claims: true,
    expiryReminders: true
  });

  if (!user) return null;

  const handleSaveProfile = () => {
    if (!user) return;
    
    // Update user name
    const updatedUser = {
      ...user,
      name: name.trim()
    };
    
    saveUser(updatedUser);
    
    // Notify user
    addNotification({
      userId: user.id,
      title: "Profile Updated",
      message: "Your profile information has been updated successfully.",
      type: "system"
    });
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleClearData = () => {
    clearAll();
    logout();
    
    toast({
      title: "Data Cleared",
      description: "All your data has been cleared. You will be logged out.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your name or organization"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                value={user.role === "business" ? "Food Business" : "Charity/Shelter"} 
                disabled 
              />
              <p className="text-xs text-muted-foreground">
                Your role cannot be changed
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex items-center space-x-2 h-10 px-3 border rounded-md bg-muted/40">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">Using your current location</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Location is automatically determined
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveProfile} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
        
        {/* Notification Settings */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-food">New Food Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  {user.role === "business" 
                    ? "When a charity claims your food" 
                    : "When new food is posted nearby"}
                </p>
              </div>
              <Switch 
                id="new-food"
                checked={notifications.newFood}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, newFood: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="claims">Claim Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  {user.role === "business" 
                    ? "When your food is claimed"
                    : "Reminders about your claims"}
                </p>
              </div>
              <Switch 
                id="claims"
                checked={notifications.claims}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, claims: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="expiry">Expiry Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  {user.role === "business" 
                    ? "When your food is about to expire"
                    : "When claimed food is expiring"}
                </p>
              </div>
              <Switch 
                id="expiry"
                checked={notifications.expiryReminders}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, expiryReminders: checked }))
                }
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => {
              toast({
                title: "Notification Settings Saved",
                description: "Your notification preferences have been updated.",
              });
            }}>
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
        
        {/* Danger Zone */}
        <Card className="md:col-span-3 border-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-md bg-destructive/5">
              <div>
                <h3 className="font-medium mb-1">Clear All Data</h3>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all your data, including food posts, claims, and settings.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setIsConfirmClearOpen(true)}
                className="sm:w-auto w-full gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={isConfirmClearOpen} onOpenChange={setIsConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your data and log you out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
