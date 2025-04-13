
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Store, 
  MapPin, 
  Clock, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Utensils,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useUser();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navigationItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/",
      visible: true
    },
    {
      name: "Map",
      icon: <MapPin size={20} />,
      path: "/map",
      visible: true
    },
    {
      name: "My Posts",
      icon: <Store size={20} />,
      path: "/my-posts",
      visible: user.role === "business"
    },
    {
      name: "Food Available",
      icon: <Utensils size={20} />,
      path: "/available",
      visible: user.role === "charity"
    },
    {
      name: "Activity",
      icon: <Clock size={20} />,
      path: "/activity",
      visible: true
    }
  ];

  const sidebar = (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-2 pl-3 py-4">
        <div className="bg-primary/10 p-2 rounded-full">
          <Utensils className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Dasher</h2>
      </div>
      
      <Separator />
      
      <div className="flex-1 px-2">
        <div className="space-y-1">
          {navigationItems
            .filter(item => item.visible)
            .map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start gap-2",
                  isActive(item.path) && "bg-secondary font-medium"
                )}
                onClick={() => {
                  navigate(item.path);
                  setShowMobileMenu(false);
                }}
              >
                {item.icon}
                {item.name}
              </Button>
            ))}
        </div>
      </div>
      
      <Separator />
      
      <div className="p-2">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role === "business" ? "Business" : "Charity"}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              navigate('/settings');
              setShowMobileMenu(false);
            }}
          >
            <Settings size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={logout}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
        {sidebar}
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-2 border-b bg-background">
          <div className="flex items-center">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                {sidebar}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 ml-2">
              <div className="bg-primary/10 p-1 rounded-full">
                <Utensils className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">Dasher</span>
            </div>
          </div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">
            {navigationItems.find(item => isActive(item.path))?.name || "Dashboard"}
          </h1>
          
          <div className="flex items-center">
            <Button 
              onClick={() => navigate(user.role === "business" ? "/my-posts" : "/available")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>
        
        {/* Mobile New Post Button (fixed at bottom) */}
        <div className="md:hidden fixed bottom-6 right-6 z-10">
          <Button 
            onClick={() => navigate(user.role === "business" ? "/my-posts" : "/available")}
            size="lg"
            className="rounded-full shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 h-14 w-14 p-0"
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-background/90">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
