import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VideoUploadDialog } from '@/components/VideoUploadDialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContentItems } from '@/hooks/useContentItems';
import { useModeration } from '@/hooks/useModeration';
import { useToast } from '@/hooks/use-toast';

interface ContentItem {
  id: string;
  title: string;
  upload_date: string;
  views: number;
  user_reports: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
  video_url?: string;
  storage_path?: string;
  file_size?: number;
}

const ContentList = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [uploadDateFilter, setUploadDateFilter] = useState('all');
  const [viewsFilter, setViewsFilter] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  const { contentItems, loading, refetch, updateModerationResult } = useContentItems();
  const { moderateWithGoogleVideo } = useModeration();
  
  // Add social media post to the content list
  const allContentItems = [
    ...contentItems,
    {
      id: '#social01',
      title: 'Social Media Post - Suspicious Marketing Claims',
      upload_date: 'Dec 15, 2024',
      views: 2341,
      user_reports: 3,
      priority: 'medium' as const,
      status: 'pending' as const,
      moderation_status: 'pending' as const,
      moderation_result: null,
      file_size: undefined // Social media posts don't have file sizes
    }
  ];
  const prefetchStartedRef = useRef(false);
  const [moderationInProgress, setModerationInProgress] = useState(false);
  const { toast } = useToast();

  // Start automated moderation checks for all content items when page loads
  useEffect(() => {
    if (!loading && !prefetchStartedRef.current && contentItems.length > 0) {
      console.log('Starting automated moderation for', contentItems.length, 'content items');
      prefetchStartedRef.current = true;
      
      // Only run moderation on items that haven't been analyzed yet
      const itemsNeedingModeration = contentItems.filter(item => 
        item.video_url && 
        (!item.moderation_status || item.moderation_status === 'pending')
      );
      
      if (itemsNeedingModeration.length === 0) {
        console.log('All items already have moderation results, skipping automated checks');
        return;
      }
      
      setModerationInProgress(true);
      let completedChecks = 0;
      
      // Start moderation for items that need it
      itemsNeedingModeration.forEach(async (item, index) => {
        console.log(`Starting moderation for item ${index + 1}:`, item.title, item.video_url);
        updateModerationResult(item.id, 'analyzing');
        
        try {
          const result = await moderateWithGoogleVideo(item.video_url!);
          updateModerationResult(item.id, 'completed', result);
          console.log(`Completed moderation for ${item.title}:`, result);
        } catch (error) {
          console.error(`Moderation failed for ${item.title}:`, error);
          updateModerationResult(item.id, 'failed');
        } finally {
          completedChecks++;
          if (completedChecks === itemsNeedingModeration.length) {
            setModerationInProgress(false);
            console.log('All automated moderation checks completed');
          }
        }
      });
    }
  }, [loading, contentItems, moderateWithGoogleVideo, updateModerationResult]);

  // Helper function to get automated issue count
  const getAutomatedIssueCount = (item: any) => {
    if (!item.moderation_result || !item.moderation_result.flagged) {
      return 0;
    }
    
    // Count categories that had issues
    return item.moderation_result.categories ? item.moderation_result.categories.length : 0;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Low</Badge>;
      default:
        return null;
    }
  };

  const handleContentClick = (contentId: string) => {
    // Remove the # symbol and navigate with the clean ID
    const cleanId = contentId.replace('#', '');
    
    // Navigate to social media moderation for social content
    if (contentId === '#social01') {
      navigate(`/social/${cleanId}`);
    } else {
      navigate(`/content/${cleanId}`);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleUploadComplete = () => {
    refetch(); // Refresh the content list after upload
  };

  const filteredContent = allContentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isExpanded={sidebarExpanded} 
        onToggle={handleSidebarToggle} 
      />

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarExpanded ? 'ml-64' : 'ml-14'
      }`}>
        {/* Header */}
        <Header 
          contentId="Content Management"
          priority="high"
          itemCount={filteredContent.length}
          sidebarExpanded={sidebarExpanded}
        />

        {/* Content Area */}
        <div className="flex-1 pt-6 px-6 pb-6">
          {/* Top Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={uploadDateFilter} onValueChange={setUploadDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Upload Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Upload Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={viewsFilter} onValueChange={setViewsFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Views" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Views</SelectItem>
                  <SelectItem value="high">High Views</SelectItem>
                  <SelectItem value="medium">Medium Views</SelectItem>
                  <SelectItem value="low">Low Views</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add content
              </Button>
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
                <span className="text-gray-600">Loading content...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Content title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Moderation ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Upload Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Views</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">User reports</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Automated issues</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContent.map((item, index) => (
                      <tr 
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleContentClick(item.id)}
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{item.title}</div>
                          {item.file_size && (
                            <div className="text-xs text-gray-500">
                              {(item.file_size / (1024 * 1024)).toFixed(1)} MB
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-600 font-mono text-sm">{item.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-600">{item.upload_date}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900 font-medium">{item.views.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4">
                          {item.user_reports > 0 ? (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                              <span className="text-red-600 font-medium">{item.user_reports}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {(() => {
                            const issueCount = getAutomatedIssueCount(item);
                            if (issueCount > 0) {
                              return (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-red-600 font-medium">{issueCount}</span>
                                </div>
                              );
                            } else if (item.moderation_status === 'completed') {
                              return <span className="text-green-600 text-sm">✓ Clean</span>;
                            } else if (item.moderation_status === 'analyzing') {
                              return (
                                <div className="flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                  <span className="text-xs text-blue-600">Analyzing</span>
                                </div>
                              );
                            } else {
                              return <span className="text-gray-400">-</span>;
                            }
                          })()}
                        </td>
                        <td className="py-4 px-4">
                          {getPriorityBadge(item.priority)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                            {item.moderation_status === 'analyzing' && (
                              <div className="flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                <span className="text-xs text-blue-600">Analyzing</span>
                              </div>
                            )}
                            {item.moderation_status === 'completed' && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600">Checked</span>
                              </div>
                            )}
                            {item.moderation_status === 'failed' && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-xs text-red-600">Failed</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && filteredContent.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {contentItems.length === 0 
                  ? "No content uploaded yet. Click 'Add content' to upload your first video."
                  : "No content items match your current filters."
                }
              </p>
              {contentItems.length === 0 && (
                <Button 
                  onClick={() => setUploadDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload First Video
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Video Upload Dialog */}
        <VideoUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUploadComplete={handleUploadComplete}
        />
      </main>
    </div>
  );
};

export default ContentList;