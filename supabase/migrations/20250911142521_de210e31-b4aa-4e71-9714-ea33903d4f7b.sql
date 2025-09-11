-- Remove the bottom 4 moderation items from content_items table
DELETE FROM content_items 
WHERE id IN (
  '7716166f-1310-4ec8-80f6-c9403a8a24e5',
  '800772f6-5a9d-4f7b-9599-a17ddc34668e', 
  '3ef1090f-b228-400b-9567-1fe3b82b3047',
  '18a50879-686f-40b2-a742-f0088414cbfe'
);