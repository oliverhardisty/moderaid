-- Fix security vulnerability: Restrict public access to only approved content
-- This prevents bad actors from seeing unmoderated content, moderation status, and storage paths

-- Drop the current overly permissive public access policy
DROP POLICY IF EXISTS "Allow public access to view content" ON public.content_items;

-- Create a new policy that only allows public users to see approved content
CREATE POLICY "Allow public access to approved content only" 
ON public.content_items 
FOR SELECT 
USING (status = 'approved');

-- Create a policy for authenticated users (moderators/admins) to see all content
CREATE POLICY "Allow authenticated users to view all content for moderation" 
ON public.content_items 
FOR SELECT 
TO authenticated
USING (true);

-- Note: The existing INSERT and UPDATE policies for authenticated users remain unchanged
-- This ensures moderators can still manage content while protecting unapproved content from public access