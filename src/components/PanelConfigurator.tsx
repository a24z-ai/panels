import React, { useState, useCallback } from 'react';
import { useTheme, Theme } from '@a24z/industry-theme';
import './PanelConfigurator.css';

export interface PanelDefinition {
  id: string;
  label: string;
  preview?: React.ReactNode;
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
  const [multiSelectPanels, setMultiSelectPanels] = useState<string[]>([]);

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

  // Handle slot click
  const handleSlotClick = useCallback((position: SlotPosition) => {
    if (!selection) {
      // First click - select this slot
      setSelection({ type: 'slot', position });
      return;
    }

    if (selection.type === 'slot') {
      // Swap two slots
      const newLayout = { ...currentLayout };
      const temp = newLayout[selection.position];
      newLayout[selection.position] = newLayout[position];
      newLayout[position] = temp;
      onChange(newLayout);
      setSelection(null);
    } else {
      // Assign panel to slot
      let newLayout = removePanelFromLayout(currentLayout, selection.id);
      newLayout[position] = selection.id;
      onChange(newLayout);
      setSelection(null);
    }
  }, [selection, currentLayout, onChange, removePanelFromLayout]);

  // Handle panel click (with shift for multi-select)
  const handlePanelClick = useCallback((panelId: string, shiftKey: boolean = false) => {
    // Multi-select mode with shift key
    if (shiftKey && !selection) {
      setMultiSelectPanels(prev =>
        prev.includes(panelId) ? prev.filter(id => id !== panelId) : [...prev, panelId]
      );
      return;
    }

    if (!selection) {
      // First click - select this panel
      setSelection({ type: 'panel', id: panelId });
      setMultiSelectPanels([]);
      return;
    }

    if (selection.type === 'slot') {
      // Assign panel to the selected slot
      let newLayout = removePanelFromLayout(currentLayout, panelId);
      newLayout[selection.position] = panelId;
      onChange(newLayout);
      setSelection(null);
      setMultiSelectPanels([]);
    } else {
      // Change selection to this panel
      setSelection({ type: 'panel', id: panelId });
      setMultiSelectPanels([]);
    }
  }, [selection, currentLayout, onChange, removePanelFromLayout]);

  // Handle slot clear (remove panel from slot)
  const handleSlotClear = useCallback((position: SlotPosition, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLayout = { ...currentLayout };
    newLayout[position] = null;
    onChange(newLayout);
    setSelection(null);
    setMultiSelectPanels([]);
  }, [currentLayout, onChange]);

  // Create tab group from multi-selected panels
  const createTabGroup = useCallback((position: SlotPosition) => {
    if (multiSelectPanels.length < 2) return;

    let newLayout = { ...currentLayout };

    // Remove all selected panels from current positions
    multiSelectPanels.forEach(panelId => {
      newLayout = removePanelFromLayout(newLayout, panelId);
    });

    // Create tab group in target position
    newLayout[position] = {
      type: 'tabs',
      panels: multiSelectPanels,
      config: { defaultActiveTab: 0, tabPosition: 'top' }
    };

    onChange(newLayout);
    setMultiSelectPanels([]);
    setSelection(null);
  }, [multiSelectPanels, currentLayout, onChange, removePanelFromLayout]);

  // Add panel to existing tab group - reserved for future use
  // const addToTabGroup = useCallback((position: SlotPosition, panelId: string) => {
  //   const slot = currentLayout[position];
  //   if (!isGroup(slot) || slot.type !== 'tabs') return;

  //   let newLayout = removePanelFromLayout(currentLayout, panelId);
  //   const existingGroup = newLayout[position];

  //   if (isGroup(existingGroup) && existingGroup.type === 'tabs') {
  //     newLayout[position] = {
  //       ...existingGroup,
  //       panels: [...existingGroup.panels, panelId]
  //     };
  //   }

  //   onChange(newLayout);
  //   setSelection(null);
  // }, [currentLayout, onChange, removePanelFromLayout]);

  // Check if item is selected
  const isSlotSelected = (position: SlotPosition) =>
    selection?.type === 'slot' && selection.position === position;

  const isPanelSelected = (panelId: string) =>
    selection?.type === 'panel' && selection.id === panelId;

  const sortedPanels = getSortedPanels();

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
                {slot === null ? (
                  <div className="slot-empty-state">
                    Empty
                    {multiSelectPanels.length >= 2 && (
                      <button
                        className="create-tab-group-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          createTabGroup(position);
                        }}
                      >
                        + Tab Group
                      </button>
                    )}
                  </div>
                ) : isGroup(slot) ? (
                  <div className="slot-content group-content">
                    <div className="group-badge">{slot.type === 'tabs' ? '📑 Tabs' : '🔲 Tiles'}</div>
                    <div className="group-panels">
                      {slot.panels.map(panelId => {
                        const panel = getPanelById(panelId);
                        return panel ? <span key={panelId} className="group-panel-label">{panel.label}</span> : null;
                      })}
                    </div>
                    <button
                      className="slot-clear-btn"
                      onClick={(e) => handleSlotClear(position, e)}
                      aria-label={`Remove group from ${position} slot`}
                    >
                      ×
                    </button>
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
        <h3 className="section-title">
          Panels
          {multiSelectPanels.length > 0 && (
            <span className="multi-select-badge">
              {multiSelectPanels.length} selected
            </span>
          )}
        </h3>
        <div className="available-panels">
          {sortedPanels.map((panel) => {
            const selected = isPanelSelected(panel.id);
            const multiSelected = multiSelectPanels.includes(panel.id);
            const inUse = isPanelInUse(panel.id);
            return (
              <div
                key={panel.id}
                className={`available-panel ${selected ? 'selected' : ''} ${multiSelected ? 'multi-selected' : ''} ${inUse ? 'in-use' : ''}`}
                onClick={(e) => handlePanelClick(panel.id, e.shiftKey)}
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
          {selection.type === 'slot'
            ? `Selected: ${selection.position} slot. Click another slot to swap, or click a panel to assign.`
            : `Selected: ${getPanelById(selection.id)?.label}. Click a slot to assign.`
          }
        </div>
      )}

      {multiSelectPanels.length >= 2 && (
        <div className="selection-hint multi-select-hint">
          {multiSelectPanels.length} panels selected. Click an empty slot's "+ Tab Group" button to create a tab group.
        </div>
      )}

      {multiSelectPanels.length > 0 && multiSelectPanels.length < 2 && (
        <div className="selection-hint">
          Shift+Click more panels to create a tab group (need at least 2).
        </div>
      )}
    </div>
  );
};
