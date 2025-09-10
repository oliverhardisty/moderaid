-- Allow public reads for videos bucket
CREATE POLICY IF NOT EXISTS "Public can view videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

-- Allow anyone to upload to the public videos bucket (dev-friendly)
CREATE POLICY IF NOT EXISTS "Public can upload videos (dev)"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'videos');

-- Optional: Allow anyone to update objects they just uploaded in videos bucket
CREATE POLICY IF NOT EXISTS "Public can update videos (dev)"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'videos')
WITH CHECK (bucket_id = 'videos');

-- Allow public to insert content items (since app has no auth yet)
CREATE POLICY IF NOT EXISTS "Allow public to create content (dev)"
ON public.content_items
FOR INSERT
WITH CHECK (true);