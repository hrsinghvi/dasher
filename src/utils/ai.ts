
import { FoodPost, User, RecommendedMatch } from "@/types";
import { calculateDistance } from "./geo";
import { v4 as uuidv4 } from "./uuid";

// Helper function to calculate similarity score between food post and charity preference
export function calculateMatchScore(post: FoodPost, charity: User): number {
  // Distance factor - closer is better (max 10km)
  const distance = calculateDistance(post.location, charity.location);
  const distanceScore = Math.max(0, 10 - distance) / 10; // 0-1 score (1 is best)
  
  // Category preference factor
  const categoryScore = charity.preferences?.foodCategories?.includes(post.category) ? 1 : 0.3;
  
  // Reliability factor (0-1 score)
  const reliabilityScore = (charity.reliability || 70) / 100;
  
  // Weighted score calculation
  const score = (distanceScore * 0.5) + (categoryScore * 0.3) + (reliabilityScore * 0.2);
  
  return score;
}

// Find recommended charities for a food post
export function findMatchingCharities(post: FoodPost, charities: User[]): RecommendedMatch[] {
  // Filter out non-charity users and calculate match scores
  const matches = charities
    .filter(user => user.role === "charity")
    .map(charity => {
      const distance = calculateDistance(post.location, charity.location);
      const score = calculateMatchScore(post, charity);
      
      // Generate a match reason
      let matchReason = "";
      
      if (charity.preferences?.foodCategories?.includes(post.category)) {
        matchReason = `Prefers ${post.category} food`;
      } else if (distance < 3) {
        matchReason = "Very close location";
      } else if (charity.reliability && charity.reliability > 80) {
        matchReason = "Highly reliable pickup history";
      } else {
        matchReason = "General match";
      }
      
      return {
        charityId: charity.id,
        charityName: charity.name,
        score,
        distance,
        matchReason
      };
    })
    .filter(match => match.distance <= 20) // Only include charities within 20km
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, 3); // Get top 3
  
  return matches;
}

// Detect duplicate food posts
export function detectDuplicatePost(newPost: Partial<FoodPost>, existingPosts: FoodPost[]): boolean {
  // Filter to only recent posts from the same business
  const recentPosts = existingPosts.filter(post => 
    post.businessId === newPost.businessId &&
    new Date(post.timestamp) >= new Date(Date.now() - 24 * 60 * 60 * 1000) // Posted in last 24 hours
  );
  
  // If no recent posts, then definitely not a duplicate
  if (recentPosts.length === 0) return false;
  
  // Check for exact title match
  const exactMatch = recentPosts.some(post => 
    post.foodName.toLowerCase() === newPost.foodName?.toLowerCase()
  );
  
  if (exactMatch) return true;
  
  // Check for similarity in title and quantity
  const similarMatch = recentPosts.some(post => {
    // Simple similarity check based on words in title
    const existingWords = post.foodName.toLowerCase().split(' ');
    const newWords = newPost.foodName?.toLowerCase().split(' ') || [];
    
    const commonWords = existingWords.filter(word => 
      word.length > 3 && newWords.includes(word)
    );
    
    // If more than 50% of significant words match, consider it similar
    const similarity = commonWords.length / Math.max(existingWords.length, newWords.length);
    
    return similarity > 0.5;
  });
  
  return similarMatch;
}
