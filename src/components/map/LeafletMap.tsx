import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FoodPost } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import L, { LatLngExpression } from 'leaflet';
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Loader2 } from "lucide-react";
import { calculateDistance } from "@/utils/geo";

// Fix for Leaflet marker icon issue with bundlers like Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
  posts: FoodPost[];
  onSelectPost?: (post: FoodPost) => void; // Optional callback
  className?: string;
  filterStatus?: ('Available' | 'Reserved' | 'Completed')[];
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  posts, 
  onSelectPost, 
  className,
  filterStatus = ['Available']
}) => {
  const [center, setCenter] = useState<LatLngExpression>([37.7749, -122.4194]); // Default to San Francisco
  const [zoom, setZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { theme } = useTheme();
  const mapRef = React.useRef<L.Map>(null);

  // Map style URLs
  const lightMap = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkMap = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

  // Filter posts based on status
  const filteredPosts = posts.filter(post => {
    const status = post.claimed 
      ? 'Reserved'
      : new Date(post.expiresAt) <= new Date() 
        ? 'Completed' 
        : 'Available';
    return filterStatus.includes(status);
  });

  useEffect(() => {
    if (user?.location) {
      setCenter([user.location.lat, user.location.lng]);
      setIsLoading(false);
    } else {
      // Attempt to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCenter([position.coords.latitude, position.coords.longitude]);
            setZoom(13); // Zoom in a bit when location is found
            setIsLoading(false);
          },
          (error) => {
            console.error("Error getting user location:", error);
            // Keep default center if location access fails or is denied
            setIsLoading(false);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        // Keep default center if geolocation is not supported
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Keep default center if location access fails or is denied
          setIsLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Keep default center if geolocation is not supported
      setIsLoading(false);
    }
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data[0]) {
        const { lat, lon } = data[0];
        setCenter([parseFloat(lat), parseFloat(lon)]);
        setZoom(13);
        mapRef.current?.flyTo([parseFloat(lat), parseFloat(lon)], 13);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (post: FoodPost) => {
    if (post.claimed) return "bg-yellow-500";
    return new Date(post.expiresAt) <= new Date() ? "bg-red-500" : "bg-green-500";
  };

  return (
    <Card className={cn("p-0 overflow-hidden", className)}>
      <div className="p-2 border-b flex gap-2">
        <Input
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Button 
          variant="secondary" 
          size="icon"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-[1000]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        
        <MapContainer 
          center={center} 
          zoom={zoom} 
          zoomControl={false}
          className="h-[600px] w-full rounded-lg"
          ref={mapRef}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={theme === 'dark' ? darkMap : lightMap}
          />
          {filteredPosts.map((post) => (
            <Marker
              key={post.id}
              position={[post.location.lat, post.location.lng]}
              eventHandlers={{
                click: () => onSelectPost?.(post),
              }}
            >
              <Popup className="rounded-lg shadow-lg">
                <div className="p-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(post))} />
                    <h3 className="font-semibold text-lg">{post.foodName}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{post.description}</p>
                  {post.quantity && (
                    <p className="text-sm">Quantity: {post.quantity}</p>
                  )}
                  {user && (
                    <p className="text-sm text-muted-foreground">
                      Distance: {calculateDistance(user.location, post.location).toFixed(1)} km
                    </p>
                  )}
                  <p className="text-sm font-medium">
                    Status: {post.claimed ? 'Reserved' : new Date(post.expiresAt) <= new Date() ? 'Completed' : 'Available'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
};

export default LeafletMap;
