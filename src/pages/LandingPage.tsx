
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
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
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-10 max-w-6xl mx-auto my-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-gray-200">
                <span className="inline-flex px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">Engineering</span>
                <span>Optimize SQL queries on sign up endpoint</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <span className="inline-flex px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs">Design</span>
                <span>Wireframes for user dashboard</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <span className="inline-flex px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">Engineering</span>
                <span>Integrate Stripe Checkout</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <span className="inline-flex px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">Engineering</span>
                <span>REST API for order management</span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-gray-200">
                <span className="inline-flex px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">Marketing</span>
                <span>Revise copy for product tour</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <span className="inline-flex px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs">Product</span>
                <span>Memory leak in fileproxy server</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <span className="inline-flex px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">Bug</span>
                <span>Fix icons on homepage</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <span className="inline-flex px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs">Feature</span>
                <span>Integrate chat bot to support</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-lg mb-12">
          <h2 className="text-2xl font-semibold mb-4">Owners</h2>
          <ul className="flex flex-col items-start gap-2 ml-8">
            <li className="flex items-center gap-2">• Alexis Doe: Designer</li>
            <li className="flex items-center gap-2">• Taylor Craig: Engineer</li>
          </ul>
        </div>
        
        <Link to="/signup">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-lg animate-pulse">
            Get Started Now
          </Button>
        </Link>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 font-bold text-xl">
            Dasher
          </div>
          <div className="text-gray-400 mt-4 md:mt-0">
            curated by <span className="font-bold text-white">Mobbin</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
