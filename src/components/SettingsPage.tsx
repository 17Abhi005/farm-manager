import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Trash2, 
  Moon,
  Sun,
  Volume2,
  Mail,
  Smartphone,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { settings, loading, saving, updateSettings, resetPassword } = useSettings();
  const [exporting, setExporting] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: settings.preferences.currency || 'INR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const newNotifications = { ...settings.notifications, [key]: value };
    updateSettings({ notifications: newNotifications });
  };

  const handlePreferenceChange = (key: string, value: string) => {
    const newPreferences = { ...settings.preferences, [key]: value };
    updateSettings({ preferences: newPreferences });
  };

  const handlePrivacyChange = (key: string, value: boolean | string) => {
    const newPrivacy = { ...settings.privacy, [key]: value };
    updateSettings({ privacy: newPrivacy });
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setExporting(true);
    try {
      // Fetch all user data from different tables
      const [
        cropsResult,
        parcelsResult,
        inventoryResult,
        transactionsResult,
        notificationsResult,
        profileResult
      ] = await Promise.all([
        supabase.from('crops').select('*').eq('user_id', user.id),
        supabase.from('parcels').select('*').eq('user_id', user.id),
        supabase.from('inventory').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('notifications').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('id', user.id).single()
      ]);

      // Check for errors
      const errors = [
        cropsResult.error,
        parcelsResult.error,
        inventoryResult.error,
        transactionsResult.error,
        notificationsResult.error,
        profileResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Export errors:', errors);
        throw new Error('Failed to fetch some data during export');
      }

      // Create simplified PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const leftMargin = 20;
      const rightMargin = 20;
      const contentWidth = pageWidth - leftMargin - rightMargin;

      // Helper function to check if we need a new page
      const checkPageBreak = (additionalHeight = 20) => {
        if (yPosition + additionalHeight > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Helper function to add section header
      const addSectionHeader = (title: string) => {
        checkPageBreak(15);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, leftMargin, yPosition);
        yPosition += 10;
        
        // Add underline
        doc.setLineWidth(0.5);
        doc.line(leftMargin, yPosition, leftMargin + contentWidth, yPosition);
        yPosition += 8;
      };

      // Helper function to add simple table
      const addTable = (headers: string[], rows: string[][]) => {
        const colWidth = contentWidth / headers.length;
        const rowHeight = 8;
        
        // Header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        headers.forEach((header, i) => {
          doc.text(header, leftMargin + (i * colWidth), yPosition);
        });
        yPosition += rowHeight;

        // Rows
        doc.setFont('helvetica', 'normal');
        rows.forEach((row) => {
          checkPageBreak(rowHeight);
          
          row.forEach((cell, i) => {
            const text = cell && cell.length > 30 ? cell.substring(0, 27) + '...' : (cell || '');
            doc.text(String(text), leftMargin + (i * colWidth), yPosition);
          });
          yPosition += rowHeight;
        });
        
        yPosition += 5;
      };

      // Helper function to add key-value pairs
      const addKeyValuePairs = (pairs: [string, string][]) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        pairs.forEach(([key, value]) => {
          checkPageBreak(6);
          doc.setFont('helvetica', 'bold');
          doc.text(`${key}:`, leftMargin, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(value, leftMargin + 50, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      };

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Farm Management Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Generated date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      const crops = cropsResult.data || [];
      const parcels = parcelsResult.data || [];
      const inventory = inventoryResult.data || [];
      const transactions = transactionsResult.data || [];
      const profile = profileResult.data;

      // Farm Profile Section
      addSectionHeader('Farm Information');
      
      if (profile) {
        const profileData: [string, string][] = [
          ['Farm Name', profile.farm_name || 'Not provided'],
          ['Owner', profile.full_name || 'Not provided'],
          ['Location', profile.location || 'Not provided'],
          ['Phone', profile.phone || 'Not provided'],
          ['Member Since', formatDate(profile.created_at)]
        ];
        
        addKeyValuePairs(profileData);
      }

      // Summary Statistics
      addSectionHeader('Summary Statistics');
      
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const totalArea = parcels.reduce((sum, parcel) => sum + (parcel.area || 0), 0);
      
      const summaryData: [string, string][] = [
        ['Total Crops', crops.length.toString()],
        ['Total Parcels', parcels.length.toString()],
        ['Total Farm Area', `${totalArea.toFixed(2)} acres`],
        ['Total Income', formatCurrency(totalIncome)],
        ['Total Expenses', formatCurrency(totalExpenses)],
        ['Net Income', formatCurrency(totalIncome - totalExpenses)],
        ['Inventory Items', inventory.length.toString()]
      ];
      
      addKeyValuePairs(summaryData);

      // Crops Section
      if (crops.length > 0) {
        addSectionHeader('Crops');
        
        const cropHeaders = ['Name', 'Variety', 'Status', 'Planting Date', 'Area'];
        const cropRows = crops.slice(0, 20).map(crop => [
          crop.name || '',
          crop.variety || 'Standard',
          crop.status || '',
          formatDate(crop.planting_date),
          crop.area_planted ? `${crop.area_planted}` : 'N/A'
        ]);
        
        addTable(cropHeaders, cropRows);
        
        if (crops.length > 20) {
          doc.setFontSize(9);
          doc.text(`... and ${crops.length - 20} more crops`, leftMargin, yPosition);
          yPosition += 10;
        }
      }

      // Parcels Section
      if (parcels.length > 0) {
        addSectionHeader('Parcels');
        
        const parcelHeaders = ['Name', 'Area (acres)', 'Soil Type', 'Status'];
        const parcelRows = parcels.map(parcel => [
          parcel.name || '',
          `${parcel.area || 0}`,
          parcel.soil_type || '',
          parcel.status || ''
        ]);
        
        addTable(parcelHeaders, parcelRows);
      }

      // Inventory Section
      if (inventory.length > 0) {
        addSectionHeader('Inventory');
        
        const inventoryHeaders = ['Item', 'Category', 'Quantity', 'Unit'];
        const inventoryRows = inventory.slice(0, 15).map(item => [
          item.name || '',
          item.category || '',
          `${item.quantity || 0}`,
          item.unit || ''
        ]);
        
        addTable(inventoryHeaders, inventoryRows);
        
        if (inventory.length > 15) {
          doc.setFontSize(9);
          doc.text(`... and ${inventory.length - 15} more items`, leftMargin, yPosition);
          yPosition += 10;
        }
      }

      // Recent Transactions Section
      if (transactions.length > 0) {
        addSectionHeader('Recent Transactions');
        
        const transactionHeaders = ['Date', 'Type', 'Amount', 'Category'];
        const recentTransactions = transactions.slice(0, 15);
        const transactionRows = recentTransactions.map(transaction => [
          formatDate(transaction.date),
          transaction.type || '',
          formatCurrency(transaction.amount),
          transaction.category || ''
        ]);
        
        addTable(transactionHeaders, transactionRows);
        
        if (transactions.length > 15) {
          doc.setFontSize(9);
          doc.text(`... and ${transactions.length - 15} more transactions`, leftMargin, yPosition);
          yPosition += 10;
        }
      }

      // Settings Section
      addSectionHeader('System Settings');
      
      const settingsData: [string, string][] = [
        ['Language', settings.preferences.language],
        ['Currency', settings.preferences.currency],
        ['Theme', settings.preferences.theme],
        ['Date Format', settings.preferences.dateFormat],
        ['Email Notifications', settings.notifications.email ? 'Enabled' : 'Disabled'],
        ['Profile Visibility', settings.privacy.profileVisibility]
      ];
      
      addKeyValuePairs(settingsData);

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      const fileName = `farm-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: 'PDF Report Generated',
        description: 'Your farm report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleClearAllData = async () => {
    if (!user) return;
    
    setClearing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`https://dujsubvfrzuvdcwiodzs.supabase.co/functions/v1/clear-user-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear data');
      }

      const result = await response.json();
      
      toast({
        title: 'Data Cleared Successfully',
        description: result.message || 'All your farm data has been cleared from the system.',
      });

      // Refresh the page to show the cleared state
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear data. Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Account Deletion',
      description: 'Please contact support to delete your account. This action cannot be undone.',
      variant: 'destructive',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Label>Email Notifications</Label>
                </div>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-gray-500" />
                  <Label>Push Notifications</Label>
                </div>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-gray-500" />
                  <Label>Sound Notifications</Label>
                </div>
                <p className="text-sm text-gray-500">Play sounds for notifications</p>
              </div>
              <Switch
                checked={settings.notifications.sound}
                onCheckedChange={(checked) => handleNotificationChange('sound', checked)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Notification Types</h4>
            <div className="space-y-3">
              {[
                { key: 'cropUpdates', label: 'Crop Updates', desc: 'Updates about your crops and harvests' },
                { key: 'weatherAlerts', label: 'Weather Alerts', desc: 'Important weather notifications' },
                { key: 'marketInsights', label: 'Market Insights', desc: 'Market price and trend updates' },
                { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Inventory low stock warnings' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{item.label}</Label>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <Switch
                    checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                    onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance & Preferences</span>
          </CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={settings.preferences.theme} 
                onValueChange={(value) => handlePreferenceChange('theme', value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select 
                value={settings.preferences.language} 
                onValueChange={(value) => handlePreferenceChange('language', value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={settings.preferences.currency} 
                onValueChange={(value) => handlePreferenceChange('currency', value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select 
                value={settings.preferences.dateFormat} 
                onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy & Security</span>
          </CardTitle>
          <CardDescription>Manage your privacy and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-gray-500">Control who can see your profile</p>
              </div>
              <Select 
                value={settings.privacy.profileVisibility} 
                onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                disabled={saving}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Sharing</Label>
                <p className="text-sm text-gray-500">Share anonymized data for research</p>
              </div>
              <Switch
                checked={settings.privacy.dataSharing}
                onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics</Label>
                <p className="text-sm text-gray-500">Help improve the app with usage analytics</p>
              </div>
              <Switch
                checked={settings.privacy.analytics}
                onCheckedChange={(checked) => handlePrivacyChange('analytics', checked)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <Button onClick={resetPassword} variant="outline" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>Export or delete your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Export Farm Report</Label>
              <p className="text-sm text-gray-500">Download a clean PDF report of your farm data</p>
            </div>
            <Button onClick={handleExportData} variant="outline" disabled={exporting || saving}>
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Report...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="space-y-1">
              <Label className="text-orange-900">Clear All Data</Label>
              <p className="text-sm text-orange-600">Remove all your farm data while keeping your account</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={clearing || saving} className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Clear All Farm Data</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>This action will permanently delete all of your farm data including:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>All crops and harvest records</li>
                      <li>Parcel information</li>
                      <li>Inventory items</li>
                      <li>Financial transactions</li>
                      <li>Notifications and recommendations</li>
                      <li>Weather data</li>
                    </ul>
                    <p className="font-medium text-red-600">This action cannot be undone. Your account will remain active but all data will be lost.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAllData}
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={clearing}
                  >
                    {clearing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      'Clear All Data'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="space-y-1">
              <Label className="text-red-900">Delete Account</Label>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <Button onClick={handleDeleteAccount} variant="destructive" size="sm" disabled={saving}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {saving && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Saving settings...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
