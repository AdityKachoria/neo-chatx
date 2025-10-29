-- Fix: Restrict profiles table to authenticated users only
-- This prevents user enumeration and activity tracking by unauthenticated users

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);