
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useCrops, Crop } from '@/hooks/useCrops';
import { Plus, Calendar, MapPin, Sprout, Trash2, Edit3 } from 'lucide-react';

const CropManagement: React.FC = () => {
  const { crops, loading, addCrop, updateCrop, deleteCrop } = useCrops();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<string | null>(null);
  const [newCrop, setNewCrop] = useState({
    name: '',
    variety: '',
    area_planted: 0,
    planting_date: '',
    expected_harvest_date: '',
    status: 'planned' as const,
    notes: ''
  });

  const indianCrops = [
    'Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Sorghum', 'Pearl Millet',
    'Finger Millet', 'Barley', 'Chickpea', 'Pigeon Pea', 'Lentil', 'Black Gram',
    'Green Gram', 'Field Pea', 'Groundnut', 'Soybean', 'Sunflower', 'Safflower',
    'Sesame', 'Niger', 'Mustard', 'Linseed', 'Castor'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planted': return 'bg-green-100 text-green-800 border-green-200';
      case 'growing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'harvested': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'planned': return 10;
      case 'planted': return 25;
      case 'growing': return 75;
      case 'harvested': return 100;
      default: return 10;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return '📋';
      case 'planted': return '🌱';
      case 'growing': return '🌿';
      case 'harvested': return '🌾';
      default: return '📋';
    }
  };

  const handleAddCrop = async () => {
    if (!newCrop.name || !newCrop.area_planted) {
      return;
    }

    try {
      await addCrop(newCrop);
      setNewCrop({
        name: '',
        variety: '',
        area_planted: 0,
        planting_date: '',
        expected_harvest_date: '',
        status: 'planned',
        notes: ''
      });
      setShowAddForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const updateCropStatus = async (id: string, newStatus: string) => {
    try {
      await updateCrop(id, { status: newStatus as Crop['status'] });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteCrop = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await deleteCrop(id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-green-900 mb-2">🌱 Crop Management</h2>
            <p className="text-green-700">Plan, track and manage your agricultural crops efficiently</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {showAddForm ? 'Cancel' : 'Add New Crop'}
          </Button>
        </div>
      </div>

      {/* Add Crop Form */}
      {showAddForm && (
        <Card className="shadow-lg border-2 border-green-100">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-900 flex items-center">
              <Sprout className="w-6 h-6 mr-2" />
              Add New Crop
            </CardTitle>
            <CardDescription>Enter details for your new crop cultivation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cropName" className="text-sm font-medium">Crop Name *</Label>
                <Select 
                  value={newCrop.name} 
                  onValueChange={(value) => setNewCrop({...newCrop, name: value})}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianCrops.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety" className="text-sm font-medium">Variety</Label>
                <Input
                  id="variety"
                  placeholder="e.g., Pusa Basmati 1121"
                  value={newCrop.variety}
                  onChange={(e) => setNewCrop({...newCrop, variety: e.target.value})}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area" className="text-sm font-medium">Area (acres) *</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="e.g., 2.5"
                  value={newCrop.area_planted}
                  onChange={(e) => setNewCrop({...newCrop, area_planted: parseFloat(e.target.value) || 0})}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantingDate" className="text-sm font-medium">Planting Date</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={newCrop.planting_date}
                  onChange={(e) => setNewCrop({...newCrop, planting_date: e.target.value})}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate" className="text-sm font-medium">Expected Harvest Date</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={newCrop.expected_harvest_date}
                  onChange={(e) => setNewCrop({...newCrop, expected_harvest_date: e.target.value})}
                  className="h-11"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this crop..."
                  value={newCrop.notes}
                  onChange={(e) => setNewCrop({...newCrop, notes: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <Button onClick={handleAddCrop} className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Crop to Farm
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map((crop) => (
          <Card key={crop.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <span className="text-2xl mr-2">{getStatusIcon(crop.status)}</span>
                    {crop.name}
                  </CardTitle>
                  {crop.variety && (
                    <CardDescription className="text-sm mt-1 font-medium text-gray-600">
                      {crop.variety}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCrop(editingCrop === crop.id ? null : crop.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCrop(crop.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Badge className={`w-fit ${getStatusColor(crop.status)} border`}>
                {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Area</p>
                    <p className="font-semibold">{crop.area_planted} acres</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Sprout className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold capitalize">{crop.status}</p>
                  </div>
                </div>
                {crop.planting_date && (
                  <div className="flex items-center col-span-2">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Planted</p>
                      <p className="font-semibold">{new Date(crop.planting_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {crop.expected_harvest_date && (
                  <div className="flex items-center col-span-2">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Expected Harvest</p>
                      <p className="font-semibold">{new Date(crop.expected_harvest_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {crop.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{crop.notes}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-green-600">{getProgressValue(crop.status)}%</span>
                </div>
                <Progress value={getProgressValue(crop.status)} className="h-3" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Update Status</Label>
                <Select 
                  value={crop.status} 
                  onValueChange={(value) => updateCropStatus(crop.id, value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">📋 Planned</SelectItem>
                    <SelectItem value="planted">🌱 Planted</SelectItem>
                    <SelectItem value="growing">🌿 Growing</SelectItem>
                    <SelectItem value="harvested">🌾 Harvested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {crops.length === 0 && !loading && (
        <Card className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-green-200">
          <CardContent>
            <div className="text-8xl mb-6">🌾</div>
            <h3 className="text-2xl font-bold mb-4 text-green-900">No crops added yet</h3>
            <p className="text-green-700 mb-6 text-lg">Start your agricultural journey by adding your first crop</p>
            <Button 
              onClick={() => setShowAddForm(true)} 
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Crop
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CropManagement;
