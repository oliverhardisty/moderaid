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
}

export const FlagsPanel: React.FC<FlagsPanelProps> = ({ 
  flags, 
  userReports, 
  uploaderStatus, 
  moderationHistory 
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
    <div className="min-w-60 overflow-hidden grow shrink w-64 gap-3.5">
      {/* Automated Flags */}
      <section className="border shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)] w-full overflow-hidden bg-white p-px rounded-[8.75px] border-solid border-[rgba(110,80,73,0.20)]">
        <button 
          onClick={() => toggleSection('flags')}
          className="flex w-full items-stretch gap-3.5 font-medium px-3.5 py-[11px] rounded-[7px] hover:bg-gray-50 transition-colors"
        >
          <div className="items-center flex gap-[7px] grow shrink basis-auto">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/be236c214ba108ac009573cade8826d157f87242?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
              alt="Automated flags icon"
            />
            <div className="self-stretch overflow-hidden text-xs text-[#281d1b] leading-none my-auto">
              <span className="font-medium leading-[17.5px]">Automated flags</span>
            </div>
            <div className="min-w-[22px] self-stretch flex flex-col text-[11px] text-[#6e11b0] whitespace-nowrap text-center leading-none flex-1 shrink basis-[0%] my-auto pl-[120px]">
              <div className="flex items-center">
                <Badge variant="purple" className="justify-center items-center border self-stretch flex overflow-hidden bg-purple-100 my-auto px-2 py-[3px] rounded-[6.75px] border-solid border-[#DAB2FF]">
                  <span className="text-[10.5px] font-medium leading-[14px] self-stretch my-auto">{flags.length}</span>
                </Badge>
              </div>
            </div>
          </div>
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/b27ce017988e697da73fc0061bd9055b299e63a1?placeholderIfAbsent=true"
            className={`aspect-[1] object-contain w-3.5 shrink-0 transition-transform ${expandedSections.flags ? 'rotate-180' : ''}`}
            alt="Expand arrow"
          />
        </button>

        {expandedSections.flags && (
          <div className="w-full overflow-hidden text-[11px] leading-none pb-3.5 px-3.5">
            <div className="w-full gap-[10.5px]">
              {flags.map((flag, index) => (
                <div 
                  key={flag.id}
                  className={`w-full ${index < flags.length - 1 ? 'border-b-neutral-100 pb-3 border-b border-solid' : ''} ${index > 0 ? 'mt-[11px]' : ''}`}
                >
                  <div className="w-full gap-[7px]">
                    <div className="justify-between items-center flex w-full gap-[40px_100px] font-medium">
                      <div className="items-center self-stretch flex gap-[7px] text-[#281d1b] my-auto">
                        <img
                          src={flag.icon}
                          className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
                          alt={`${flag.type} icon`}
                        />
                        <div className="self-stretch overflow-hidden my-auto">
                          <span className="text-[10.5px] font-medium leading-[14px]">{flag.type}</span>
                        </div>
                      </div>
                      {getStatusBadge(flag.status, flag.confidence)}
                    </div>
                    <div className="opacity-60 w-full gap-[7px] mt-[7px]">
                      <div className="items-center flex w-full gap-[3.5px] text-[#281d1b] font-normal">
                        <img
                          src="https://api.builder.io/api/v1/image/assets/TEMP/e681dc682252463a7bb9a8ed94598e56d5877559?placeholderIfAbsent=true"
                          className="aspect-[1.1] object-contain w-[11px] self-stretch shrink-0 my-auto"
                          alt="Clock icon"
                        />
                        <div className="self-stretch overflow-hidden my-auto">
                          <span className="text-[10.5px] font-normal leading-[14px]">{flag.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex w-full items-center font-medium mt-[7px]">
                        <div className="self-stretch my-auto">
                          <span className={`text-[10.5px] font-medium leading-[14px] ${getConfidenceColor(flag.confidence)}`}>
                            {flag.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-60 w-full overflow-hidden text-[#281d1b] font-normal mt-[7px]">
                      <span className="text-[10.5px] font-normal leading-[14px]">Model: {flag.model}</span>
                    </div>
                    <div className="items-stretch opacity-80 flex w-full flex-col overflow-hidden text-[#281d1b] font-normal leading-[14px] justify-center bg-neutral-50 mt-[7px] p-[7px] rounded-[3.5px]">
                      <span className="text-[10.5px] font-normal leading-[14px]">{flag.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* User Reports */}
      <section className="items-stretch border shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)] flex w-full flex-col overflow-hidden font-medium justify-center bg-white mt-3.5 p-px rounded-[8.75px] border-solid border-[rgba(110,80,73,0.20)]">
        <button 
          onClick={() => toggleSection('reports')}
          className="flex w-full items-stretch gap-3.5 px-3.5 py-[11px] rounded-[7px] hover:bg-gray-50 transition-colors"
        >
          <div className="items-center flex gap-[7px] grow shrink basis-auto">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/8e88d17ed90a618c996fc5933c5a5ee02b819246?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
              alt="User reports icon"
            />
            <div className="self-stretch overflow-hidden text-xs text-[#281d1b] leading-none my-auto">
              <span className="font-medium leading-[17.5px]">User reports</span>
            </div>
            <div className="min-w-[22px] self-stretch flex flex-col text-[11px] text-[#9f0712] whitespace-nowrap text-center leading-none flex-1 shrink basis-[0%] my-auto pl-[143px]">
              <Badge variant="danger" className="justify-center items-center border flex overflow-hidden bg-[#FFE2E2] px-2 py-[3px] rounded-[6.75px] border-solid border-[#FFA2A2]">
                <span className="text-[10.5px] font-medium leading-[14px] self-stretch my-auto">{userReports}</span>
              </Badge>
            </div>
          </div>
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/b596def72a8d427ae8167f953eb96d1cce612bf7?placeholderIfAbsent=true"
            className={`aspect-[1] object-contain w-3.5 shrink-0 transition-transform ${expandedSections.reports ? 'rotate-180' : ''}`}
            alt="Expand arrow"
          />
        </button>
      </section>

      {/* Uploader Info */}
      <section className="items-stretch border shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)] flex w-full flex-col overflow-hidden font-medium justify-center bg-white mt-3.5 p-px rounded-[8.75px] border-solid border-[rgba(110,80,73,0.20)]">
        <button 
          onClick={() => toggleSection('uploader')}
          className="flex w-full items-stretch gap-3.5 px-3.5 py-2.5 rounded-[7px] hover:bg-gray-50 transition-colors"
        >
          <div className="items-center flex gap-[7px] grow shrink basis-auto">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/c63c65b00781f1035f974e651dcfb8ccb7e30181?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
              alt="Uploader info icon"
            />
            <div className="self-stretch overflow-hidden text-xs text-[#281d1b] leading-none my-auto">
              <span className="font-medium leading-[17.5px]">Uploader info</span>
            </div>
            <div className="min-w-[42px] self-stretch flex flex-col text-[11px] text-[#016630] whitespace-nowrap text-center leading-none flex-1 shrink basis-[0%] my-auto pl-[115px]">
              <Badge variant="success" className="justify-center items-center border flex overflow-hidden bg-blue-100 px-2 py-[3px] rounded-[6.75px] border-solid border-[#7BF1A8]">
                <span className="text-[10.5px] font-medium leading-[14px] self-stretch my-auto">Good</span>
              </Badge>
            </div>
          </div>
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/ea31fe7a911c44ada20f5ec14ed1d66c198ba634?placeholderIfAbsent=true"
            className={`aspect-[1] object-contain w-3.5 shrink-0 my-auto transition-transform ${expandedSections.uploader ? 'rotate-180' : ''}`}
            alt="Expand arrow"
          />
        </button>
      </section>

      {/* Moderation History */}
      <section className="shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)] w-full overflow-hidden font-medium bg-white mt-3.5 pt-px px-px rounded-[8.75px] border-t-[rgba(110,80,73,0.20)] border-x-[rgba(110,80,73,0.20)] border-t border-solid border-r border-l">
        <button 
          onClick={() => toggleSection('history')}
          className="flex w-full items-stretch gap-3.5 px-3.5 py-[11px] rounded-[7px] hover:bg-gray-50 transition-colors"
        >
          <div className="items-center flex gap-[7px] grow shrink basis-auto">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/6a61bc13514cd60dec38a46a9bd58bb5f025b3b9?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
              alt="Moderation history icon"
            />
            <div className="self-stretch overflow-hidden text-xs text-[#281d1b] leading-none my-auto">
              <span className="font-medium leading-[17.5px]">Moderation history</span>
            </div>
            <div className="min-w-[22px] self-stretch flex flex-col text-[11px] text-[#193cb8] whitespace-nowrap text-center leading-none flex-1 shrink basis-[0%] my-auto pl-[107px]">
              <Badge variant="info" className="justify-center items-center border flex overflow-hidden bg-blue-100 px-2 py-[3px] rounded-[6.75px] border-solid border-[#8EC5FF]">
                <span className="text-[10.5px] font-medium leading-[14px] self-stretch my-auto">{moderationHistory}</span>
              </Badge>
            </div>
          </div>
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/b596def72a8d427ae8167f953eb96d1cce612bf7?placeholderIfAbsent=true"
            className={`aspect-[1] object-contain w-3.5 shrink-0 transition-transform ${expandedSections.history ? 'rotate-180' : ''}`}
            alt="Expand arrow"
          />
        </button>
      </section>
    </div>
  );
};
