import React, { useState } from 'react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
  return (
    <aside className="items-stretch shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)] relative flex overflow-hidden h-full w-14 bg-white pr-px border-r-[rgba(110,80,73,0.20)] border-r border-solid max-md:hidden">
      <div className="z-0 flex-1 shrink basis-[0%] bg-neutral-50 pb-[140px] max-md:hidden max-md:pb-[100px]">
        {/* Logo/Brand Section */}
        <div className="relative w-[54px] h-[54px] bg-white p-3.5">
          <div className="z-0 flex w-full justify-center">
            <div className="flex min-h-[25px] w-[25px] flex-col items-stretch justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/42a2981d7a8fc70d430f5ae175a6bacdb7460de7?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-full flex-1"
                alt="Logo"
              />
            </div>
          </div>
          <button
            onClick={onToggle}
            className="justify-center items-center border absolute z-0 flex min-h-[21px] w-[21px] h-[21px] right-[-11px] translate-x-[0%] -translate-y-2/4 bg-white rounded-[16777200px] border-solid border-[rgba(110,80,73,0.20)] top-2/4 hover:bg-gray-50 transition-colors"
            aria-label="Toggle sidebar"
          />
        </div>

        {/* Navigation Icons */}
        <nav className="min-h-[757px] bg-white pt-[7px] px-[7px] max-md:hidden">
          <div className="w-full gap-[3.5px]">
            <button className="justify-center items-center flex w-full bg-neutral-100 px-3.5 py-[11px] rounded-[6.75px] hover:bg-neutral-200 transition-colors">
              <div className="self-stretch flex min-h-3 w-3 flex-col items-stretch justify-center my-auto">
                <div className="flex min-h-3 w-full flex-1 bg-gray-400 rounded-sm" />
              </div>
            </button>
            <button className="flex w-full items-center justify-center mt-1 px-3.5 py-[11px] rounded-[7px] hover:bg-neutral-100 transition-colors">
              <div className="self-stretch flex min-h-3 w-3 flex-col items-stretch justify-center my-auto">
                <div className="flex min-h-3 w-full flex-1 bg-gray-400 rounded-sm" />
              </div>
            </button>
            <button className="flex w-full items-center justify-center mt-1 px-3.5 py-[11px] rounded-[7px] hover:bg-neutral-100 transition-colors">
              <div className="self-stretch flex min-h-3 w-3 flex-col items-stretch justify-center my-auto">
                <div className="flex min-h-3 w-full flex-1 bg-gray-400 rounded-sm" />
              </div>
            </button>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="z-10 mt-[-140px] w-full gap-[7px] bg-white pt-[21px] pb-3 px-[7px]">
          <button className="flex w-full items-center justify-center px-3.5 py-[11px] rounded-[7px] hover:bg-neutral-100 transition-colors">
            <div className="self-stretch flex min-h-3 w-3 flex-col items-stretch justify-center my-auto">
              <div className="flex min-h-3 w-full flex-1 bg-gray-400 rounded-sm" />
            </div>
          </button>
          <button className="flex w-full items-center justify-center mt-[7px] px-3.5 py-[11px] rounded-[7px] hover:bg-neutral-100 transition-colors">
            <div className="self-stretch flex min-h-3 w-3 flex-col items-stretch justify-center my-auto">
              <div className="flex min-h-3 w-full flex-1 bg-gray-400 rounded-sm" />
            </div>
          </button>
          <div className="flex w-full items-center justify-center mt-[7px] px-[7px] py-[11px] rounded-[7px]">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/ded33a45df08d7251bd83a214a14d8ff2dd51766?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-[21px] self-stretch min-h-[21px] my-auto rounded-[16777200px]"
              alt="User avatar"
            />
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      <div className="shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)] absolute z-0 flex shrink-0 h-[965px] w-[55px] bg-[rgba(255,255,255,0.00)] border-r-[rgba(110,80,73,0.20)] border-r border-solid left-0 right-px inset-y-0 max-md:hidden" />
    </aside>
  );
};
