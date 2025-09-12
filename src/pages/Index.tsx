import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { IssuesPanel } from '@/components/IssuesPanel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ContentMetadata } from '@/components/ContentMetadata';
import { ActionBar } from '@/components/ActionBar';
import { PanelGroup, Panel, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';
import { Switch } from '@/components/ui/switch';
import { Layout } from 'lucide-react';
import { useModeration } from '@/hooks/useModeration';
import { useToast } from '@/hooks/use-toast';
import { useContentItems } from '@/hooks/useContentItems';
import { TimestampMarkers } from '@/components/TimestampMarkers';
import { supabase } from '@/integrations/supabase/client';
const Index = () => {
  const {
    contentId
  } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isContentBlurred, setIsContentBlurred] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moderationIssues, setModerationIssues] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isCompactView, setIsCompactView] = useState(false);
  const [currentModerationResult, setCurrentModerationResult] = useState<any>(null);
  const [seekFunction, setSeekFunction] = useState<((timeInSeconds: number) => void) | null>(null);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const {
    moderateWithGoogleVideo,
    moderateWithAzure
  } = useModeration();
  const {
    contentItems,
    loading: itemsLoading,
    updateModerationResult
  } = useContentItems();

  // Content data - use the same data as ContentList
  const currentContent = contentItems.find(item => item.id === `#${contentId}`) || contentItems[0];
  const contentData = currentContent ? {
    id: currentContent.id,
    priority: currentContent.priority,
    title: currentContent.title,
    uploadDate: currentContent.upload_date,
    views: currentContent.views,
    viewerReports: currentContent.user_reports,
    videoUrl: currentContent.video_url
  } : {
    id: '#67890',
    priority: 'high' as const,
    title: 'NHL Greatest Fights Of All Time',
    uploadDate: 'Mar 12, 2024',
    views: 15781,
    viewerReports: 12,
    videoUrl: 'https://storage.googleapis.com/cloud-samples-data/video/cat.mp4'
  };

  // Video content for moderation analysis
  const videoContent = `
    Video Title: ${contentData.title}
    Video URL: ${contentData.videoUrl || 'No URL provided'}
    Description: This video content requires comprehensive safety analysis. The video may contain material that needs to be reviewed for policy compliance including but not limited to: violence, adult content, harassment, hate speech, dangerous activities, or other policy violations.
    
    Analysis Request: Please analyze this video title and associated content for any potential policy violations, inappropriate content, or material that may violate community standards. Pay special attention to any potentially harmful, violent, sexual, or otherwise problematic content that may be present.
    
    Context: User-submitted video content under moderation review for platform safety compliance.
  `;

  // Function to analyze video content with moderation APIs
  const analyzeContent = async () => {
    console.log('Starting content analysis (Google)...');
    setIsAnalyzing(true);
    try {
      const issues: any[] = [];

      // Try Google Video Intelligence first (skip if YouTube URL)
      if (contentData.videoUrl) {
        const urlLower = contentData.videoUrl.toLowerCase();

        // If local file URL, prompt for upload and analyze the uploaded copy
        if (urlLower.includes('localhost') || urlLower.includes('127.0.0.1')) {
          toast({
            title: "Local video detected",
            description: "Select the local file to upload temporarily for analysis."
          });
          setIsAnalyzing(false);
          fileInputRef.current?.click();
          return;
        }
        const isYouTube = urlLower.includes('youtube.com') || urlLower.includes('youtu.be');
        if (isYouTube) {
          issues.push({
            id: 'google-skip-youtube',
            type: 'Upload Required for Analysis',
            status: 'dismissed' as const,
            confidence: 0,
            timestamp: new Date().toLocaleString(),
            model: 'Google Video Intelligence',
            description: 'Direct YouTube URLs are not supported. Please upload the video or use a direct file URL.',
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
          });
        } else {
          try {
            const googleResult = await moderateWithGoogleVideo(contentData.videoUrl);
            if (googleResult?.flagged) {
              googleResult.categories.forEach((category: string, index: number) => {
                const score = googleResult.categoryScores?.[category] ?? 0;

                // Get timestamps for this specific category - improve matching logic
                const categoryTimestamps = googleResult.timestamps?.filter((ts: any) => {
                  // Check if any of the timestamp categories match the current category
                  return ts.categories.some((tsCategory: string) => tsCategory === category || tsCategory.toLowerCase() === category.toLowerCase() || tsCategory.replace(/[/_]/g, ' ').toLowerCase() === category.replace(/[/_]/g, ' ').toLowerCase());
                }) || [];
                console.log(`Processing Google category "${category}":`, {
                  totalTimestamps: googleResult.timestamps?.length || 0,
                  matchingTimestamps: categoryTimestamps.length,
                  timestampCategories: googleResult.timestamps?.map(ts => ts.categories) || [],
                  categoryTimestamps
                });
                issues.push({
                  id: `google-${category}-${index}`,
                  type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                  status: 'active' as const,
                  confidence: Math.round(score * 100),
                  timestamp: new Date().toLocaleString(),
                  model: 'Google Video Intelligence',
                  description: `Google detected ${category} content with ${Math.round(score * 100)}% confidence${categoryTimestamps.length > 0 ? ` at ${categoryTimestamps.length} timestamp(s)` : ''}`,
                  icon: 'https://api.builder.io/api/v1/image/assets/TEMP/621c8c5642880383388d15c77d0d83b3374d09eb?placeholderIfAbsent=true',
                  timestamps: categoryTimestamps
                });

                // Debug log for timestamps
                console.log(`Created issue for ${category}:`, {
                  category,
                  timestampsCount: categoryTimestamps.length,
                  timestamps: categoryTimestamps
                });
              });
            }
          } catch (googleError) {
            console.warn('Google Video Intelligence failed:', googleError);
            issues.push({
              id: 'google-failed',
              type: 'Google Analysis Failed',
              status: 'dismissed' as const,
              confidence: 0,
              timestamp: new Date().toLocaleString(),
              model: 'Google Video Intelligence',
              description: 'Google Video Intelligence analysis failed.',
              icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
            });
          }
        }
      }

      // Add Azure moderation for text content
      try {
        const azureResult = await moderateWithAzure(videoContent);
        if (azureResult?.flagged) {
          azureResult.categories.forEach((category: string, index: number) => {
            const score = azureResult.categoryScores?.[category] ?? 0;
            issues.push({
              id: `azure-${category}-${index}`,
              type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              status: 'active' as const,
              confidence: Math.round(score * 100),
              timestamp: new Date().toLocaleString(),
              model: 'Azure Content Safety',
              description: `Azure detected ${category} content with ${Math.round(score * 100)}% confidence`,
              icon: 'https://api.builder.io/api/v1/image/assets/TEMP/621c8c5642880383388d15c77d0d83b3374d09eb?placeholderIfAbsent=true'
            });
          });
        }
      } catch (azureError) {
        console.warn('Azure Content Safety failed:', azureError);
        issues.push({
          id: 'azure-failed',
          type: 'Azure Analysis Failed',
          status: 'dismissed' as const,
          confidence: 0,
          timestamp: new Date().toLocaleString(),
          model: 'Azure Content Safety',
          description: 'Azure Content Safety analysis failed.',
          icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
        });
      }

      // If no issues were generated, add a content approved issue
      if (issues.length === 0 || issues.every(f => f.status === 'dismissed')) {
        issues.push({
          id: 'content-approved',
          type: 'Content Approved',
          status: 'dismissed' as const,
          confidence: 95,
          timestamp: new Date().toLocaleString(),
          model: 'Multi-Provider Analysis',
          description: 'No policy violations detected. Content passed all moderation checks.',
          icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
        });
      }
      setModerationIssues(issues);

      // Save moderation results to localStorage for persistence
      const activeIssues = issues.filter(f => f.status === 'active');
      // Collect all timestamps from active issues (if any)
      const allTimestamps = activeIssues.filter(f => Array.isArray(f.timestamps) && f.timestamps.length > 0).flatMap(f => f.timestamps as Array<{
        timeOffset: number;
        categories: string[];
        confidence: number;
      }>);
      if (activeIssues.length > 0) {
        const moderationResult = {
          flagged: true,
          categories: activeIssues.map(f => f.type),
          categoryScores: Object.fromEntries(activeIssues.map(f => [f.type, f.confidence / 100])),
          provider: 'Multi-Provider Analysis',
          timestamp: new Date().toISOString(),
          // Persist timestamps so they survive refresh
          timestamps: allTimestamps
        } as any;
        updateModerationResult(contentData.id, 'completed', moderationResult);
      } else {
        const moderationResult = {
          flagged: false,
          categories: [],
          categoryScores: {},
          provider: 'Multi-Provider Analysis',
          timestamp: new Date().toISOString(),
          timestamps: []
        } as any;
        updateModerationResult(contentData.id, 'completed', moderationResult);
      }

      // Debug log the final issues array
      console.log('Final moderation issues with timestamps:', issues.map(f => ({
        type: f.type,
        timestampsCount: f.timestamps?.length || 0,
        hasTimestamps: !!f.timestamps
      })));
      toast({
        title: "Analysis Complete",
        description: `Found ${activeIssues.length} issues for "${contentData.title}" using Google and Azure`
      });
    } catch (error: any) {
      console.error('Content analysis failed:', error);
      let errorDescription = 'Unable to analyze content. Google API failed.';

      // Handle specific error cases
      if (error?.message?.includes('LOCALHOST_UNREACHABLE')) {
        errorDescription = 'Cannot access localhost video URLs from server. Please upload video to public storage or use a publicly accessible URL.';
      } else if (error?.message?.includes('404')) {
        errorDescription = 'Video not found. Please check the video URL is correct and accessible.';
      } else if (error?.message?.includes('403') || error?.message?.includes('unauthorized')) {
        errorDescription = 'API keys invalid or services not enabled. Check your Google Cloud configuration.';
      }
      setModerationIssues([{
        id: 'analysis-failed',
        type: 'Analysis Failed',
        status: 'active' as const,
        confidence: 0,
        timestamp: new Date().toLocaleString(),
        model: 'Multi-Provider Analysis',
        description: errorDescription,
        icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
      }]);
      toast({
        title: "Analysis Failed",
        description: errorDescription,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Test Azure API - removed as per user request

  // Handle local file selection -> upload to Supabase then analyze
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAndAnalyzeLocalFile(file);
    // clear input
    e.target.value = '';
  };
  const uploadAndAnalyzeLocalFile = async (file: File) => {
    try {
      setIsAnalyzing(true);
      toast({
        title: "Uploading video",
        description: "Preparing a copy for analysis..."
      });
      const ext = file.name.split('.').pop() || 'mp4';
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const {
        error: uploadError
      } = await supabase.storage.from('videos').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'video/mp4'
      });
      if (uploadError) {
        console.error('Upload failed:', uploadError);
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }
      const {
        data: pub
      } = supabase.storage.from('videos').getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      // Run Google analysis on uploaded URL
      const googleResult = await moderateWithGoogleVideo(publicUrl);
      const issues: any[] = [];
      if (googleResult?.flagged) {
        googleResult.categories.forEach((category: string, index: number) => {
          const score = googleResult.categoryScores?.[category] ?? 0;

          // Get timestamps for this specific category - improve matching logic
          const categoryTimestamps = googleResult.timestamps?.filter((ts: any) => {
            // Check if any of the timestamp categories match the current category
            return ts.categories.some((tsCategory: string) => tsCategory === category || tsCategory.toLowerCase() === category.toLowerCase() || tsCategory.replace(/[/_]/g, ' ').toLowerCase() === category.replace(/[/_]/g, ' ').toLowerCase());
          }) || [];
          console.log(`Processing Google category "${category}":`, {
            totalTimestamps: googleResult.timestamps?.length || 0,
            matchingTimestamps: categoryTimestamps.length,
            timestampCategories: googleResult.timestamps?.map(ts => ts.categories) || [],
            categoryTimestamps
          });
          issues.push({
            id: `google-${category}-${index}`,
            type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            status: 'active' as const,
            confidence: Math.round(score * 100),
            timestamp: new Date().toLocaleString(),
            model: 'Google Video Intelligence',
            description: `Google detected ${category} content with ${Math.round(score * 100)}% confidence${categoryTimestamps.length > 0 ? ` at ${categoryTimestamps.length} timestamp(s)` : ''}`,
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/621c8c5642880383388d15c77d0d83b3374d09eb?placeholderIfAbsent=true',
            timestamps: categoryTimestamps
          });

          // Debug log for timestamps
          console.log(`Created issue for ${category}:`, {
            category,
            timestampsCount: categoryTimestamps.length,
            timestamps: categoryTimestamps
          });
        });
      }
      if (issues.length === 0) {
        issues.push({
          id: 'content-approved',
          type: 'Content Approved',
          status: 'dismissed' as const,
          confidence: 95,
          timestamp: new Date().toLocaleString(),
          model: 'Google Video Intelligence',
          description: 'No policy violations detected.',
          icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
        });
      }
      setModerationIssues(issues);

      // Save moderation results to localStorage for persistence
      const activeIssues = issues.filter(f => f.status === 'active');
      // Collect all timestamps from active issues (if any)
      const allTimestamps = activeIssues.filter(f => Array.isArray(f.timestamps) && f.timestamps.length > 0).flatMap(f => f.timestamps as Array<{
        timeOffset: number;
        categories: string[];
        confidence: number;
      }>);
      if (activeIssues.length > 0) {
        const moderationResult = {
          flagged: true,
          categories: activeIssues.map(f => f.type),
          categoryScores: Object.fromEntries(activeIssues.map(f => [f.type, f.confidence / 100])),
          provider: 'Google Video Intelligence',
          timestamp: new Date().toISOString(),
          timestamps: allTimestamps
        } as any;
        updateModerationResult(contentData.id, 'completed', moderationResult);
      } else {
        const moderationResult = {
          flagged: false,
          categories: [],
          categoryScores: {},
          provider: 'Google Video Intelligence',
          timestamp: new Date().toISOString(),
          timestamps: []
        } as any;
        updateModerationResult(contentData.id, 'completed', moderationResult);
      }
      toast({
        title: "Analysis Complete",
        description: `Found ${activeIssues.length} issues for "${contentData.title}"`
      });
    } catch (err: any) {
      console.error('Local upload analyze failed:', err);
      toast({
        title: "Analysis Failed",
        description: err?.message || 'Unable to analyze uploaded copy.',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Use stored moderation results if available, otherwise auto-analyze
  useEffect(() => {
    console.log('Content moderation check:', {
      itemsLoading,
      currentContent: currentContent?.id,
      hasModerationResult: !!currentContent?.moderation_result,
      moderationStatus: currentContent?.moderation_status,
      videoUrl: contentData.videoUrl
    });
    if (!itemsLoading && currentContent) {
      // Check if we have stored results for this content
      if (currentContent.moderation_result && currentContent.moderation_status === 'completed') {
        console.log('Using stored moderation results for:', currentContent.id);
        const result = currentContent.moderation_result;
        setCurrentModerationResult(result);
        const flags: any[] = [];
        if (result.flagged) {
          result.categories.forEach((category: string, index: number) => {
            const score = result.categoryScores?.[category] ?? 0;

            // Get timestamps for this specific category from the stored result - improve matching
            const categoryTimestamps = (result as any).timestamps?.filter((ts: any) => {
              return ts.categories.some((tsCategory: string) => tsCategory === category || tsCategory.toLowerCase() === category.toLowerCase() || tsCategory.replace(/[/_]/g, ' ').toLowerCase() === category.replace(/[/_]/g, ' ').toLowerCase());
            }) || [];
            console.log(`Processing stored category "${category}":`, {
              totalTimestamps: (result as any).timestamps?.length || 0,
              matchingTimestamps: categoryTimestamps.length,
              timestampCategories: (result as any).timestamps?.map((ts: any) => ts.categories) || []
            });
            flags.push({
              id: `${result.provider.toLowerCase().replace(/\s+/g, '-')}-${category}-${index}`,
              type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              status: 'active' as const,
              confidence: Math.round(score * 100),
              timestamp: new Date(result.timestamp).toLocaleString(),
              model: result.provider,
              description: `${result.provider} detected ${category} content with ${Math.round(score * 100)}% confidence${categoryTimestamps.length > 0 ? ` at ${categoryTimestamps.length} timestamp(s)` : ''}`,
              icon: 'https://api.builder.io/api/v1/image/assets/TEMP/621c8c5642880383388d15c77d0d83b3374d09eb?placeholderIfAbsent=true',
              timestamps: categoryTimestamps
            });
          });
        }
        if (flags.length === 0) {
          flags.push({
            id: 'content-approved',
            type: 'Content Approved',
            status: 'dismissed' as const,
            confidence: 95,
            timestamp: new Date(result.timestamp).toLocaleString(),
            model: result.provider,
            description: 'No policy violations detected. Content passed all moderation checks.',
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
          });
        }
        setModerationIssues(flags);
        setCurrentModerationResult(result);
        setIsAnalyzing(false);
      } else if (contentData.videoUrl && (!currentContent.moderation_result || currentContent.moderation_status !== 'completed')) {
        // Only analyze if no stored results or analysis not complete
        console.log('No stored results found, running analysis for:', currentContent.id);
        analyzeContent();
      }
    }
  }, [itemsLoading, currentContent?.id, currentContent?.moderation_status, currentContent?.moderation_result]);
  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };
  const handleUnblur = () => {
    setIsContentBlurred(!isContentBlurred);
  };
  const handleReportIssue = () => {
    console.log('Report issue submitted');
    // Handle report issue logic
  };
  const toggleCompactView = () => {
    const newCompactView = !isCompactView;
    setIsCompactView(newCompactView);
    
    if (newCompactView) {
      // Right option (compact view): Set media player to minimum width (40%)
      rightPanelRef.current?.resize(40);
      leftPanelRef.current?.resize(60);
    } else {
      // Left option (normal view): Use current widths as the restored state
      // Don't change sizes when switching to normal view - keep current manual adjustments
      // This preserves whatever the user manually set with the resize handle
    }
  };
  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Content accepted');
      // Handle success (e.g., navigate to next item)
    } catch (error) {
      console.error('Error accepting content:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleReject = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Content rejected');
      // Handle success (e.g., navigate to next item)
    } catch (error) {
      console.error('Error rejecting content:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleEscalate = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Content escalated');
      // Handle success (e.g., navigate to next item)
    } catch (error) {
      console.error('Error escalating content:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  return <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isExpanded={sidebarExpanded} onToggle={handleSidebarToggle} />

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col overflow-hidden h-full transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-14'}`}>
        {/* Header */}
        <Header contentId={contentData.id} priority={contentData.priority} sidebarExpanded={sidebarExpanded} isCompactView={isCompactView} onToggleCompactView={toggleCompactView} />
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" aria-hidden="true" onChange={e => handleFileChange(e)} />

        <div className="flex-1 overflow-hidden h-full flex">
          {/* Content Area */}
          <PanelGroup direction="horizontal" className="h-full min-h-0 w-full">
            {/* Left Section - Tab Section */}
            <Panel defaultSize={30} minSize={20} maxSize={60} className="min-h-0">
              <div className="h-full flex flex-col min-h-0">
                <IssuesPanel issues={moderationIssues} userReports={3} uploaderStatus="good" moderationHistory={3} isAnalyzing={isAnalyzing} onRunAnalysis={analyzeContent} onSeekToTimestamp={seekFunction} sidebarExpanded={sidebarExpanded} />
              </div>
            </Panel>
            
            <PanelResizeHandle className="w-2 bg-border hover:bg-accent cursor-col-resize flex items-center justify-center group">
              <div className="w-1 h-8 bg-muted-foreground group-hover:bg-foreground rounded-full transition-colors"></div>
            </PanelResizeHandle>
            
            {/* Right Section - Media Player Section */}
            <Panel defaultSize={70} minSize={40} className="h-full">
              <div className="px-4 pt-2 pb-4 h-full overflow-hidden flex flex-col">
                <div className="flex-1 flex flex-col gap-2 min-h-0 h-full">
                  <div className="flex-1 min-h-0">
                    <VideoPlayer isBlurred={isContentBlurred} onUnblur={handleUnblur} onReportIssue={handleReportIssue} videoUrl={contentData.videoUrl} onPlayerReady={seekFn => setSeekFunction(() => seekFn)} />
                  </div>
                  
                  {/* Timestamp Markers */}
                  {currentModerationResult?.timestamps && (
                    <div className="flex-shrink-0">
                      <TimestampMarkers timestamps={currentModerationResult.timestamps} onSeekTo={time => {
                        // This would seek the video to the timestamp
                        console.log('Seeking to:', time);
                      }} videoDuration={60} // Would need to get actual duration from video player
                      />
                    </div>
                  )}
                  
                  <div className="flex-shrink-0">
                    <ContentMetadata title={contentData.title} uploadDate={contentData.uploadDate} views={contentData.views} viewerReports={contentData.viewerReports} />
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>

        {/* Action Bar */}
        <ActionBar onAccept={handleAccept} onReject={handleReject} onEscalate={handleEscalate} disabled={isProcessing} />
      </main>
    </div>;
};
export default Index;