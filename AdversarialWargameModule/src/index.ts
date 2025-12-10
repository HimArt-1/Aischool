/**
 * SCAR-EYE Adversarial Wargame Module
 * Main Entry Point
 * 
 * This module provides an educational AI vs AI simulation
 * for demonstrating adversarial scenarios in a controlled environment.
 * 
 * ⚠️ EDUCATIONAL SIMULATION ONLY - NO REAL OPERATIONS ⚠️
 */

// Core Components
export { DigitalTwinMap } from './core/DigitalTwinMap';
export { SimulationEngine } from './core/SimulationEngine';

// AI Agents
export { RedAI } from './agents/RedAI';
export { BlueAI } from './agents/BlueAI';

// UI Components
export { WargameDashboard } from './ui/WargameDashboard';

// Types
export type {
  Position,
  Rectangle,
  Building,
  Road,
  HidingSpot,
  Camera,
  SpectralSignature,
  SpectralLayer,
  IlluminanceState,
  RedAIOutput,
  BlueAIOutput,
  RoundResult,
  SimulationConfig,
  SimulationStats,
  DashboardState,
  SimulationEvent,
  EventCallback
} from './utils/types';

// Utilities
export {
  randomInRange,
  randomInt,
  randomChoice,
  distance,
  clamp
} from './utils/mockData';

// ═══════════════════════════════════════════════════════════════
// Quick Start Function
// ═══════════════════════════════════════════════════════════════

import { SimulationEngine } from './core/SimulationEngine';
import { WargameDashboard } from './ui/WargameDashboard';
import { SimulationConfig } from './utils/types';

/**
 * Quick start function to initialize the wargame simulation
 * 
 * @param containerId - ID of the HTML container element
 * @param config - Optional simulation configuration
 * @returns Object with engine and dashboard instances
 * 
 * @example
 * ```typescript
 * const { engine, dashboard } = initWargame('my-container', {
 *   totalRounds: 100,
 *   adaptiveLightingEnabled: true
 * });
 * 
 * // Start the simulation
 * engine.start();
 * ```
 */
export function initWargame(
  containerId: string,
  config: Partial<SimulationConfig> = {}
): { engine: SimulationEngine; dashboard: WargameDashboard } {
  // Create simulation engine
  const engine = new SimulationEngine({
    totalRounds: 200,
    mapWidth: 800,
    mapHeight: 600,
    detectionThreshold: 0.5,
    adaptiveLightingEnabled: true,
    spectralAnalysisEnabled: true,
    ...config
  });
  
  // Create and initialize dashboard
  const dashboard = new WargameDashboard(engine, {
    containerId,
    showCameraRanges: true,
    showHidingSpots: false,
    showSpectralOverlay: false,
    animationSpeed: 1
  });
  
  dashboard.init();
  
  return { engine, dashboard };
}

// ═══════════════════════════════════════════════════════════════
// Module Information
// ═══════════════════════════════════════════════════════════════

export const MODULE_INFO = {
  name: 'AdversarialWargameModule',
  version: '1.0.0',
  description: 'SCAR-EYE Adversarial AI Wargaming Simulation',
  author: 'SCAR-EYE Team',
  license: 'Educational Use Only',
  
  components: [
    'DigitalTwinMap - Simulated neighborhood with buildings, roads, cameras',
    'RedAI - Adversarial agent attempting to hide virtual threats',
    'BlueAI - Defensive SCAR-EYE system detecting and predicting threats',
    'SimulationEngine - Manages rounds and statistics',
    'WargameDashboard - Interactive visualization interface'
  ],
  
  disclaimer: `
    This module is for EDUCATIONAL and DEMONSTRATION purposes only.
    It does not connect to any real data sources, APIs, or surveillance systems.
    All data is synthetically generated for simulation purposes.
    No real offensive or defensive capabilities are implemented.
  `
};

// ═══════════════════════════════════════════════════════════════
// Default Export
// ═══════════════════════════════════════════════════════════════

export default {
  DigitalTwinMap: DigitalTwinMap,
  SimulationEngine: SimulationEngine,
  RedAI: RedAI,
  BlueAI: BlueAI,
  WargameDashboard: WargameDashboard,
  initWargame,
  MODULE_INFO
};
