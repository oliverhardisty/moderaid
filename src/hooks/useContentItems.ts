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
      title: 'NHL Greatest Fights Of All Time',
      upload_date: 'Mar 12, 2024',
      views: 15781,
      user_reports: 12,
      priority: 'high',
      status: 'approved',
      video_url: 'https://www.youtube.com/watch?v=YXHPQqmvJkI',
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
    },
    {
      id: '#55332',
      title: 'Gaming Review - Latest RPG',
      upload_date: 'Jan 8, 2024',
      views: 789,
      user_reports: 7,
      priority: 'high',
      status: 'rejected',
      created_at: '2024-01-08T00:00:00Z',
      updated_at: '2024-01-08T00:00:00Z'
    },
    {
      id: '#66445',
      title: 'Tech Review - Smartphone Comparison',
      upload_date: 'Jan 5, 2024',
      views: 1456,
      user_reports: 4,
      priority: 'high',
      status: 'approved',
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z'
    },
    {
      id: '#73625',
      title: 'Fitness Workout - Morning Routine',
      upload_date: 'Jan 3, 2024',
      views: 1534,
      user_reports: 1,
      priority: 'low',
      status: 'approved',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z'
    },
    {
      id: '#95613',
      title: 'Music Performance - Live Concert',
      upload_date: 'Jan 1, 2024',
      views: 2187,
      user_reports: 0,
      priority: 'medium',
      status: 'approved',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '#15396',
      title: 'Educational Content - Science Experiment',
      upload_date: 'Dec 30, 2023',
      views: 1898,
      user_reports: 0,
      priority: 'medium',
      status: 'approved',
      created_at: '2023-12-30T00:00:00Z',
      updated_at: '2023-12-30T00:00:00Z'
    },
    {
      id: '#39152',
      title: 'Comedy Sketch - Office Parody',
      upload_date: 'Dec 28, 2023',
      views: 3247,
      user_reports: 6,
      priority: 'medium',
      status: 'pending',
      created_at: '2023-12-28T00:00:00Z',
      updated_at: '2023-12-28T00:00:00Z'
    },
    {
      id: '#52138',
      title: 'Documentary - Environmental Awareness',
      upload_date: 'Dec 26, 2023',
      views: 987,
      user_reports: 1,
      priority: 'high',
      status: 'approved',
      created_at: '2023-12-26T00:00:00Z',
      updated_at: '2023-12-26T00:00:00Z'
    },
    {
      id: '#81749',
      title: 'Travel Vlog - European Adventure',
      upload_date: 'Dec 25, 2023',
      views: 1342,
      user_reports: 2,
      priority: 'low',
      status: 'approved',
      created_at: '2023-12-25T00:00:00Z',
      updated_at: '2023-12-25T00:00:00Z'
    },
    {
      id: '#42617',
      title: 'Product Unboxing - Tech Gadgets',
      upload_date: 'Dec 24, 2023',
      views: 876,
      user_reports: 0,
      priority: 'medium',
      status: 'approved',
      created_at: '2023-12-24T00:00:00Z',
      updated_at: '2023-12-24T00:00:00Z'
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