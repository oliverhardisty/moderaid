import React from 'react';

interface ContentMetadataProps {
  title: string;
  uploadDate: string;
  views: number;
  viewerReports: number;
}

export const ContentMetadata: React.FC<ContentMetadataProps> = ({
  title,
  uploadDate,
  views,
  viewerReports
}) => {
  const formatViews = (count: number) => {
    return count.toLocaleString();
  };

  return (
    <section className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Content Title */}
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Content title
          </label>
          <h2 className="text-sm text-gray-900 mt-1">
            {title}
          </h2>
        </div>

        {/* Upload Date */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Upload date
          </label>
          <div className="flex items-center gap-2 mt-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time className="text-sm text-gray-900">
              {uploadDate}
            </time>
          </div>
        </div>

        {/* Views */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Views
          </label>
          <div className="flex items-center gap-2 mt-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm text-gray-900">
              {formatViews(views)}
            </span>
          </div>
        </div>

        {/* Viewer Reports */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Viewer reports
          </label>
          <div className="flex items-center gap-2 mt-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-gray-900">
              {viewerReports}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
