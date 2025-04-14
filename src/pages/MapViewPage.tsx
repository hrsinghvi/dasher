import React, { useState, useEffect } from 'react';
import LeafletMap from '@/components/map/LeafletMap';
import { FoodPost, FoodCategory } from '@/types';
import { getFoodPosts } from '@/utils/storage';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PanelLeft, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';

type FoodPostWithStatus = FoodPost & {
  status: 'Available' | 'Reserved' | 'Completed';
};

const MapViewPage: React.FC = () => {
  const [foodPosts, setFoodPosts] = useState<FoodPostWithStatus[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Available', 'Reserved', 'Completed']);
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load posts
    const allPosts = getFoodPosts();
    const postsWithStatus = allPosts.map(post => {
      const now = new Date();
      const expiryDate = new Date(post.expiresAt);
      const status: 'Available' | 'Reserved' | 'Completed' = post.claimed ? 'Reserved' : expiryDate <= now ? 'Completed' : 'Available';
      return { ...post, status };
    });
    setFoodPosts(postsWithStatus);
    setIsLoading(false);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter posts based on selected statuses and categories
  const filteredPosts = foodPosts.filter(post => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(post.status)) {
      return false;
    }
    if (selectedCategories.length > 0 && !selectedCategories.includes(post.category)) {
      return false;
    }
    return true;
  });

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleCategory = (category: FoodCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const FilterSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">Status</h3>
          <div className="space-y-2">
            {['Available', 'Reserved', 'Completed'].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox 
                  id={status.toLowerCase()}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                  className="hover:bg-primary/5 transition-colors"
                />
                <Label 
                  htmlFor={status.toLowerCase()} 
                  className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                >
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Categories</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['produce', 'bakery', 'prepared', 'dairy', 'other'] as FoodCategory[]).map((category) => (
              <div
                key={category}
                className={cn(
                  "px-3 py-2 rounded-md border cursor-pointer transition-all",
                  selectedCategories.includes(category)
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-accent border-input"
                )}
                onClick={() => toggleCategory(category)}
              >
                <p className="text-sm font-medium capitalize">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(selectedStatuses.length > 0 || selectedCategories.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-muted-foreground">Active filters:</p>
          {selectedStatuses.map(status => (
            <Badge 
              key={status} 
              variant="secondary"
              className="px-2 py-0.5 hover:bg-destructive/10 cursor-pointer transition-colors"
              onClick={() => toggleStatus(status)}
            >
              {status} <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          {selectedCategories.map(category => (
            <Badge 
              key={category} 
              variant="secondary"
              className="px-2 py-0.5 capitalize hover:bg-destructive/10 cursor-pointer transition-colors"
              onClick={() => toggleCategory(category)}
            >
              {category} <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="container h-full mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Food Share Map</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search location..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[300px]">
                  <ScrollArea className="h-full">
                    <FilterSection />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100%-4rem)] grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Filters Section - Desktop */}
          {!isMobile && (
            <Card className={cn(
              "transition-all duration-300 overflow-hidden",
              isSidebarOpen ? "md:col-span-3" : "md:col-span-1"
            )}>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className={cn(
                    "font-semibold transition-opacity",
                    !isSidebarOpen && "opacity-0"
                  )}>
                    Filters
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="shrink-0"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className={cn(
                  "transition-opacity",
                  !isSidebarOpen && "opacity-0"
                )}>
                  <FilterSection />
                </div>
              </div>
            </Card>
          )}

          {/* Map Section */}
          <div className={cn(
            "transition-all duration-300",
            isSidebarOpen ? "md:col-span-9" : "md:col-span-11"
          )}>
            <LeafletMap 
              posts={filteredPosts}
              className="h-full min-h-[500px] md:min-h-0"
              filterStatus={selectedStatuses as ('Available' | 'Reserved' | 'Completed')[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewPage;
