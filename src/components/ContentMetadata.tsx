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
    <section className="w-full text-[#281d1b] font-normal pt-6 max-md:max-w-full">
      <div className="justify-center items-stretch flex w-full gap-3.5 flex-wrap max-md:max-w-full">
        {/* Content Title */}
        <div className="min-w-60 grow shrink w-[436px] gap-[3.5px] max-md:max-w-full">
          <div className="opacity-60 w-full text-[11px] leading-none max-md:max-w-full">
            <label className="text-[10.5px] font-normal leading-[14px] max-md:max-w-full">
              Content title
            </label>
          </div>
          <div className="w-full text-sm mt-1 max-md:max-w-full">
            <h2 className="text-sm font-normal leading-[21px] max-md:max-w-full">
              {title}
            </h2>
          </div>
        </div>

        {/* Upload Date */}
        <div className="min-w-60 grow shrink w-[194px] gap-[3.25px]">
          <div className="opacity-60 w-full text-[11px] leading-none">
            <label className="text-[10.5px] font-normal leading-[14px]">
              Upload date
            </label>
          </div>
          <div className="items-center flex w-full gap-[3.5px] text-sm whitespace-nowrap">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/3a8b156ac92120ba41bf338148f8a0fc4e3cd54a?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
              alt="Calendar icon"
            />
            <time className="text-sm font-normal leading-[21px] self-stretch my-auto">
              {uploadDate}
            </time>
          </div>
        </div>

        {/* Views */}
        <div className="min-w-60 whitespace-nowrap grow shrink w-[193px] gap-[3.25px]">
          <div className="opacity-60 w-full text-[11px] leading-none">
            <label className="text-[10.5px] font-normal leading-[14px]">
              Views
            </label>
          </div>
          <div className="items-center flex w-full gap-[3.5px] text-sm">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/1736f6714bbcde8591cce4f2b95b6f67060f7fe6?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
              alt="Views icon"
            />
            <span className="text-sm font-normal leading-[21px] self-stretch my-auto">
              {formatViews(views)}
            </span>
          </div>
        </div>

        {/* Viewer Reports */}
        <div className="min-w-60 grow shrink w-[194px] gap-[3.25px]">
          <div className="opacity-60 w-full text-[11px] leading-none">
            <label className="text-[10.5px] font-normal leading-[14px]">
              Viewer reports
            </label>
          </div>
          <div className="items-center flex w-full gap-[3.5px] text-sm whitespace-nowrap">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/b6d29fb4c66eb4a65754effb1f7715a0cd7cc59c?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
              alt="Reports icon"
            />
            <span className="text-sm font-normal leading-[21px] self-stretch my-auto">
              {viewerReports}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
