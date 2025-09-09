import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FlagsPanel } from '@/components/FlagsPanel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ContentMetadata } from '@/components/ContentMetadata';
import { ActionBar } from '@/components/ActionBar';
import { ModerationTest } from '@/components/ModerationTest';
import { useModeration } from '@/hooks/useModeration';

const Index = () => {
  const { contentId } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isContentBlurred, setIsContentBlurred] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moderationFlags, setModerationFlags] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  
  const { moderateWithBoth } = useModeration();

  // Mock data - in real app, this would be fetched based on contentId
  const contentData = {
    id: contentId ? `#${contentId}` : "#67890", // Add # back for display
    priority: "high" as const,
    title: contentId === "67890" ? "NHL Greatest Fights Of All Time" : 
           contentId === "77889" ? "Cooking Tutorial - Italian Pasta" :
           contentId === "99001" ? "DIY Home Improvement Tips" :
           "Content Item - Under Review",
    uploadDate: contentId === "67890" ? "12/03/2024" : "15/01/2024",
    views: contentId === "67890" ? 15781 : 2156,
    viewerReports: contentId === "67890" ? 12 : 8,
  };

  // Video content for moderation analysis - updated for NHL fights video
  const videoContent = `
    Video Title: NHL Greatest Fights Of All Time
    Description: Compilation of the most intense and memorable fights in NHL hockey history.
    Contains themes of: ice hockey, professional sports, physical altercations, competitive fighting.
    Content may include: aggressive physical contact, fighting, competitive sports violence, athletic confrontations.
    Context: Sports compilation highlighting physical aspects of professional hockey competition.
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
            id: "clean-hockey-content",
            type: "Sports Content Approved",
            status: "dismissed" as const,
            confidence: 89,
            timestamp: new Date().toLocaleString(),
            model: "Combined AI Analysis", 
            description: "NHL hockey fights compilation analyzed by both OpenAI and Azure APIs. Content classified as legitimate sports entertainment. Physical contact within acceptable sports competition guidelines.",
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
            type: "Hockey Sports Content",
            status: "dismissed" as const,
            confidence: 85,
            timestamp: new Date().toLocaleString(),
            model: "Demo Analysis",
            description: "Demo mode: NHL hockey fights compilation detected. Content shows professional sports altercations within competitive hockey context. Sports entertainment content approved.",
            icon: "https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true"
          },
          {
            id: "violence-check",
            type: "Violence Assessment", 
            status: "dismissed" as const,
            confidence: 91,
            timestamp: new Date().toLocaleString(),
            model: "Demo Analysis",
            description: "Physical altercations detected but classified as legitimate competitive sports content. NHL fighting is within acceptable sports entertainment guidelines.",
            icon: "https://api.builder.io/api/v1/image/assets/TEMP/621c8c5642880383388d15c77d0d83b3374d09eb?placeholderIfAbsent=true"
          },
          {
            id: "sports-content",
            type: "Professional Sports Content",
            status: "dismissed" as const,
            confidence: 93,
            timestamp: new Date().toLocaleString(),
            model: "Content Classifier",
            description: "Video classified as professional sports compilation. Hockey fight highlights detected. Suitable for sports entertainment platforms.",
            icon: "https://api.builder.io/api/v1/image/assets/TEMP/621c8c5642880383388d15c77d0d83b3374d09eb?placeholderIfAbsent=true"
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
