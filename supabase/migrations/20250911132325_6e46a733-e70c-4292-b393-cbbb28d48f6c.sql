-- Allow anonymous users to read all content items (so newly uploaded, pending items appear)
-- This complements the existing public-approved-only policy and ensures moderation UI can list uploads
CREATE POLICY "Allow public to view all content for moderation (anon)"
ON public.content_items
AS PERMISSIVE
FOR SELECT
TO anon
USING (true);
