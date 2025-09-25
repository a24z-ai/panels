export { AnimatedResizableLayout, type AnimatedResizableLayoutProps } from './components/AnimatedResizableLayout';
export { ThreePanelLayout, type ThreePanelLayoutProps } from './components/ThreePanelLayout';

// Types are kept for potential future use
export type {
  PanelOrientation,
  CollapsibleSide,
  Theme,
  AnimationConfig,
  CollapseButtonConfig,
  PanelCallbacks,
} from './types';

// Theme exports
export { type PanelTheme, defaultLightTheme, defaultDarkTheme } from './types/theme';

export { useMediaQuery } from './hooks/useMediaQuery';
export { useLocalStorage } from './hooks/useLocalStorage';