import React, { useState, useCallback } from 'react';
import { useTheme, Theme } from '@a24z/industry-theme';
import './PanelConfigurator.css';

export interface PanelDefinition {
  id: string;
  label: string;
  preview?: React.ReactNode;
  icon?: React.ReactNode;
}

export type PanelSlot =
  | string                          // Single panel ID
  | null                            // Empty slot
  | PanelGroup;                     // Multiple panels grouped together

export interface PanelGroup {
  type: 'tabs' | 'tiles';
  panels: string[];                 // Array of panel IDs
  config?: TabsConfig | TilesConfig;
}

export interface TabsConfig {
  defaultActiveTab?: number;        // Which tab is active by default (index)
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';
  centered?: boolean;                // Whether to center the tabs
}

export interface TilesConfig {
  direction?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  rows?: number;
  tileSizes?: number[];             // Size percentages for each tile
}

export interface PanelLayout {
  left: PanelSlot;
  middle: PanelSlot;
  right: PanelSlot;
}

export interface PanelConfiguratorProps {
  /** Available panels that can be placed in slots */
  availablePanels: PanelDefinition[];

  /** Current layout configuration */
  currentLayout: PanelLayout;

  /** Callback when layout changes */
  onChange: (layout: PanelLayout) => void;

  /** Optional class name for the container */
  className?: string;

  /** Optional theme override (uses context theme by default) */
  theme?: Theme;
}

type SlotPosition = 'left' | 'middle' | 'right';
type Selection = { type: 'slot'; position: SlotPosition } | { type: 'panel'; id: string } | null;

// Helper to check if a slot is a group
const isGroup = (slot: PanelSlot): slot is PanelGroup => {
  return slot !== null && typeof slot === 'object' && 'type' in slot;
};

// Helper to get panel IDs from a slot
const getPanelIdsFromSlot = (slot: PanelSlot): string[] => {
  if (slot === null) return [];
  if (typeof slot === 'string') return [slot];
  if (isGroup(slot)) return slot.panels;
  return [];
};

/**
 * PanelConfigurator - Interactive UI for configuring panel layout
 *
 * Interaction modes:
 * - Click slot → click panel: Assigns panel to slot
 * - Click panel → click slot: Assigns panel to slot
 * - Click slot → click slot: Swaps their content
 */
export const PanelConfigurator: React.FC<PanelConfiguratorProps> = ({
  availablePanels,
  currentLayout,
  onChange,
  className = '',
  theme: themeProp,
}) => {
  const contextTheme = useTheme();
  const theme = themeProp || contextTheme.theme;
  const [selection, setSelection] = useState<Selection>(null);

  // Get panel by id
  const getPanelById = useCallback((id: string | null) => {
    if (!id) return null;
    return availablePanels.find(p => p.id === id) || null;
  }, [availablePanels]);

  // Get all panels sorted alphabetically
  const getSortedPanels = useCallback(() => {
    return [...availablePanels].sort((a, b) => a.label.localeCompare(b.label));
  }, [availablePanels]);

  // Check if a panel is in use
  const isPanelInUse = useCallback((panelId: string) => {
    const leftIds = getPanelIdsFromSlot(currentLayout.left);
    const middleIds = getPanelIdsFromSlot(currentLayout.middle);
    const rightIds = getPanelIdsFromSlot(currentLayout.right);
    return leftIds.includes(panelId) || middleIds.includes(panelId) || rightIds.includes(panelId);
  }, [currentLayout]);

  // Remove panel from any slot
  const removePanelFromLayout = useCallback((layout: PanelLayout, panelId: string): PanelLayout => {
    const newLayout = { ...layout };
    (['left', 'middle', 'right'] as SlotPosition[]).forEach((pos) => {
      const slot = newLayout[pos];
      if (slot === panelId) {
        newLayout[pos] = null;
      } else if (isGroup(slot)) {
        const filteredPanels = slot.panels.filter(id => id !== panelId);
        if (filteredPanels.length === 0) {
          newLayout[pos] = null;
        } else if (filteredPanels.length === 1) {
          newLayout[pos] = filteredPanels[0];
        } else {
          newLayout[pos] = { ...slot, panels: filteredPanels };
        }
      }
    });
    return newLayout;
  }, []);

  // Toggle tab mode for a slot
  const toggleTabMode = useCallback((position: SlotPosition, e: React.MouseEvent) => {
    e.stopPropagation();
    const slot = currentLayout[position];

    if (isGroup(slot) && slot.type === 'tabs') {
      // Disable tab mode - convert to single panel (first panel in group) or null
      const newLayout = { ...currentLayout };
      newLayout[position] = slot.panels.length > 0 ? slot.panels[0] : null;
      onChange(newLayout);
    } else {
      // Enable tab mode
      const panels: string[] = slot && typeof slot === 'string' ? [slot] : [];
      const newLayout = { ...currentLayout };
      newLayout[position] = {
        type: 'tabs',
        panels,
        config: { defaultActiveTab: 0, tabPosition: 'top' }
      };
      onChange(newLayout);
    }
  }, [currentLayout, onChange]);

  // Handle slot click
  const handleSlotClick = useCallback((position: SlotPosition) => {
    if (!selection) {
      // First click - select this slot
      setSelection({ type: 'slot', position });
      return;
    }

    if (selection.type === 'slot') {
      // If clicking the same slot that's already selected, keep it selected (don't swap)
      if (selection.position === position) {
        return;
      }

      // Swap two different slots
      const newLayout = { ...currentLayout };
      const temp = newLayout[selection.position];
      newLayout[selection.position] = newLayout[position];
      newLayout[position] = temp;
      onChange(newLayout);
      setSelection(null);
    } else {
      // Assign panel to slot
      const slot = currentLayout[position];

      // If slot is in tab mode, add panel to the tab group
      if (isGroup(slot) && slot.type === 'tabs') {
        // Check if panel is already in this group
        if (slot.panels.includes(selection.id)) {
          setSelection(null);
          return;
        }

        const newLayout = removePanelFromLayout(currentLayout, selection.id);
        const existingGroup = newLayout[position];

        if (isGroup(existingGroup) && existingGroup.type === 'tabs') {
          newLayout[position] = {
            ...existingGroup,
            panels: [...existingGroup.panels, selection.id]
          };
        }

        onChange(newLayout);
        // Keep slot selected so user can add more panels
        return;
      } else {
        // Replace slot with panel
        const newLayout = removePanelFromLayout(currentLayout, selection.id);
        newLayout[position] = selection.id;
        onChange(newLayout);
        setSelection(null);
      }
    }
  }, [selection, currentLayout, onChange, removePanelFromLayout]);

  // Handle panel click
  const handlePanelClick = useCallback((panelId: string) => {
    if (!selection) {
      // First click - select this panel
      setSelection({ type: 'panel', id: panelId });
      return;
    }

    if (selection.type === 'slot') {
      // Assign panel to the selected slot
      const slot = currentLayout[selection.position];

      // If slot is in tab mode, add panel to the tab group
      if (isGroup(slot) && slot.type === 'tabs') {
        // Check if panel is already in this group
        if (slot.panels.includes(panelId)) {
          setSelection(null);
          return;
        }

        const newLayout = removePanelFromLayout(currentLayout, panelId);
        const existingGroup = newLayout[selection.position];

        if (isGroup(existingGroup) && existingGroup.type === 'tabs') {
          newLayout[selection.position] = {
            ...existingGroup,
            panels: [...existingGroup.panels, panelId]
          };
        }

        onChange(newLayout);
        setSelection(null);
      } else {
        // Replace slot with panel
        const newLayout = removePanelFromLayout(currentLayout, panelId);
        newLayout[selection.position] = panelId;
        onChange(newLayout);
        setSelection(null);
      }
    } else {
      // Change selection to this panel
      setSelection({ type: 'panel', id: panelId });
    }
  }, [selection, currentLayout, onChange, removePanelFromLayout]);

  // Handle slot clear (remove panel from slot)
  const handleSlotClear = useCallback((position: SlotPosition, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLayout = { ...currentLayout };
    newLayout[position] = null;
    onChange(newLayout);
    setSelection(null);
  }, [currentLayout, onChange]);

  // Remove panel from tab group
  const removePanelFromTabGroup = useCallback((position: SlotPosition, panelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const slot = currentLayout[position];
    if (!isGroup(slot) || slot.type !== 'tabs') return;

    const filteredPanels = slot.panels.filter(id => id !== panelId);
    const newLayout = { ...currentLayout };

    if (filteredPanels.length === 0) {
      newLayout[position] = null;
    } else if (filteredPanels.length === 1) {
      // Only one panel left, convert back to single panel
      newLayout[position] = filteredPanels[0];
    } else {
      newLayout[position] = { ...slot, panels: filteredPanels };
    }

    onChange(newLayout);
  }, [currentLayout, onChange]);

  // Update tab configuration
  const updateTabConfig = useCallback((position: SlotPosition, config: Partial<TabsConfig>) => {
    const slot = currentLayout[position];
    if (!isGroup(slot) || slot.type !== 'tabs') return;

    const newLayout = { ...currentLayout };
    newLayout[position] = {
      ...slot,
      config: { ...(slot.config as TabsConfig), ...config }
    };

    onChange(newLayout);
  }, [currentLayout, onChange]);

  // Check if item is selected
  const isSlotSelected = (position: SlotPosition) =>
    selection?.type === 'slot' && selection.position === position;

  const isPanelSelected = (panelId: string) =>
    selection?.type === 'panel' && selection.id === panelId;

  const sortedPanels = getSortedPanels();

  const isTabModeSlot = (position: SlotPosition) => {
    const slot = currentLayout[position];
    return isGroup(slot) && slot.type === 'tabs';
  };

  // Apply theme colors as CSS variables
  const themeStyles = {
    '--configurator-bg': theme.colors.background,
    '--configurator-title': theme.colors.textSecondary,

    '--slot-bg': theme.colors.backgroundSecondary,
    '--slot-border': theme.colors.border,
    '--slot-border-hover': theme.colors.textTertiary,
    '--slot-border-selected': theme.colors.primary,
    '--slot-bg-selected': theme.colors.backgroundLight,
    '--slot-label': theme.colors.textTertiary,
    '--slot-content-text': theme.colors.text,
    '--slot-preview-bg': theme.colors.backgroundTertiary,
    '--slot-preview-border': theme.colors.border,
    '--slot-preview-text': theme.colors.textMuted,
    '--slot-empty-text': theme.colors.textMuted,

    '--panel-bg': theme.colors.backgroundSecondary,
    '--panel-border': theme.colors.border,
    '--panel-border-hover': theme.colors.textSecondary,
    '--panel-border-selected': theme.colors.primary,
    '--panel-bg-selected': theme.colors.backgroundLight,
    '--panel-label-text': theme.colors.text,
    '--panel-preview-bg': theme.colors.backgroundTertiary,
    '--panel-preview-text': theme.colors.textMuted,

    '--clear-btn-bg': theme.colors.error,
    '--clear-btn-text': theme.colors.background,
    '--clear-btn-hover': theme.colors.error,

    '--hint-bg': theme.colors.backgroundLight,
    '--hint-border': theme.colors.primary,
    '--hint-text': theme.colors.text,
  } as React.CSSProperties;

  return (
    <div className={`panel-configurator ${className}`} style={themeStyles}>
      <div className="configurator-section">
        <h3 className="section-title">Panel Layout (3 Slots)</h3>
        <div className="slots-container">
          {(['left', 'middle', 'right'] as SlotPosition[]).map((position) => {
            const slot = currentLayout[position];
            const selected = isSlotSelected(position);
            const isTabGroup = isGroup(slot) && slot.type === 'tabs';
            const isFilled = slot !== null;

            return (
              <div
                key={position}
                data-position={position}
                className={`slot ${selected ? 'selected' : ''} ${isFilled ? 'filled' : 'empty'} ${isTabGroup ? 'tab-group' : ''}`}
                onClick={() => handleSlotClick(position)}
              >
                <button
                  className={`tab-mode-toggle ${isTabGroup ? 'active' : ''}`}
                  onClick={(e) => toggleTabMode(position, e)}
                  title={isTabGroup ? 'Disable tab mode' : 'Enable tab mode'}
                >
                  🗂️
                </button>

                {!isTabGroup && <div className="slot-label">{position}</div>}

                {slot === null ? (
                  <div className="slot-empty-state">
                    {isTabGroup ? 'Click panels to add tabs' : 'Empty'}
                  </div>
                ) : isGroup(slot) ? (
                  <div className="slot-content group-content">
                    {slot.type === 'tabs' && slot.panels.length > 0 && (
                      <div className="tab-config-controls">
                        <label className="tab-config-label">
                          Position:
                          <select
                            value={(slot.config as TabsConfig)?.tabPosition || 'top'}
                            onChange={(e) => updateTabConfig(position, { tabPosition: e.target.value as 'top' | 'bottom' | 'left' | 'right' })}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </label>
                      </div>
                    )}
                    <div className="group-panels">
                      {slot.panels.length === 0 ? (
                        <div className="slot-empty-state">Click panels to add tabs</div>
                      ) : (
                        slot.panels.map((panelId, idx) => {
                          const panel = getPanelById(panelId);
                          const isDefaultTab = slot.type === 'tabs' && ((slot.config as TabsConfig)?.defaultActiveTab ?? 0) === idx;
                          return panel ? (
                            <div key={panelId} className="group-panel-item">
                              <span className="group-panel-label">
                                {panel.label}
                                {isDefaultTab && <span className="default-badge">★</span>}
                              </span>
                              <button
                                className="remove-from-group-btn"
                                onClick={(e) => removePanelFromTabGroup(position, panelId, e)}
                                title={`Remove ${panel.label}`}
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="slot-content">
                    {getPanelById(slot)?.preview && (
                      <div className="slot-preview">{getPanelById(slot)?.preview}</div>
                    )}
                    <div className="slot-panel-label">{getPanelById(slot)?.label}</div>
                    <button
                      className="slot-clear-btn"
                      onClick={(e) => handleSlotClear(position, e)}
                      aria-label={`Remove ${getPanelById(slot)?.label} from ${position} slot`}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="configurator-section">
        <h3 className="section-title">Available Panels</h3>
        <div className="available-panels">
          {sortedPanels.map((panel) => {
            const selected = isPanelSelected(panel.id);
            const inUse = isPanelInUse(panel.id);
            return (
              <div
                key={panel.id}
                className={`available-panel ${selected ? 'selected' : ''} ${inUse ? 'in-use' : ''}`}
                onClick={() => handlePanelClick(panel.id)}
              >
                <div className="panel-label">{panel.label}</div>
                {panel.preview && (
                  <div className="panel-preview">{panel.preview}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selection && (
        <div className="selection-hint">
          {selection.type === 'slot' ? (
            isTabModeSlot(selection.position) ? (
              <>Selected: {selection.position} slot (Tab Mode). Click panels to add them to the tab group.</>
            ) : (
              <>Selected: {selection.position} slot. Click another slot to swap, or click a panel to assign.</>
            )
          ) : (
            <>Selected: {getPanelById(selection.id)?.label}. Click a slot to assign{isTabModeSlot('left') || isTabModeSlot('middle') || isTabModeSlot('right') ? ' (or add to tab group)' : ''}.</>
          )}
        </div>
      )}

      <div className="usage-hint">
        💡 <strong>Tip:</strong> Toggle 🗂️ on a slot to enable tab mode, then click panels to add multiple tabs.
      </div>
    </div>
  );
};
