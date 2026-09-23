import React from 'react';
import { Bot } from 'lucide-react';

interface FloatingAIButtonProps {
  onOpen: () => void;
}

export const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ onOpen }) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      id="floating-ai-receptionist-btn"
      aria-label="Open AI Receptionist"
      className="ai-receptionist-launcher fixed bottom-[76px] right-4 sm:bottom-6 sm:right-6 z-40 group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#27BAC8] focus-visible:outline-offset-2"
    >
      {/* Centered Bot Icon */}
      <Bot
        className="w-6 h-6 text-[#27BAC8] group-hover:text-[#56C4CF] transition-colors duration-200"
        aria-hidden="true"
      />

      {/* Quiet pulsing teal indicator dot */}
      <span className="absolute top-2 right-2 flex h-2.5 w-2.5 pointer-events-none" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27BAC8] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2097A2]"></span>
      </span>
    </button>
  );
};


