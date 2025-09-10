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
  };
}

export const useContentItems = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateModerationResult = (itemId: string, status: 'analyzing' | 'completed' | 'failed', result?: any) => {
    setContentItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, moderation_status: status, moderation_result: result }
        : item
    ));
  };

  // Mock data for demo purposes
  const mockContentItems: ContentItem[] = [
    {
      id: '#67890',
      title: 'Sexual Content Test Video',
      upload_date: 'Mar 12, 2024',
      views: 15781,
      user_reports: 12,
      priority: 'high',
      status: 'approved',
      video_url: 'http://localhost:8000/Documents/Career/Designs/1.%20Product%20design/Company%20work/Moderaid/Content/sexual.mp4',
      created_at: '2024-03-12T00:00:00Z',
      updated_at: '2024-03-12T00:00:00Z',
      moderation_status: 'pending'
    },
    {
      id: '#12345',
      title: 'Violence Detection Test',
      upload_date: 'Mar 10, 2024',
      views: 8952,
      user_reports: 5,
      priority: 'high',
      status: 'pending',
      video_url: 'https://example.com/test-video-2.mp4',
      created_at: '2024-03-10T00:00:00Z',
      updated_at: '2024-03-10T00:00:00Z',
      moderation_status: 'pending'
    },
    {
      id: '#54321',
      title: 'Safe Content Example',
      upload_date: 'Mar 8, 2024',
      views: 3421,
      user_reports: 0,
      priority: 'low',
      status: 'approved',
      video_url: 'https://example.com/safe-video.mp4',
      created_at: '2024-03-08T00:00:00Z',
      updated_at: '2024-03-08T00:00:00Z',
      moderation_status: 'pending'
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

      // Combine uploaded content with mock data
      // Put new uploads first, then mock data
      const combinedItems = [...transformedData, ...mockContentItems];
      setContentItems(combinedItems);

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