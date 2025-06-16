
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  Search,
  Filter,
  Eye,
  Calendar,
  FileIcon
} from 'lucide-react';
import FileUploadComponent from './FileUploadComponent';

interface FileAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  description?: string;
  created_at: string;
  crop_id?: string;
}

const FileManagement: React.FC = () => {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { user } = useAuth();
  const { getFileUrl } = useFileUpload();
  const { toast } = useToast();

  const fetchFiles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('crop_attachments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        toast({
          title: "Error",
          description: "Failed to load files. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const handleFileUpload = () => {
    fetchFiles(); // Refresh the file list
  };

  const handleDeleteFile = async (file: FileAttachment) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('crop-attachments')
        .remove([file.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with metadata deletion even if storage deletion fails
      }

      // Delete metadata from database
      const { error: dbError } = await supabase
        .from('crop_attachments')
        .delete()
        .eq('id', file.id);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Success",
        description: "File deleted successfully",
      });

      fetchFiles(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = (file: FileAttachment) => {
    const url = getFileUrl(file.file_path);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-600" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-600" />;
    }
    return <FileIcon className="w-6 h-6 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'images' && file.file_type.startsWith('image/')) ||
                         (filterType === 'documents' && !file.file_type.startsWith('image/'));
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-2">File Management</h2>
          <p className="text-primary-foreground/90">Loading your files...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">File Management</h2>
        <p className="text-primary-foreground/90">
          Upload, organize, and manage your farm-related files and documents.
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FileUploadComponent onUploadComplete={handleFileUpload} />
        </div>

        {/* Files Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileIcon className="w-5 h-5 mr-2" />
                Files Overview
              </CardTitle>
              <CardDescription>
                Total files: {files.length} • Total size: {formatFileSize(files.reduce((sum, file) => sum + (file.file_size || 0), 0))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Image className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Images</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {files.filter(f => f.file_type.startsWith('image/')).length}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Documents</p>
                  <p className="text-2xl font-bold text-green-600">
                    {files.filter(f => !f.file_type.startsWith('image/')).length}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">This Month</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {files.filter(f => new Date(f.created_at).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium">Recent</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {files.filter(f => new Date(f.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                size="sm"
              >
                All Files
              </Button>
              <Button
                variant={filterType === 'images' ? 'default' : 'outline'}
                onClick={() => setFilterType('images')}
                size="sm"
              >
                <Image className="w-4 h-4 mr-1" />
                Images
              </Button>
              <Button
                variant={filterType === 'documents' ? 'default' : 'outline'}
                onClick={() => setFilterType('documents')}
                size="sm"
              >
                <FileText className="w-4 h-4 mr-1" />
                Documents
              </Button>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {files.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
              </h3>
              <p className="text-gray-500 mb-4">
                {files.length === 0 
                  ? 'Upload your first file to get started' 
                  : 'Try adjusting your search terms or filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" title={file.file_name}>
                            {file.file_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.file_size || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {file.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {file.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{formatDate(file.created_at)}</span>
                      {file.crop_id && (
                        <Badge variant="secondary" className="text-xs">
                          Linked to Crop
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(file)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFile(file)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileManagement;
