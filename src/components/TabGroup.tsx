import React, { useState } from 'react';
import { Theme } from '@a24z/industry-theme';
import { mapThemeToTabVars } from '../utils/themeMapping';
import { PanelDefinitionWithContent } from './ConfigurablePanelLayout';
import { TabsConfig } from './PanelConfigurator';
import './TabGroup.css';

export interface TabGroupProps {
  /** Panel IDs to display as tabs */
  panelIds: string[];

  /** All available panels with content */
  panels: PanelDefinitionWithContent[];

  /** Tab configuration */
  config?: TabsConfig;

  /** Optional class name */
  className?: string;

  /** Theme object for customizing colors */
  theme: Theme;
}

/**
 * TabGroup - Renders multiple panels in a tabbed interface
 */
export const TabGroup: React.FC<TabGroupProps> = ({
  panelIds,
  panels,
  config = {},
  className = '',
  theme,
}) => {
  const { defaultActiveTab = 0, tabPosition = 'top', centered = true } = config;
  const [activeTabIndex, setActiveTabIndex] = useState(defaultActiveTab);

  // Apply theme as CSS variables
  const themeStyles = mapThemeToTabVars(theme) as React.CSSProperties;

  // Get panels in order
  const tabPanels = panelIds
    .map(id => panels.find(p => p.id === id))
    .filter((p): p is PanelDefinitionWithContent => p !== undefined);

  // Ensure active tab is valid
  const safeActiveIndex = Math.min(activeTabIndex, tabPanels.length - 1);

  const activePanel = tabPanels[safeActiveIndex];

  if (tabPanels.length === 0) {
    return <div className="tab-group-empty">No panels available</div>;
  }

  const tabList = (
    <div className={`tab-list ${centered ? 'centered' : ''}`} role="tablist">
      {tabPanels.map((panel, index) => (
        <button
          key={panel.id}
          role="tab"
          aria-selected={index === safeActiveIndex}
          aria-controls={`tabpanel-${panel.id}`}
          id={`tab-${panel.id}`}
          className={`tab-button ${index === safeActiveIndex ? 'active' : ''}`}
          onClick={() => setActiveTabIndex(index)}
          title={panel.icon ? panel.label : undefined}
        >
          {panel.icon ? (
            <span className="tab-icon">{panel.icon}</span>
          ) : (
            panel.label
          )}
        </button>
      ))}
    </div>
  );

  const tabContent = activePanel ? (
    <div
      className="tab-content"
      role="tabpanel"
      id={`tabpanel-${activePanel.id}`}
      aria-labelledby={`tab-${activePanel.id}`}
    >
      {activePanel.content}
    </div>
  ) : null;

  return (
    <div className={`tab-group tab-position-${tabPosition} ${className}`} style={themeStyles}>
      {(tabPosition === 'top' || tabPosition === 'left') && tabList}
      {tabContent}
      {(tabPosition === 'bottom' || tabPosition === 'right') && tabList}
    </div>
  );
};
