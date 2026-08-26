import React from 'react';
import { PageId } from '../types';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; page?: PageId }[];
  onNavigate: (page: PageId) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  return (
    <nav className="py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-[#105B62]/80" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 flex-wrap">
        <li>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 font-medium hover:text-[#25B3C2] transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-[#25B3C2]" />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-3 h-3 text-[#25B3C2]/50 shrink-0" aria-hidden="true" />
            {item.page ? (
              <button
                onClick={() => onNavigate(item.page!)}
                className="font-medium hover:text-[#25B3C2] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              <span className="font-bold text-[#111314]" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

