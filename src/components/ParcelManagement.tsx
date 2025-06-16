
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useParcels } from '@/hooks/useParcels';

const ParcelManagement: React.FC = () => {
  const { parcels, loading, addParcel, updateParcelStatus } = useParcels();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<string | null>(null);

  const [newParcel, setNewParcel] = useState({
    name: '',
    area: '',
    soil_type: '',
    location: '',
    coordinates: '',
    notes: ''
  });

  const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Sandy Loam', 'Silt', 'Alluvial', 'Black Cotton', 'Red Soil'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cultivated': return 'bg-green-500';
      case 'Fallow': return 'bg-yellow-500';
      case 'Preparing': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAddParcel = async () => {
    if (!newParcel.name || !newParcel.area || !newParcel.soil_type) {
      return;
    }

    const result = await addParcel(newParcel);
    
    if (result?.success) {
      // Reset form
      setNewParcel({
        name: '',
        area: '',
        soil_type: '',
        location: '',
        coordinates: '',
        notes: ''
      });
      setShowAddForm(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Parcel Management</h2>
            <p className="text-muted-foreground">Manage your farm plots and land parcels</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading parcels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Parcel Management</h2>
          <p className="text-muted-foreground">Manage your farm plots and land parcels</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Parcel'}
        </Button>
      </div>

      {/* Map Integration Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">🗺️</span>
            Farm Map Overview
          </CardTitle>
          <CardDescription>Geographic view of your farm parcels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-green-100 to-green-200 h-64 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300">
            <div className="text-center">
              <div className="text-4xl mb-2">🌍</div>
              <p className="text-lg font-medium text-green-700">Interactive Map</p>
              <p className="text-green-600">Visual representation of your farm parcels</p>
              <Button variant="outline" className="mt-4">
                View Detailed Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Parcel Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Parcel</CardTitle>
            <CardDescription>Enter details for your new land parcel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parcelName">Parcel Name *</Label>
                <Input
                  id="parcelName"
                  placeholder="e.g., Parcel A1"
                  value={newParcel.name}
                  onChange={(e) => setNewParcel(prev => ({...prev, name: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area (acres) *</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="e.g., 2.5"
                  value={newParcel.area}
                  onChange={(e) => setNewParcel(prev => ({...prev, area: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type *</Label>
                <Select 
                  value={newParcel.soil_type} 
                  onValueChange={(value) => setNewParcel(prev => ({...prev, soil_type: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map((soil) => (
                      <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., North Field"
                  value={newParcel.location}
                  onChange={(e) => setNewParcel(prev => ({...prev, location: e.target.value}))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="coordinates">GPS Coordinates</Label>
                <Input
                  id="coordinates"
                  placeholder="e.g., 28.7041° N, 77.1025° E"
                  value={newParcel.coordinates}
                  onChange={(e) => setNewParcel(prev => ({...prev, coordinates: e.target.value}))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this parcel..."
                  value={newParcel.notes}
                  onChange={(e) => setNewParcel(prev => ({...prev, notes: e.target.value}))}
                />
              </div>
            </div>

            <Button onClick={handleAddParcel} className="w-full">
              Add Parcel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Parcels List */}
      {parcels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parcels.map((parcel) => (
            <Card key={parcel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{parcel.name}</CardTitle>
                    <CardDescription>{parcel.location}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(parcel.status)}>
                    {parcel.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p className="font-medium">{parcel.area} acres</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Soil Type</p>
                    <p className="font-medium">{parcel.soil_type}</p>
                  </div>
                </div>

                {parcel.coordinates && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Coordinates</p>
                    <p className="font-medium">{parcel.coordinates}</p>
                  </div>
                )}

                {parcel.crops.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Crops</p>
                    <div className="flex flex-wrap gap-1">
                      {parcel.crops.map((crop, index) => (
                        <Badge key={index} variant="outline">{crop}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {parcel.notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Notes</p>
                    <p className="text-xs bg-muted p-2 rounded">{parcel.notes}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select 
                    value={parcel.status} 
                    onValueChange={(value) => updateParcelStatus(parcel.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fallow">Fallow</SelectItem>
                      <SelectItem value="Preparing">Preparing</SelectItem>
                      <SelectItem value="Cultivated">Cultivated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedParcel(parcel.name)}
                >
                  View on Map
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2">No parcels added yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first land parcel</p>
            <Button onClick={() => setShowAddForm(true)}>Add Your First Parcel</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParcelManagement;
