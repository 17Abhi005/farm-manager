
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2, Lightbulb, TrendingUp, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Recommendation {
  crop: string;
  reason: string;
  confidence: number;
}

interface PreviousRecommendation {
  id: string;
  recommended_crop: string;
  reason: string;
  confidence_score: number;
  created_at: string;
  weather_data?: any;
  soil_data?: any;
}

const AIRecommendations: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [previousRecommendations, setPreviousRecommendations] = useState<PreviousRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    location: 'Mumbai, Maharashtra',
    soilType: '',
    previousCrops: '',
    season: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPreviousRecommendations();
    }
  }, [user]);

  const fetchPreviousRecommendations = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching previous recommendations for user:', user.id);
      const { data, error } = await supabase
        .from('crop_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching previous recommendations:', error);
        toast({
          title: "Error",
          description: "Failed to fetch previous recommendations",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Fetched recommendations:', data);
      setPreviousRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching previous recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch previous recommendations",
        variant: "destructive",
      });
    }
  };

  const deleteRecommendation = async (id: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }
    
    setDeletingId(id);
    console.log('Attempting to delete recommendation:', id);
    
    try {
      const { error } = await supabase
        .from('crop_recommendations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Successfully deleted recommendation:', id);
      
      // Update the UI immediately by filtering out the deleted recommendation
      setPreviousRecommendations(prev => {
        const updated = prev.filter(rec => rec.id !== id);
        console.log('Updated recommendations after delete:', updated);
        return updated;
      });
      
      toast({
        title: "Success",
        description: "Recommendation deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to delete recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getRecommendations = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to get AI recommendations",
        variant: "destructive",
      });
      return;
    }

    if (!formData.location || !formData.soilType || !formData.season) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    setRecommendations([]);
    
    try {
      console.log('Requesting AI recommendations with data:', formData);
      
      const { data, error } = await supabase.functions.invoke('ai-crop-recommendations', {
        body: {
          location: formData.location,
          soilType: formData.soilType,
          previousCrops: formData.previousCrops ? formData.previousCrops.split(',').map(c => c.trim()).filter(c => c) : [],
          season: formData.season
        }
      });

      console.log('AI recommendations response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        setError(error.message || 'Failed to get recommendations');
        toast({
          title: "Service Error",
          description: error.message || 'Failed to get recommendations',
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        setError(data.error);
        toast({
          title: "AI Service Notice",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
        // Refresh the previous recommendations list to include any newly saved ones
        await fetchPreviousRecommendations();
        
        toast({
          title: "Success",
          description: `Generated ${data.recommendations.length} AI recommendations`,
        });
      } else {
        setError('Invalid response format from AI service');
        toast({
          title: "Error",
          description: "Invalid response from AI service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI recommendations';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const isFormValid = formData.location && formData.soilType && formData.season;

  return (
    <div className="space-y-6">
      {/* AI Recommendation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-600" />
            AI Crop Recommendations
          </CardTitle>
          <CardDescription>
            Get personalized crop recommendations based on AI analysis of weather, soil, and market conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, Maharashtra"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type *</Label>
              <Select value={formData.soilType} onValueChange={(value) => setFormData({...formData, soilType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="loamy">Loamy</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="black">Black Cotton</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="alluvial">Alluvial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousCrops">Previous Crops (Optional)</Label>
              <Input
                id="previousCrops"
                placeholder="e.g., Rice, Wheat, Cotton"
                value={formData.previousCrops}
                onChange={(e) => setFormData({...formData, previousCrops: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season *</Label>
              <Select value={formData.season} onValueChange={(value) => setFormData({...formData, season: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kharif">Kharif (Monsoon)</SelectItem>
                  <SelectItem value="rabi">Rabi (Winter)</SelectItem>
                  <SelectItem value="zaid">Zaid (Summer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={getRecommendations} 
            disabled={loading || !isFormValid}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Recommendations...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Get AI Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Latest Recommendations
            </CardTitle>
            <CardDescription>AI-generated crop suggestions based on your inputs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {rec.crop}
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs text-white ${getConfidenceColor(rec.confidence)}`}>
                          {getConfidenceText(rec.confidence)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(rec.confidence * 100)}%
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700">{rec.reason}</p>
                    <div className="mt-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${getConfidenceColor(rec.confidence)}`}
                          style={{ width: `${rec.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Recommendations */}
      {previousRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Previous Recommendations ({previousRecommendations.length})
            </CardTitle>
            <CardDescription>Your recent AI recommendations history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previousRecommendations.map((rec) => (
                <div key={rec.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{rec.recommended_crop}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs text-white ${getConfidenceColor(rec.confidence_score)}`}>
                        {Math.round(rec.confidence_score * 100)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === rec.id}
                          >
                            {deletingId === rec.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Recommendation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this recommendation for "{rec.recommended_crop}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteRecommendation(rec.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{rec.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIRecommendations;
