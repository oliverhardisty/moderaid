import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  contentId: string;
  priority: 'high' | 'medium' | 'low';
  itemCount?: number;
  sidebarExpanded?: boolean;
  isCompactView?: boolean;
  onToggleCompactView?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ contentId, priority, itemCount, sidebarExpanded = false, isCompactView = false, onToggleCompactView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Only show back button on content detail pages, not on content list
  const showBackButton = location.pathname !== '/';

  const handleCopy = () => {
    navigator.clipboard.writeText(contentId);
  };

  const handleShare = () => {
    // Share functionality
    console.log('Share content:', contentId);
  };

  const handleBack = () => {
    // Navigate back to content list
    navigate('/');
  };

  return (
    <header className={`fixed top-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-40 h-16 flex-shrink-0 transition-all duration-300 ${sidebarExpanded ? 'left-64' : 'left-14'}`}>
      {showBackButton && (
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-900 font-medium hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Queue
        </button>
      )}
      
      {!showBackButton && <div />} {/* Spacer for content list page */}

      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900">
          {showBackButton ? `Moderation ${contentId}` : 'Your Moderations'}
        </h1>
        {showBackButton ? (
          <Badge 
            variant="destructive"
            className="bg-red-600 text-white px-3 py-1 text-xs font-medium"
          >
            High Priority
          </Badge>
        ) : (
          <Badge 
            className="bg-gray-100 text-gray-800 px-3 py-1 text-xs font-medium"
          >
            {itemCount || 0} items
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 text-purple-600 border border-purple-600 bg-white hover:bg-purple-50 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-purple-600 border border-purple-600 bg-white hover:bg-purple-50 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        
        {/* View Toggle - only show on content detail pages */}
        {showBackButton && onToggleCompactView && (
          <div className="inline-flex bg-gray-100 rounded-lg p-1 ml-3">
            <button 
              onClick={() => isCompactView && onToggleCompactView()} 
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${!isCompactView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Maximize media player"
            >
              <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.749512" y="0.991272" width="18.9246" height="13.9557" rx="1.5" stroke="currentColor" strokeLinecap="round" />
                <rect x="6.23047" y="3.08093" width="11.5454" height="8.08487" rx="1" fill="currentColor" />
              </svg>
            </button>
            <button 
              onClick={() => !isCompactView && onToggleCompactView()} 
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${isCompactView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Minimize media player"
            >
              <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.27246" y="0.991272" width="18.9246" height="13.9557" rx="1.5" stroke="currentColor" strokeLinecap="round" />
                <rect x="10.7349" y="2.96021" width="7.48682" height="5.70145" rx="1" fill="currentColor" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
