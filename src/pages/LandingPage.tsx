
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Utensils, Clock, MapPin } from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
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
      <main className="container mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Fighting hunger by reducing <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">food waste</span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-8">
            Dasher connects local businesses with surplus food to nearby shelters, food banks, and community fridges — making it easy to share food where it's needed most.
          </p>
          
          <div className="grid grid-cols-2 gap-6 w-full mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Utensils className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Surplus Food</h3>
                <p className="text-sm text-gray-400">Post available food in seconds</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Location-Based</h3>
                <p className="text-sm text-gray-400">Connect with nearby partners</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Real-Time</h3>
                <p className="text-sm text-gray-400">Instant notifications</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Rocket className="h-6 w-6 text-green-500" />
              </div>
              <div>
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
        
        {/* Dashboard Preview */}
        <div className="relative">
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,255,215,0.15),rgba(0,0,0,0))]"></div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="h-5 w-24 bg-gray-700 rounded-md"></div>
              </div>
              
              <div className="flex">
                {/* Sidebar mockup */}
                <div className="w-1/5 bg-gray-800 rounded-lg mr-2 p-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-green-500"></div>
                    <div className="h-2 w-16 bg-gray-700 rounded-md"></div>
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 mb-2 flex items-center rounded px-2 bg-gray-700/50">
                      <div className="w-4 h-4 rounded-sm bg-green-500/30 mr-2"></div>
                      <div className="h-2 w-12 bg-gray-600 rounded-md"></div>
                    </div>
                  ))}
                </div>
                
                {/* Content mockup */}
                <div className="w-4/5 bg-gray-800/50 rounded-lg p-3">
                  <div className="h-8 w-full bg-gray-700 rounded-md mb-4"></div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-28 bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between mb-2">
                          <div className="h-3 w-20 bg-green-500/30 rounded-md"></div>
                          <div className="h-3 w-10 bg-gray-600 rounded-md"></div>
                        </div>
                        <div className="h-2 w-full bg-gray-600 rounded-md mb-1"></div>
                        <div className="h-2 w-3/4 bg-gray-600 rounded-md mb-3"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-600"></div>
                          <div className="h-6 w-20 bg-green-500/40 rounded-md"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="h-48 bg-gray-700 rounded-lg w-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -z-10 -bottom-6 -right-6 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -z-10 -top-6 -left-6 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2025 Dasher. Making food connections that matter.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
