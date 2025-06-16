
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCrops } from '@/hooks/useCrops';
import { useParcels } from '@/hooks/useParcels';
import { useInventory } from '@/hooks/useInventory';
import { useFinance } from '@/hooks/useFinance';

interface DashboardProps {
  onNavigate: (module: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { crops, loading: cropsLoading } = useCrops();
  const { parcels, loading: parcelsLoading } = useParcels();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { transactions, loading: financeLoading } = useFinance();

  const weatherData = {
    temperature: '--',
    humidity: '--',
    rainfall: '--',
    forecast: 'No data available'
  };

  // Calculate stats from actual data
  const activeCrops = crops.filter(crop => crop.status === 'growing' || crop.status === 'planted').length;
  const totalParcels = parcels.length;
  const inventoryItems = inventory.length;
  
  // Calculate monthly revenue from income transactions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transaction.type === 'income' && 
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((total, transaction) => total + transaction.amount, 0);

  const quickStats = [
    { label: 'Total Parcels', value: totalParcels.toString(), icon: '📍', color: 'bg-blue-500' },
    { label: 'Active Crops', value: activeCrops.toString(), icon: '🌱', color: 'bg-green-500' },
    { label: 'Inventory Items', value: inventoryItems.toString(), icon: '📦', color: 'bg-orange-500' },
    { label: 'Monthly Revenue', value: `₹${monthlyRevenue.toLocaleString()}`, icon: '💰', color: 'bg-purple-500' },
  ];

  // Show loading state if any data is still loading
  if (cropsLoading || parcelsLoading || inventoryLoading || financeLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-2">Welcome back, Farmer!</h2>
          <p className="text-primary-foreground/90">
            Loading your farm data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Welcome back, Farmer!</h2>
        <p className="text-primary-foreground/90">
          Manage your farm efficiently with our comprehensive agricultural management system.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🌦️</span>
              Weather Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-lg font-semibold">{weatherData.temperature}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-lg font-semibold">{weatherData.humidity}</p>
              </div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Today's Rainfall</p>
              <p className="text-lg font-semibold">{weatherData.rainfall}</p>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => onNavigate('weather')}
            >
              View Detailed Weather
            </Button>
          </CardContent>
        </Card>

        {/* Crop Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🌱</span>
              Crop Status
            </CardTitle>
            <CardDescription>Current status of your crops</CardDescription>
          </CardHeader>
          <CardContent>
            {crops.length > 0 ? (
              <div className="space-y-4">
                {crops.slice(0, 3).map((crop) => {
                  // Calculate progress based on crop status
                  const getProgress = (status: string) => {
                    switch (status) {
                      case 'planned': return 10;
                      case 'planted': return 30;
                      case 'growing': return 70;
                      case 'harvested': return 100;
                      default: return 0;
                    }
                  };

                  const progress = getProgress(crop.status);
                  
                  return (
                    <div key={crop.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{crop.name} {crop.variety && `(${crop.variety})`}</p>
                          <p className="text-sm text-muted-foreground">
                            {crop.area_planted ? `${crop.area_planted} acres` : 'Area not specified'} • {crop.status}
                          </p>
                        </div>
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
                {crops.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{crops.length - 3} more crops
                  </p>
                )}
                <Button 
                  className="w-full mt-4" 
                  onClick={() => onNavigate('crops')}
                >
                  Manage All Crops
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold mb-2">No crops added yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first crop</p>
                <Button onClick={() => onNavigate('crops')}>
                  Add Your First Crop
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used features for efficient farm management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('crops')}
            >
              <span className="text-2xl">🌱</span>
              <span className="text-sm">Add Crop</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('inventory')}
            >
              <span className="text-2xl">📦</span>
              <span className="text-sm">Check Inventory</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('finance')}
            >
              <span className="text-2xl">💰</span>
              <span className="text-sm">Add Expense</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('parcels')}
            >
              <span className="text-2xl">📍</span>
              <span className="text-sm">View Parcels</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
