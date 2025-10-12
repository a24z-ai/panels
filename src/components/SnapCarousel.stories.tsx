import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { SnapCarousel, SnapCarouselRef } from './SnapCarousel';
import { terminalTheme, ThemeProvider } from '@a24z/industry-theme';

const meta = {
  title: 'Components/SnapCarousel',
  component: SnapCarousel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    minPanelWidth: {
      control: { type: 'number', min: 200, max: 800, step: 50 },
    },
    idealPanelWidth: {
      control: { type: 'number', min: 0.2, max: 0.8, step: 0.05 },
    },
    gap: {
      control: { type: 'number', min: 0, max: 48, step: 4 },
    },
  },
} satisfies Meta<typeof SnapCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample panel content
const createSamplePanel = (index: number, color: string) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${color}22, ${color}44)`,
      padding: '2rem',
      gap: '1rem',
    }}
  >
    <h2 style={{ margin: 0, fontSize: '2rem' }}>Panel {index + 1}</h2>
    <p style={{ margin: 0, textAlign: 'center', opacity: 0.8 }}>
      This is panel {index + 1}. Scroll horizontally to see more panels.
    </p>
    <div style={{ fontSize: '4rem', opacity: 0.5 }}>{index + 1}</div>
  </div>
);

export const Default: Story = {
  args: {
    theme: terminalTheme,
    panels: [
      createSamplePanel(0, '#3b82f6'),
      createSamplePanel(1, '#8b5cf6'),
      createSamplePanel(2, '#ec4899'),
      createSamplePanel(3, '#f59e0b'),
      createSamplePanel(4, '#10b981'),
      createSamplePanel(5, '#06b6d4'),
    ],
    minPanelWidth: 500,
    idealPanelWidth: 0.333,
    gap: 16,
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={terminalTheme}>
        <div style={{ height: '600px', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export const ManyPanels: Story = {
  args: {
    theme: terminalTheme,
    panels: Array.from({ length: 20 }, (_, i) => {
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
      return createSamplePanel(i, colors[i % colors.length]);
    }),
    minPanelWidth: 500,
    idealPanelWidth: 0.333,
    gap: 16,
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={terminalTheme}>
        <div style={{ height: '600px', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export const LargerPanels: Story = {
  args: {
    theme: terminalTheme,
    panels: [
      createSamplePanel(0, '#3b82f6'),
      createSamplePanel(1, '#8b5cf6'),
      createSamplePanel(2, '#ec4899'),
      createSamplePanel(3, '#f59e0b'),
    ],
    minPanelWidth: 700,
    idealPanelWidth: 0.5,
    gap: 24,
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={terminalTheme}>
        <div style={{ height: '600px', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export const NarrowGap: Story = {
  args: {
    theme: terminalTheme,
    panels: [
      createSamplePanel(0, '#3b82f6'),
      createSamplePanel(1, '#8b5cf6'),
      createSamplePanel(2, '#ec4899'),
      createSamplePanel(3, '#f59e0b'),
      createSamplePanel(4, '#10b981'),
    ],
    minPanelWidth: 500,
    idealPanelWidth: 0.333,
    gap: 4,
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={terminalTheme}>
        <div style={{ height: '600px', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export const WithCallbacks: Story = {
  args: {
    theme: terminalTheme,
    panels: [
      createSamplePanel(0, '#3b82f6'),
      createSamplePanel(1, '#8b5cf6'),
      createSamplePanel(2, '#ec4899'),
      createSamplePanel(3, '#f59e0b'),
      createSamplePanel(4, '#10b981'),
    ],
    minPanelWidth: 500,
    idealPanelWidth: 0.333,
    gap: 16,
    onPanelChange: (index: number) => {
      console.log('Current panel:', index);
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={terminalTheme}>
        <div style={{ height: '600px', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export const CustomContent: Story = {
  args: {
    theme: terminalTheme,
    panels: [
      <div key="card-1" style={{ padding: '2rem', height: '100%', overflow: 'auto' }}>
        <h3>Product Card</h3>
        <img
          src="https://via.placeholder.com/400x300"
          alt="Product"
          style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}
        />
        <h4>Amazing Product</h4>
        <p>This is a detailed description of the product with all its features and benefits.</p>
        <button style={{ padding: '0.5rem 1rem', borderRadius: '4px' }}>Add to Cart</button>
      </div>,
      <div key="card-2" style={{ padding: '2rem', height: '100%', overflow: 'auto' }}>
        <h3>Statistics Dashboard</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,234</div>
            <div>Total Users</div>
          </div>
          <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>$45,678</div>
            <div>Revenue</div>
          </div>
          <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>89%</div>
            <div>Satisfaction</div>
          </div>
        </div>
      </div>,
      <div key="card-3" style={{ padding: '2rem', height: '100%', overflow: 'auto' }}>
        <h3>Article Preview</h3>
        <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Published on Jan 15, 2025</p>
        <h4>The Future of Web Development</h4>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris.
        </p>
        <a href="#" style={{ color: '#3b82f6' }}>
          Read more →
        </a>
      </div>,
    ],
    minPanelWidth: 500,
    idealPanelWidth: 0.333,
    gap: 16,
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={terminalTheme}>
        <div style={{ height: '600px', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

const WithNavigationButtonsComponent = (args: SnapCarouselProps) => {
  const carouselRef = useRef<SnapCarouselRef>(null);
  const [currentPanel, setCurrentPanel] = useState(0);

  const panels = [
    createSamplePanel(0, '#3b82f6'),
    createSamplePanel(1, '#8b5cf6'),
    createSamplePanel(2, '#ec4899'),
    createSamplePanel(3, '#f59e0b'),
    createSamplePanel(4, '#10b981'),
    createSamplePanel(5, '#06b6d4'),
  ];

  const handleNavigate = (index: number) => {
    carouselRef.current?.scrollToPanel(index);
  };

  const handlePrevious = () => {
    const current = carouselRef.current?.getCurrentPanel() ?? 0;
    if (current > 0) {
      carouselRef.current?.scrollToPanel(current - 1);
    }
  };

  const handleNext = () => {
    const current = carouselRef.current?.getCurrentPanel() ?? 0;
    if (current < panels.length - 1) {
      carouselRef.current?.scrollToPanel(current + 1);
    }
  };

  return (
    <ThemeProvider theme={terminalTheme}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation Controls */}
        <div
          style={{
            padding: '1rem',
            background: '#f5f5f5',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrevious}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Next →
            </button>
          </div>

          <div style={{ height: '24px', width: '1px', background: '#ddd' }} />

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {panels.map((_, index) => (
              <button
                key={index}
                onClick={() => handleNavigate(index)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: currentPanel === index ? '#8b5cf6' : '#e5e7eb',
                  color: currentPanel === index ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: currentPanel === index ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', color: '#666', fontSize: '0.875rem' }}>
            Panel {currentPanel + 1} of {panels.length}
          </div>
        </div>

        {/* Carousel */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <SnapCarousel
            ref={carouselRef}
            {...args}
            panels={panels}
            onPanelChange={setCurrentPanel}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export const WithNavigationButtons: Story = {
  render: WithNavigationButtonsComponent,
  args: {
    theme: terminalTheme,
    minPanelWidth: 500,
    idealPanelWidth: 0.333,
    gap: 1,
  },
};
