-- Add moderation columns to content_items table
ALTER TABLE public.content_items 
ADD COLUMN moderation_status TEXT DEFAULT 'pending',
ADD COLUMN moderation_result JSONB;

-- Add comment explaining the moderation_result structure
COMMENT ON COLUMN public.content_items.moderation_result IS 'JSON object containing moderation results from various providers (Google, Azure, etc.) with flags, categories, scores, and timestamps';
COMMENT ON COLUMN public.content_items.moderation_status IS 'Status of moderation analysis: pending, analyzing, completed, failed';