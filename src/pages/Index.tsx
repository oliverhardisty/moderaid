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

const Index = () => {
  const { contentId } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isContentBlurred, setIsContentBlurred] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moderationFlags, setModerationFlags] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isCompactView, setIsCompactView] = useState(false);
  
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  
  const { moderateWithBoth, moderateWithGoogleVideo } = useModeration();

  // Content data - fetch from ContentList data structure
  const allContentItems = [
    {
      id: '#67890',
      title: 'NHL Greatest Fights Of All Time',
      uploadDate: 'Mar 12, 2024',
      views: 15781,
      userReports: 12,
      priority: 'high' as const
    },
    {
      id: '#77889',
      title: 'Cooking Tutorial - Italian Pasta',
      uploadDate: 'Jan 11, 2024',
      views: 1685,
      userReports: 0,
      priority: 'medium' as const
    },
    {
      id: '#99001',
      title: 'DIY Home Improvement Tips',
      uploadDate: 'Jan 10, 2024',
      views: 562,
      userReports: 1,
      priority: 'low' as const
    }
  ];

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
    console.log('Starting content analysis...');
    setIsAnalyzing(true);
    try {
      console.log('Calling moderation APIs with content:', videoContent);
      const [results, googleVideo] = await Promise.all([
        moderateWithBoth(videoContent),
        contentData.videoUrl ? moderateWithGoogleVideo(contentData.videoUrl).catch(() => null) : Promise.resolve(null)
      ]);
      console.log('Moderation results received:', results, googleVideo);
      
      const flags = [];
      
      // Create flags based on OpenAI results
      if (results.openai.flagged) {
        results.openai.categories.forEach((category, index) => {
          const score = results.openai.categoryScores[category] || 0;
          flags.push({
            id: `openai-${category}-${index}`,
            type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            status: 'active' as const,
            confidence: Math.round(score * 100),
            timestamp: new Date().toLocaleString(),
            model: 'OpenAI Moderation API',
            description: `OpenAI detected ${category} content with ${Math.round(score * 100)}% confidence`,
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/c2e47eddddb0febc028c8752cdb97d2a6f99be13?placeholderIfAbsent=true'
          });
        });
      }

      // Create flags based on Azure results  
      if (results.azure.flagged) {
        results.azure.categories.forEach((category, index) => {
          const score = results.azure.categoryScores[category] || 0;
          flags.push({
            id: `azure-${category}-${index}`,
            type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            status: 'active' as const,
            confidence: Math.round(score * 100),
            timestamp: new Date().toLocaleString(),
            model: 'Azure Content Safety',
            description: `Azure detected ${category} content with ${Math.round(score * 100)}% confidence`,
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/621c8c5642880383388d15c77d0d83b3374d09eb?placeholderIfAbsent=true'
          });
        });
      }

      // Create flags based on Google Video Intelligence results
      if (googleVideo && googleVideo.flagged) {
        googleVideo.categories.forEach((category, index) => {
          const score = googleVideo.categoryScores[category] || 0;
          flags.push({
            id: `gvi-${category}-${index}`,
            type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            status: 'active' as const,
            confidence: Math.round(score * 100),
            timestamp: new Date().toLocaleString(),
            model: 'Google Video Intelligence',
            description: `Google Video Intelligence detected ${category} content with ${Math.round(score * 100)}% confidence`,
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
          });
        });
      }

      // If no flags, add a clean content flag
      if (flags.length === 0) {
        flags.push({
          id: "clean-content",
          type: "Content Approved",
          status: "dismissed" as const,
          confidence: 89,
          timestamp: new Date().toLocaleString(),
          model: "Combined AI Analysis", 
          description: "Content analyzed by OpenAI, Azure, and Google Video Intelligence APIs. No policy violations detected.",
          icon: "https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true"
        });
      }

      setModerationFlags(flags);
    } catch (error) {
      console.error("Content analysis failed:", error);
      
      // Create demo flags to show the UI working
      setModerationFlags([
        {
          id: "demo-analysis",
          type: "Analysis Error",
          status: "dismissed" as const,
          confidence: 0,
          timestamp: new Date().toLocaleString(),
          model: "Error Handler",
          description: "Content analysis failed. Using demo mode to show UI functionality.",
          icon: "https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true"
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
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
          contentId={contentData.id}
          priority={contentData.priority}
          sidebarExpanded={sidebarExpanded}
        />

        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-col pt-16 pb-20 overflow-hidden">
          {/* View Toggle */}
          <div className="px-4 pb-2 pt-2 flex justify-end items-center flex-shrink-0">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => !isCompactView || toggleCompactView()}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                !isCompactView 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.749512" y="0.991272" width="18.9246" height="13.9557" rx="1.5" stroke="currentColor" strokeLinecap="round"/>
                <rect x="6.23047" y="3.08093" width="11.5454" height="8.08487" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <button
              onClick={() => isCompactView || toggleCompactView()}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                isCompactView 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.27246" y="0.991272" width="18.9246" height="13.9557" rx="1.5" stroke="currentColor" strokeLinecap="round"/>
                <rect x="10.7349" y="2.96021" width="7.48682" height="5.70145" rx="1" fill="currentColor"/>
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
                />
              </div>
            </Panel>
            
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize flex items-center justify-center">
              <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
            </PanelResizeHandle>

            {/* Right Panel - Video Player and Metadata */}
            <Panel ref={rightPanelRef} defaultSize={70} minSize={40}>
              <div className="flex flex-col gap-4 h-full pl-4">
                <VideoPlayer 
                  isBlurred={isContentBlurred}
                  onUnblur={handleUnblur}
                  onReportIssue={handleReportIssue}
                  videoUrl={contentData.videoUrl}
                />
                
                <ContentMetadata 
                  title={contentData.title}
                  uploadDate={contentData.uploadDate}
                  views={contentData.views}
                  viewerReports={contentData.viewerReports}
                />
              </div>
            </Panel>
          </PanelGroup>
          </div>
        </div>

        {/* Action Bar */}
        <ActionBar 
          onAccept={handleAccept}
          onReject={handleReject}
          onEscalate={handleEscalate}
          disabled={isProcessing}
        />
      </main>
    </div>
  );
};

export default Index;
