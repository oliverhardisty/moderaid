import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FlagsPanel } from '@/components/FlagsPanel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ContentMetadata } from '@/components/ContentMetadata';
import { ActionBar } from '@/components/ActionBar';
import { ModerationTest } from '@/components/ModerationTest';
import { useModeration } from '@/hooks/useModeration';

const Index = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isContentBlurred, setIsContentBlurred] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moderationFlags, setModerationFlags] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  
  const { moderateWithBoth } = useModeration();

  // Mock data
  const contentData = {
    id: '#67890',
    priority: 'high' as const,
    title: 'Adult Content Video - Flagged for Review',
    uploadDate: '15/01/2024',
    views: 2156,
    viewerReports: 8,
  };

  // Video content for moderation analysis
  const videoContent = `
    Video Title: Rick Astley - Never Gonna Give You Up (Official Music Video)
    Description: The official video for "Never Gonna Give You Up" by Rick Astley. 
    A classic 1980s pop song with romantic lyrics about commitment and love.
    Contains themes of: romance, commitment, relationships, 1980s music culture.
    No explicit content, violence, or inappropriate material detected.
  `;

  // Analyze video content with moderation APIs
  useEffect(() => {
    const analyzeContent = async () => {
      console.log('Starting content analysis...');
      setIsAnalyzing(true);
      try {
        console.log('Calling moderation APIs with content:', videoContent);
        const results = await moderateWithBoth(videoContent);
        console.log('Moderation results received:', results);
        
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

        // If no flags, add a clean content flag
        if (flags.length === 0) {
          flags.push({
            id: 'clean-content',
            type: 'Content Analysis Complete',
            status: 'dismissed' as const,
            confidence: 95,
            timestamp: new Date().toLocaleString(),
            model: 'Combined AI Analysis',
            description: 'Content analyzed by both OpenAI and Azure APIs. No policy violations detected. Safe for general audiences.',
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
          });
        }

        setModerationFlags(flags);
      } catch (error) {
        console.error('Content analysis failed:', error);
        // Create demo flags to show the UI working
        setModerationFlags([
          {
            id: 'demo-analysis',
            type: 'Content Analysis Complete',
            status: 'dismissed' as const,
            confidence: 95,
            timestamp: new Date().toLocaleString(),
            model: 'Demo Analysis',
            description: 'Demo mode: This video appears to be "Never Gonna Give You Up" by Rick Astley - a clean, family-friendly music video with no content policy violations detected.',
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
          },
          {
            id: 'setup-reminder',
            type: 'API Setup Required',
            status: 'active' as const,
            confidence: 100,
            timestamp: new Date().toLocaleString(),
            model: 'System',
            description: 'To enable real-time moderation analysis, please ensure your OpenAI and Azure API keys are configured in Supabase Edge Function Secrets and functions are deployed.',
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/c2e47eddddb0febc028c8752cdb97d2a6f99be13?placeholderIfAbsent=true'
          }
        ]);
      } finally {
        setIsAnalyzing(false);
      }
    };

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
            />
          </div>

          {/* Right Panel - Video Player and Metadata */}
          <div className="flex-1 flex flex-col gap-4">
            <VideoPlayer 
              isBlurred={isContentBlurred}
              onUnblur={handleUnblur}
              onReportIssue={handleReportIssue}
            />
            
            <ContentMetadata 
              title={contentData.title}
              uploadDate={contentData.uploadDate}
              views={contentData.views}
              viewerReports={contentData.viewerReports}
            />

            {/* Moderation API Test */}
            <ModerationTest />
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
