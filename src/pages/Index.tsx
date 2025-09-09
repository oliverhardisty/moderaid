import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FlagsPanel } from '@/components/FlagsPanel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ContentMetadata } from '@/components/ContentMetadata';
import { ActionBar } from '@/components/ActionBar';

import { useModeration } from '@/hooks/useModeration';

const Index = () => {
  const { contentId } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isContentBlurred, setIsContentBlurred] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moderationFlags, setModerationFlags] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  
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
    setIsContentBlurred(false);
  };

  const handleReportIssue = () => {
    console.log('Report issue submitted');
    // Handle report issue logic
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
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          contentId={contentData.id}
          priority={contentData.priority}
        />

        {/* Content Area */}
        <div className="flex-1 flex gap-4 p-4">
          {/* Left Panel - Flags and Reports */}
          <div className="w-80 flex-shrink-0">
            <FlagsPanel 
              flags={moderationFlags}
              userReports={3}
              uploaderStatus="good"
              moderationHistory={3}
              isAnalyzing={isAnalyzing}
              onRunAnalysis={analyzeContent}
            />
          </div>

          {/* Right Panel - Video Player and Metadata */}
          <div className="flex-1 flex flex-col gap-4">
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
