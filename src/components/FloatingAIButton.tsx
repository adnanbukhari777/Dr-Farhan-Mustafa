import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface FloatingAIButtonProps {
  onOpen: () => void;
}

export const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ onOpen }) => {
  return (
    <button
      onClick={onOpen}
      id="floating-ai-receptionist-btn"
      aria-label="Ask Dr. Farhan's AI Clinic Receptionist"
      className="fixed bottom-6 right-5 sm:right-6 z-30 flex items-center gap-2.5 h-[50px] md:h-[52px] px-4 md:px-5 bg-[#090B0C] hover:bg-[#111618] text-white rounded-[3px] border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(32,151,162,0.25)] hover:-translate-y-1 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#27BAC8] focus-visible:outline-offset-2 group overflow-hidden"
    >
      {/* Subtle traveling glass shine on hover */}
      <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -left-full group-hover:left-[150%] transition-all duration-700 pointer-events-none" />

      {/* AI Icon with quiet pulsing teal dot */}
      <div className="relative flex items-center justify-center shrink-0">
        <Bot className="w-5 h-5 text-[#27BAC8] group-hover:text-white transition-colors duration-200" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27BAC8] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2097A2]"></span>
        </span>
      </div>

      {/* Button Text */}
      <div className="flex flex-col text-left">
        <span className="text-[12px] md:text-[13px] font-medium tracking-wide text-white flex items-center gap-1.5">
          <span className="hidden sm:inline">Ask AI Receptionist</span>
          <span className="sm:hidden">Ask AI</span>
          <Sparkles className="w-3 h-3 text-[#A4E0E5] opacity-80" />
        </span>
        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold hidden md:block">
          24/7 Clinic Guidance
        </span>
      </div>
    </button>
  );
};

