
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = async (file: File, cropId?: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload file directly - the bucket should already exist or be created by admin
      const { error: uploadError } = await supabase.storage
        .from('crop-attachments')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Store file metadata - only if crop_attachments table exists and crop_id is provided
      try {
        const insertData: any = {
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          description: description || null
        };

        // Only add crop_id if it's provided
        if (cropId) {
          insertData.crop_id = cropId;
        }

        const { data, error: metadataError } = await supabase
          .from('crop_attachments')
          .insert(insertData)
          .select()
          .single();

        if (metadataError) {
          console.error('Metadata storage error:', metadataError);
          // File was uploaded but metadata couldn't be stored
          toast({
            title: "Partial Success",
            description: "File uploaded but metadata could not be stored. The file is available in storage.",
            variant: "destructive",
          });
          return { file_path: fileName, file_name: file.name };
        }

        toast({
          title: "Success",
          description: "File uploaded successfully",
        });

        return data;
      } catch (metadataError) {
        console.error('Metadata storage error:', metadataError);
        // File was uploaded but metadata couldn't be stored
        toast({
          title: "Partial Success", 
          description: "File uploaded but metadata could not be stored. The file is available in storage.",
          variant: "destructive",
        });
        return { file_path: fileName, file_name: file.name };
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const getFileUrl = (filePath: string) => {
    try {
      const { data } = supabase.storage
        .from('crop-attachments')
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return '';
    }
  };

  return {
    uploadFile,
    getFileUrl,
    uploading
  };
};
