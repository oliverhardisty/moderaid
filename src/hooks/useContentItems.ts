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
      id: '#67890',
      title: 'AI Ethics Discussion Panel',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      storage_path: 'videos/ai-ethics-panel.mp4',
      file_size: 45600000,
      duration: 1820,
      thumbnail_url: undefined,
      upload_date: 'Dec 15, 2024',
      views: 2340,
      user_reports: 0,
      priority: 'medium' as const,
      status: 'pending' as const,
      created_at: '2024-12-15T10:30:00Z',
      updated_at: '2024-12-15T10:30:00Z',
      moderation_status: 'completed' as const,
      moderation_result: {
        flagged: false,
        categories: [],
        categoryScores: {
          'harassment': 0.1,
          'hate_speech': 0.05,
          'violence': 0.02,
          'adult_content': 0.01
        },
        provider: 'google_video_ai',
        timestamp: '2024-12-15T10:35:00Z',
        timestamps: []
      }
    },
    {
      id: '#56781',
      title: 'Product Launch Event Highlights',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      storage_path: 'videos/product-launch.mp4',
      file_size: 67800000,
      duration: 2145,
      thumbnail_url: undefined,
      upload_date: 'Dec 14, 2024',
      views: 5670,
      user_reports: 1,
      priority: 'high' as const,
      status: 'approved' as const,
      created_at: '2024-12-14T16:45:00Z',
      updated_at: '2024-12-14T16:45:00Z',
      moderation_status: 'completed' as const,
      moderation_result: {
        flagged: false,
        categories: [],
        categoryScores: {
          'harassment': 0.02,
          'hate_speech': 0.01,
          'violence': 0.01,
          'adult_content': 0.03
        },
        provider: 'google_video_ai',
        timestamp: '2024-12-14T16:50:00Z',
        timestamps: []
      }
    },
    {
      id: '#45672',
      title: 'Controversial Interview Segment',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      storage_path: 'videos/controversial-interview.mp4',
      file_size: 34200000,
      duration: 1456,
      thumbnail_url: undefined,
      upload_date: 'Dec 13, 2024',
      views: 8901,
      user_reports: 5,
      priority: 'high' as const,
      status: 'pending' as const,
      created_at: '2024-12-13T09:20:00Z',
      updated_at: '2024-12-13T09:20:00Z',
      moderation_status: 'completed' as const,
      moderation_result: {
        flagged: true,
        categories: ['harassment', 'hate_speech'],
        categoryScores: {
          'harassment': 0.78,
          'hate_speech': 0.65,
          'violence': 0.23,
          'adult_content': 0.12
        },
        provider: 'google_video_ai',
        timestamp: '2024-12-13T09:25:00Z',
        timestamps: [
          { timeOffset: 145, categories: ['harassment'], confidence: 0.82 },
          { timeOffset: 289, categories: ['hate_speech'], confidence: 0.71 },
          { timeOffset: 456, categories: ['harassment', 'hate_speech'], confidence: 0.89 }
        ]
      }
    },
    {
      id: '#34563',
      title: 'Gaming Stream Compilation',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      storage_path: 'videos/gaming-stream.mp4',
      file_size: 89400000,
      duration: 3780,
      thumbnail_url: undefined,
      upload_date: 'Dec 12, 2024',
      views: 12450,
      user_reports: 2,
      priority: 'medium' as const,
      status: 'approved' as const,
      created_at: '2024-12-12T14:15:00Z',
      updated_at: '2024-12-12T14:15:00Z',
      moderation_status: 'completed' as const,
      moderation_result: {
        flagged: true,
        categories: ['violence'],
        categoryScores: {
          'harassment': 0.15,
          'hate_speech': 0.08,
          'violence': 0.72,
          'adult_content': 0.06
        },
        provider: 'google_video_ai',
        timestamp: '2024-12-12T14:20:00Z',
        timestamps: [
          { timeOffset: 567, categories: ['violence'], confidence: 0.75 },
          { timeOffset: 1234, categories: ['violence'], confidence: 0.68 },
          { timeOffset: 2890, categories: ['violence'], confidence: 0.81 }
        ]
      }
    },
    {
      id: '#23454',
      title: 'Educational Workshop Recording',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      storage_path: 'videos/educational-workshop.mp4',
      file_size: 52300000,
      duration: 2567,
      thumbnail_url: undefined,
      upload_date: 'Dec 11, 2024',
      views: 1230,
      user_reports: 0,
      priority: 'low' as const,
      status: 'approved' as const,
      created_at: '2024-12-11T11:30:00Z',
      updated_at: '2024-12-11T11:30:00Z',
      moderation_status: 'completed' as const,
      moderation_result: {
        flagged: false,
        categories: [],
        categoryScores: {
          'harassment': 0.03,
          'hate_speech': 0.01,
          'violence': 0.02,
          'adult_content': 0.04
        },
        provider: 'google_video_ai',
        timestamp: '2024-12-11T11:35:00Z',
        timestamps: []
      }
    },
    {
      id: '#12345',
      title: 'Live Concert Performance',
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      storage_path: 'videos/concert-performance.mp4',
      file_size: 156700000,
      duration: 4200,
      thumbnail_url: undefined,
      upload_date: 'Dec 10, 2024',
      views: 25670,
      user_reports: 3,
      priority: 'high' as const,
      status: 'rejected' as const,
      created_at: '2024-12-10T20:45:00Z',
      updated_at: '2024-12-10T20:45:00Z',
      moderation_status: 'completed' as const,
      moderation_result: {
        flagged: true,
        categories: ['adult_content', 'harassment'],
        categoryScores: {
          'harassment': 0.67,
          'hate_speech': 0.34,
          'violence': 0.18,
          'adult_content': 0.89
        },
        provider: 'google_video_ai',
        timestamp: '2024-12-10T20:50:00Z',
        timestamps: [
          { timeOffset: 890, categories: ['adult_content'], confidence: 0.92 },
          { timeOffset: 1567, categories: ['harassment'], confidence: 0.71 },
          { timeOffset: 2340, categories: ['adult_content', 'harassment'], confidence: 0.85 },
          { timeOffset: 3456, categories: ['adult_content'], confidence: 0.78 }
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