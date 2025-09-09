import React, { useState } from 'react';

interface VideoPlayerProps {
  isBlurred: boolean;
  onUnblur: () => void;
  onReportIssue: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  isBlurred, 
  onUnblur, 
  onReportIssue 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = () => {
    // Volume control logic
  };

  return (
    <div className="flex w-full items-center justify-center max-md:max-w-full">
      <div className="self-stretch relative flex min-w-60 w-full flex-col overflow-hidden flex-1 shrink basis-[0%] bg-black my-auto rounded-[8.75px] max-md:max-w-full">
        {/* Background Video/Image */}
        <div className="max-w-[1227px] self-stretch blur-[20px] z-0 w-full overflow-hidden text-[28px] text-white font-normal text-center max-md:max-w-full">
          <div className="flex min-h-[690px] flex-col overflow-hidden items-center justify-center px-[153px] max-md:max-w-full max-md:px-5">
            <div className="max-w-full w-[920px] overflow-hidden">
              <div className="bg-[rgba(51,51,51,1)] flex flex-col items-center justify-center fill-[#333] px-[70px] py-[329px] max-md:max-w-full max-md:px-5 max-md:py-[100px]">
                <div className="text-[28px] font-normal mb-[-68px] max-md:mb-2.5">
                  Video Player
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blur Overlay */}
        {isBlurred && (
          <div className="justify-center items-center absolute z-0 flex max-w-full w-[1255px] text-white text-center bg-[#101828] py-[227px] rounded-[8.75px] top-0 bottom-[90px] inset-x-0 max-md:py-[100px]">
            <div className="self-stretch flex min-w-60 w-[376px] flex-col items-stretch my-auto p-[21px] max-md:px-5">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/0badc2994ef08ed7c6578d83e413ed410ab7fc9f?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-[42px] self-center"
                alt="Shield icon"
              />
              <div className="flex flex-col items-center text-base font-medium leading-loose mt-3.5">
                <h3 className="font-medium leading-[24.5px]">
                  Content Blurred for Protection
                </h3>
              </div>
              <div className="items-center opacity-75 flex flex-col text-xs font-normal leading-none mt-1.5">
                <p className="font-normal leading-[17.5px]">
                  This content has been flagged as potentially sensitive material
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Button */}
        <div className="absolute z-0 w-8 right-3.5 top-3.5">
          <button className="justify-center items-center backdrop-blur-sm flex min-h-7 w-full bg-[rgba(0,0,0,0.30)] pl-2 pr-[9px] py-[7px] rounded-[6.75px] hover:bg-[rgba(0,0,0,0.40)] transition-colors">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/a178edca854b0105e974bcdf11825397fd1fe8ab?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-3.5 self-stretch my-auto"
              alt="Settings"
            />
          </button>
        </div>

        {/* Video Controls */}
        <div className="items-center absolute z-0 flex w-full max-w-[1255px] flex-col gap-[12.5px] bg-white pt-6 border-t border-solid bottom-0 inset-x-0 max-md:max-w-full">
          {/* Progress Bar */}
          <div className="justify-center items-center self-center flex h-1 w-[1199px] max-w-full rounded-[8.75px]">
            <div className="self-stretch flex min-h-4 min-w-60 w-full flex-1 shrink basis-[0%] my-auto max-md:max-w-full bg-gray-200 rounded-full">
              <div className="h-1 bg-purple-600 rounded-full w-1/4"></div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="justify-between items-center flex w-full gap-[40px_100px] flex-wrap mt-[13px] pb-[11px] px-3.5 max-md:max-w-full">
            <div className="items-center self-stretch flex gap-[10.5px] my-auto">
              {/* Play/Pause Button */}
              <button 
                onClick={handlePlayPause}
                className="self-stretch flex min-h-7 items-center justify-center w-[35px] my-auto px-[9px] py-1.5 rounded-[7px] hover:bg-gray-100 transition-colors"
              >
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/2c7a4a7a4b48497164b9a504a54a743b57611893?placeholderIfAbsent=true"
                  className="aspect-[1] object-contain w-[17px] self-stretch my-auto"
                  alt={isPlaying ? "Pause" : "Play"}
                />
              </button>

              {/* Volume Controls */}
              <div className="items-center self-stretch flex gap-[7px] my-auto">
                <button 
                  onClick={handleVolumeChange}
                  className="self-stretch flex min-h-7 items-center justify-center w-8 my-auto pl-2 pr-[9px] py-[7px] rounded-[7px] hover:bg-gray-100 transition-colors"
                >
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/6d012f4864018af7f35157686e30d12573a28e05?placeholderIfAbsent=true"
                    className="aspect-[1] object-contain w-3.5 self-stretch my-auto"
                    alt="Volume"
                  />
                </button>
                <div className="self-stretch flex w-14 shrink-0 h-[3px] my-auto rounded-[8.75px] bg-gray-300">
                  <div className="h-full bg-purple-600 rounded-full w-3/4"></div>
                </div>
              </div>

              {/* Time Display */}
              <div className="self-stretch text-xs text-[#364153] font-normal leading-none my-auto">
                <span className="font-normal leading-[17.5px]">
                  {currentTime} / {duration}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="items-center self-stretch flex gap-[6.99px] text-xs font-medium text-center leading-none my-auto">
              <button 
                onClick={onUnblur}
                className="justify-center items-center border self-stretch flex min-h-8 gap-[7px] text-[#8800ff] whitespace-nowrap bg-white my-auto px-4 py-[7px] rounded-[6.75px] border-solid border-[#80F] hover:bg-purple-50 transition-colors"
              >
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/a1026800996702cce682d70518bd0a9d29762d59?placeholderIfAbsent=true"
                  className="aspect-[1] object-contain w-3.5 self-stretch shrink-0 my-auto"
                  alt="Unblur icon"
                />
                <span className="font-medium leading-[17.5px] self-stretch my-auto">
                  Unblur
                </span>
              </button>
              <button 
                onClick={onReportIssue}
                className="justify-center items-center self-stretch flex min-h-8 text-white bg-[#80F] my-auto px-4 rounded-[6.75px] hover:bg-purple-700 transition-colors"
              >
                <span className="font-medium leading-[17.5px] self-stretch my-auto">
                  Report issue
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
