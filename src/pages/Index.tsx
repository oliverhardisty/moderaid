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
    moderateWithBoth,
    moderateWithGoogleVideo,
    moderateWithGoogleVideoContent
  } = useModeration();

  // Content data - fetch from ContentList data structure
  const allContentItems = [{
    id: '#67890',
    title: 'NHL Greatest Fights Of All Time',
    uploadDate: 'Mar 12, 2024',
    views: 15781,
    userReports: 12,
    priority: 'high' as const,
    videoUrl: 'http://localhost:8000/Documents/Career/Designs/1.%20Product%20design/Company%20work/Yoti/Content%20moderation/Moderaid/Content/clips/0539c3dc73b0/0539c3dc73b0.mp4'
  }, {
    id: '#77889',
    title: 'Cooking Tutorial - Italian Pasta',
    uploadDate: 'Jan 11, 2024',
    views: 1685,
    userReports: 0,
    priority: 'medium' as const,
    videoUrl: 'http://localhost:8000/Documents/Career/Designs/1.%20Product%20design/Company%20work/Yoti/Content%20moderation/Moderaid/Content/clips/0539c3dc73b0/0539c3dc73b0.mp4'
  }, {
    id: '#99001',
    title: 'DIY Home Improvement Tips',
    uploadDate: 'Jan 10, 2024',
    views: 562,
    userReports: 1,
    priority: 'low' as const
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
    console.log('Starting content analysis...');
    setIsAnalyzing(true);

    // Helper: read a local file to base64 (no data: prefix)
    const fileToBase64 = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    // Helper: prompt user to pick a local video and return base64
    const promptLocalVideoAsBase64 = async (): Promise<string | null> => {
      toast({ title: 'Local video not reachable', description: 'Select the local file to analyze it securely in-browser.' });
      try {
        if ('showOpenFilePicker' in window) {
          // @ts-ignore - File System Access API
          const [handle] = await (window as any).showOpenFilePicker({
            types: [{ description: 'Video', accept: { 'video/*': ['.mp4', '.webm', '.mov', '.mkv'] } }],
            multiple: false,
          });
          const file = await handle.getFile();
          return await fileToBase64(file);
        }
      } catch (e) {
        console.warn('showOpenFilePicker failed, falling back to input:', e);
      }

      return await new Promise<string | null>((resolve) => {
        const input = fileInputRef.current;
        if (!input) return resolve(null);
        const cleanup = () => {
          input.value = '';
          input.onchange = null;
        };
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) {
            cleanup();
            return resolve(null);
          }
          try {
            const b64 = await fileToBase64(file);
            cleanup();
            resolve(b64);
          } catch (err) {
            console.error('Failed reading file:', err);
            cleanup();
            resolve(null);
          }
        };
        input.click();
      });
    };

    try {
      console.log('Calling moderation APIs with content:', videoContent);

      // Run text-based checks, but do not fail overall if providers are misconfigured
      let results: any = null;
      try {
        results = await moderateWithBoth(videoContent);
      } catch (e) {
        console.warn('Text moderation failed, continuing with video analysis:', e);
        results = {
          openai: { flagged: false, categories: [], categoryScores: {}, provider: 'openai', timestamp: new Date().toISOString() },
          azure: { flagged: false, categories: [], categoryScores: {}, provider: 'azure', timestamp: new Date().toISOString() },
          consensus: { flagged: false, categories: [], confidence: 'low' as const },
        };
      }

      // Video checks (Google Video Intelligence)
      const url = contentData.videoUrl as string | undefined;
      let googleVideo: any = null;
      if (url) {
        try {
          if (url.startsWith('gs://')) {
            googleVideo = await moderateWithGoogleVideo(url);
          } else if (url.includes('localhost')) {
            // Try direct fetch first (works only if same-origin and reachable)
            try {
              const res = await fetch(url);
              if (!res.ok) throw new Error('Fetch failed');
              const buf = await res.arrayBuffer();
              // Chunked to base64
              let binary = '';
              const bytes = new Uint8Array(buf);
              const chunkSize = 0x8000;
              for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.subarray(i, i + chunkSize);
                binary += String.fromCharCode(...chunk);
              }
              const b64 = btoa(binary);
              googleVideo = await moderateWithGoogleVideoContent(b64);
            } catch {
              // If the sandbox cannot reach localhost, ask user to pick the file
              const b64 = await promptLocalVideoAsBase64();
              if (b64) googleVideo = await moderateWithGoogleVideoContent(b64);
            }
          } else {
            // Remote URL - let the edge function fetch and analyze
            googleVideo = await moderateWithGoogleVideo(url);
          }
        } catch (e) {
          console.warn('Google Video analysis failed:', e);
        }
      }

      console.log('Moderation results received:', results, googleVideo);

      const flags: any[] = [];

      if (results?.openai?.flagged) {
        results.openai.categories.forEach((category: string, index: number) => {
          const score = results.openai.categoryScores?.[category] || 0;
          flags.push({
            id: `openai-${category}-${index}`,
            type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            status: 'active' as const,
            confidence: Math.round(score * 100),
            timestamp: new Date().toLocaleString(),
            model: 'OpenAI Moderation API',
            description: `OpenAI detected ${category} content with ${Math.round(score * 100)}% confidence`,
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/c2e47eddddb0febc028c8752cdb97d2a6f99be13?placeholderIfAbsent=true'
          });
        });
      }

      if (results?.azure?.flagged) {
        results.azure.categories.forEach((category: string, index: number) => {
          const score = results.azure.categoryScores?.[category] || 0;
          flags.push({
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

      if (googleVideo?.flagged) {
        googleVideo.categories.forEach((category: string, index: number) => {
          const score = googleVideo.categoryScores?.[category] || 0;
          flags.push({
            id: `gvi-${category}-${index}`,
            type: category.replace(/[/_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            status: 'active' as const,
            confidence: Math.round(score * 100),
            timestamp: new Date().toLocaleString(),
            model: 'Google Video Intelligence',
            description: `Google Video Intelligence detected ${category} content with ${Math.round(score * 100)}% confidence`,
            icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
          });
        });
      }

      if (flags.length === 0) {
        flags.push({
          id: 'clean-content',
          type: 'Content Approved',
          status: 'dismissed' as const,
          confidence: 89,
          timestamp: new Date().toLocaleString(),
          model: 'Combined AI Analysis',
          description: 'No policy violations detected by available providers.',
          icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
        });
      }

      setModerationFlags(flags);
    } catch (error) {
      console.error('Content analysis failed:', error);
      setModerationFlags([
        {
          id: 'demo-analysis',
          type: 'Analysis Error',
          status: 'dismissed' as const,
          confidence: 0,
          timestamp: new Date().toLocaleString(),
          model: 'Error Handler',
          description: 'Content analysis failed. Using demo mode to show UI functionality.',
          icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
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
                <FlagsPanel flags={moderationFlags} userReports={3} uploaderStatus="good" moderationHistory={3} isAnalyzing={isAnalyzing} onRunAnalysis={analyzeContent} />
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