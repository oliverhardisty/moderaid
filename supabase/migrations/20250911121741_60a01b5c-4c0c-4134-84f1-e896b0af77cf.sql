-- Optional: Remove public content creation for production security
-- This ensures only authenticated users can upload content

DROP POLICY IF EXISTS "Allow public to create content (dev)" ON public.content_items;