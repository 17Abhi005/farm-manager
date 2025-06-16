
-- Add settings columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN notifications JSONB DEFAULT '{}',
ADD COLUMN preferences JSONB DEFAULT '{}',
ADD COLUMN privacy JSONB DEFAULT '{}';
