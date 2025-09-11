-- Allow anonymous (public) inserts into content_items while keeping new rows in pending state
-- This fixes upload failures caused by RLS when users are not authenticated

-- Create a permissive INSERT policy for the anon role
CREATE POLICY "Allow public to insert pending content"
ON public.content_items
FOR INSERT
TO anon
WITH CHECK (
  coalesce(status, 'pending') = 'pending'::text
  AND coalesce(moderation_status, 'pending') = 'pending'::text
);
