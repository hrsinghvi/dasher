
type Location = {
  lat: number;
  lng: number;
};

// Calculate distance in kilometers between two coordinates using the Haversine formula
export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = deg2rad(loc2.lat - loc1.lat);
  const dLng = deg2rad(loc2.lng - loc1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get current location using browser geolocation API
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        
        // Fallback to default location (San Francisco)
        resolve({
          lat: 37.7749,
          lng: -122.4194
        });
      }
    );
  });
}

// Get mock locations around a center point
export function getMockLocationsAround(center: Location, count: number, radiusKm: number): Location[] {
  const locations: Location[] = [];
  
  for (let i = 0; i < count; i++) {
    // Random angle
    const angle = Math.random() * 2 * Math.PI;
    // Random radius (adjusting to get a good distribution)
    const radius = Math.sqrt(Math.random()) * radiusKm;
    
    // Earth radius in km
    const earthRadius = 6371;
    
    // Calculate offsets
    const latOffset = (radius / earthRadius) * (180 / Math.PI);
    const lngOffset = (radius / earthRadius) * (180 / Math.PI) / Math.cos(center.lat * Math.PI / 180);
    
    // Calculate new position
    const lat = center.lat + latOffset * Math.cos(angle);
    const lng = center.lng + lngOffset * Math.sin(angle);
    
    locations.push({ lat, lng });
  }
  
  return locations;
}

// Get address from coordinates using reverse geocoding (simplified mock version)
export function getAddressFromCoordinates(location: Location): Promise<string> {
  // In a real app, we would use a geocoding service like Google Maps API
  // For this demo, we'll simulate with random addresses
  return new Promise((resolve) => {
    setTimeout(() => {
      const streetNames = [
        "Main Street", "Oak Avenue", "Maple Drive", "Cedar Lane", 
        "Pine Road", "Elm Street", "Washington Avenue", "Park Place"
      ];
      const cityNames = ["Springfield", "Riverdale", "Maplewood", "Oakville", "Pinecrest"];
      
      const streetNumber = Math.floor(Math.random() * 1000) + 1;
      const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
      const cityName = cityNames[Math.floor(Math.random() * cityNames.length)];
      
      resolve(`${streetNumber} ${streetName}, ${cityName}`);
    }, 300); // Simulate network delay
  });
}
