/*
  # Fix notification RLS policies

  1. Changes
    - Add INSERT policy for users table to allow authenticated users to create their own row
    - Update existing RLS policies to be more specific about conditions
  
  2. Security
    - Enable RLS on users table (already enabled)
    - Add policy for users to create their own row
    - Update existing policies for better security
*/

-- Add INSERT policy for users table
CREATE POLICY "Users can create their own row" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Update existing SELECT policy to be more specific
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Update existing UPDATE policy to be more specific
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);