
import React, { useEffect, useRef, useState } from "react";
import { FoodPost } from "@/types";
import { useUser } from "@/contexts/UserContext";

interface GoogleMapProps {
  posts: FoodPost[];
  onSelectPost: (post: FoodPost) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ posts, onSelectPost }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { user } = useUser();

  // Load Google Maps script
  useEffect(() => {
    const googleMapsApiKey = "AIzaSyBnOkQE4NWJlU1hvwjWl7v_-lPt8s4pj_4"; // Placeholder key
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    script.onload = initializeMap;
    
    return () => {
      // Clean up markers when component unmounts
      markers.forEach(marker => marker.setMap(null));
    };
  }, []);

  // Initialize the map
  const initializeMap = () => {
    if (!mapRef.current || !user) return;
    
    const mapOptions: google.maps.MapOptions = {
      center: { lat: user.location.lat, lng: user.location.lng },
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    };
    
    const newMap = new google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);
    
    // Add user marker
    const userIcon = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: user.role === "business" ? "#34d399" : "#3b82f6",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#ffffff",
      scale: 8,
    };
    
    new google.maps.Marker({
      position: { lat: user.location.lat, lng: user.location.lng },
      map: newMap,
      icon: userIcon,
      title: "Your Location",
      zIndex: 999
    });
  };

  // Update markers when posts change
  useEffect(() => {
    if (!map) return;
    
    // Clear old markers
    markers.forEach(marker => marker.setMap(null));
    
    // Create new markers
    const newMarkers = posts.map(post => {
      const marker = new google.maps.Marker({
        position: { lat: post.location.lat, lng: post.location.lng },
        map: map,
        title: post.foodName,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          fillColor: "#f97316",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
          scale: 6,
        }
      });
      
      marker.addListener("click", () => {
        onSelectPost(post);
      });
      
      return marker;
    });
    
    setMarkers(newMarkers);
    
    // Fit map to include all markers if there are any
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      // Add user location
      if (user) {
        bounds.extend({ lat: user.location.lat, lng: user.location.lng });
      }
      
      // Add all post locations
      posts.forEach(post => {
        bounds.extend({ lat: post.location.lat, lng: post.location.lng });
      });
      
      map.fitBounds(bounds);
      
      // Don't zoom in too far
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 15) map.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, posts, user]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg" />;
};

export default GoogleMap;
