export { AnimatedResizableLayout, type AnimatedResizableLayoutProps } from './components/AnimatedResizableLayout';
export { AnimatedVerticalLayout, type AnimatedVerticalLayoutProps } from './components/AnimatedVerticalLayout';
export { ThreePanelLayout, type ThreePanelLayoutProps } from './components/ThreePanelLayout';
export { ConfigurablePanelLayout, type ConfigurablePanelLayoutProps, type PanelDefinitionWithContent } from './components/ConfigurablePanelLayout';
export { PanelConfigurator, type PanelConfiguratorProps, type PanelDefinition, type PanelLayout, type PanelSlot, type PanelGroup, type TabsConfig, type TilesConfig } from './components/PanelConfigurator';
export { TabGroup, type TabGroupProps } from './components/TabGroup';

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