
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingContactForm from '@/components/LandingContactForm';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🌾</span>
              </div>
              <div>
               <Link to="/">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                  FarmManager
                </h1>
                </Link>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="flex items-center space-x-2 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <LandingContactForm />
    </div>
  );
};

export default Contact;
