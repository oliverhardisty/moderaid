import React from 'react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  contentId: string;
  priority: 'high' | 'medium' | 'low';
}

export const Header: React.FC<HeaderProps> = ({ contentId, priority }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(contentId);
  };

  const handleShare = () => {
    // Share functionality
    console.log('Share content:', contentId);
  };

  const handleBack = () => {
    // Navigate back to queue
    console.log('Back to queue');
  };

  return (
    <header className="justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)] relative flex w-full overflow-hidden bg-white pt-3.5 pb-[15px] px-3.5 border-b-[rgba(110,80,73,0.20)] border-b border-solid max-md:max-w-full">
      <button 
        onClick={handleBack}
        className="justify-center items-center self-stretch z-0 flex min-h-7 gap-[7px] text-sm text-neutral-950 font-medium text-center leading-none my-auto px-[9px] rounded-[6.75px] hover:bg-gray-50 transition-colors"
      >
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/57ea5054ca46647c7659efbe70f90954c485b000?placeholderIfAbsent=true"
          className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
          alt="Back arrow"
        />
        <span className="font-medium leading-[17.5px] self-stretch my-auto">
          Back to Queue
        </span>
      </button>

      <div className="items-center absolute z-0 flex gap-[10.49px] right-[704px] top-4">
        <h1 className="self-stretch text-lg text-[#281d1b] font-bold whitespace-nowrap leading-none my-auto">
          <span className="font-bold leading-[24.5px]">{contentId}</span>
        </h1>
        <Badge 
          variant="danger"
          className="justify-center items-center border self-stretch flex min-h-6 overflow-hidden text-xs text-white font-medium text-center leading-none w-[92px] bg-[#E7000B] my-auto px-2 py-[5px] rounded-[6.75px] border-solid border-[#E7000B]"
        >
          <span className="font-medium leading-[14px] self-stretch my-auto">
            High Priority
          </span>
        </Badge>
      </div>

      <div className="items-center self-stretch z-0 flex gap-[7px] text-xs text-[#8800ff] font-medium whitespace-nowrap text-center leading-none my-auto">
        <button 
          onClick={handleCopy}
          className="justify-center items-center border self-stretch flex min-h-8 gap-[7px] bg-white my-auto px-2.5 py-[7px] rounded-[6.75px] border-solid border-[#80F] hover:bg-purple-50 transition-colors"
        >
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/927ead985c29fbad91d30d8ffb2137c3aea1f24b?placeholderIfAbsent=true"
            className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
            alt="Copy icon"
          />
          <span className="font-medium leading-[17.5px] self-stretch my-auto">
            Copy
          </span>
        </button>
        <button 
          onClick={handleShare}
          className="justify-center items-center border self-stretch flex min-h-8 gap-[7px] bg-white my-auto pl-[9px] pr-2.5 py-[7px] rounded-[6.75px] border-solid border-[#80F] hover:bg-purple-50 transition-colors"
        >
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c3f18a2dad7df84d7ef1d2e6659566a21050440b?placeholderIfAbsent=true"
            className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
            alt="Share icon"
          />
          <span className="font-medium leading-[17.5px] self-stretch my-auto">
            Share
          </span>
        </button>
      </div>
    </header>
  );
};
