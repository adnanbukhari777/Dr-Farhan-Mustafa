import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCMS } from '../context/CMSContext';
import { Star, ChevronLeft, ChevronRight, CheckCircle, ExternalLink } from 'lucide-react';

export const ReviewsSlider: React.FC = () => {
  const { reviews, clinicInfo } = useCMS();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter published reviews only
  const publishedReviews = useMemo(
    () => reviews.filter((r) => r.status === 'published' || !r.status),
    [reviews]
  );
  const totalCount = publishedReviews.length;

  // Responsive items per view: 1 mobile, 2 tablet, 3 desktop
  const [itemsPerView, setItemsPerView] = useState<number>(3);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Buffer size for seamless infinite looping
  const bufferSize = useMemo(() => Math.max(3, itemsPerView), [itemsPerView]);

  // Extended slides array: [clonesBefore, ...publishedReviews, clonesAfter]
  const extendedReviews = useMemo(() => {
    if (totalCount === 0) return [];
    if (totalCount < bufferSize) {
      // Repeat reviews if count is small so buffer is always full
      const repeated = [];
      while (repeated.length < bufferSize * 2 + totalCount) {
        repeated.push(...publishedReviews);
      }
      const before = repeated.slice(-bufferSize);
      const after = repeated.slice(0, bufferSize);
      return [...before, ...publishedReviews, ...after];
    }
    const before = publishedReviews.slice(-bufferSize);
    const after = publishedReviews.slice(0, bufferSize);
    return [...before, ...publishedReviews, ...after];
  }, [publishedReviews, totalCount, bufferSize]);

  // Track index points to current slide in extendedReviews
  const [trackIndex, setTrackIndex] = useState<number>(bufferSize);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState<boolean>(true);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive Breakpoints & Container Measurement
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
      const w = window.innerWidth;
      if (w < 768) {
        setItemsPerView(1);
      } else if (w < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Update trackIndex baseline if bufferSize changes
  useEffect(() => {
    setTrackIndex(bufferSize);
  }, [bufferSize]);

  // Handle previous slide
  const handlePrev = useCallback(() => {
    if (totalCount === 0) return;
    setIsSettling(false);
    setIsTransitioning(true);
    setTrackIndex((prev) => prev - 1);
  }, [totalCount]);

  // Handle next slide
  const handleNext = useCallback(() => {
    if (totalCount === 0) return;
    setIsSettling(false);
    setIsTransitioning(true);
    setTrackIndex((prev) => prev + 1);
  }, [totalCount]);

  // Jump to specific active index via pagination dots
  const handleGoTo = useCallback(
    (index: number) => {
      if (totalCount === 0) return;
      setIsSettling(false);
      setIsTransitioning(true);
      setTrackIndex(bufferSize + index);
    },
    [bufferSize, totalCount]
  );

  // Handle transition end for seamless infinite loop wrapping
  const handleTransitionEnd = () => {
    setIsSettling(true);
    if (trackIndex >= totalCount + bufferSize) {
      // Wrapped past end -> snap back to start without transition
      setIsTransitioning(false);
      setTrackIndex(trackIndex - totalCount);
    } else if (trackIndex < bufferSize) {
      // Wrapped before start -> snap forward to end without transition
      setIsTransitioning(false);
      setTrackIndex(trackIndex + totalCount);
    }
  };

  // Re-enable transition after snap on next tick
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Autoplay timer: runs every 5 seconds, pauses on hover, focus, reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isPaused || totalCount <= 1 || prefersReducedMotion) {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
      return;
    }

    autoplayTimerRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [isPaused, totalCount, handleNext]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (totalCount === 0) {
    return (
      <div className="card-dark p-8 text-center text-neutral-300">
        <p className="text-sm">Patient reviews are currently loading from verified sources.</p>
      </div>
    );
  }

  // Calculate pixel widths for gap-6 (24px)
  const gap = 24;
  const cardWidth = containerWidth > 0 ? (containerWidth - (itemsPerView - 1) * gap) / itemsPerView : 320;
  const stepWidth = cardWidth + gap;
  const currentTranslateX = -(trackIndex * stepWidth);

  // Active dot index (0 to totalCount - 1)
  const activeDotIndex = ((trackIndex - bufferSize) % totalCount + totalCount) % totalCount;

  return (
    <div
      className="space-y-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Verified Patient Reviews Slider"
    >
      {/* Slider Viewport Container */}
      <div ref={containerRef} className="overflow-hidden w-full relative -mx-1 px-1 py-2">
        {/* Hardware-Accelerated Sliding Track */}
        <div
          className="review-slider-track flex"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate3d(${currentTranslateX}px, 0, 0)`,
            transition: isTransitioning
              ? 'transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1)'
              : 'none',
            gap: `${gap}px`,
          }}
        >
          {extendedReviews.map((review, idx) => {
            // Determine whether this item is currently settling into the visible viewport
            const isVisible = idx >= trackIndex && idx < trackIndex + itemsPerView;

            return (
              <div
                key={`${review.id}-ext-${idx}`}
                className={`review-slide-card card-dark card-interactive p-6 sm:p-7 flex flex-col justify-between ${
                  isSettling && isVisible ? 'slide-settling' : 'slide-entering'
                }`}
                style={{
                  width: `${cardWidth}px`,
                  minWidth: `${cardWidth}px`,
                }}
              >
                <div className="space-y-4">
                  {/* Header: Stars & Verified Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-1"
                      aria-label={`${review.rating || 5} out of 5 stars`}
                    >
                      {[...Array(Math.floor(review.rating || 5))].map((_, sIdx) => (
                        <Star key={sIdx} className="w-4 h-4 fill-[var(--color-star-gold)] text-[var(--color-star-gold)]" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-[var(--brand-aqua)] bg-[var(--brand-aqua)]/15 px-2 py-0.5 rounded-[var(--radius-sharp)] border border-[var(--brand-aqua)]/30">
                      <CheckCircle className="w-2.5 h-2.5" />
                      Verified Patient
                    </span>
                  </div>

                  {/* Review Text - Clean & Crisp */}
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                    "{review.reviewText}"
                  </p>
                </div>

                {/* Author attribution */}
                <div className="pt-4 mt-5 border-t border-white/15 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {review.patientName}
                    </h4>
                    <p className="text-[10px] text-neutral-400">{review.reviewDate}</p>
                  </div>
                  <span className="text-[10px] text-[var(--footer-icon-blue)] font-medium tracking-wide">
                    Google Review
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slider Controls & Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous patient review"
            className="p-2.5 rounded-[var(--radius-sm)] bg-white/10 border border-white/20 text-white hover:bg-[var(--brand-blue)] hover:border-[var(--brand-aqua)] transition-all cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-[var(--brand-aqua)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Pagination Indicators / Dots */}
          <div
            className="flex items-center gap-1.5 px-2"
            role="tablist"
            aria-label="Review slider pagination"
          >
            {publishedReviews.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => handleGoTo(dotIdx)}
                aria-label={`Go to review ${dotIdx + 1}`}
                aria-selected={activeDotIndex === dotIdx}
                role="tab"
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeDotIndex === dotIdx
                    ? 'w-7 bg-[var(--brand-aqua)] shadow-[0_0_8px_rgba(39,186,200,0.6)]'
                    : 'w-2 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            aria-label="Next patient review"
            className="p-2.5 rounded-[var(--radius-sm)] bg-white/10 border border-white/20 text-white hover:bg-[var(--brand-blue)] hover:border-[var(--brand-aqua)] transition-all cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-[var(--brand-aqua)]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View all on Google Link */}
        <a
          href={clinicInfo.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--footer-icon-blue)] hover:text-white transition-colors"
        >
          <span>Read all {clinicInfo.googleReviewCount} reviews on Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
