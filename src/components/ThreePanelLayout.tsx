import React, { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from 'react-resizable-panels';
import { PanelTheme, defaultLightTheme } from '../types/theme';
import './ThreePanelLayout.css';

export interface ThreePanelLayoutProps {
  /** Content for the left panel */
  leftPanel: ReactNode;

  /** Content for the middle panel */
  middlePanel: ReactNode;

  /** Content for the right panel */
  rightPanel: ReactNode;

  /** Which panels are collapsible */
  collapsiblePanels?: {
    left?: boolean;
    right?: boolean;
  };

  /** Default sizes for each panel (0-100, must sum to 100) */
  defaultSizes?: {
    left: number;
    middle: number;
    right: number;
  };

  /** Minimum sizes for each panel when expanded (0-100) */
  minSizes?: {
    left: number;
    middle: number;
    right: number;
  };

  /** CSS class for the layout container */
  className?: string;

  /** Initial collapsed state for panels */
  collapsed?: {
    left?: boolean;
    right?: boolean;
  };

  /** Additional styles to apply to the container */
  style?: React.CSSProperties;

  /** Whether to show collapse/expand toggle buttons */
  showCollapseButtons?: boolean;

  /** Animation duration in milliseconds */
  animationDuration?: number;

  /** Animation easing function */
  animationEasing?: string;

  /** Theme object for customizing colors */
  theme?: PanelTheme;

  /** Callbacks for panel events */
  onLeftCollapseStart?: () => void;
  onLeftCollapseComplete?: () => void;
  onLeftExpandStart?: () => void;
  onLeftExpandComplete?: () => void;
  onRightCollapseStart?: () => void;
  onRightCollapseComplete?: () => void;
  onRightExpandStart?: () => void;
  onRightExpandComplete?: () => void;
  onPanelResize?: (sizes: { left: number; middle: number; right: number }) => void;
}

/**
 * ThreePanelLayout - A three-panel layout with collapsible left and right panels
 */
export const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  leftPanel,
  middlePanel,
  rightPanel,
  collapsiblePanels = { left: true, right: true },
  defaultSizes = { left: 20, middle: 60, right: 20 },
  minSizes = { left: 15, middle: 30, right: 15 },
  className = '',
  collapsed = { left: false, right: false },
  style,
  showCollapseButtons = true,
  animationDuration = 300,
  animationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  theme = defaultLightTheme,
  onLeftCollapseStart,
  onLeftCollapseComplete,
  onLeftExpandStart,
  onLeftExpandComplete,
  onRightCollapseStart,
  onRightCollapseComplete,
  onRightExpandStart,
  onRightExpandComplete,
  onPanelResize,
}) => {
  // State for collapsed status
  const [leftCollapsed, setLeftCollapsed] = useState(collapsed.left || false);
  const [rightCollapsed, setRightCollapsed] = useState(collapsed.right || false);

  // State for animation
  const [leftAnimating, setLeftAnimating] = useState(false);
  const [rightAnimating, setRightAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // State for handle visibility
  const [hideLeftHandle, setHideLeftHandle] = useState(collapsed.left || false);
  const [hideRightHandle, setHideRightHandle] = useState(collapsed.right || false);

  // State for current sizes
  const [leftSize, setLeftSize] = useState(collapsed.left ? 0 : defaultSizes.left);
  const [rightSize, setRightSize] = useState(collapsed.right ? 0 : defaultSizes.right);

  // Panel refs
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  // Animation refs
  const leftAnimationFrameRef = useRef<number | undefined>(undefined);
  const rightAnimationFrameRef = useRef<number | undefined>(undefined);
  const leftStartTimeRef = useRef<number | undefined>(undefined);
  const rightStartTimeRef = useRef<number | undefined>(undefined);

  // Generic animation function
  const animatePanel = useCallback(
    (
      panelRef: React.RefObject<ImperativePanelHandle>,
      fromSize: number,
      toSize: number,
      animationFrameRef: React.MutableRefObject<number | undefined>,
      startTimeRef: React.MutableRefObject<number | undefined>,
      onComplete?: () => void
    ) => {
      if (!panelRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!startTimeRef.current || !panelRef.current) return;

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Apply easing
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const newSize = fromSize + (toSize - fromSize) * eased;

        // Always use resize during animation
        panelRef.current.resize(newSize);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Ensure final state
          if (toSize === 0) {
            panelRef.current.collapse();
          } else {
            panelRef.current.resize(toSize);
          }
          if (onComplete) onComplete();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [animationDuration]
  );

  // Left panel collapse/expand handlers
  const handleLeftCollapse = useCallback(() => {
    if (leftAnimating || isDragging || !collapsiblePanels.left) return;

    setLeftAnimating(true);
    setLeftCollapsed(true);
    if (onLeftCollapseStart) onLeftCollapseStart();

    animatePanel(
      leftPanelRef,
      leftSize,
      0,
      leftAnimationFrameRef,
      leftStartTimeRef,
      () => {
        setLeftSize(0);
        setHideLeftHandle(true);
        setLeftAnimating(false);
        if (onLeftCollapseComplete) onLeftCollapseComplete();
      }
    );
  }, [leftAnimating, isDragging, leftSize, collapsiblePanels.left, animatePanel, onLeftCollapseStart, onLeftCollapseComplete]);

  const handleLeftExpand = useCallback(() => {
    if (leftAnimating || isDragging || !collapsiblePanels.left) return;

    setLeftAnimating(true);
    setLeftCollapsed(false);
    setHideLeftHandle(false);
    if (onLeftExpandStart) onLeftExpandStart();

    animatePanel(
      leftPanelRef,
      0,
      defaultSizes.left,
      leftAnimationFrameRef,
      leftStartTimeRef,
      () => {
        setLeftSize(defaultSizes.left);
        setLeftAnimating(false);
        if (onLeftExpandComplete) onLeftExpandComplete();
      }
    );
  }, [leftAnimating, isDragging, defaultSizes.left, collapsiblePanels.left, animatePanel, onLeftExpandStart, onLeftExpandComplete]);

  // Right panel collapse/expand handlers
  const handleRightCollapse = useCallback(() => {
    if (rightAnimating || isDragging || !collapsiblePanels.right) return;

    setRightAnimating(true);
    setRightCollapsed(true);
    if (onRightCollapseStart) onRightCollapseStart();

    animatePanel(
      rightPanelRef,
      rightSize,
      0,
      rightAnimationFrameRef,
      rightStartTimeRef,
      () => {
        setRightSize(0);
        setHideRightHandle(true);
        setRightAnimating(false);
        if (onRightCollapseComplete) onRightCollapseComplete();
      }
    );
  }, [rightAnimating, isDragging, rightSize, collapsiblePanels.right, animatePanel, onRightCollapseStart, onRightCollapseComplete]);

  const handleRightExpand = useCallback(() => {
    if (rightAnimating || isDragging || !collapsiblePanels.right) return;

    setRightAnimating(true);
    setRightCollapsed(false);
    setHideRightHandle(false);
    if (onRightExpandStart) onRightExpandStart();

    animatePanel(
      rightPanelRef,
      0,
      defaultSizes.right,
      rightAnimationFrameRef,
      rightStartTimeRef,
      () => {
        setRightSize(defaultSizes.right);
        setRightAnimating(false);
        if (onRightExpandComplete) onRightExpandComplete();
      }
    );
  }, [rightAnimating, isDragging, defaultSizes.right, collapsiblePanels.right, animatePanel, onRightExpandStart, onRightExpandComplete]);

  // Toggle handlers
  const toggleLeftPanel = useCallback(() => {
    if (leftCollapsed) {
      handleLeftExpand();
    } else {
      handleLeftCollapse();
    }
  }, [leftCollapsed, handleLeftCollapse, handleLeftExpand]);

  const toggleRightPanel = useCallback(() => {
    if (rightCollapsed) {
      handleRightExpand();
    } else {
      handleRightCollapse();
    }
  }, [rightCollapsed, handleRightCollapse, handleRightExpand]);

  // Resize handlers
  const handleLeftResize = useCallback((size: number) => {
    if (!leftAnimating) {
      setLeftSize(size);
      if (size > 0) {
        setLeftCollapsed(false);
      }
    }
  }, [leftAnimating]);

  const handleRightResize = useCallback((size: number) => {
    if (!rightAnimating) {
      setRightSize(size);
      if (size > 0) {
        setRightCollapsed(false);
      }
    }
  }, [rightAnimating]);

  // Drag handlers
  const handleDragEnd = useCallback(() => {
    if (onPanelResize) {
      onPanelResize({
        left: leftSize,
        middle: 100 - leftSize - rightSize,
        right: rightSize,
      });
    }
  }, [leftSize, rightSize, onPanelResize]);

  const handleDragging = useCallback(
    (dragging: boolean) => {
      setIsDragging(dragging);
      if (!dragging) {
        handleDragEnd();
      }
    },
    [handleDragEnd]
  );

  // Effect for external collapsed prop changes
  useEffect(() => {
    if (collapsed.left !== undefined && collapsed.left !== leftCollapsed) {
      if (collapsed.left) {
        handleLeftCollapse();
      } else {
        handleLeftExpand();
      }
    }
  }, [collapsed.left]);

  useEffect(() => {
    if (collapsed.right !== undefined && collapsed.right !== rightCollapsed) {
      if (collapsed.right) {
        handleRightCollapse();
      } else {
        handleRightExpand();
      }
    }
  }, [collapsed.right]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (leftAnimationFrameRef.current) {
        cancelAnimationFrame(leftAnimationFrameRef.current);
      }
      if (rightAnimationFrameRef.current) {
        cancelAnimationFrame(rightAnimationFrameRef.current);
      }
    };
  }, []);

  // Panel class helper
  const getPanelClassName = (panelName: 'left' | 'middle' | 'right') => {
    let className = 'three-panel-item';

    if (panelName === 'left' && collapsiblePanels.left) {
      className += ' collapsible-panel';
      if (leftAnimating && !isDragging) className += ' animating';
      if (leftCollapsed) className += ' collapsed';
    } else if (panelName === 'right' && collapsiblePanels.right) {
      className += ' collapsible-panel';
      if (rightAnimating && !isDragging) className += ' animating';
      if (rightCollapsed) className += ' collapsed';
    } else if (panelName === 'middle') {
      className += ' middle-panel';
    }

    return className;
  };

  const leftCollapsiblePanelStyle =
    leftAnimating && !isDragging
      ? ({ transition: `flex ${animationDuration}ms ${animationEasing}` } satisfies React.CSSProperties)
      : undefined;

  const rightCollapsiblePanelStyle =
    rightAnimating && !isDragging
      ? ({ transition: `flex ${animationDuration}ms ${animationEasing}` } satisfies React.CSSProperties)
      : undefined;

  // Apply theme as CSS variables
  const themeStyles = {
    '--panel-background': theme?.background || defaultLightTheme.background,
    '--panel-border': theme?.border || defaultLightTheme.border,
    '--panel-handle': theme?.handle || defaultLightTheme.handle,
    '--panel-handle-hover': theme?.handleHover || defaultLightTheme.handleHover,
    '--panel-handle-active': theme?.handleActive || defaultLightTheme.handleActive,
    '--panel-button-bg': theme?.buttonBackground || defaultLightTheme.buttonBackground,
    '--panel-button-hover': theme?.buttonHover || defaultLightTheme.buttonHover,
    '--panel-button-border': theme?.buttonBorder || defaultLightTheme.buttonBorder,
    '--panel-button-icon': theme?.buttonIcon || defaultLightTheme.buttonIcon,
  } as React.CSSProperties;

  return (
    <div className={`three-panel-layout ${className}`} style={{ ...themeStyles, ...style }}>
      <PanelGroup direction="horizontal" onLayout={handleDragEnd}>
        {/* Left Panel */}
        <Panel
          ref={leftPanelRef}
          collapsible={collapsiblePanels.left}
          defaultSize={collapsed.left ? 0 : defaultSizes.left}
          minSize={minSizes.left}
          collapsedSize={0}
          onResize={handleLeftResize}
          onCollapse={() => setLeftCollapsed(true)}
          onExpand={() => setLeftCollapsed(false)}
          className={getPanelClassName('left')}
          style={leftCollapsiblePanelStyle}
        >
          <div
            className="panel-content-wrapper"
            style={{
              opacity: leftCollapsed ? 0 : 1,
              transition: leftAnimating
                ? `opacity ${animationDuration * 0.5}ms ${animationEasing}`
                : 'none',
            }}
          >
            {leftPanel}
          </div>
        </Panel>

        {/* Left Resize Handle */}
        <PanelResizeHandle
          className={`resize-handle left-handle ${hideLeftHandle ? 'collapsed' : ''}`}
          onDragging={handleDragging}
          style={hideLeftHandle ? { visibility: 'hidden', width: 0 } : undefined}
        >
          {showCollapseButtons && collapsiblePanels.left && (
            <div className="handle-bar">
              <button
                onClick={toggleLeftPanel}
                className="collapse-toggle"
                disabled={leftAnimating}
                aria-label={leftCollapsed ? 'Expand left panel' : 'Collapse left panel'}
              >
                {leftCollapsed ? '▸' : '◂'}
              </button>
            </div>
          )}
        </PanelResizeHandle>

        {/* Middle Panel */}
        <Panel
          defaultSize={defaultSizes.middle}
          minSize={minSizes.middle}
          className={getPanelClassName('middle')}
        >
          <div className="panel-content-wrapper">
            {middlePanel}
          </div>
        </Panel>

        {/* Right Resize Handle */}
        <PanelResizeHandle
          className={`resize-handle right-handle ${hideRightHandle ? 'collapsed' : ''}`}
          onDragging={handleDragging}
          style={hideRightHandle ? { visibility: 'hidden', width: 0 } : undefined}
        >
          {showCollapseButtons && collapsiblePanels.right && (
            <div className="handle-bar">
              <button
                onClick={toggleRightPanel}
                className="collapse-toggle"
                disabled={rightAnimating}
                aria-label={rightCollapsed ? 'Expand right panel' : 'Collapse right panel'}
              >
                {rightCollapsed ? '◂' : '▸'}
              </button>
            </div>
          )}
        </PanelResizeHandle>

        {/* Right Panel */}
        <Panel
          ref={rightPanelRef}
          collapsible={collapsiblePanels.right}
          defaultSize={collapsed.right ? 0 : defaultSizes.right}
          minSize={minSizes.right}
          collapsedSize={0}
          onResize={handleRightResize}
          onCollapse={() => setRightCollapsed(true)}
          onExpand={() => setRightCollapsed(false)}
          className={getPanelClassName('right')}
          style={rightCollapsiblePanelStyle}
        >
          <div
            className="panel-content-wrapper"
            style={{
              opacity: rightCollapsed ? 0 : 1,
              transition: rightAnimating
                ? `opacity ${animationDuration * 0.5}ms ${animationEasing}`
                : 'none',
            }}
          >
            {rightPanel}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};