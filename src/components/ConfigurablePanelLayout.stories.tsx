import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ConfigurablePanelLayout, PanelDefinitionWithContent } from './ConfigurablePanelLayout';
import { PanelLayout } from './PanelConfigurator';
import { slateTheme, terminalTheme } from '@a24z/industry-theme';
import React, { useState } from 'react';

const meta = {
  title: 'Components/ConfigurablePanelLayout',
  component: ConfigurablePanelLayout,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onPanelResize: fn(),
    onLeftCollapseStart: fn(),
    onLeftCollapseComplete: fn(),
    onLeftExpandStart: fn(),
    onLeftExpandComplete: fn(),
    onRightCollapseStart: fn(),
    onRightCollapseComplete: fn(),
    onRightExpandStart: fn(),
    onRightExpandComplete: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ConfigurablePanelLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample panel definitions with content
const samplePanels: PanelDefinitionWithContent[] = [
  {
    id: 'nav',
    label: 'Navigation',
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Navigation Panel</h3>
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'main',
    label: 'Main Content',
    content: (
      <div style={{ padding: '20px' }}>
        <h2>Main Content Area</h2>
        <p>This is the main content panel.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    ),
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Sidebar</h3>
        <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '10px' }}>
          Widget 1
        </div>
        <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
          Widget 2
        </div>
      </div>
    ),
  },
  {
    id: 'tools',
    label: 'Tools',
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Tools Panel</h3>
        <button style={{ margin: '5px', padding: '8px 16px' }}>Tool 1</button>
        <button style={{ margin: '5px', padding: '8px 16px' }}>Tool 2</button>
      </div>
    ),
  },
];

// Basic story
export const Default: Story = {
  args: {
    panels: samplePanels,
    layout: {
      left: 'nav',
      middle: 'main',
      right: 'sidebar',
    },
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 60, right: 20 },
    theme: slateTheme,
  },
};

// With different layout configuration
export const DifferentLayout: Story = {
  args: {
    panels: samplePanels,
    layout: {
      left: 'tools',
      middle: 'main',
      right: 'nav',
    },
    showCollapseButtons: true,
    defaultSizes: { left: 15, middle: 70, right: 15 },
    theme: slateTheme,
  },
};

// With empty slots
export const WithEmptySlots: Story = {
  args: {
    panels: samplePanels,
    layout: {
      left: 'nav',
      middle: 'main',
      right: null,
    },
    showCollapseButtons: true,
    defaultSizes: { left: 25, middle: 75, right: 0 },
    theme: slateTheme,
  },
};

// Interactive story with dynamic layout
const InteractiveConfigurableLayout = () => {
  const [layout, setLayout] = useState<PanelLayout>({
    left: 'nav',
    middle: 'main',
    right: 'sidebar',
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc', background: '#f7f7f7' }}>
        <h4>Change Layout Configuration</h4>
        <select
          value={layout.left || ''}
          onChange={(e) => setLayout({ ...layout, left: e.target.value || null })}
          style={{ margin: '5px', padding: '5px' }}
        >
          <option value="">Empty</option>
          {samplePanels.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select
          value={layout.middle || ''}
          onChange={(e) => setLayout({ ...layout, middle: e.target.value || null })}
          style={{ margin: '5px', padding: '5px' }}
        >
          <option value="">Empty</option>
          {samplePanels.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select
          value={layout.right || ''}
          onChange={(e) => setLayout({ ...layout, right: e.target.value || null })}
          style={{ margin: '5px', padding: '5px' }}
        >
          <option value="">Empty</option>
          {samplePanels.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <ConfigurablePanelLayout
          panels={samplePanels}
          layout={layout}
          showCollapseButtons={true}
          defaultSizes={{ left: 20, middle: 60, right: 20 }}
          theme={slateTheme}
        />
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveConfigurableLayout />,
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    panels: samplePanels,
    layout: {
      left: 'nav',
      middle: 'main',
      right: 'sidebar',
    },
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 60, right: 20 },
    theme: terminalTheme,
  },
};

// Extended panel set for tabs demo
const extendedPanels: PanelDefinitionWithContent[] = [
  ...samplePanels,
  {
    id: 'preview',
    label: 'Preview',
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Preview Panel</h3>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '4px' }}>
          Preview content goes here...
        </div>
      </div>
    ),
  },
  {
    id: 'terminal',
    label: 'Terminal',
    content: (
      <div style={{ padding: '20px', background: '#1e1e1e', color: '#00ff00', fontFamily: 'monospace' }}>
        <div>$ npm run dev</div>
        <div>Server started on http://localhost:3000</div>
      </div>
    ),
  },
  {
    id: 'git',
    label: 'Git',
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Git Panel</h3>
        <div>Modified files: 3</div>
        <div>Staged changes: 1</div>
      </div>
    ),
  },
];

// Tab Groups - Single tab group in right panel
export const WithTabGroup: Story = {
  args: {
    panels: extendedPanels,
    layout: {
      left: 'nav',
      middle: 'main',
      right: {
        type: 'tabs',
        panels: ['preview', 'terminal', 'git'],
        config: { defaultActiveTab: 0, tabPosition: 'top' }
      },
    },
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 50, right: 30 },
    theme: slateTheme,
  },
};

// Tab Groups - Multiple tab groups
export const MultipleTabGroups: Story = {
  args: {
    panels: extendedPanels,
    layout: {
      left: {
        type: 'tabs',
        panels: ['nav', 'tools'],
        config: { defaultActiveTab: 0, tabPosition: 'top' }
      },
      middle: 'main',
      right: {
        type: 'tabs',
        panels: ['preview', 'terminal', 'git'],
        config: { defaultActiveTab: 0, tabPosition: 'top' }
      },
    },
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 50, right: 30 },
    theme: slateTheme,
  },
};

// Tab Groups - Bottom positioned tabs
export const TabGroupBottomPosition: Story = {
  args: {
    panels: extendedPanels,
    layout: {
      left: 'nav',
      middle: 'main',
      right: {
        type: 'tabs',
        panels: ['preview', 'terminal', 'git'],
        config: { defaultActiveTab: 0, tabPosition: 'bottom' }
      },
    },
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 50, right: 30 },
    theme: slateTheme,
  },
};

// Two-Panel Layouts - Left + Right (skip middle)
export const TwoPanelLeftRight: Story = {
  args: {
    panels: samplePanels,
    layout: {
      left: 'nav',
      middle: null,
      right: 'main',
    },
    showCollapseButtons: true,
    defaultSizes: { left: 30, middle: 0, right: 70 },
    theme: slateTheme,
  },
};

// Two-Panel Layouts - Left + Middle (skip right)
export const TwoPanelLeftMiddle: Story = {
  args: {
    panels: samplePanels,
    layout: {
      left: 'nav',
      middle: 'main',
      right: null,
    },
    showCollapseButtons: true,
    defaultSizes: { left: 25, middle: 75, right: 0 },
    theme: slateTheme,
  },
};

// Two-Panel Layouts - Middle + Right (skip left)
export const TwoPanelMiddleRight: Story = {
  args: {
    panels: samplePanels,
    layout: {
      left: null,
      middle: 'main',
      right: 'sidebar',
    },
    showCollapseButtons: true,
    defaultSizes: { left: 0, middle: 70, right: 30 },
    theme: slateTheme,
  },
};

// Enhanced Two-Panel - What the API should look like after implementation
export const EnhancedTwoPanelAPI: Story = {
  name: 'Enhanced Two-Panel API (Future)',
  args: {
    panels: [
      {
        id: 'content',
        label: 'Content',
        content: (
          <div style={{ padding: '20px' }}>
            <h2>Content Panel</h2>
            <p>This demonstrates the simplified two-panel API.</p>
            <p>Notice we only need to define two panels and two size values.</p>
          </div>
        ),
      },
      {
        id: 'preview',
        label: 'Preview',
        content: (
          <div style={{ padding: '20px' }}>
            <h3>Preview Panel</h3>
            <div style={{ border: '2px dashed #ccc', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
              Preview Area
            </div>
          </div>
        ),
      },
    ],
    layout: {
      left: 'content',
      middle: null,
      right: 'preview',
    },
    showCollapseButtons: true,
    // Future API: should accept just { left: 60, right: 40 }
    defaultSizes: { left: 60, middle: 0, right: 40 },
    theme: slateTheme,
  },
};
