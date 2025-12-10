/**
 * SCAR-EYE Adversarial Wargame Module
 * Type Definitions
 * 
 * Educational simulation only - No real operations
 */

// ═══════════════════════════════════════════════════════════════
// Position & Geometry Types
// ═══════════════════════════════════════════════════════════════

export interface Position {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ═══════════════════════════════════════════════════════════════
// Map Element Types
// ═══════════════════════════════════════════════════════════════

export interface Building extends Rectangle {
  id: string;
  type: 'residential' | 'commercial' | 'industrial' | 'government';
  height: number; // floors
  shadowCoverage: number; // 0-1
}

export interface Road {
  id: string;
  points: Position[];
  width: number;
  type: 'main' | 'secondary' | 'alley';
}

export interface HidingSpot {
  id: string;
  position: Position;
  concealmentLevel: number; // 0-1 how well hidden
  spectralDifficulty: number; // 0-1 how hard to detect spectrally
  nearestCameraDistance: number;
  isInShadow: boolean;
}

export interface Camera {
  id: string;
  position: Position;
  fieldOfView: number; // degrees
  direction: number; // angle in degrees
  range: number;
  spectralCapability: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Spectral Analysis Types
// ═══════════════════════════════════════════════════════════════

export interface SpectralSignature {
  visible: number;      // 400-700nm
  nearInfrared: number; // 700-1000nm
  shortwave: number;    // 1000-2500nm
  thermal: number;      // 8000-14000nm
}

export interface SpectralLayer {
  id: string;
  name: string;
  wavelengthRange: [number, number];
  intensityMap: number[][]; // 2D grid of intensity values
}

export interface IlluminanceState {
  ambient: number;      // 0-1
  artificial: number;   // 0-1
  adaptive: boolean;
  zones: Map<string, number>;
}

// ═══════════════════════════════════════════════════════════════
// AI Agent Types
// ═══════════════════════════════════════════════════════════════

export interface RedAIOutput {
  hideLocation: Position;
  camouflageProfile: SpectralSignature;
  path: Position[];
  strategy: string;
  exploitedWeaknesses: string[];
}

export interface BlueAIOutput {
  detected: boolean;
  confidence: number;
  predictedLocation: Position;
  reasoning: string;
  illuminanceAdjustments: Map<string, number>;
  spectralAnomalies: Position[];
}

// ═══════════════════════════════════════════════════════════════
// Simulation Types
// ═══════════════════════════════════════════════════════════════

export interface RoundResult {
  roundNumber: number;
  timestamp: number;
  redAction: RedAIOutput;
  blueResponse: BlueAIOutput;
  actualDistance: number;
  detected: boolean;
  confidence: number;
}

export interface SimulationConfig {
  totalRounds: number;
  mapWidth: number;
  mapHeight: number;
  detectionThreshold: number;
  adaptiveLightingEnabled: boolean;
  spectralAnalysisEnabled: boolean;
}

export interface SimulationStats {
  totalRounds: number;
  completedRounds: number;
  detectionRate: number;
  averageConfidence: number;
  confidenceTrend: number[];
  redWins: number;
  blueWins: number;
}

// ═══════════════════════════════════════════════════════════════
// Dashboard Types
// ═══════════════════════════════════════════════════════════════

export interface DashboardState {
  currentRound: number;
  isRunning: boolean;
  speed: number;
  stats: SimulationStats;
  selectedRound: number | null;
  showSpectralOverlay: boolean;
  showHeatmap: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Event Types
// ═══════════════════════════════════════════════════════════════

export type SimulationEvent = 
  | { type: 'ROUND_START'; round: number }
  | { type: 'RED_MOVE'; action: RedAIOutput }
  | { type: 'BLUE_ANALYZE'; response: BlueAIOutput }
  | { type: 'ROUND_END'; result: RoundResult }
  | { type: 'SIMULATION_COMPLETE'; stats: SimulationStats };

export type EventCallback = (event: SimulationEvent) => void;
