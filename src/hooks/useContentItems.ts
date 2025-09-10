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
}

export const useContentItems = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      updated_at: '2024-03-12T00:00:00Z'
    },
    {
      id: '#77889',
      title: 'Controversial Political Debate - Heated Arguments',
      upload_date: 'Jan 11, 2024',
      views: 1685,
      user_reports: 8,
      priority: 'high',
      status: 'rejected',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      created_at: '2024-01-11T00:00:00Z',
      updated_at: '2024-01-11T00:00:00Z'
    },
    {
      id: '#99001',
      title: 'DIY Home Improvement Tips',
      upload_date: 'Jan 10, 2024',
      views: 562,
      user_reports: 1,
      priority: 'low',
      status: 'pending',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z'
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
  };
};