import React from 'react';
interface ActionBarProps {
  onAccept: () => void;
  onReject: () => void;
  onEscalate: () => void;
  disabled?: boolean;
  sidebarExpanded?: boolean;
}
export const ActionBar: React.FC<ActionBarProps> = ({
  onAccept,
  onReject,
  onEscalate,
  disabled = false,
  sidebarExpanded = false
}) => {
  return <footer className={`fixed bottom-0 right-0 bg-white border-t border-gray-200 p-4 z-40 py-3 ${
    sidebarExpanded ? 'left-64' : 'left-14'
  }`}>
      <div className="flex justify-center gap-4">
        {/* Accept Button */}
        <button onClick={onAccept} disabled={disabled} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px] justify-center" aria-label="Accept content">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Accept
        </button>

        {/* Reject Button */}
        <button onClick={onReject} disabled={disabled} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px] justify-center" aria-label="Reject content">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Reject
        </button>

        {/* Escalate Button */}
        <button onClick={onEscalate} disabled={disabled} className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px] justify-center" aria-label="Escalate content for further review">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          Escalate
        </button>
      </div>
    </footer>;
};