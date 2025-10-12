import React, { ReactNode, useRef, useImperativeHandle, forwardRef } from 'react';
import { Theme } from '@a24z/industry-theme';
import { mapThemeToPanelVars } from '../utils/themeMapping';
import './SnapCarousel.css';

export interface SnapCarouselRef {
  /** Scroll to a specific panel by index */
  scrollToPanel: (index: number) => void;
  /** Get the current panel index */
  getCurrentPanel: () => number;
}

export interface SnapCarouselProps {
  /** Array of panel content to display in the carousel */
  panels: ReactNode[];

  /** CSS class for the carousel container */
  className?: string;

  /** Additional styles to apply to the container */
  style?: React.CSSProperties;

  /** Theme object for customizing colors */
  theme: Theme;

  /** Minimum width for each panel (default: 500px) */
  minPanelWidth?: number;

  /** Ideal width for each panel as a fraction of viewport width (default: 1/3 = 0.333) */
  idealPanelWidth?: number;

  /** Gap between panels in pixels (default: 1) */
  gap?: number;

  /** Callback when a panel comes into view */
  onPanelChange?: (index: number) => void;
}

/**
 * SnapCarousel - A horizontally scrolling carousel with snap points
 * Each panel fills approximately 1/3 of the viewport width with a minimum of 500px
 */
export const SnapCarousel = forwardRef<SnapCarouselRef, SnapCarouselProps>(({
  panels,
  className = '',
  style,
  theme,
  minPanelWidth = 500,
  idealPanelWidth = 0.333, // 1/3 of viewport
  gap = 1,
  onPanelChange,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply theme as CSS variables
  const themeStyles = mapThemeToPanelVars(theme) as React.CSSProperties;

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    scrollToPanel: (index: number) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const targetPanel = container.children[index] as HTMLElement;

      if (targetPanel) {
        targetPanel.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    },
    getCurrentPanel: () => {
      if (!containerRef.current || containerRef.current.children.length === 0) return 0;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      // The snap point is the left edge of the container
      const snapPointX = containerRect.left;

      // Find which panel's left edge is closest to the snap point
      let closestIndex = 0;
      let closestDistance = Infinity;

      for (let i = 0; i < container.children.length; i++) {
        const panel = container.children[i] as HTMLElement;
        const panelRect = panel.getBoundingClientRect();

        // Distance from this panel's left edge to the snap point
        const distance = Math.abs(panelRect.left - snapPointX);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      return closestIndex;
    },
  }));

  // Handle scroll to track which panel is in view
  const handleScroll = (_e: React.UIEvent<HTMLDivElement>) => {
    if (!onPanelChange || !containerRef.current || containerRef.current.children.length === 0) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // The snap point is the left edge of the container
    const snapPointX = containerRect.left;

    // Find which panel's left edge is closest to the snap point
    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < container.children.length; i++) {
      const panel = container.children[i] as HTMLElement;
      const panelRect = panel.getBoundingClientRect();

      // Distance from this panel's left edge to the snap point
      const distance = Math.abs(panelRect.left - snapPointX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    onPanelChange(closestIndex);
  };

  return (
    <div
      ref={containerRef}
      className={`snap-carousel-container ${className}`}
      style={{
        ...themeStyles,
        ...style,
        '--snap-carousel-min-width': `${minPanelWidth}px`,
        '--snap-carousel-ideal-width': `${idealPanelWidth * 100}vw`,
        '--snap-carousel-gap': `${gap}px`,
      } as React.CSSProperties}
      onScroll={handleScroll}
    >
      {panels.map((panel, index) => (
        <div key={index} className="snap-carousel-panel">
          {panel}
        </div>
      ))}
    </div>
  );
});

SnapCarousel.displayName = 'SnapCarousel';
