// Basic types for panel components

export type PanelOrientation = 'horizontal' | 'vertical';
export type CollapsibleSide = 'left' | 'right' | 'both' | 'none';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type MobileLayout = 'stack' | 'tabs' | 'drawer';
export type TabletLayout = 'two-panel' | 'drawer-main';
export type DesktopLayout = 'three-panel' | 'two-panel';

export interface AnimationConfig {
  duration?: number;
  easing?: string;
}

export interface CollapseButtonConfig {
  show?: boolean;
  position?: 'handle' | 'panel' | 'both';
}

export interface PanelCallbacks {
  onPanelResize?: (sizes: number[]) => void;
  onPanelCollapse?: (panel: string) => void;
  onPanelExpand?: (panel: string) => void;
  onCollapseStart?: (panel: string) => void;
  onCollapseComplete?: (panel: string) => void;
  onExpandStart?: (panel: string) => void;
  onExpandComplete?: (panel: string) => void;
}

// Component-specific props removed - using AnimatedResizableLayout only

