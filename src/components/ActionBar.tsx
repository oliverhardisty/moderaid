import React from 'react';

interface ActionBarProps {
  onAccept: () => void;
  onReject: () => void;
  onEscalate: () => void;
  disabled?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onAccept,
  onReject,
  onEscalate,
  disabled = false
}) => {
  return (
    <footer className="items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)] flex w-full flex-col overflow-hidden bg-white pt-[15px] pb-3.5 px-3.5 border-t-[rgba(110,80,73,0.20)] border-t border-solid max-md:max-w-full">
      <div className="justify-center items-center flex gap-3.5 max-md:max-w-full">
        {/* Accept Button */}
        <button
          onClick={onAccept}
          disabled={disabled}
          className="justify-center items-center self-stretch flex min-h-11 w-[140px] bg-[#00A63E] my-auto px-[11px] py-[13px] rounded-[6.75px] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Accept content"
        >
          <div className="self-stretch flex min-h-3.5 flex-col w-[21px] my-auto pr-[7px]">
            <div className="flex min-h-3.5 w-3.5 flex-col overflow-hidden items-center justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/5f66d44b4b38ac8b5acdedb2c80032a59acd5a78?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-full flex-1"
                alt="Accept icon"
              />
            </div>
          </div>
          <span className="text-white text-center text-sm font-bold leading-[17.5px] self-stretch my-auto">
            Accept
          </span>
        </button>

        {/* Reject Button */}
        <button
          onClick={onReject}
          disabled={disabled}
          className="justify-center items-center self-stretch flex min-h-11 w-[140px] bg-[#E7000B] my-auto px-[11px] py-[13px] rounded-[6.75px] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Reject content"
        >
          <div className="self-stretch flex min-h-3.5 flex-col w-[21px] my-auto pr-[7px]">
            <div className="flex min-h-3.5 w-3.5 flex-col overflow-hidden items-center justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/d8d4d8a5779f1bd3e8d3ecc69007751a49dfb142?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-full flex-1"
                alt="Reject icon"
              />
            </div>
          </div>
          <span className="text-white text-center text-sm font-bold leading-[17.5px] self-stretch my-auto">
            Reject
          </span>
        </button>

        {/* Escalate Button */}
        <button
          onClick={onEscalate}
          disabled={disabled}
          className="justify-center items-center border self-stretch flex min-h-11 w-[140px] bg-white my-auto px-3 py-[13px] rounded-[6.75px] border-solid border-[#99A1AF] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Escalate content for further review"
        >
          <div className="self-stretch flex min-h-3.5 flex-col w-[21px] my-auto pr-[7px]">
            <div className="flex min-h-3.5 w-3.5 flex-col overflow-hidden items-center justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/1a3a51a3559198539b81ea7ddc8b1418154bab00?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-full flex-1"
                alt="Escalate icon"
              />
            </div>
          </div>
          <span className="text-[#364153] text-center text-sm font-bold leading-[17.5px] self-stretch my-auto">
            Escalate
          </span>
        </button>
      </div>
    </footer>
  );
};
