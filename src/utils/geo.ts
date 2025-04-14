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

// Get current location using browser geolocation API with timeout
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Geolocation request timed out"));
    }, 10000);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error("Error getting location:", error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// Get address from coordinates using reverse geocoding with OpenStreetMap
export async function getAddressFromCoordinates(location: Location): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    throw new Error('No address found');
  } catch (error) {
    console.error('Error getting address:', error);
    throw error;
  }
}
