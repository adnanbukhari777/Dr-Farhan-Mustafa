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
      aria-label="Ask Dr. Farhan's AI Receptionist"
      className="hidden md:flex fixed bottom-6 right-6 z-30 bg-[#2097A2] hover:bg-[#1B808A] text-white p-3.5 rounded-full shadow-lg items-center gap-2 transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-white"
    >
      <div className="relative">
        <Bot className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#27BAC8] rounded-full animate-ping"></span>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider pr-1">
        Ask AI Receptionist
      </span>
    </button>
  );
};
