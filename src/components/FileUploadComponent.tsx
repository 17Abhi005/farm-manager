
import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Upload, FileText, Image, Loader2 } from 'lucide-react';

interface FileUploadComponentProps {
  cropId?: string;
  onUploadComplete?: (file: any) => void;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({ cropId, onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const { uploadFile, uploading } = useFileUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      const uploadedFile = await uploadFile(file, cropId, description);
      setFile(null);
      setDescription('');
      if (onUploadComplete) {
        onUploadComplete(uploadedFile);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-600" />;
    }
    return <FileText className="w-6 h-6 text-gray-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Upload Files
        </CardTitle>
        <CardDescription>
          Upload photos, documents, or receipts related to your crops
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>

        {file && (
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            {getFileIcon(file.type)}
            <div className="flex-1">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add a description for this file..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUploadComponent;
