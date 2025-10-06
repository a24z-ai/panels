import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { ThemeProvider, terminalTheme } from '@a24z/industry-theme';
import { PanelConfigurator, PanelLayout, PanelDefinition } from './PanelConfigurator';
import { ConfigurablePanelLayout, PanelDefinitionWithContent } from './ConfigurablePanelLayout';

const meta = {
  title: 'Examples/Tab Groups Demo',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Panel definitions with content
const demopanels: PanelDefinitionWithContent[] = [
  {
    id: 'nav',
    label: 'Navigation',
    icon: '📁',
    preview: <div style={{ fontSize: '0.7rem' }}>📁 Nav Menu</div>,
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
    icon: '📄',
    preview: <div style={{ fontSize: '0.7rem' }}>📄 Content</div>,
    content: (
      <div style={{ padding: '20px' }}>
        <h2>Main Content Area</h2>
        <p>This is the main content panel.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    ),
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: '🔧',
    preview: <div style={{ fontSize: '0.7rem' }}>🔧 Tools</div>,
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Tools Panel</h3>
        <button style={{ margin: '5px', padding: '8px 16px' }}>Tool 1</button>
        <button style={{ margin: '5px', padding: '8px 16px' }}>Tool 2</button>
      </div>
    ),
  },
  {
    id: 'console',
    label: 'Console',
    icon: '💻',
    preview: <div style={{ fontSize: '0.7rem' }}>💻 Console</div>,
    content: (
      <div style={{ padding: '20px', background: '#1e1e1e', color: '#00ff00', fontFamily: 'monospace', height: '100%' }}>
        <div>Console output:</div>
        <div>$ npm run dev</div>
        <div>Server started successfully</div>
      </div>
    ),
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: '⌨️',
    preview: <div style={{ fontSize: '0.7rem' }}>⌨️ Terminal</div>,
    content: (
      <div style={{ padding: '20px', background: '#000', color: '#0f0', fontFamily: 'monospace', height: '100%' }}>
        <div>user@host:~$ </div>
      </div>
    ),
  },
  {
    id: 'output',
    label: 'Output',
    icon: '📋',
    preview: <div style={{ fontSize: '0.7rem' }}>📋 Output</div>,
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Output Panel</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          Build completed successfully
        </pre>
      </div>
    ),
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: '👁️',
    preview: <div style={{ fontSize: '0.7rem' }}>👁️ Preview</div>,
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Preview Panel</h3>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '4px', background: 'white' }}>
          Preview content renders here...
        </div>
      </div>
    ),
  },
];

// Panel definitions without content (for configurator only)
const demoPanelDefs: PanelDefinition[] = demopanels.map(({ id, label, preview, icon }) => ({
  id,
  label,
  preview,
  icon,
}));

// Complete interactive example
const CompleteTabGroupDemo = () => {
  const [layout, setLayout] = useState<PanelLayout>({
    left: 'nav',
    middle: 'main',
    right: {
      type: 'tabs',
      panels: ['console', 'terminal', 'output'],
      config: { defaultActiveTab: 0, tabPosition: 'top', centered: true }
    },
  });
  const [showConfigurator, setShowConfigurator] = useState(false);

  return (
    <ThemeProvider theme={terminalTheme}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '1rem',
          background: '#2a2a2a',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0 }}>Tab Groups Demo - Live Example</h2>
          <button
            onClick={() => setShowConfigurator(!showConfigurator)}
            style={{
              padding: '8px 16px',
              background: '#00ff00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {showConfigurator ? 'Hide' : 'Show'} Configurator
          </button>
        </div>

        {/* Configurator Panel */}
        {showConfigurator && (
          <div style={{
            padding: '1rem',
            background: '#f5f5f5',
            borderBottom: '1px solid #ddd',
          }}>
            <PanelConfigurator
              availablePanels={demoPanelDefs}
              currentLayout={layout}
              onChange={setLayout}
            />
          </div>
        )}

        {/* Layout Preview */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ConfigurablePanelLayout
            panels={demopanels}
            layout={layout}
            showCollapseButtons={true}
            defaultSizes={{ left: 20, middle: 50, right: 30 }}
            theme={terminalTheme}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export const InteractiveDemo: Story = {
  render: () => <CompleteTabGroupDemo />,
};

// Pre-configured tab group examples
export const IDELayout: Story = {
  render: () => (
    <ThemeProvider theme={terminalTheme}>
      <div style={{ height: '100vh' }}>
        <ConfigurablePanelLayout
          panels={demopanels}
          layout={{
            left: {
              type: 'tabs',
              panels: ['nav', 'tools'],
              config: { defaultActiveTab: 0, tabPosition: 'top', centered: false }
            },
            middle: 'main',
            right: {
              type: 'tabs',
              panels: ['preview', 'console', 'terminal', 'output'],
              config: { defaultActiveTab: 0, tabPosition: 'top', centered: true }
            },
          }}
          showCollapseButtons={true}
          defaultSizes={{ left: 20, middle: 50, right: 30 }}
          theme={terminalTheme}
        />
      </div>
    </ThemeProvider>
  ),
};
