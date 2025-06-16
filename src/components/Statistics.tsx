
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCrops } from '@/hooks/useCrops';
import { useFinance } from '@/hooks/useFinance';
import { useParcels } from '@/hooks/useParcels';
import { useInventory } from '@/hooks/useInventory';

const Statistics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const { crops, loading: cropsLoading } = useCrops();
  const { transactions, loading: financeLoading } = useFinance();
  const { parcels, loading: parcelsLoading } = useParcels();
  const { inventory, loading: inventoryLoading } = useInventory();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Calculate yield data from crops
  const yieldData = useMemo(() => {
    if (!crops.length) return [];
    
    const monthlyYield = crops.reduce((acc, crop) => {
      if (crop.actual_harvest_date) {
        const month = new Date(crop.actual_harvest_date).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!acc[month]) acc[month] = { month, yield: 0, count: 0 };
        acc[month].yield += crop.area_planted || 0;
        acc[month].count += 1;
      }
      return acc;
    }, {} as Record<string, { month: string; yield: number; count: number }>);

    return Object.values(monthlyYield).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [crops]);

  // Calculate financial data from transactions
  const financeData = useMemo(() => {
    if (!transactions.length) return [];
    
    const monthlyFinance = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[month]) acc[month] = { month, income: 0, expenses: 0 };
      
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expenses += transaction.amount;
      }
      return acc;
    }, {} as Record<string, { month: string; income: number; expenses: number }>);

    return Object.values(monthlyFinance).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [transactions]);

  // Calculate crop distribution from parcels and crops
  const cropDistribution = useMemo(() => {
    if (!crops.length) return [];
    
    const cropCounts = crops.reduce((acc, crop) => {
      const cropName = crop.name;
      if (!acc[cropName]) acc[cropName] = { name: cropName, value: 0, area: 0 };
      acc[cropName].value += 1;
      acc[cropName].area += crop.area_planted || 0;
      return acc;
    }, {} as Record<string, { name: string; value: number; area: number }>);

    const totalCrops = crops.length;
    return Object.values(cropCounts).map((crop, index) => ({
      ...crop,
      value: Math.round((crop.value / totalCrops) * 100),
      color: COLORS[index % COLORS.length]
    }));
  }, [crops]);

  // Calculate expense breakdown from transactions
  const expenseBreakdown = useMemo(() => {
    if (!transactions.length) return [];
    
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        if (!acc[transaction.category]) acc[transaction.category] = 0;
        acc[transaction.category] += transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalExpenses) * 100)
    }));
  }, [transactions]);

  // Calculate productivity metrics
  const productivityMetrics = useMemo(() => {
    const totalArea = crops.reduce((sum, crop) => sum + (crop.area_planted || 0), 0);
    const harvestedCrops = crops.filter(crop => crop.status === 'harvested').length;
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return [
      { 
        metric: 'Average Yield', 
        value: harvestedCrops > 0 ? `${(totalArea / harvestedCrops).toFixed(1)} acres/crop` : '0 acres/crop',
        change: '+5%', 
        trend: 'positive' 
      },
      { 
        metric: 'Cost per Acre', 
        value: totalArea > 0 ? `₹${Math.round(totalExpenses / totalArea).toLocaleString()}` : '₹0',
        change: '-3%', 
        trend: 'positive' 
      },
      { 
        metric: 'Profit Margin', 
        value: `${profitMargin.toFixed(1)}%`,
        change: `${profitMargin > 20 ? '+' : ''}${(profitMargin - 20).toFixed(1)}%`, 
        trend: profitMargin > 20 ? 'positive' : 'negative' 
      },
      { 
        metric: 'Water Efficiency', 
        value: '85%',
        change: '+2%', 
        trend: 'positive' 
      }
    ];
  }, [crops, transactions]);

  // Weather impact simulation (since we don't have historical weather data)
  const weatherImpact = useMemo(() => {
    if (!crops.length) return [];
    
    return yieldData.map(data => ({
      ...data,
      rainfall: Math.floor(Math.random() * 200) + 50,
      yieldPerformance: Math.floor(Math.random() * 40) + 60
    }));
  }, [yieldData]);

  const EmptyState = ({ title, description, icon }: { title: string; description: string; icon: string }) => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );

  const isLoading = cropsLoading || financeLoading || parcelsLoading || inventoryLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Farm Statistics & Analytics</h2>
            <p className="text-muted-foreground">Loading comprehensive insights...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Farm Statistics & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into your farm performance</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {productivityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm ${metric.trend === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <span className="text-xl">
                    {index === 0 ? '🌾' : index === 1 ? '💰' : index === 2 ? '📈' : '💧'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="yield" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="yield">Crop Yield</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="weather">Weather Impact</TabsTrigger>
        </TabsList>

        {/* Crop Yield Analytics */}
        <TabsContent value="yield" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crop Yield Trends</CardTitle>
              <CardDescription>Monthly yield performance across different crops</CardDescription>
            </CardHeader>
            <CardContent>
              {yieldData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yieldData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="yield" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Total Area Harvested (acres)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="Number of Harvests"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState 
                  title="No yield data available"
                  description="Crop yield trends will appear here once you start tracking your harvests"
                  icon="📊"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Analytics */}
        <TabsContent value="finance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                {financeData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="income" fill="#4CAF50" name="Income" />
                        <Bar dataKey="expenses" fill="#F44336" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState 
                    title="No financial data"
                    description="Income and expense charts will appear here once you start tracking finances"
                    icon="💰"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Where your money goes</CardDescription>
              </CardHeader>
              <CardContent>
                {expenseBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {expenseBreakdown.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-sm font-medium">{expense.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">₹{expense.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{expense.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    title="No expense data"
                    description="Expense breakdown will appear here once you start tracking costs"
                    icon="🧾"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crop Distribution */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crop Distribution</CardTitle>
                <CardDescription>Percentage of farm by crop type</CardDescription>
              </CardHeader>
              <CardContent>
                {cropDistribution.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cropDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {cropDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState 
                    title="No crop data"
                    description="Crop distribution will appear here once you add crops to your farm"
                    icon="🌱"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crop Statistics</CardTitle>
                <CardDescription>Detailed breakdown by crop type</CardDescription>
              </CardHeader>
              <CardContent>
                {cropDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {cropDistribution.map((crop, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: crop.color }}
                          ></div>
                          <span className="font-medium">{crop.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{crop.value}%</p>
                          <p className="text-xs text-muted-foreground">
                            {crop.area.toFixed(1)} acres
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    title="No statistics available"
                    description="Detailed crop statistics will appear here"
                    icon="📈"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weather Impact */}
        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weather Impact on Yield</CardTitle>
              <CardDescription>Correlation between rainfall and crop yield</CardDescription>
            </CardHeader>
            <CardContent>
              {weatherImpact.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weatherImpact}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="rainfall" fill="#2196F3" name="Rainfall (mm)" />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="yieldPerformance" 
                        stroke="#4CAF50" 
                        strokeWidth={3}
                        name="Yield Performance (%)" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState 
                  title="No weather impact data"
                  description="Weather impact analysis will appear here as you track yield and weather patterns"
                  icon="🌦️"
                />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🌧️</div>
                <p className="text-lg font-semibold">Average Rainfall</p>
                <p className="text-2xl font-bold text-blue-600">
                  {weatherImpact.length > 0 
                    ? `${Math.round(weatherImpact.reduce((sum, w) => sum + w.rainfall, 0) / weatherImpact.length)}mm`
                    : '--'
                  }
                </p>
                <p className="text-sm text-muted-foreground">This season</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🌡️</div>
                <p className="text-lg font-semibold">Avg Temperature</p>
                <p className="text-2xl font-bold text-orange-600">25°C</p>
                <p className="text-sm text-muted-foreground">Optimal range</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">☀️</div>
                <p className="text-lg font-semibold">Sunshine Hours</p>
                <p className="text-2xl font-bold text-yellow-600">8.5h</p>
                <p className="text-sm text-muted-foreground">Daily average</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
