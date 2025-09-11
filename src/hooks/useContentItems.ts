import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentItem {
  id: string;
  title: string;
  video_url?: string;
  storage_path?: string;
  file_size?: number;
  duration?: number;
  thumbnail_url?: string;
  upload_date: string;
  views: number;
  user_reports: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  moderation_status?: 'pending' | 'analyzing' | 'completed' | 'failed';
  moderation_result?: {
    flagged: boolean;
    categories: string[];
    categoryScores: Record<string, number>;
    provider: string;
    timestamp: string;
    timestamps?: Array<{ timeOffset: number; categories: string[]; confidence: number }>;
  };
}

export const useContentItems = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateModerationResult = (itemId: string, status: 'analyzing' | 'completed' | 'failed', result?: any) => {
    setContentItems(prev => {
      const updated = prev.map(item => 
        item.id === itemId 
          ? { ...item, moderation_status: status, moderation_result: result }
          : item
      );
      
      // Persist moderation results to localStorage
      try {
        const moderationResults = JSON.parse(localStorage.getItem('moderationResults') || '{}');
        if (status === 'completed' && result) {
          moderationResults[itemId] = { status, result };
        } else {
          moderationResults[itemId] = { status };
        }
        localStorage.setItem('moderationResults', JSON.stringify(moderationResults));
      } catch (e) {
        console.warn('Failed to save moderation results:', e);
      }
      
      return updated;
    });
  };

  // Mock data for demo purposes
  const mockContentItems: ContentItem[] = [
    {
      id: '#12345',
      title: 'sexual',
      video_url: 'https://example.com/sexual.mp4',
      file_size: 45000000,
      duration: 180,
      thumbnail_url: 'https://example.com/thumb1.jpg',
      upload_date: 'Dec 15, 2024',
      views: 1250,
      user_reports: 8,
      priority: 'high' as const,
      status: 'pending' as const,
      created_at: '2024-12-15T10:30:00Z',
      updated_at: '2024-12-15T10:30:00Z',
      moderation_status: 'completed' as const,
      moderation_result: {
        flagged: true,
        categories: ['sexual_content', 'adult_content'],
        categoryScores: { sexual_content: 0.95, adult_content: 0.88 },
        provider: 'google',
        timestamp: '2024-12-15T10:31:00Z',
        timestamps: [
          { timeOffset: 45, categories: ['sexual_content'], confidence: 0.95 },
          { timeOffset: 120, categories: ['adult_content'], confidence: 0.88 }
        ]
      }
    },
    {
      id: '#67890',
      title: 'violence3',
      video_url: 'https://example.com/violence3.mp4',
      file_size: 67000000,
      duration: 240,
      thumbnail_url: 'https://example.com/thumb2.jpg',
      upload_date: 'Dec 14, 2024',
      views: 890,
      user_reports: 12,
      priority: 'high' as const,
      status: 'rejected' as const,
      created_at: '2024-12-14T15:20:00Z',
      updated_at: '2024-12-14T16:45:00Z',
      moderation_status: 'completed' as const,
      moderation_result: {
        flagged: true,
        categories: ['violence', 'graphic_content'],
        categoryScores: { violence: 0.92, graphic_content: 0.87 },
        provider: 'azure',
        timestamp: '2024-12-14T15:25:00Z',
        timestamps: [
          { timeOffset: 30, categories: ['violence'], confidence: 0.92 },
          { timeOffset: 180, categories: ['graphic_content'], confidence: 0.87 }
        ]
      }
    },
    {
      id: '#54321',
      title: 'violence',
      video_url: 'https://example.com/violence.mp4',
      file_size: 52000000,
      duration: 210,
      thumbnail_url: 'https://example.com/thumb3.jpg',
      upload_date: 'Dec 13, 2024',
      views: 2100,
      user_reports: 15,
      priority: 'high' as const,
      status: 'rejected' as const,
      created_at: '2024-12-13T09:15:00Z',
      updated_at: '2024-12-13T10:30:00Z',
      moderation_status: 'completed' as const,
      moderation_result: {
        flagged: true,
        categories: ['violence', 'disturbing_content'],
        categoryScores: { violence: 0.98, disturbing_content: 0.85 },
        provider: 'openai',
        timestamp: '2024-12-13T09:20:00Z',
        timestamps: [
          { timeOffset: 60, categories: ['violence'], confidence: 0.98 },
          { timeOffset: 150, categories: ['disturbing_content'], confidence: 0.85 }
        ]
      }
    }
  ];

  const fetchContentItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        // If there's an error, just use mock data
        setContentItems(mockContentItems);
        return;
      }

      // Transform database data to match the expected format
      const transformedData: ContentItem[] = (data || []).map(item => ({
        id: `#${item.id.slice(-5)}`, // Use last 5 chars of UUID for display
        title: item.title,
        video_url: item.video_url,
        storage_path: item.storage_path,
        file_size: item.file_size,
        duration: item.duration,
        thumbnail_url: item.thumbnail_url,
        upload_date: new Date(item.upload_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        views: item.views,
        user_reports: item.user_reports,
        priority: item.priority as 'high' | 'medium' | 'low',
        status: item.status as 'pending' | 'approved' | 'rejected',
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      // Load persisted moderation results
      const moderationResults = JSON.parse(localStorage.getItem('moderationResults') || '{}');
      
      // Apply stored moderation results to all items
      const applyStoredResults = (items: ContentItem[]) => {
        return items.map(item => {
          const storedResult = moderationResults[item.id];
          if (storedResult) {
            return {
              ...item,
              moderation_status: storedResult.status,
              moderation_result: storedResult.result || undefined
            };
          }
          return item;
        });
      };

      // Combine uploaded content with mock data
      // Put new uploads first, then mock data
      const combinedItems = [...transformedData, ...mockContentItems];
      const itemsWithStoredResults = applyStoredResults(combinedItems);
      setContentItems(itemsWithStoredResults);

    } catch (err) {
      console.error('Fetch error:', err);
      // If there's an error, just use mock data
      setContentItems(mockContentItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentItems();
  }, []);

  return {
    contentItems,
    loading,
    error,
    refetch: fetchContentItems,
    updateModerationResult,
  };
};