import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Utensils, Clock, MapPin } from "lucide-react";
const LandingPage: React.FC = () => {
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center">
      {/* Navigation */}
      <header className="container w-full mx-auto px-8 py-6"> {/* Increased horizontal padding */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">dasher</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white">Sign up</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      {/* Removed specific margins/padding, relying on flex centering and container padding */}
      <main className="container px-4 py-16 flex-grow flex items-center justify-center"> 
        {/* Removed the grid layout to center the single content block */}
        <div className="w-full max-w-3xl"> {/* Adjusted max-width for single centered block */}
          <div className="flex flex-col items-center text-center"> 
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Fighting hunger by reducing <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">food waste</span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-8">
            dasher connects local businesses with surplus food to nearby shelters, food banks, and community fridges — making it easy to share food where it's needed most.
          </p>
          
          {/* Reduced horizontal gap between columns */}
          <div className="grid grid-cols-2 gap-x-64 gap-y-6 w-full mb-8"> 
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                 <Utensils className="h-6 w-6 text-green-500" />
               </div>
               <div className="text-left"> {/* Added text-left */}
                 <h3 className="font-semibold">Surplus Food</h3>
                 <p className="text-sm text-gray-400">Post available food in seconds</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                 <MapPin className="h-6 w-6 text-green-500" />
               </div>
               <div className="text-left"> {/* Added text-left */}
                 <h3 className="font-semibold">Location-Based</h3>
                 <p className="text-sm text-gray-400">Connect with nearby partners</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                 <Clock className="h-6 w-6 text-green-500" />
               </div>
               <div className="text-left"> {/* Added text-left */}
                 <h3 className="font-semibold">Real-Time</h3>
                 <p className="text-sm text-gray-400">Instant notifications</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                 <Rocket className="h-6 w-6 text-green-500" />
               </div>
               <div className="text-left"> {/* Added text-left */}
                 <h3 className="font-semibold">Smart Matching</h3>
                 <p className="text-sm text-gray-400">Find the perfect recipients</p>
              </div>
            </div>
          </div>
          
          <Link to="/signup">
            <Button className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-8 py-6 text-lg rounded-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
        {/* Removed the second grid item (Dashboard Preview) to focus on centering the text content */}
      </div> {/* This closes the flex container */}
    </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-auto w-full"> {/* Added w-full */}
        <div className="container mx-auto px-8 text-center text-gray-500 text-sm"> {/* Matched header padding */}
          <p>© 2025 dasher. Making food connections that matter.</p>
        </div>
      </footer>
    </div>;
};
export default LandingPage;
