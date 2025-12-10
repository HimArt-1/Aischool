/**
 * SCAR-EYE Adversarial Wargame Module
 * Simulation Engine
 * 
 * Manages the adversarial simulation between Red-AI and Blue-AI
 * - Orchestrates rounds of attack/defense
 * - Logs all results for analysis
 * - Provides statistics and metrics
 * 
 * Educational simulation only - No real operations
 */

import {
  RoundResult,
  SimulationConfig,
  SimulationStats,
  SimulationEvent,
  EventCallback,
  RedAIOutput,
  BlueAIOutput
} from '../utils/types';

import { distance } from '../utils/mockData';
import { DigitalTwinMap } from './DigitalTwinMap';
import { RedAI } from '../agents/RedAI';
import { BlueAI } from '../agents/BlueAI';

// ═══════════════════════════════════════════════════════════════
// Default Configuration
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: SimulationConfig = {
  totalRounds: 200,
  mapWidth: 800,
  mapHeight: 600,
  detectionThreshold: 0.5,
  adaptiveLightingEnabled: true,
  spectralAnalysisEnabled: true
};

// ═══════════════════════════════════════════════════════════════
// Simulation Engine Class
// ═══════════════════════════════════════════════════════════════

export class SimulationEngine {
  private config: SimulationConfig;
  private map: DigitalTwinMap;
  private redAI: RedAI;
  private blueAI: BlueAI;
  
  // State
  private currentRound: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private roundLog: RoundResult[] = [];
  
  // Event system
  private eventListeners: EventCallback[] = [];
  
  // Timing
  private roundDelay: number = 100; // ms between rounds
  private animationFrameId: number | null = null;

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize components
    this.map = new DigitalTwinMap(this.config);
    this.redAI = new RedAI(this.map);
    this.blueAI = new BlueAI(this.map);
  }

  // ─────────────────────────────────────────────────────────────
  // Simulation Control
  // ─────────────────────────────────────────────────────────────

  /**
   * Start the simulation
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    
    await this.runSimulation();
  }

  /**
   * Pause the simulation
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume the simulation
   */
  async resume(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isPaused = false;
    await this.runSimulation();
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Reset the simulation
   */
  reset(): void {
    this.stop();
    this.currentRound = 0;
    this.roundLog = [];
    this.map.reset();
    this.redAI.reset();
    this.blueAI.reset();
  }

  /**
   * Run a single round manually
   */
  runSingleRound(): RoundResult | null {
    if (this.currentRound >= this.config.totalRounds) {
      return null;
    }
    
    return this.executeRound();
  }

  /**
   * Run multiple rounds at once
   */
  runRounds(count: number): RoundResult[] {
    const results: RoundResult[] = [];
    
    for (let i = 0; i < count && this.currentRound < this.config.totalRounds; i++) {
      const result = this.executeRound();
      results.push(result);
    }
    
    return results;
  }

  // ─────────────────────────────────────────────────────────────
  // Core Simulation Loop
  // ─────────────────────────────────────────────────────────────

  private async runSimulation(): Promise<void> {
    while (this.isRunning && !this.isPaused && this.currentRound < this.config.totalRounds) {
      const result = this.executeRound();
      
      // Delay between rounds for visualization
      if (this.roundDelay > 0) {
        await this.delay(this.roundDelay);
      }
    }
    
    // Check if simulation completed
    if (this.currentRound >= this.config.totalRounds) {
      this.isRunning = false;
      this.emitEvent({
        type: 'SIMULATION_COMPLETE',
        stats: this.getStats()
      });
    }
  }

  private executeRound(): RoundResult {
    this.currentRound++;
    
    // Emit round start event
    this.emitEvent({ type: 'ROUND_START', round: this.currentRound });
    
    // 1. Red-AI generates attack attempt
    const redAction = this.redAI.generateAttempt();
    this.emitEvent({ type: 'RED_MOVE', action: redAction });
    
    // 2. Blue-AI analyzes and responds
    const blueResponse = this.blueAI.analyze(redAction);
    this.emitEvent({ type: 'BLUE_ANALYZE', response: blueResponse });
    
    // 3. Calculate actual distance between prediction and hide location
    const actualDistance = distance(blueResponse.predictedLocation, redAction.hideLocation);
    
    // 4. Create round result
    const result: RoundResult = {
      roundNumber: this.currentRound,
      timestamp: Date.now(),
      redAction,
      blueResponse,
      actualDistance,
      detected: blueResponse.detected,
      confidence: blueResponse.confidence
    };
    
    // 5. Log result
    this.roundLog.push(result);
    
    // 6. Update AI learning
    this.redAI.recordResult(
      redAction.hideLocation,
      blueResponse.detected,
      redAction.strategy as any
    );
    this.blueAI.recordActualResult(
      blueResponse.predictedLocation,
      redAction.hideLocation
    );
    
    // 7. Emit round end event
    this.emitEvent({ type: 'ROUND_END', result });
    
    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // Statistics & Metrics
  // ─────────────────────────────────────────────────────────────

  /**
   * Get current simulation statistics
   */
  getStats(): SimulationStats {
    const completedRounds = this.roundLog.length;
    
    if (completedRounds === 0) {
      return {
        totalRounds: this.config.totalRounds,
        completedRounds: 0,
        detectionRate: 0,
        averageConfidence: 0,
        confidenceTrend: [],
        redWins: 0,
        blueWins: 0
      };
    }
    
    const detections = this.roundLog.filter(r => r.detected).length;
    const totalConfidence = this.roundLog.reduce((sum, r) => sum + r.confidence, 0);
    
    // Calculate confidence trend (moving average)
    const windowSize = 10;
    const confidenceTrend: number[] = [];
    
    for (let i = 0; i < this.roundLog.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = this.roundLog.slice(start, i + 1);
      const avgConfidence = window.reduce((s, r) => s + r.confidence, 0) / window.length;
      confidenceTrend.push(avgConfidence);
    }
    
    return {
      totalRounds: this.config.totalRounds,
      completedRounds,
      detectionRate: detections / completedRounds,
      averageConfidence: totalConfidence / completedRounds,
      confidenceTrend,
      redWins: completedRounds - detections,
      blueWins: detections
    };
  }

  /**
   * Get round log
   */
  getRoundLog(): RoundResult[] {
    return [...this.roundLog];
  }

  /**
   * Get specific round result
   */
  getRound(roundNumber: number): RoundResult | undefined {
    return this.roundLog.find(r => r.roundNumber === roundNumber);
  }

  /**
   * Get recent rounds
   */
  getRecentRounds(count: number): RoundResult[] {
    return this.roundLog.slice(-count);
  }

  /**
   * Get detection rate trend
   */
  getDetectionRateTrend(windowSize: number = 20): number[] {
    const trend: number[] = [];
    
    for (let i = 0; i < this.roundLog.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = this.roundLog.slice(start, i + 1);
      const detections = window.filter(r => r.detected).length;
      trend.push(detections / window.length);
    }
    
    return trend;
  }

  /**
   * Get average prediction error trend
   */
  getPredictionErrorTrend(windowSize: number = 20): number[] {
    const trend: number[] = [];
    
    for (let i = 0; i < this.roundLog.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = this.roundLog.slice(start, i + 1);
      const avgError = window.reduce((s, r) => s + r.actualDistance, 0) / window.length;
      trend.push(avgError);
    }
    
    return trend;
  }

  // ─────────────────────────────────────────────────────────────
  // Strategy Analytics
  // ─────────────────────────────────────────────────────────────

  /**
   * Get Red-AI strategy performance
   */
  getRedStrategyAnalysis(): Record<string, { attempts: number; successes: number; rate: number }> {
    const analysis: Record<string, { attempts: number; successes: number; rate: number }> = {};
    
    this.roundLog.forEach(round => {
      const strategy = round.redAction.strategy;
      
      if (!analysis[strategy]) {
        analysis[strategy] = { attempts: 0, successes: 0, rate: 0 };
      }
      
      analysis[strategy].attempts++;
      if (!round.detected) {
        analysis[strategy].successes++;
      }
    });
    
    // Calculate rates
    Object.keys(analysis).forEach(strategy => {
      const data = analysis[strategy];
      data.rate = data.attempts > 0 ? data.successes / data.attempts : 0;
    });
    
    return analysis;
  }

  /**
   * Get Blue-AI performance over time
   */
  getBluePerformancePhases(): Array<{
    phase: string;
    startRound: number;
    endRound: number;
    detectionRate: number;
    avgConfidence: number;
  }> {
    const phases: Array<{
      phase: string;
      startRound: number;
      endRound: number;
      detectionRate: number;
      avgConfidence: number;
    }> = [];
    
    const phaseSize = Math.ceil(this.roundLog.length / 4);
    
    for (let i = 0; i < 4; i++) {
      const start = i * phaseSize;
      const end = Math.min((i + 1) * phaseSize, this.roundLog.length);
      const phaseRounds = this.roundLog.slice(start, end);
      
      if (phaseRounds.length === 0) continue;
      
      const detections = phaseRounds.filter(r => r.detected).length;
      const avgConf = phaseRounds.reduce((s, r) => s + r.confidence, 0) / phaseRounds.length;
      
      phases.push({
        phase: ['Early', 'Mid-Early', 'Mid-Late', 'Late'][i],
        startRound: start + 1,
        endRound: end,
        detectionRate: detections / phaseRounds.length,
        avgConfidence: avgConf
      });
    }
    
    return phases;
  }

  // ─────────────────────────────────────────────────────────────
  // Event System
  // ─────────────────────────────────────────────────────────────

  /**
   * Subscribe to simulation events
   */
  on(callback: EventCallback): () => void {
    this.eventListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  private emitEvent(event: SimulationEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('Event listener error:', e);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Configuration
  // ─────────────────────────────────────────────────────────────

  /**
   * Set round delay (ms between rounds)
   */
  setRoundDelay(delay: number): void {
    this.roundDelay = Math.max(0, delay);
  }

  /**
   * Get round delay
   */
  getRoundDelay(): number {
    return this.roundDelay;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): SimulationConfig {
    return { ...this.config };
  }

  // ─────────────────────────────────────────────────────────────
  // State Getters
  // ─────────────────────────────────────────────────────────────

  /**
   * Get current round number
   */
  getCurrentRound(): number {
    return this.currentRound;
  }

  /**
   * Check if simulation is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Check if simulation is paused
   */
  getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Check if simulation is complete
   */
  getIsComplete(): boolean {
    return this.currentRound >= this.config.totalRounds;
  }

  /**
   * Get the digital twin map
   */
  getMap(): DigitalTwinMap {
    return this.map;
  }

  /**
   * Get Red-AI agent
   */
  getRedAI(): RedAI {
    return this.redAI;
  }

  /**
   * Get Blue-AI agent
   */
  getBlueAI(): BlueAI {
    return this.blueAI;
  }

  // ─────────────────────────────────────────────────────────────
  // Export / Serialization
  // ─────────────────────────────────────────────────────────────

  /**
   * Export simulation data to JSON
   */
  exportData(): object {
    return {
      config: this.config,
      stats: this.getStats(),
      roundLog: this.roundLog,
      redStrategyAnalysis: this.getRedStrategyAnalysis(),
      bluePerformancePhases: this.getBluePerformancePhases(),
      mapState: this.map.getState()
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default SimulationEngine;
