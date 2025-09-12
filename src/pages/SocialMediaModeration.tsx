import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { IssuesPanel } from '@/components/IssuesPanel';
import { ContentMetadata } from '@/components/ContentMetadata';
import { ActionBar } from '@/components/ActionBar';
import { PanelGroup, Panel, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';
import { Switch } from '@/components/ui/switch';
import { Layout } from 'lucide-react';
import { useModeration } from '@/hooks/useModeration';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

const SocialMediaModeration = () => {
  const { contentId } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isContentBlurred, setIsContentBlurred] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moderationIssues, setModerationIssues] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  
  const [currentModerationResult, setCurrentModerationResult] = useState<any>(null);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const { toast } = useToast();
  const { moderateWithAzure } = useModeration();

  // Sample social media post data
  const contentData = {
    id: `#${contentId}`,
    priority: 'medium' as const,
    title: 'Social Media Post Analysis',
    uploadDate: 'Dec 15, 2024',
    views: 2341,
    viewerReports: 3,
    postText: "Check out this amazing product! 🔥 It's literally the best thing ever invented. Link in bio for instant results! #amazing #bestseller #lifechanging #notascam",
    platform: 'Instagram',
    author: '@user_account_123',
    engagement: { likes: 156, comments: 23, shares: 8 }
  };

  // Social media content for moderation analysis
  const socialContent = `
    Platform: ${contentData.platform}
    Author: ${contentData.author}
    Post Text: ${contentData.postText}
    Engagement: ${contentData.engagement.likes} likes, ${contentData.engagement.comments} comments, ${contentData.engagement.shares} shares
    
    Analysis Request: Please analyze this social media post for any potential policy violations, including but not limited to: spam, misinformation, hate speech, harassment, adult content, violence, or misleading claims. Pay special attention to potentially deceptive marketing practices, false advertising, or harmful content.
    
    Context: User-reported social media post under moderation review for platform safety compliance.
  `;

  // Function to analyze social media content
  const analyzeContent = async () => {
    console.log('Starting social media content analysis...');
    setIsAnalyzing(true);
    try {
      const issues: any[] = [];

      // Use Azure moderation for text content
      try {
        const azureResult = await moderateWithAzure(socialContent);
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
              description: `Azure detected ${category} content with ${Math.round(score * 100)}% confidence in social media post`,
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
          model: 'Azure Content Safety',
          description: 'No policy violations detected. Social media post passed all moderation checks.',
          icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
        });
      }

      setModerationIssues(issues);
      const activeIssues = issues.filter(f => f.status === 'active');

      if (activeIssues.length > 0) {
        const moderationResult = {
          flagged: true,
          categories: activeIssues.map(f => f.type),
          categoryScores: Object.fromEntries(activeIssues.map(f => [f.type, f.confidence / 100])),
          provider: 'Azure Content Safety',
          timestamp: new Date().toISOString()
        };
        setCurrentModerationResult(moderationResult);
      }

      toast({
        title: "Analysis Complete",
        description: `Found ${activeIssues.length} issues for social media post analysis`
      });
    } catch (error: any) {
      console.error('Content analysis failed:', error);
      setModerationIssues([{
        id: 'analysis-failed',
        type: 'Analysis Failed',
        status: 'active' as const,
        confidence: 0,
        timestamp: new Date().toLocaleString(),
        model: 'Azure Content Safety',
        description: 'Social media content analysis failed. Please try again.',
        icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9371b88034800825a248025fe5048d6623ff53f7?placeholderIfAbsent=true'
      }]);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze social media content",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Start analysis when component mounts
    analyzeContent();
  }, [contentId]);

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleUnblur = () => {
    setIsContentBlurred(!isContentBlurred);
  };


  const handleAccept = () => {
    toast({
      title: "Content Accepted",
      description: "Social media post has been approved and will be published."
    });
  };

  const handleReject = () => {
    toast({
      title: "Content Rejected",
      description: "Social media post has been rejected and will be removed."
    });
  };

  const handleEscalate = () => {
    toast({
      title: "Content Escalated", 
      description: "Social media post has been escalated to senior moderators."
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isExpanded={sidebarExpanded} 
        onToggle={handleSidebarToggle} 
      />

      <main className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarExpanded ? 'ml-64' : 'ml-14'
      }`}>
        <Header 
          contentId={contentData.id}
          priority={contentData.priority}
          itemCount={moderationIssues.filter(issue => issue.status === 'active').length}
          sidebarExpanded={sidebarExpanded}
        />

        <div className="flex-1 pt-6 px-6 pb-6">

          <PanelGroup direction="horizontal" className="flex-1">
            <Panel 
              ref={leftPanelRef}
              defaultSize={35}
              minSize={25}
              maxSize={50}
              className="pr-3"
            >
              <IssuesPanel 
                issues={moderationIssues}
                userReports={3}
                uploaderStatus="warning"
                moderationHistory={1}
                isAnalyzing={isAnalyzing}
                onSeekToTimestamp={undefined} // Social media posts don't have video seeking
              />
            </Panel>

            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 rounded-full mx-1" />

            <Panel 
              ref={rightPanelRef}
              defaultSize={65}
              minSize={50}
              className="pl-3"
            >
              <div className="space-y-4">
                {/* Social Media Post Display */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Social Media Post</h3>
                      <div className="text-sm text-gray-500">{contentData.platform}</div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          U
                        </div>
                        <span className="ml-3 font-medium">{contentData.author}</span>
                      </div>
                      
                      <div className={`text-gray-900 mb-4 ${isContentBlurred ? 'blur-sm' : ''}`}>
                        {contentData.postText}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>❤️ {contentData.engagement.likes}</span>
                        <span>💬 {contentData.engagement.comments}</span>
                        <span>🔄 {contentData.engagement.shares}</span>
                      </div>
                    </div>
                    
                    
                    {/* Control Bar */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch 
                          id="blur-content" 
                          checked={!isContentBlurred}
                          onCheckedChange={handleUnblur}
                        />
                        <label htmlFor="blur-content" className="text-sm font-medium">
                          Unblur content
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Content Metadata */}
                <ContentMetadata 
                  title={contentData.title}
                  uploadDate={contentData.uploadDate}
                  views={contentData.views}
                  viewerReports={contentData.viewerReports}
                />
              </div>
            </Panel>
          </PanelGroup>

          <ActionBar 
            onAccept={handleAccept}
            onReject={handleReject}
            onEscalate={handleEscalate}
            disabled={isProcessing}
          />
        </div>
      </main>
    </div>
  );
};

export default SocialMediaModeration;