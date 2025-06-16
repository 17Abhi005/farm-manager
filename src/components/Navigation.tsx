
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Sprout, 
  MapPin, 
  Package, 
  DollarSign, 
  Cloud, 
  BarChart3,
  Brain,
  Bell,
  Upload
} from 'lucide-react';

interface NavigationProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeModule, onModuleChange }) => {
  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'crops', label: 'Crops', icon: Sprout },
    { id: 'ai-recommendations', label: 'AI Recommendations', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'files', label: 'Files', icon: Upload },
    { id: 'parcels', label: 'Parcels', icon: MapPin },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-4 overflow-x-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Button
                key={module.id}
                variant={activeModule === module.id ? 'default' : 'ghost'}
                onClick={() => onModuleChange(module.id)}
                className={`flex items-center space-x-2 whitespace-nowrap ${
                  activeModule === module.id 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{module.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
