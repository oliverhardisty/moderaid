import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Flag {
  id: string;
  type: string;
  status: 'active' | 'dismissed';
  confidence: number;
  timestamp: string;
  model: string;
  description: string;
  icon: string;
  timestamps?: Array<{ timeOffset: number; categories: string[]; confidence: number }>;
}

interface FlagsPanelProps {
  flags: Flag[];
  userReports: number;
  uploaderStatus: 'good' | 'warning' | 'bad';
  moderationHistory: number;
  isAnalyzing?: boolean;
  onRunAnalysis?: () => void;
  onSeekToTimestamp?: ((timeInSeconds: number) => void) | null;
  sidebarExpanded?: boolean;
}

export const FlagsPanel: React.FC<FlagsPanelProps> = ({ 
  flags, 
  userReports, 
  uploaderStatus, 
  moderationHistory,
  isAnalyzing = false,
  onRunAnalysis,
  onSeekToTimestamp,
  sidebarExpanded
}) => {
  console.log('FlagsPanel received flags:', flags.map(f => ({
    type: f.type,
    hasTimestamps: !!f.timestamps,
    timestampsLength: f.timestamps?.length || 0
  })));

  const getStatusBadge = (status: string, confidence?: number) => {
    if (status === 'active') {
      return (
        <Badge variant="danger" className="justify-center items-center border self-stretch flex overflow-hidden text-[#9f0712] whitespace-nowrap text-center bg-[#FFE2E2] my-auto px-2 py-[3px] rounded-[6.75px] border-solid border-[#FFA2A2]">
          <span className="text-[10.5px] font-medium leading-[14px] self-stretch my-auto">Active</span>
        </Badge>
      );
    } else if (status === 'dismissed') {
      return (
        <Badge variant="outline" className="justify-center items-center border self-stretch flex overflow-hidden text-[#1e2939] whitespace-nowrap text-center bg-neutral-100 my-auto px-2 py-[3px] rounded-[6.75px] border-solid border-[#D1D5DC]">
          <span className="text-[10.5px] font-medium leading-[14px] self-stretch my-auto">Dismissed</span>
        </Badge>
      );
    }
    return null;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-[#e7000b]';
    if (confidence >= 60) return 'text-[#f54900]';
    return 'text-[#4a5565]';
  };

  return (
    <Tabs defaultValue="ai-flags" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto border-b border-gray-200 flex-shrink-0 sticky top-0 z-10 px-4">
        <TabsTrigger value="ai-flags" className="bg-transparent border-0 rounded-none pb-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 text-gray-500 font-medium">AI flags</TabsTrigger>
        <TabsTrigger value="reports" className="bg-transparent border-0 rounded-none pb-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 text-gray-500 font-medium">Reports</TabsTrigger>
        <TabsTrigger value="activity" className="bg-transparent border-0 rounded-none pb-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 text-gray-500 font-medium">Activity</TabsTrigger>
      </TabsList>
      
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <TabsContent value="ai-flags" className="mt-4 space-y-4 px-3">
        <div className="space-y-3">
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Running AI content analysis...</p>
                <p className="text-xs text-gray-400 mt-1">Checking with Google Video Intelligence</p>
              </div>
            </div>
          ) : flags.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600">No automated flags detected</p>
              <p className="text-xs text-gray-400 mt-1">Content passed all AI moderation checks</p>
            </div>
          ) : (
            flags.map((flag, index) => {
              console.log('Rendering flag:', {
                id: flag.id,
                type: flag.type,
                hasTimestamps: !!flag.timestamps,
                timestampsLength: flag.timestamps?.length || 0,
                timestamps: flag.timestamps
              });
              
              return (
              <div 
                key={flag.id}
                className={`p-3 bg-white border border-gray-200 rounded-lg ${index < flags.length - 1 ? 'mb-3' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-gray-900">{flag.type}</span>
                  </div>
                  {getStatusBadge(flag.status, flag.confidence)}
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{flag.timestamp}</span>
                  </div>
                  <div className={`font-medium ${getConfidenceColor(flag.confidence)}`}>
                    {flag.confidence}% confidence
                  </div>
                  
                  {/* Show timestamps if available */}
                  {flag.timestamps && flag.timestamps.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs font-medium text-black mb-1">
                        Violation timestamps ({flag.timestamps.length}):
                      </div>
                      <div className="text-xs text-gray-700">
                        {flag.timestamps.map((timestamp: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1 mr-3 mb-1">
                            <button 
                              className="font-mono font-medium text-black underline hover:text-gray-700 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSeekToTimestamp) {
                                  onSeekToTimestamp(timestamp.timeOffset);
                                } else {
                                  console.log('Seek function not available, timestamp:', timestamp.timeOffset, 'seconds');
                                }
                              }}
                            >
                              {Math.floor(timestamp.timeOffset / 60)}:{Math.floor(timestamp.timeOffset % 60).toString().padStart(2, '0')}
                            </button>
                            <span className="text-gray-500">({Math.round(timestamp.confidence * 100)}%)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              );
            })
          )}
          
        </div>
      </TabsContent>
      
      <TabsContent value="reports" className="mt-4 px-3">
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">User reports</span>
            <Badge className="bg-red-100 text-red-800 text-xs px-2 py-0.5">
              {userReports}
            </Badge>
          </div>
          <p className="text-xs text-gray-600">Viewer reports and community flagging</p>
        </div>
      </TabsContent>
      
      <TabsContent value="activity" className="mt-4 px-3">
        <div className="space-y-3">
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Uploader info</span>
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
                Good
              </Badge>
            </div>
            <p className="text-xs text-gray-600">Uploader history and status</p>
          </div>
          
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Moderation history</span>
              <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
                {moderationHistory}
              </Badge>
            </div>
            <p className="text-xs text-gray-600">Previous moderation actions</p>
          </div>
        </div>
      </TabsContent>
        </ScrollArea>
        
        {/* Global action button - moved inside scroll area */}
        {!isAnalyzing && onRunAnalysis && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-white">
            <button
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-white border border-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              aria-label="Run checks again"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run checks again
            </button>
          </div>
        )}
      </div>
    </Tabs>
  );
};
