
-- Add missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN farm_name TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN location TEXT,
ADD COLUMN bio TEXT;
