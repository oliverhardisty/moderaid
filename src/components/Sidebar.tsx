import React from 'react';
import { FileText, Zap, Shield, Settings, Bell, ChevronRight, Menu } from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
  const navigationItems = [
    { icon: FileText, label: 'Content', active: true },
    { icon: Zap, label: 'Decisions', active: false },
    { icon: Shield, label: 'Policies', active: false },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings' },
    { icon: Bell, label: 'Notifications' },
  ];

  return (
    <aside className={`relative flex flex-col min-h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
      isExpanded ? 'w-64' : 'w-14'
    }`}>
      {/* Expand/Collapse Button - Always on the right edge */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {/* Header Section */}
      <div className="flex items-center h-16 px-2 border-b border-gray-100">
        <button 
          onClick={onToggle}
          className={`flex items-center w-full hover:bg-gray-50 rounded-lg p-2 transition-colors ${
            isExpanded ? 'gap-3' : 'justify-center'
          }`}
        >
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          {isExpanded && (
            <>
              <span className="text-xl font-semibold text-gray-900">Moderaid</span>
              <ChevronRight className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6">
        <div className="space-y-2 px-2">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center rounded-lg transition-all duration-200 ${
                isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'
              } ${
                item.active 
                  ? 'bg-purple-50 text-purple-700' + (isExpanded ? ' border-r-2 border-purple-600' : '')
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 py-4">
        <div className="space-y-2 px-2 mb-4">
          {bottomItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </div>
        
        {/* User Profile */}
        <div className="px-2">
          <div className={`flex items-center rounded-lg hover:bg-gray-50 transition-colors ${
            isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'
          }`}>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">AT</span>
            </div>
            {isExpanded && (
              <span className="font-medium text-gray-900">Alex Thompson</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
