import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  contentId: string;
  priority: 'high' | 'medium' | 'low';
  itemCount?: number;
  sidebarExpanded?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ contentId, priority, itemCount, sidebarExpanded = false }) => {
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
    <header className={`fixed top-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50 ${
      sidebarExpanded ? 'left-64' : 'left-14'
    }`}>
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
          {showBackButton ? contentId : 'Your Content'}
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
      </div>
    </header>
  );
};
