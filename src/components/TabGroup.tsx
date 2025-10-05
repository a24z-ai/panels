import React, { useState } from 'react';
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
}

/**
 * TabGroup - Renders multiple panels in a tabbed interface
 */
export const TabGroup: React.FC<TabGroupProps> = ({
  panelIds,
  panels,
  config = {},
  className = '',
}) => {
  const { defaultActiveTab = 0, tabPosition = 'top' } = config;
  const [activeTabIndex, setActiveTabIndex] = useState(defaultActiveTab);

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
    <div className="tab-list" role="tablist">
      {tabPanels.map((panel, index) => (
        <button
          key={panel.id}
          role="tab"
          aria-selected={index === safeActiveIndex}
          aria-controls={`tabpanel-${panel.id}`}
          id={`tab-${panel.id}`}
          className={`tab-button ${index === safeActiveIndex ? 'active' : ''}`}
          onClick={() => setActiveTabIndex(index)}
        >
          {panel.label}
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
    <div className={`tab-group tab-position-${tabPosition} ${className}`}>
      {(tabPosition === 'top' || tabPosition === 'left') && tabList}
      {tabContent}
      {(tabPosition === 'bottom' || tabPosition === 'right') && tabList}
    </div>
  );
};
