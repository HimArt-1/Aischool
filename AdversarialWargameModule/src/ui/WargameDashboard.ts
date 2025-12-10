/**
 * SCAR-EYE Adversarial Wargame Module
 * Wargame Dashboard UI
 * 
 * Interactive visualization dashboard for the simulation:
 * - Digital Twin Map rendering
 * - Red-AI path visualization
 * - Blue-AI prediction display
 * - Real-time statistics
 * - Confidence trend charts
 * 
 * Educational simulation only - No real surveillance
 */

import {
  Position,
  RoundResult,
  SimulationStats,
  Building,
  Road,
  Camera,
  HidingSpot,
  SimulationEvent
} from '../utils/types';

import { SimulationEngine } from '../core/SimulationEngine';
import { clamp } from '../utils/mockData';

// ═══════════════════════════════════════════════════════════════
// Dashboard Configuration
// ═══════════════════════════════════════════════════════════════

interface DashboardConfig {
  containerId: string;
  width: number;
  height: number;
  showSpectralOverlay: boolean;
  showCameraRanges: boolean;
  showHidingSpots: boolean;
  animationSpeed: number;
}

const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  containerId: 'wargame-dashboard',
  width: 1200,
  height: 800,
  showSpectralOverlay: false,
  showCameraRanges: true,
  showHidingSpots: false,
  animationSpeed: 1
};

// ═══════════════════════════════════════════════════════════════
// CSS Styles (Scoped to Dashboard)
// ═══════════════════════════════════════════════════════════════

const DASHBOARD_STYLES = `
.wargame-dashboard {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f23 100%);
  border-radius: 12px;
  padding: 20px;
  color: #e0e0e0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.wargame-dashboard * {
  box-sizing: border-box;
}

.wargame-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #333;
}

.wargame-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(90deg, #00d4ff, #7b2cbf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.wargame-subtitle {
  font-size: 14px;
  color: #888;
  margin-top: 5px;
}

.wargame-controls {
  display: flex;
  gap: 10px;
}

.wargame-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.wargame-btn-primary {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  color: #fff;
}

.wargame-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
}

.wargame-btn-danger {
  background: linear-gradient(135deg, #ff4757, #c23616);
  color: #fff;
}

.wargame-btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 71, 87, 0.4);
}

.wargame-btn-secondary {
  background: #333;
  color: #fff;
  border: 1px solid #555;
}

.wargame-btn-secondary:hover {
  background: #444;
}

.wargame-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.wargame-main {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
}

.wargame-map-container {
  background: #111;
  border-radius: 10px;
  padding: 15px;
  position: relative;
  overflow: hidden;
}

.wargame-map-canvas {
  border-radius: 8px;
  display: block;
}

.wargame-sidebar {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.wargame-panel {
  background: rgba(30, 30, 50, 0.8);
  border-radius: 10px;
  padding: 15px;
  border: 1px solid #333;
}

.wargame-panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #00d4ff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wargame-panel-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #00d4ff;
  border-radius: 2px;
}

.wargame-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.wargame-stat {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.wargame-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.wargame-stat-label {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
}

.wargame-stat-blue .wargame-stat-value {
  color: #00d4ff;
}

.wargame-stat-red .wargame-stat-value {
  color: #ff4757;
}

.wargame-stat-gold .wargame-stat-value {
  color: #ffd700;
}

.wargame-progress {
  margin-top: 10px;
}

.wargame-progress-bar {
  height: 8px;
  background: #222;
  border-radius: 4px;
  overflow: hidden;
}

.wargame-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #7b2cbf);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.wargame-progress-text {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
}

.wargame-chart-container {
  height: 120px;
  position: relative;
}

.wargame-chart-canvas {
  width: 100%;
  height: 100%;
}

.wargame-log {
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.6;
}

.wargame-log::-webkit-scrollbar {
  width: 6px;
}

.wargame-log::-webkit-scrollbar-track {
  background: #111;
  border-radius: 3px;
}

.wargame-log::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.wargame-log-entry {
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.wargame-log-entry-detected {
  background: rgba(0, 212, 255, 0.15);
  border-left: 3px solid #00d4ff;
}

.wargame-log-entry-missed {
  background: rgba(255, 71, 87, 0.15);
  border-left: 3px solid #ff4757;
}

.wargame-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.wargame-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.wargame-legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.wargame-speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.wargame-speed-label {
  font-size: 12px;
  color: #888;
}

.wargame-speed-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 6px;
  background: #333;
  border-radius: 3px;
  outline: none;
}

.wargame-speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #00d4ff;
  border-radius: 50%;
  cursor: pointer;
}

.wargame-toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.wargame-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.wargame-toggle input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.wargame-current-round {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(123, 44, 191, 0.2));
  border: 1px solid #00d4ff;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
}

.wargame-round-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 12px;
}

.wargame-round-info div {
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.wargame-round-label {
  color: #888;
  margin-bottom: 3px;
}

.wargame-round-value {
  color: #fff;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.wargame-running-indicator {
  animation: pulse 1s infinite;
  color: #00d4ff;
}
`;

// ═══════════════════════════════════════════════════════════════
// Wargame Dashboard Class
// ═══════════════════════════════════════════════════════════════

export class WargameDashboard {
  private config: DashboardConfig;
  private engine: SimulationEngine;
  private container: HTMLElement | null = null;
  
  // Canvas elements
  private mapCanvas: HTMLCanvasElement | null = null;
  private mapCtx: CanvasRenderingContext2D | null = null;
  private chartCanvas: HTMLCanvasElement | null = null;
  private chartCtx: CanvasRenderingContext2D | null = null;
  
  // UI elements
  private elements: Record<string, HTMLElement> = {};
  
  // State
  private currentRoundResult: RoundResult | null = null;
  private animationFrame: number | null = null;
  private pathAnimationProgress: number = 0;
  
  // Unsubscribe function
  private unsubscribe: (() => void) | null = null;

  constructor(engine: SimulationEngine, config: Partial<DashboardConfig> = {}) {
    this.engine = engine;
    this.config = { ...DEFAULT_DASHBOARD_CONFIG, ...config };
  }

  // ─────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────

  /**
   * Initialize and render the dashboard
   */
  init(): void {
    // Inject styles
    this.injectStyles();
    
    // Get container
    this.container = document.getElementById(this.config.containerId);
    if (!this.container) {
      console.error(`Container #${this.config.containerId} not found`);
      return;
    }
    
    // Render HTML
    this.container.innerHTML = this.generateHTML();
    
    // Setup canvas contexts
    this.setupCanvases();
    
    // Cache element references
    this.cacheElements();
    
    // Bind events
    this.bindEvents();
    
    // Subscribe to engine events
    this.subscribeToEngine();
    
    // Initial render
    this.renderMap();
    this.updateStats();
  }

  /**
   * Cleanup and destroy dashboard
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HTML Generation
  // ─────────────────────────────────────────────────────────────

  private generateHTML(): string {
    const map = this.engine.getMap();
    
    return `
      <div class="wargame-dashboard">
        <header class="wargame-header">
          <div>
            <h1 class="wargame-title">🎯 SCAR-EYE Adversarial Wargame</h1>
            <p class="wargame-subtitle">AI vs AI Simulation • Educational Demo</p>
          </div>
          <div class="wargame-controls">
            <button id="btn-start" class="wargame-btn wargame-btn-primary">▶ Start</button>
            <button id="btn-pause" class="wargame-btn wargame-btn-secondary" disabled>⏸ Pause</button>
            <button id="btn-step" class="wargame-btn wargame-btn-secondary">⏭ Step</button>
            <button id="btn-reset" class="wargame-btn wargame-btn-danger">↺ Reset</button>
          </div>
        </header>
        
        <div class="wargame-main">
          <div class="wargame-map-container">
            <canvas 
              id="map-canvas" 
              class="wargame-map-canvas" 
              width="${map.width}" 
              height="${map.height}">
            </canvas>
            <div class="wargame-legend">
              <div class="wargame-legend-item">
                <div class="wargame-legend-color" style="background: #444;"></div>
                <span>Buildings</span>
              </div>
              <div class="wargame-legend-item">
                <div class="wargame-legend-color" style="background: #ff4757;"></div>
                <span>Red-AI Path</span>
              </div>
              <div class="wargame-legend-item">
                <div class="wargame-legend-color" style="background: #ff4757; border: 2px solid #fff;"></div>
                <span>Hide Location</span>
              </div>
              <div class="wargame-legend-item">
                <div class="wargame-legend-color" style="background: #00d4ff;"></div>
                <span>Blue-AI Prediction</span>
              </div>
              <div class="wargame-legend-item">
                <div class="wargame-legend-color" style="background: rgba(0, 212, 255, 0.3);"></div>
                <span>Camera Range</span>
              </div>
            </div>
          </div>
          
          <div class="wargame-sidebar">
            <div class="wargame-panel">
              <div class="wargame-panel-title">Simulation Progress</div>
              <div class="wargame-stats-grid">
                <div class="wargame-stat">
                  <div class="wargame-stat-value" id="stat-round">0</div>
                  <div class="wargame-stat-label">Current Round</div>
                </div>
                <div class="wargame-stat wargame-stat-gold">
                  <div class="wargame-stat-value" id="stat-total">${this.engine.getConfig().totalRounds}</div>
                  <div class="wargame-stat-label">Total Rounds</div>
                </div>
              </div>
              <div class="wargame-progress">
                <div class="wargame-progress-bar">
                  <div class="wargame-progress-fill" id="progress-fill" style="width: 0%"></div>
                </div>
                <div class="wargame-progress-text">
                  <span id="progress-percent">0%</span>
                  <span id="status-text">Ready</span>
                </div>
              </div>
            </div>
            
            <div class="wargame-panel">
              <div class="wargame-panel-title">Battle Statistics</div>
              <div class="wargame-stats-grid">
                <div class="wargame-stat wargame-stat-blue">
                  <div class="wargame-stat-value" id="stat-blue-wins">0</div>
                  <div class="wargame-stat-label">SCAR-EYE Detections</div>
                </div>
                <div class="wargame-stat wargame-stat-red">
                  <div class="wargame-stat-value" id="stat-red-wins">0</div>
                  <div class="wargame-stat-label">Red-AI Evasions</div>
                </div>
                <div class="wargame-stat">
                  <div class="wargame-stat-value" id="stat-detection-rate">0%</div>
                  <div class="wargame-stat-label">Detection Rate</div>
                </div>
                <div class="wargame-stat">
                  <div class="wargame-stat-value" id="stat-confidence">0%</div>
                  <div class="wargame-stat-label">Avg Confidence</div>
                </div>
              </div>
            </div>
            
            <div class="wargame-panel">
              <div class="wargame-panel-title">Confidence Trend</div>
              <div class="wargame-chart-container">
                <canvas id="chart-canvas" class="wargame-chart-canvas"></canvas>
              </div>
            </div>
            
            <div class="wargame-panel wargame-current-round" id="current-round-panel" style="display: none;">
              <div class="wargame-panel-title">Current Round</div>
              <div class="wargame-round-info" id="round-info">
                <!-- Populated dynamically -->
              </div>
            </div>
            
            <div class="wargame-panel">
              <div class="wargame-panel-title">Settings</div>
              <div class="wargame-speed-control">
                <span class="wargame-speed-label">Speed:</span>
                <input type="range" id="speed-slider" class="wargame-speed-slider" 
                       min="1" max="100" value="50">
                <span id="speed-value">50ms</span>
              </div>
              <div class="wargame-toggle-group">
                <label class="wargame-toggle">
                  <input type="checkbox" id="toggle-cameras" checked>
                  <span>Show Camera Ranges</span>
                </label>
                <label class="wargame-toggle">
                  <input type="checkbox" id="toggle-hiding">
                  <span>Show Hiding Spots</span>
                </label>
                <label class="wargame-toggle">
                  <input type="checkbox" id="toggle-spectral">
                  <span>Spectral Overlay</span>
                </label>
              </div>
            </div>
            
            <div class="wargame-panel">
              <div class="wargame-panel-title">Activity Log</div>
              <div class="wargame-log" id="activity-log">
                <div class="wargame-log-entry">Simulation initialized...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────
  // Setup
  // ─────────────────────────────────────────────────────────────

  private injectStyles(): void {
    const styleId = 'wargame-dashboard-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = DASHBOARD_STYLES;
      document.head.appendChild(style);
    }
  }

  private setupCanvases(): void {
    this.mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;
    this.chartCanvas = document.getElementById('chart-canvas') as HTMLCanvasElement;
    
    if (this.mapCanvas) {
      this.mapCtx = this.mapCanvas.getContext('2d');
    }
    
    if (this.chartCanvas) {
      // Set chart canvas size
      const container = this.chartCanvas.parentElement;
      if (container) {
        this.chartCanvas.width = container.clientWidth;
        this.chartCanvas.height = container.clientHeight;
      }
      this.chartCtx = this.chartCanvas.getContext('2d');
    }
  }

  private cacheElements(): void {
    const ids = [
      'btn-start', 'btn-pause', 'btn-step', 'btn-reset',
      'stat-round', 'stat-total', 'stat-blue-wins', 'stat-red-wins',
      'stat-detection-rate', 'stat-confidence',
      'progress-fill', 'progress-percent', 'status-text',
      'speed-slider', 'speed-value',
      'toggle-cameras', 'toggle-hiding', 'toggle-spectral',
      'activity-log', 'current-round-panel', 'round-info'
    ];
    
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) this.elements[id] = el;
    });
  }

  private bindEvents(): void {
    // Control buttons
    this.elements['btn-start']?.addEventListener('click', () => this.handleStart());
    this.elements['btn-pause']?.addEventListener('click', () => this.handlePause());
    this.elements['btn-step']?.addEventListener('click', () => this.handleStep());
    this.elements['btn-reset']?.addEventListener('click', () => this.handleReset());
    
    // Speed slider
    this.elements['speed-slider']?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      const delay = 200 - value * 2; // 0-200ms range
      this.engine.setRoundDelay(Math.max(0, delay));
      if (this.elements['speed-value']) {
        this.elements['speed-value'].textContent = `${delay}ms`;
      }
    });
    
    // Toggles
    this.elements['toggle-cameras']?.addEventListener('change', (e) => {
      this.config.showCameraRanges = (e.target as HTMLInputElement).checked;
      this.renderMap();
    });
    
    this.elements['toggle-hiding']?.addEventListener('change', (e) => {
      this.config.showHidingSpots = (e.target as HTMLInputElement).checked;
      this.renderMap();
    });
    
    this.elements['toggle-spectral']?.addEventListener('change', (e) => {
      this.config.showSpectralOverlay = (e.target as HTMLInputElement).checked;
      this.renderMap();
    });
  }

  private subscribeToEngine(): void {
    this.unsubscribe = this.engine.on((event: SimulationEvent) => {
      this.handleEngineEvent(event);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────

  private handleStart(): void {
    this.engine.start();
    this.updateButtonStates(true, false);
    this.setStatusText('Running...', true);
  }

  private handlePause(): void {
    if (this.engine.getIsPaused()) {
      this.engine.resume();
      this.updateButtonStates(true, false);
      this.setStatusText('Running...', true);
    } else {
      this.engine.pause();
      this.updateButtonStates(true, true);
      this.setStatusText('Paused');
    }
  }

  private handleStep(): void {
    const result = this.engine.runSingleRound();
    if (result) {
      this.currentRoundResult = result;
      this.renderMap();
      this.updateStats();
      this.showRoundInfo(result);
      this.addLogEntry(result);
    }
  }

  private handleReset(): void {
    this.engine.reset();
    this.currentRoundResult = null;
    this.updateButtonStates(false, false);
    this.setStatusText('Ready');
    this.updateStats();
    this.renderMap();
    this.renderChart([]);
    this.clearLog();
    this.hideRoundInfo();
  }

  private handleEngineEvent(event: SimulationEvent): void {
    switch (event.type) {
      case 'ROUND_END':
        this.currentRoundResult = event.result;
        this.renderMap();
        this.updateStats();
        this.showRoundInfo(event.result);
        this.addLogEntry(event.result);
        break;
        
      case 'SIMULATION_COMPLETE':
        this.updateButtonStates(false, false);
        this.setStatusText('Complete!');
        this.addLogEntry(null, 'Simulation complete! Final detection rate: ' + 
          (event.stats.detectionRate * 100).toFixed(1) + '%');
        break;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UI Updates
  // ─────────────────────────────────────────────────────────────

  private updateButtonStates(running: boolean, paused: boolean): void {
    const startBtn = this.elements['btn-start'] as HTMLButtonElement;
    const pauseBtn = this.elements['btn-pause'] as HTMLButtonElement;
    const stepBtn = this.elements['btn-step'] as HTMLButtonElement;
    
    if (startBtn) startBtn.disabled = running && !paused;
    if (pauseBtn) {
      pauseBtn.disabled = !running;
      pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
    }
    if (stepBtn) stepBtn.disabled = running && !paused;
  }

  private setStatusText(text: string, running: boolean = false): void {
    const el = this.elements['status-text'];
    if (el) {
      el.textContent = text;
      el.className = running ? 'wargame-running-indicator' : '';
    }
  }

  private updateStats(): void {
    const stats = this.engine.getStats();
    const config = this.engine.getConfig();
    
    // Update stat values
    this.updateElement('stat-round', stats.completedRounds.toString());
    this.updateElement('stat-blue-wins', stats.blueWins.toString());
    this.updateElement('stat-red-wins', stats.redWins.toString());
    this.updateElement('stat-detection-rate', (stats.detectionRate * 100).toFixed(1) + '%');
    this.updateElement('stat-confidence', (stats.averageConfidence * 100).toFixed(1) + '%');
    
    // Update progress
    const progress = (stats.completedRounds / config.totalRounds) * 100;
    if (this.elements['progress-fill']) {
      (this.elements['progress-fill'] as HTMLElement).style.width = progress + '%';
    }
    this.updateElement('progress-percent', progress.toFixed(0) + '%');
    
    // Update chart
    this.renderChart(stats.confidenceTrend);
  }

  private updateElement(id: string, value: string): void {
    const el = this.elements[id];
    if (el) el.textContent = value;
  }

  private showRoundInfo(result: RoundResult): void {
    const panel = this.elements['current-round-panel'];
    const info = this.elements['round-info'];
    
    if (panel && info) {
      panel.style.display = 'block';
      
      info.innerHTML = `
        <div>
          <div class="wargame-round-label">Strategy</div>
          <div class="wargame-round-value">${result.redAction.strategy}</div>
        </div>
        <div>
          <div class="wargame-round-label">Confidence</div>
          <div class="wargame-round-value">${(result.confidence * 100).toFixed(1)}%</div>
        </div>
        <div>
          <div class="wargame-round-label">Detection</div>
          <div class="wargame-round-value" style="color: ${result.detected ? '#00d4ff' : '#ff4757'}">
            ${result.detected ? '✓ DETECTED' : '✗ MISSED'}
          </div>
        </div>
        <div>
          <div class="wargame-round-label">Distance Error</div>
          <div class="wargame-round-value">${result.actualDistance.toFixed(0)}px</div>
        </div>
      `;
    }
  }

  private hideRoundInfo(): void {
    const panel = this.elements['current-round-panel'];
    if (panel) panel.style.display = 'none';
  }

  private addLogEntry(result: RoundResult | null, customMessage?: string): void {
    const log = this.elements['activity-log'];
    if (!log) return;
    
    const entry = document.createElement('div');
    entry.className = 'wargame-log-entry';
    
    if (customMessage) {
      entry.textContent = customMessage;
    } else if (result) {
      entry.className += result.detected ? ' wargame-log-entry-detected' : ' wargame-log-entry-missed';
      entry.textContent = `R${result.roundNumber}: ${result.redAction.strategy} → ${result.detected ? 'DETECTED' : 'EVADED'} (${(result.confidence * 100).toFixed(0)}%)`;
    }
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    // Limit log entries
    while (log.children.length > 50) {
      log.removeChild(log.children[0]);
    }
  }

  private clearLog(): void {
    const log = this.elements['activity-log'];
    if (log) {
      log.innerHTML = '<div class="wargame-log-entry">Simulation reset...</div>';
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Map Rendering
  // ─────────────────────────────────────────────────────────────

  private renderMap(): void {
    if (!this.mapCtx || !this.mapCanvas) return;
    
    const ctx = this.mapCtx;
    const map = this.engine.getMap();
    
    // Clear canvas
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
    
    // Draw grid
    this.drawGrid(ctx);
    
    // Draw spectral overlay if enabled
    if (this.config.showSpectralOverlay) {
      this.drawSpectralOverlay(ctx);
    }
    
    // Draw roads
    this.drawRoads(ctx, map.getRoads());
    
    // Draw camera ranges if enabled
    if (this.config.showCameraRanges) {
      this.drawCameraRanges(ctx, map.getCameras());
    }
    
    // Draw buildings
    this.drawBuildings(ctx, map.getBuildings());
    
    // Draw hiding spots if enabled
    if (this.config.showHidingSpots) {
      this.drawHidingSpots(ctx, map.getHidingSpots());
    }
    
    // Draw cameras
    this.drawCameras(ctx, map.getCameras());
    
    // Draw current round visualization
    if (this.currentRoundResult) {
      this.drawRoundVisualization(ctx, this.currentRoundResult);
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    
    for (let x = 0; x < this.mapCanvas!.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.mapCanvas!.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < this.mapCanvas!.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.mapCanvas!.width, y);
      ctx.stroke();
    }
  }

  private drawSpectralOverlay(ctx: CanvasRenderingContext2D): void {
    const map = this.engine.getMap();
    const layers = map.getSpectralLayers();
    const thermalLayer = layers.find(l => l.id === 'thermal');
    
    if (!thermalLayer) return;
    
    const cellSize = 20;
    
    thermalLayer.intensityMap.forEach((row, y) => {
      row.forEach((value, x) => {
        const alpha = value * 0.3;
        ctx.fillStyle = `rgba(255, 100, 50, ${alpha})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });
    });
  }

  private drawRoads(ctx: CanvasRenderingContext2D, roads: Road[]): void {
    roads.forEach(road => {
      ctx.beginPath();
      ctx.strokeStyle = road.type === 'main' ? '#2a2a3e' : 
                        road.type === 'secondary' ? '#222233' : '#1a1a28';
      ctx.lineWidth = road.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (road.points.length > 0) {
        ctx.moveTo(road.points[0].x, road.points[0].y);
        road.points.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
      }
      
      ctx.stroke();
    });
  }

  private drawBuildings(ctx: CanvasRenderingContext2D, buildings: Building[]): void {
    buildings.forEach(building => {
      // Building shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(building.x + 5, building.y + 5, building.width, building.height);
      
      // Building base
      const gradient = ctx.createLinearGradient(
        building.x, building.y,
        building.x + building.width, building.y + building.height
      );
      
      const baseColor = building.type === 'government' ? '#3a3a5a' :
                        building.type === 'commercial' ? '#3a4a4a' :
                        building.type === 'industrial' ? '#4a3a3a' : '#3a3a4a';
      
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, '#2a2a3a');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Building outline
      ctx.strokeStyle = '#4a4a5a';
      ctx.lineWidth = 1;
      ctx.strokeRect(building.x, building.y, building.width, building.height);
    });
  }

  private drawCameraRanges(ctx: CanvasRenderingContext2D, cameras: Camera[]): void {
    cameras.forEach(camera => {
      ctx.beginPath();
      
      // Draw field of view cone
      const startAngle = (camera.direction - camera.fieldOfView / 2) * Math.PI / 180;
      const endAngle = (camera.direction + camera.fieldOfView / 2) * Math.PI / 180;
      
      ctx.moveTo(camera.position.x, camera.position.y);
      ctx.arc(camera.position.x, camera.position.y, camera.range, startAngle, endAngle);
      ctx.closePath();
      
      const gradient = ctx.createRadialGradient(
        camera.position.x, camera.position.y, 0,
        camera.position.x, camera.position.y, camera.range
      );
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0.02)');
      
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }

  private drawCameras(ctx: CanvasRenderingContext2D, cameras: Camera[]): void {
    cameras.forEach(camera => {
      // Camera body
      ctx.beginPath();
      ctx.arc(camera.position.x, camera.position.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = camera.spectralCapability ? '#7b2cbf' : '#00d4ff';
      ctx.fill();
      
      // Direction indicator
      const dirRad = camera.direction * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(camera.position.x, camera.position.y);
      ctx.lineTo(
        camera.position.x + Math.cos(dirRad) * 12,
        camera.position.y + Math.sin(dirRad) * 12
      );
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  private drawHidingSpots(ctx: CanvasRenderingContext2D, spots: HidingSpot[]): void {
    spots.forEach(spot => {
      ctx.beginPath();
      ctx.arc(spot.position.x, spot.position.y, 4, 0, Math.PI * 2);
      
      const alpha = spot.concealmentLevel;
      ctx.fillStyle = spot.isInShadow ? 
        `rgba(50, 50, 100, ${alpha})` : 
        `rgba(100, 100, 50, ${alpha})`;
      ctx.fill();
    });
  }

  private drawRoundVisualization(ctx: CanvasRenderingContext2D, result: RoundResult): void {
    const { redAction, blueResponse } = result;
    
    // Draw Red-AI path
    if (redAction.path.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      
      ctx.moveTo(redAction.path[0].x, redAction.path[0].y);
      redAction.path.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw path points
      redAction.path.forEach((point, i) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = i === redAction.path.length - 1 ? '#ff4757' : '#ff8888';
        ctx.fill();
      });
    }
    
    // Draw hide location (Red-AI target)
    ctx.beginPath();
    ctx.arc(redAction.hideLocation.x, redAction.hideLocation.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 71, 87, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#ff4757';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Inner marker
    ctx.beginPath();
    ctx.arc(redAction.hideLocation.x, redAction.hideLocation.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4757';
    ctx.fill();
    
    // Draw Blue-AI prediction
    ctx.beginPath();
    ctx.arc(blueResponse.predictedLocation.x, blueResponse.predictedLocation.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Crosshair
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    const cx = blueResponse.predictedLocation.x;
    const cy = blueResponse.predictedLocation.y;
    
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
    
    // Draw line between prediction and actual
    ctx.beginPath();
    ctx.moveTo(blueResponse.predictedLocation.x, blueResponse.predictedLocation.y);
    ctx.lineTo(redAction.hideLocation.x, redAction.hideLocation.y);
    ctx.strokeStyle = result.detected ? '#00ff00' : '#ff0000';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Detection indicator
    if (result.detected) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('✓ DETECTED', redAction.hideLocation.x + 15, redAction.hideLocation.y - 15);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Chart Rendering
  // ─────────────────────────────────────────────────────────────

  private renderChart(data: number[]): void {
    if (!this.chartCtx || !this.chartCanvas) return;
    
    const ctx = this.chartCtx;
    const width = this.chartCanvas.width;
    const height = this.chartCanvas.height;
    
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    if (data.length < 2) return;
    
    // Draw grid lines
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw confidence line
    ctx.beginPath();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    
    const xStep = width / (data.length - 1);
    
    data.forEach((value, i) => {
      const x = i * xStep;
      const y = height - (value * height);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw detection rate line
    const detectionTrend = this.engine.getDetectionRateTrend();
    if (detectionTrend.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#7b2cbf';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      
      detectionTrend.forEach((value, i) => {
        const x = i * xStep;
        const y = height - (value * height);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

export default WargameDashboard;
