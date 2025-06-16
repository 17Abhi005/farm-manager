
-- Create the storage bucket for crop attachments (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crop-attachments',
  'crop-attachments', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/*', 'application/pdf', 'text/*']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create storage policies for the crop-attachments bucket
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'crop-attachments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'crop-attachments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'crop-attachments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Make crop_id nullable in crop_attachments table
ALTER TABLE public.crop_attachments 
ALTER COLUMN crop_id DROP NOT NULL;

-- Add RLS policies for crop_attachments table
ALTER TABLE public.crop_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own attachments" ON public.crop_attachments;
DROP POLICY IF EXISTS "Users can create their own attachments" ON public.crop_attachments;
DROP POLICY IF EXISTS "Users can update their own attachments" ON public.crop_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON public.crop_attachments;

-- Create RLS policies for crop_attachments table
CREATE POLICY "Users can view their own attachments" ON public.crop_attachments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attachments" ON public.crop_attachments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attachments" ON public.crop_attachments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attachments" ON public.crop_attachments
  FOR DELETE USING (auth.uid() = user_id);
