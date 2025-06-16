
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWeather } from '@/hooks/useWeather';
import { MapPin, RefreshCw } from 'lucide-react';

const WeatherModule: React.FC = () => {
  const { toast } = useToast();
  const { weather, currentWeather, loading, fetchWeather } = useWeather();
  const [location, setLocation] = useState('Mumbai, India');
  const [selectedDay, setSelectedDay] = useState(0);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch weather data on component mount
    fetchWeather(location);
  }, []);

  const handleLocationUpdate = () => {
    if (location.trim()) {
      fetchWeather(location);
    }
  };

  const getConditionAdvice = (condition: string) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain')) {
      return 'Good for water storage. Avoid field operations.';
    } else if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return 'Perfect for harvesting and drying crops.';
    } else if (conditionLower.includes('cloud')) {
      return 'Suitable for transplanting activities.';
    } else if (conditionLower.includes('storm')) {
      return 'Stay indoors. Secure loose farm equipment.';
    }
    return 'Monitor weather conditions regularly.';
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('storm')) return '⛈️';
    if (conditionLower.includes('snow')) return '❄️';
    return '🌤️';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Weather & Climate</h2>
          <p className="text-muted-foreground">Real-time weather monitoring and agricultural advisories</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="w-48"
            />
          </div>
          <Button 
            onClick={handleLocationUpdate}
            disabled={loading}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Update
          </Button>
        </div>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${alert.type === 'warning' ? 'border-l-orange-500 bg-orange-50' : 'border-l-blue-500 bg-blue-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold flex items-center">
                      <span className="mr-2">{alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                      {alert.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Current Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🌡️</span>
              Current Weather - {location}
            </CardTitle>
            <CardDescription>Real-time weather conditions</CardDescription>
          </CardHeader>
          <CardContent>
            {currentWeather ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl mb-2">🌡️</div>
                    <p className="text-2xl font-bold">{currentWeather.temp_c}°C</p>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl mb-2">💧</div>
                    <p className="text-2xl font-bold">{currentWeather.humidity}%</p>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl mb-2">🌧️</div>
                    <p className="text-2xl font-bold">{currentWeather.precip_mm}mm</p>
                    <p className="text-sm text-muted-foreground">Precipitation</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl mb-2">💨</div>
                    <p className="text-2xl font-bold">{currentWeather.wind_kph} km/h</p>
                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Agricultural Advice</h4>
                  <p className="text-sm">{getConditionAdvice(currentWeather.condition?.text)}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🌤️</div>
                <h3 className="text-xl font-semibold mb-2">No weather data available</h3>
                <p className="text-muted-foreground">Click "Update" to fetch current weather data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Weather Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentWeather ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Feels Like</span>
                  <span className="font-medium">{currentWeather.feelslike_c}°C</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">UV Index</span>
                  <Badge className={currentWeather.uv > 7 ? 'bg-red-500' : currentWeather.uv > 5 ? 'bg-orange-500' : 'bg-green-500'}>
                    {currentWeather.uv}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Visibility</span>
                  <span className="font-medium">{currentWeather.vis_km} km</span>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Condition</p>
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getWeatherIcon(currentWeather.condition?.text)}</span>
                    <span>{currentWeather.condition?.text}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🌡️</div>
                <p className="text-muted-foreground text-sm">Weather details will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Forecast */}
      {weather.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>7-Day Forecast</CardTitle>
            <CardDescription>Extended weather outlook for farm planning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {weather.map((day, index) => (
                <div
                  key={day.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedDay === index ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDay(index)}
                >
                  <div className="text-center">
                    <p className="font-medium text-sm mb-2">
                      {new Date(day.forecast_date).toLocaleDateString('en', { weekday: 'short' })}
                    </p>
                    <div className="text-4xl mb-2">{getWeatherIcon(day.conditions)}</div>
                    <p className="text-xs text-muted-foreground mb-2">{day.conditions}</p>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{Math.round(day.temperature)}°C</p>
                      <div className="flex items-center justify-center text-xs">
                        <span className="mr-1">🌧️</span>
                        <span>{day.rainfall}mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedDay !== null && weather[selectedDay] && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  {new Date(weather[selectedDay].forecast_date).toLocaleDateString('en', { weekday: 'long' })} - {weather[selectedDay].conditions}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {getConditionAdvice(weather[selectedDay].conditions)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>7-Day Forecast</CardTitle>
            <CardDescription>Extended weather outlook for farm planning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">No forecast data available</h3>
              <p className="text-muted-foreground">7-day weather forecast will appear here once data is fetched</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherModule;
