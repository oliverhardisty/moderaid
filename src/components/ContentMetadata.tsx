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
    <section className="bg-gray-100 p-4 rounded-lg border border-gray-200">
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
          <div className="mt-1">
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
          <div className="mt-1">
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
          <div className="mt-1">
            <span className="text-sm text-gray-900">
              {viewerReports}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
