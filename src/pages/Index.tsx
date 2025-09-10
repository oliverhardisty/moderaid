import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FlagsPanel } from '@/components/FlagsPanel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ContentMetadata } from '@/components/ContentMetadata';
import { ActionBar } from '@/components/ActionBar';
import { PanelGroup, Panel, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';
import { Switch } from '@/components/ui/switch';
import { Layout } from 'lucide-react';
import { useModeration } from '@/hooks/useModeration';
import { useToast } from '@/hooks/use-toast';
const Index = () => {
  const {
    contentId
  } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isContentBlurred, setIsContentBlurred] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moderationFlags, setModerationFlags] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isCompactView, setIsCompactView] = useState(false);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const {
    moderateWithGoogleVideo,
  } = useModeration();

  // Content data - fetch from ContentList data structure
  const allContentItems = [{
    id: '#67890',
    title: 'NHL Greatest Fights Of All Time',
    uploadDate: 'Mar 12, 2024',
    views: 15781,
    userReports: 12,
    priority: 'high' as const,
    videoUrl: 'https://storage.googleapis.com/cloud-samples-data/video/cat.mp4'
  }, {
    id: '#77889',
    title: 'Cooking Tutorial - Italian Pasta',
    uploadDate: 'Jan 11, 2024',
    views: 1685,
    userReports: 0,
    priority: 'medium' as const,
    videoUrl: 'https://storage.googleapis.com/cloud-samples-data/video/cat.mp4'
  }, {
    id: '#99001',
    title: 'DIY Home Improvement Tips',
    uploadDate: 'Jan 10, 2024',
    views: 562,
    userReports: 1,
    priority: 'low' as const,
    videoUrl: 'https://storage.googleapis.com/cloud-samples-data/video/cat.mp4'
  }];
  const currentContent = allContentItems.find(item => item.id === `#${contentId}`) || allContentItems[0];
  const contentData = {
    id: currentContent.id,
    priority: currentContent.priority,
    title: currentContent.title,
    uploadDate: currentContent.uploadDate.replace(/(\w+)\s(\d+),\s(\d+)/, '$2/$1/$3'),
    views: currentContent.views,
    viewerReports: currentContent.userReports,
    videoUrl: (currentContent as any).videoUrl
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
    console.log('Starting content analysis (Google only)...');
    setIsAnalyzing(true);

    try {
      const flags: any[] = [];

      if (!contentData.videoUrl) {
        throw new Error('Missing video URL for analysis');
      }

      const result = await moderateWithGoogleVideo(contentData.videoUrl);

      if (result?.flagged) {
        result.categories.forEach((category: string, index: number) => {
          const score = result.categoryScores?.[category] ?? 0;
          flags.push({
            id: `google-${category}-${index}`,
            type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            status: 'active' as const,
            confidence: Math.round(score * 100),
            timestamp: new Date().toLocaleString(),
            model: 'Google Video Intelligence',
            description: `Google detected ${category} content with ${Math.round(score * 100)}% confidence`,
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/621c8c5642880383388d15c77d0d83b3374d09eb?placeholderIfAbsent=true'
          });
        });
      } else {
        flags.push({
          id: 'content-approved',
          type: 'Content Approved',
          status: 'dismissed' as const,
          confidence: 95,
          timestamp: new Date().toLocaleString(),
          model: 'Google Video Intelligence',
          description: 'No policy violations detected. Content passed Google moderation checks.',
          icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
        });
      }

      setModerationFlags(flags);
      toast({
        title: "Analysis Complete",
        description: `Found ${flags.filter(f => f.status === 'active').length} flags for "${contentData.title}"`
      });
    } catch (error: any) {
      console.error('Content analysis failed:', error);
      
      let errorDescription = 'Unable to analyze content. Please confirm your Google Cloud API key and Video Intelligence API access.';
      
      // Handle specific error cases
      if (error?.message?.includes('LOCALHOST_UNREACHABLE')) {
        errorDescription = 'Cannot access localhost video URLs from server. Please upload video to public storage or use a publicly accessible URL.';
      } else if (error?.message?.includes('404')) {
        errorDescription = 'Video not found. Please check the video URL is correct and accessible.';
      } else if (error?.message?.includes('403') || error?.message?.includes('unauthorized')) {
        errorDescription = 'Google Cloud API key invalid or Video Intelligence API not enabled. Check your API configuration.';
      }
      
      setModerationFlags([
        {
          id: 'analysis-failed',
          type: 'Analysis Failed',
          status: 'active' as const,
          confidence: 0,
          timestamp: new Date().toLocaleString(),
          model: 'Google Video Intelligence',
          description: errorDescription,
          icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
        }
      ]);
      toast({
        title: "Analysis Failed",
        description: errorDescription,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to reset automated flags
  const resetFlags = () => {
    console.log('Resetting automated flags for content:', contentData.id);
    setModerationFlags([]);
    toast({
      title: "Flags Reset",
      description: "All automated flags have been cleared for this content.",
    });
  };

  // Auto-analyze content on mount
  useEffect(() => {
    analyzeContent();
  }, []);
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
      // Compact view: maximize left panel (50%), minimize right panel (40%)
      leftPanelRef.current?.resize(60);
      rightPanelRef.current?.resize(40);
    } else {
      // Normal view: restore default sizes
      leftPanelRef.current?.resize(30);
      rightPanelRef.current?.resize(70);
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
  return <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isExpanded={sidebarExpanded} onToggle={handleSidebarToggle} />

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-14'}`}>
        {/* Header */}
        <Header contentId={contentData.id} priority={contentData.priority} sidebarExpanded={sidebarExpanded} />
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" aria-hidden="true" />


        <div className="flex-1 flex flex-col pt-20 pb-20 overflow-hidden py-[56px]">
          {/* View Toggle */}
          <div className="px-4 pb-2 pt-2 flex justify-end items-center flex-shrink-0">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => !isCompactView || toggleCompactView()} className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${!isCompactView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.749512" y="0.991272" width="18.9246" height="13.9557" rx="1.5" stroke="currentColor" strokeLinecap="round" />
                <rect x="6.23047" y="3.08093" width="11.5454" height="8.08487" rx="1" fill="currentColor" />
              </svg>
            </button>
            <button onClick={() => isCompactView || toggleCompactView()} className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${isCompactView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.27246" y="0.991272" width="18.9246" height="13.9557" rx="1.5" stroke="currentColor" strokeLinecap="round" />
                <rect x="10.7349" y="2.96021" width="7.48682" height="5.70145" rx="1" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

          {/* Content Area */}
          <div className="flex-1 px-4 pb-4 overflow-auto">
            <PanelGroup direction="horizontal" className="h-full min-h-0">
            {/* Left Panel - Flags and Reports */}
            <Panel ref={leftPanelRef} defaultSize={30} minSize={20} maxSize={60}>
              <div className="h-full">
                <FlagsPanel 
                  flags={moderationFlags} 
                  userReports={3} 
                  uploaderStatus="good" 
                  moderationHistory={3} 
                  isAnalyzing={isAnalyzing} 
                  onRunAnalysis={analyzeContent}
                  onResetFlags={resetFlags}
                />
              </div>
            </Panel>
            
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize flex items-center justify-center">
              <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
            </PanelResizeHandle>

            {/* Right Panel - Video Player and Metadata */}
            <Panel ref={rightPanelRef} defaultSize={70} minSize={40}>
              <div className="flex flex-col gap-4 h-full pl-4">
                <VideoPlayer isBlurred={isContentBlurred} onUnblur={handleUnblur} onReportIssue={handleReportIssue} videoUrl={contentData.videoUrl} />
                
                <ContentMetadata title={contentData.title} uploadDate={contentData.uploadDate} views={contentData.views} viewerReports={contentData.viewerReports} />
              </div>
            </Panel>
          </PanelGroup>
          </div>
        </div>

        {/* Action Bar */}
        <ActionBar onAccept={handleAccept} onReject={handleReject} onEscalate={handleEscalate} disabled={isProcessing} />
      </main>
    </div>;
};
export default Index;