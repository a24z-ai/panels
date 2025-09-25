export interface PanelTheme {
  /** Panel background color */
  background?: string;

  /** Panel border/divider color */
  border?: string;

  /** Resize handle color */
  handle?: string;

  /** Resize handle hover color */
  handleHover?: string;

  /** Resize handle active/dragging color */
  handleActive?: string;

  /** Collapse button background */
  buttonBackground?: string;

  /** Collapse button hover background */
  buttonHover?: string;

  /** Collapse button border color */
  buttonBorder?: string;

  /** Collapse button icon color */
  buttonIcon?: string;
}

export const defaultLightTheme: PanelTheme = {
  background: '#ffffff',
  border: '#e2e8f0',
  handle: '#f0f0f0',
  handleHover: '#e0e0e0',
  handleActive: '#d0d0d0',
  buttonBackground: '#ffffff',
  buttonHover: '#f9fafb',
  buttonBorder: '#e2e8f0',
  buttonIcon: '#64748b',
};

export const defaultDarkTheme: PanelTheme = {
  background: '#1a1a1a',
  border: '#374151',
  handle: '#2a2a2a',
  handleHover: '#374151',
  handleActive: '#4b5563',
  buttonBackground: '#1f2937',
  buttonHover: '#374151',
  buttonBorder: '#374151',
  buttonIcon: '#9ca3af',
};