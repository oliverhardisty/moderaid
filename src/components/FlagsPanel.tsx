import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Flag {
  id: string;
  type: string;
  status: 'active' | 'dismissed';
  confidence: number;
  timestamp: string;
  model: string;
  description: string;
  icon: string;
}

interface FlagsPanelProps {
  flags: Flag[];
  userReports: number;
  uploaderStatus: 'good' | 'warning' | 'bad';
  moderationHistory: number;
  isAnalyzing?: boolean;
}

export const FlagsPanel: React.FC<FlagsPanelProps> = ({ 
  flags, 
  userReports, 
  uploaderStatus, 
  moderationHistory,
  isAnalyzing = false
}) => {
  const [expandedSections, setExpandedSections] = useState({
    flags: true,
    reports: false,
    uploader: false,
    history: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
    <div className="space-y-4">
      {/* Automated Flags */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <button 
          onClick={() => toggleSection('flags')}
          className="flex w-full items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V9a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              {isAnalyzing ? 'Analyzing Content...' : 'Automated flags'}
            </span>
            {isAnalyzing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            ) : (() => {
              const violatingFlags = flags.filter(flag => flag.status === 'active');
              return violatingFlags.length > 0 ? (
                <Badge className="bg-gray-100 text-black text-xs px-2 py-0.5">
                  {violatingFlags.length}
                </Badge>
              ) : null;
            })()}
          </div>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.flags ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.flags && (
          <div className="px-3 pb-3 space-y-3">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Running AI content analysis...</p>
                  <p className="text-xs text-gray-400 mt-1">Checking with OpenAI and Azure APIs</p>
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
            ) : (() => {
              const violatingFlags = flags.filter(flag => flag.status === 'active');
              const overallConfidence = Math.round(flags.reduce((sum, flag) => sum + flag.confidence, 0) / flags.length);
              
              return violatingFlags.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-black">No violating flags detected</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Content analyzed and approved with {overallConfidence}% confidence
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    All {flags.length} automated checks passed
                  </p>
                </div>
              ) : (
                violatingFlags.map((flag, index) => (
                  <div 
                    key={flag.id}
                    className={`${index < violatingFlags.length - 1 ? 'pb-3 border-b border-gray-100' : ''}`}
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
                      <div className="text-gray-500">
                        Model: {flag.model}
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-gray-700 mt-2">
                        {flag.description}
                      </div>
                    </div>
                  </div>
                ))
              );
            })()}
          </div>
        )}
      </section>

      {/* User Reports */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <button 
          onClick={() => toggleSection('reports')}
          className="flex w-full items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">User reports</span>
            <Badge className="bg-red-100 text-red-800 text-xs px-2 py-0.5">
              {userReports}
            </Badge>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.reports ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* Uploader Info */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <button 
          onClick={() => toggleSection('uploader')}
          className="flex w-full items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Uploader info</span>
            <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
              Good
            </Badge>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.uploader ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* Moderation History */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <button 
          onClick={() => toggleSection('history')}
          className="flex w-full items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Moderation history</span>
            <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
              {moderationHistory}
            </Badge>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.history ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>
    </div>
  );
};
