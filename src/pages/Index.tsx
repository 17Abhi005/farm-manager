
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "@/components/Dashboard";
import Navigation from "@/components/Navigation";
import CropManagement from "@/components/CropManagement";
import ParcelManagement from "@/components/ParcelManagement";
import InventoryManagement from "@/components/InventoryManagement";
import FinanceManagement from "@/components/FinanceManagement";
import WeatherModule from "@/components/WeatherModule";
import Statistics from "@/components/Statistics";
import AIRecommendations from "@/components/AIRecommendations";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import FileManagement from "@/components/FileManagement";
import UserMenu from "@/components/UserMenu";
import ProfilePage from "@/components/ProfilePage";
import SettingsPage from "@/components/SettingsPage";
import NotificationsPage from "@/components/NotificationsPage";
import ContactPage from "@/components/ContactPage";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState('dashboard');

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveModule} />;
      case 'crops':
        return <CropManagement />;
      case 'parcels':
        return <ParcelManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'finance':
        return <FinanceManagement />;
      case 'weather':
        return <WeatherModule />;
      case 'statistics':
        return <Statistics />;
      case 'ai-recommendations':
        return <AIRecommendations />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'files':
        return <FileManagement />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <Dashboard onNavigate={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🌾</div>
                <h1 className="text-3xl font-bold text-green-700 tracking-tight">FarmManager</h1>
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300"></div>
              <span className="text-base text-gray-600 font-medium hidden md:inline">
                Welcome back, {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <UserMenu onNavigate={setActiveModule} />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation 
        activeModule={activeModule} 
        onModuleChange={setActiveModule} 
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveModule()}
      </main>
    </div>
  );
};

export default Index;
