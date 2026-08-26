import React from 'react';
import { PageId } from '../types';
import { Breadcrumb } from './Breadcrumb';

interface PageHeroProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; page?: PageId }[];
  onNavigate?: (page: PageId) => void;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  eyebrow,
  subtitle,
  breadcrumbs,
  onNavigate,
  actions,
  badge,
  className = ''
}) => {
  return (
    <div className="w-full">
      <header className={`hero-inner-gradient text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
          {/* Eyebrow & Badge */}
          <div className="flex flex-wrap items-center gap-3">
            {eyebrow && (
              <div className="hero-eyebrow-pill">
                <span className="w-2 h-2 rounded-full bg-[#25B3C2] animate-pulse" aria-hidden="true" />
                <span>{eyebrow}</span>
              </div>
            )}
            {badge}
          </div>

          {/* Controlled Refined Page Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#F7FFFF] leading-tight max-w-4xl">
            {title}
          </h1>

          {/* Supporting Text */}
          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-[#F7FFFF]/90 font-normal max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Optional Action CTAs */}
          {actions && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </header>

      {/* Integrated Breadcrumbs */}
      {breadcrumbs && onNavigate && (
        <div className="bg-[#ECFAFC]/60 border-b border-[#25B3C2]/15">
          <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
};
