
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const MarketInsights: React.FC = () => {
  const [marketData, setMarketData] = useState([]);

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = (change: number) => {
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const marketsRising = marketData.filter(item => item.trend === 'up').length;
  const marketsFalling = marketData.filter(item => item.trend === 'down').length;
  const avgChangeNum = marketData.length > 0 
    ? (marketData.reduce((sum, item) => sum + item.change, 0) / marketData.length)
    : 0;
  const avgChange = avgChangeNum.toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Market Insights</h2>
          <p className="text-muted-foreground">Live crop prices and market trends</p>
        </div>
        <Button>
          <BarChart3 className="w-4 h-4 mr-2" />
          View Detailed Analysis
        </Button>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Markets Rising</p>
                <p className="text-2xl font-bold text-green-900">{marketsRising}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Markets Falling</p>
                <p className="text-2xl font-bold text-red-900">{marketsFalling}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Avg. Change</p>
                <p className="text-2xl font-bold text-blue-900">{avgChangeNum > 0 ? '+' : ''}{avgChange}%</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Market Prices</CardTitle>
          <CardDescription>Latest prices from major Agricultural Produce Market Committees (APMCs)</CardDescription>
        </CardHeader>
        <CardContent>
          {marketData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No market data available</h3>
              <p className="text-muted-foreground mb-4">Market prices will appear here once data is available</p>
              <Button variant="outline">Add Market Data</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData.map((item, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{item.crop}</h3>
                      {getTrendIcon(item.trend)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <span className="font-bold text-lg">₹{item.currentPrice.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Unit</span>
                        <span className="text-sm">{item.unit}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Change</span>
                        <Badge className={getChangeColor(item.change)}>
                          {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">{item.market}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Market Analysis</CardTitle>
          <CardDescription>Key insights and trends affecting crop prices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">No analysis data available</h3>
            <p className="text-muted-foreground">Market insights and trends will appear here once data is available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketInsights;
