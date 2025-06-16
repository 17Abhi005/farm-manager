
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventory } from '@/hooks/useInventory';

const InventoryManagement: React.FC = () => {
  const { inventory, loading, addItem, updateQuantity } = useInventory();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('seeds');

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'seeds',
    quantity: '',
    unit: '',
    minThreshold: '',
    price: '',
    supplier: '',
    expiryDate: '',
    location: ''
  });

  const categories = [
    { id: 'seeds', name: 'Seeds', icon: '🌱' },
    { id: 'fertilizers', name: 'Fertilizers', icon: '🧪' },
    { id: 'pesticides', name: 'Pesticides', icon: '🛡️' },
    { id: 'tools', name: 'Tools', icon: '🔧' }
  ];

  const units = ['kg', 'bags', 'liters', 'pieces', 'tons', 'packets'];

  const getStockStatus = (quantity: number, minThreshold: number) => {
    if (quantity <= minThreshold) return { status: 'Low', color: 'bg-red-500' };
    if (quantity <= minThreshold * 2) return { status: 'Medium', color: 'bg-yellow-500' };
    return { status: 'Good', color: 'bg-green-500' };
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.unit) {
      return;
    }

    const result = await addItem(newItem);
    if (result?.success) {
      setNewItem({
        name: '',
        category: 'seeds',
        quantity: '',
        unit: '',
        minThreshold: '',
        price: '',
        supplier: '',
        expiryDate: '',
        location: ''
      });
      setShowAddForm(false);
    }
  };

  const filteredInventory = inventory.filter(item => item.category === activeCategory);
  const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Track and manage your agricultural supplies</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Item'}
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <span className="mr-2">⚠️</span>
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-2">The following items are running low:</p>
            <div className="space-y-1">
              {lowStockItems.map(item => (
                <p key={item.id} className="text-sm">
                  • {item.name} - {item.quantity} {item.unit} remaining
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Inventory Item</CardTitle>
            <CardDescription>Enter details for your new inventory item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  placeholder="e.g., Basmati Rice Seeds"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={newItem.category} 
                  onValueChange={(value) => setNewItem({...newItem, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="50"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select 
                  value={newItem.unit} 
                  onValueChange={(value) => setNewItem({...newItem, unit: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minThreshold">Minimum Threshold</Label>
                <Input
                  id="minThreshold"
                  type="number"
                  placeholder="10"
                  value={newItem.minThreshold}
                  onChange={(e) => setNewItem({...newItem, minThreshold: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price per Unit (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="80"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Supplier name"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Warehouse A"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                />
              </div>
            </div>

            <Button onClick={handleAddItem} className="w-full">
              Add to Inventory
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Inventory Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {filteredInventory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.quantity, item.minThreshold);
                  return (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <CardDescription>{item.supplier}</CardDescription>
                          </div>
                          <Badge className={stockStatus.color}>
                            {stockStatus.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium text-lg">{item.quantity} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min. Required</p>
                            <p className="font-medium">{item.minThreshold} {item.unit}</p>
                          </div>
                          {item.price > 0 && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Price/Unit</p>
                                <p className="font-medium">₹{item.price}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total Value</p>
                                <p className="font-medium">₹{(item.quantity * item.price).toLocaleString()}</p>
                              </div>
                            </>
                          )}
                        </div>

                        {item.location && (
                          <div className="text-sm">
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{item.location}</p>
                          </div>
                        )}

                        {item.expiryDate && (
                          <div className="text-sm">
                            <p className="text-muted-foreground">Expires On</p>
                            <p className="font-medium">{new Date(item.expiryDate).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="h-8 text-center"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          >
                            -
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">
                    {categories.find(c => c.id === category.id)?.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No {category.name.toLowerCase()} in inventory</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first item</p>
                  <Button onClick={() => setShowAddForm(true)}>Add {category.name}</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default InventoryManagement;
