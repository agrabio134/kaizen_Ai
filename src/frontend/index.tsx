import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import './index.css';
import React from 'react';
import type { UUID } from '@elizaos/core';
import { ElizaChat } from '@elizaos/ui'; // Import the ElizaOS chat component for rendering the agent interface
const queryClient = new QueryClient();

// Hardcoded agent configuration to ensure only the specific Kaizen agent is shown
// This bypasses server-injected config for static/iframe embedding, preventing fallback to defaults or other agents
const HARDCODED_AGENT_ID: UUID = '841c4f8c-9d23-4dd3-b84f-82d5d0dc78fa' as UUID;
const API_BASE = process.env.REACT_APP_ELIZA_API_BASE || 'https://api.elizaos.com'; // Fallback API base; set via env for production

// Optional: Declare global window extension if server injection is still needed as fallback
declare global {
  interface Window {
    ELIZA_CONFIG?: {
      agentId: string;
      apiBase?: string;
    };
  }
}

/**
 * Main Example route component
 * Updated to prioritize hardcoded agent ID for isolation—only Kaizen will render.
 * Falls back to window config only if hardcoded fails (e.g., dev mode).
 */
function ExampleRoute() {
  // Use hardcoded agent for isolation; fallback to window config if needed
  const config = window.ELIZA_CONFIG;
  const agentId = HARDCODED_AGENT_ID || (config?.agentId as UUID);
  const apiBase = config?.apiBase || API_BASE;

  // Apply dark mode to the root element for consistent theming
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (!agentId) {
    return (
      <div className="p-4 text-center bg-black text-green-400 min-h-screen flex items-center justify-center">
        <div className="text-red-600 font-medium mb-2">Error: Agent ID not configured</div>
        <div className="text-sm text-gray-400">
          Expected Kaizen agent (ID: {HARDCODED_AGENT_ID}). Check env vars or server injection.
        </div>
      </div>
    );
  }

  return (
    <ElizaChatProvider agentId={agentId} apiBase={apiBase}>
      <ElizaChat agentId={agentId} apiBase={apiBase} />
    </ElizaChatProvider>
  );
}

/**
 * ElizaChat provider wrapper for QueryClient and any shared state
 * Ensures the chat renders only for the specified agent.
 */
function ElizaChatProvider({ agentId, apiBase, children }: { agentId: UUID; apiBase: string; children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-full w-full flex flex-col bg-black text-green-400">
        {children}
      </div>
    </QueryClientProvider>
  );
}

// Initialize the application - no router needed for iframe embedding
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<ExampleRoute />);
}

// Define types for integration with agent UI system (unchanged, but isolated to this agent)
export interface AgentPanel {
  name: string;
  path: string;
  component: React.ComponentType<any>;
  icon?: string;
  public?: boolean;
  shortLabel?: string; // Optional short label for mobile
}

interface PanelProps {
  agentId: string;
}

/**
 * Kaizen-specific panel component for the plugin system
 * Renders only for the hardcoded agent ID.
 */
const PanelComponent: React.FC<PanelProps> = ({ agentId }) => {
  if (agentId !== HARDCODED_AGENT_ID) {
    return (
      <div className="p-4 text-center text-red-600">
        Access restricted: Only Kaizen agent ({HARDCODED_AGENT_ID}) allowed.
      </div>
    );
  }
  return (
    <div className="p-4 bg-black text-green-400">
      Kaizen Panel Active: Vibes > Noise. CA: 3ejk8LXAS9kUC7XhpDGHRjARyUy5qU7PaAq7PMykpump
    </div>
  );
};

// Export the panel configuration—limited to Kaizen-only access
export const panels: AgentPanel[] = [
  {
    name: 'Kaizen Dashboard',
    path: 'kaizen',
    component: PanelComponent,
    icon: 'Sparkles', // Use a meme/hype icon
    public: false,
    shortLabel: 'Kaizen',
  },
];

export * from './utils';