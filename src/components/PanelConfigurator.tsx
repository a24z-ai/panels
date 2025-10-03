import React, { useState, useCallback } from 'react';
import { useTheme, Theme } from '@a24z/industry-theme';
import './PanelConfigurator.css';

export interface PanelDefinition {
  id: string;
  label: string;
  preview?: React.ReactNode;
}

export interface PanelLayout {
  left: string | null;
  middle: string | null;
  right: string | null;
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
    return currentLayout.left === panelId ||
           currentLayout.middle === panelId ||
           currentLayout.right === panelId;
  }, [currentLayout]);

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
      const newLayout = { ...currentLayout };

      // If the panel is already in another slot, remove it from there
      Object.keys(newLayout).forEach((key) => {
        if (newLayout[key as SlotPosition] === selection.id) {
          newLayout[key as SlotPosition] = null;
        }
      });

      // Assign to the clicked slot
      newLayout[position] = selection.id;
      onChange(newLayout);
      setSelection(null);
    }
  }, [selection, currentLayout, onChange]);

  // Handle panel click
  const handlePanelClick = useCallback((panelId: string) => {
    if (!selection) {
      // First click - select this panel
      setSelection({ type: 'panel', id: panelId });
      return;
    }

    if (selection.type === 'slot') {
      // Assign panel to the selected slot
      const newLayout = { ...currentLayout };

      // If the panel is already in another slot, remove it from there
      Object.keys(newLayout).forEach((key) => {
        if (newLayout[key as SlotPosition] === panelId) {
          newLayout[key as SlotPosition] = null;
        }
      });

      newLayout[selection.position] = panelId;
      onChange(newLayout);
      setSelection(null);
    } else {
      // Change selection to this panel
      setSelection({ type: 'panel', id: panelId });
    }
  }, [selection, currentLayout, onChange]);

  // Handle slot clear (remove panel from slot)
  const handleSlotClear = useCallback((position: SlotPosition, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLayout = { ...currentLayout };
    newLayout[position] = null;
    onChange(newLayout);
    setSelection(null);
  }, [currentLayout, onChange]);

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
            const panelId = currentLayout[position];
            const panel = getPanelById(panelId);
            const selected = isSlotSelected(position);

            return (
              <div
                key={position}
                data-position={position}
                className={`slot ${selected ? 'selected' : ''} ${panel ? 'filled' : 'empty'}`}
                onClick={() => handleSlotClick(position)}
              >
                {panel ? (
                  <div className="slot-content">
                    {panel.preview && (
                      <div className="slot-preview">{panel.preview}</div>
                    )}
                    <button
                      className="slot-clear-btn"
                      onClick={(e) => handleSlotClear(position, e)}
                      aria-label={`Remove ${panel.label} from ${position} slot`}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="slot-empty-state">Empty</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="configurator-section">
        <h3 className="section-title">
          Panels
        </h3>
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
          {selection.type === 'slot'
            ? `Selected: ${selection.position} slot. Click another slot to swap, or click a panel to assign.`
            : `Selected: ${getPanelById(selection.id)?.label}. Click a slot to assign.`
          }
        </div>
      )}
    </div>
  );
};
