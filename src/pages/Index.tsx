import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FlagsPanel } from '@/components/FlagsPanel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ContentMetadata } from '@/components/ContentMetadata';
import { ActionBar } from '@/components/ActionBar';

const Index = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isContentBlurred, setIsContentBlurred] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data
  const contentData = {
    id: '#67890',
    priority: 'high' as const,
    title: 'Adult Content Video - Flagged for Review',
    uploadDate: '15/01/2024',
    views: 2156,
    viewerReports: 8,
  };

  const flagsData = [
    {
      id: '1',
      type: 'Adult Content',
      status: 'active' as const,
      confidence: 92,
      timestamp: '15/01/2024, 09:15:00',
      model: 'Vision AI v2.1',
      description: 'High confidence detection of adult/mature content based on visual analysis',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/c2e47eddddb0febc028c8752cdb97d2a6f99be13?placeholderIfAbsent=true'
    },
    {
      id: '2',
      type: 'Spam Detection',
      status: 'active' as const,
      confidence: 78,
      timestamp: '15/01/2024, 09:16:00',
      model: 'Content Classifier v1.8',
      description: 'Content pattern matches known spam characteristics',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/621c8c5642880383388d15c77d0d83b3374d09eb?placeholderIfAbsent=true'
    },
    {
      id: '3',
      type: 'Violence Detection',
      status: 'dismissed' as const,
      confidence: 34,
      timestamp: '15/01/2024, 09:17:00',
      model: 'Safety Detector v3.0',
      description: 'Low confidence detection - likely false positive',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
    }
  ];

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
    <div className="flex items-stretch flex-wrap min-h-screen">
      {/* Sidebar */}
      <Sidebar 
        isExpanded={sidebarExpanded} 
        onToggle={handleSidebarToggle} 
      />

      {/* Main Content Area */}
      <main className="min-w-60 min-h-[965px] flex-1 shrink basis-[0%] max-md:max-w-full">
        <div className="w-full bg-neutral-50 pb-10 max-md:max-w-full">
          {/* Header */}
          <Header 
            contentId={contentData.id}
            priority={contentData.priority}
          />

          {/* Content Area */}
          <div className="justify-center items-stretch flex min-h-[771px] w-full gap-[21px] flex-wrap mt-5 px-[13px] max-md:max-w-full">
            {/* Left Panel - Flags and Reports */}
            <FlagsPanel 
              flags={flagsData}
              userReports={3}
              uploaderStatus="good"
              moderationHistory={3}
            />

            {/* Right Panel - Video Player and Metadata */}
            <div className="min-w-60 overflow-hidden grow shrink w-[1191px] max-md:max-w-full">
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
            </div>
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
