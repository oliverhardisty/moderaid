import React from 'react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
  return (
    <aside className="flex flex-col w-14 min-h-screen bg-white border-r border-gray-200 shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-14 bg-white border-b border-gray-100">
        <div className="w-6 h-6 bg-purple-600 rounded-sm flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 py-2">
        <div className="space-y-1 px-2">
          {/* Document Icon */}
          <button className="w-full h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
          </button>
          
          {/* Tag Icon */}
          <button className="w-full h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
          </button>
          
          {/* Circle Icon */}
          <button className="w-full h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          </button>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="py-2 px-2 space-y-1">
        {/* Settings Icon */}
        <button className="w-full h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
        </button>
        
        {/* Help Icon */}
        <button className="w-full h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
        </button>
        
        {/* User Avatar */}
        <div className="flex items-center justify-center h-10">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">AI</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
