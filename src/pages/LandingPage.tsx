import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const LandingPage: React.FC = () => {
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Dasher</span>
          </div>
          <div className="flex space-x-6">
            <Link to="#product" className="text-gray-300 hover:text-white transition-colors">Product</Link>
            <Link to="#mission" className="text-gray-300 hover:text-white transition-colors">Mission</Link>
            <Link to="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="#resources" className="text-gray-300 hover:text-white transition-colors">Resources</Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">Sign up</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 max-w-5xl">
          The only <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-pink-500">autonomous</span> project management tool
        </h1>
        
        
        
        
        
        <Link to="/signup">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-lg animate-pulse">
            Get Started Now
          </Button>
        </Link>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-auto">
        
      </footer>
    </div>;
};
export default LandingPage;