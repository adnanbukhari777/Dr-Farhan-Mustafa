import React from 'react';
import { PageId } from '../types';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; page?: PageId }[];
  onNavigate: (page: PageId) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  return (
    <nav className="py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-[#5B6467]" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1 hover:text-[#2097A2] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-3 h-3 text-[#CBD5E1]" />
            {item.page ? (
              <button
                onClick={() => onNavigate(item.page!)}
                className="hover:text-[#2097A2] transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="font-semibold text-[#0A0A0A]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
