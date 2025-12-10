/**
 * SCAR-EYE Adversarial Wargame Module
 * Digital Twin Map
 * 
 * Simulated neighborhood map with buildings, roads, hiding spots,
 * spectral layers, and adaptive illuminance response
 * 
 * Educational simulation only - No real data
 */

import {
  Building,
  Road,
  HidingSpot,
  Camera,
  SpectralLayer,
  IlluminanceState,
  Position,
  SimulationConfig
} from '../utils/types';

import {
  generateMockBuildings,
  generateMockRoads,
  generateMockCameras,
  generateMockHidingSpots,
  generateMockSpectralLayers,
  distance,
  clamp,
  randomInRange
} from '../utils/mockData';

// ═══════════════════════════════════════════════════════════════
// Digital Twin Map Class
// ═══════════════════════════════════════════════════════════════

export class DigitalTwinMap {
  readonly width: number;
  readonly height: number;
  
  private buildings: Building[] = [];
  private roads: Road[] = [];
  private cameras: Camera[] = [];
  private hidingSpots: HidingSpot[] = [];
  private spectralLayers: SpectralLayer[] = [];
  private illuminanceState: IlluminanceState;
  
  private gridResolution: number = 20;

  constructor(config: Partial<SimulationConfig> = {}) {
    this.width = config.mapWidth || 800;
    this.height = config.mapHeight || 600;
    
    this.illuminanceState = {
      ambient: 0.3, // Night time
      artificial: 0.5,
      adaptive: config.adaptiveLightingEnabled ?? true,
      zones: new Map()
    };
    
    this.initializeMap();
  }

  // ─────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────

  private initializeMap(): void {
    // Generate all map elements
    this.buildings = generateMockBuildings(this.width, this.height);
    this.roads = generateMockRoads(this.width, this.height);
    this.cameras = generateMockCameras(this.buildings, this.width, this.height);
    this.hidingSpots = generateMockHidingSpots(
      this.buildings, 
      this.cameras, 
      this.width, 
      this.height
    );
    this.spectralLayers = generateMockSpectralLayers(
      this.width, 
      this.height, 
      this.gridResolution
    );
    
    // Initialize illuminance zones around buildings
    this.buildings.forEach(building => {
      this.illuminanceState.zones.set(building.id, randomInRange(0.3, 0.7));
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────────

  getBuildings(): Building[] {
    return [...this.buildings];
  }

  getRoads(): Road[] {
    return [...this.roads];
  }

  getCameras(): Camera[] {
    return [...this.cameras];
  }

  getHidingSpots(): HidingSpot[] {
    return [...this.hidingSpots];
  }

  getSpectralLayers(): SpectralLayer[] {
    return [...this.spectralLayers];
  }

  getIlluminanceState(): IlluminanceState {
    return { ...this.illuminanceState, zones: new Map(this.illuminanceState.zones) };
  }

  // ─────────────────────────────────────────────────────────────
  // Spectral Analysis
  // ─────────────────────────────────────────────────────────────

  /**
   * Get spectral intensity at a given position
   */
  getSpectralIntensityAt(position: Position, layerId: string): number {
    const layer = this.spectralLayers.find(l => l.id === layerId);
    if (!layer) return 0;
    
    const gridX = Math.floor(position.x / this.gridResolution);
    const gridY = Math.floor(position.y / this.gridResolution);
    
    if (gridY >= 0 && gridY < layer.intensityMap.length &&
        gridX >= 0 && gridX < layer.intensityMap[0].length) {
      return layer.intensityMap[gridY][gridX];
    }
    
    return 0;
  }

  /**
   * Get all spectral readings at a position
   */
  getFullSpectralReadingAt(position: Position): Record<string, number> {
    const readings: Record<string, number> = {};
    this.spectralLayers.forEach(layer => {
      readings[layer.id] = this.getSpectralIntensityAt(position, layer.id);
    });
    return readings;
  }

  /**
   * Update spectral layer at a position (for simulation)
   */
  updateSpectralAt(position: Position, layerId: string, value: number): void {
    const layer = this.spectralLayers.find(l => l.id === layerId);
    if (!layer) return;
    
    const gridX = Math.floor(position.x / this.gridResolution);
    const gridY = Math.floor(position.y / this.gridResolution);
    
    if (gridY >= 0 && gridY < layer.intensityMap.length &&
        gridX >= 0 && gridX < layer.intensityMap[0].length) {
      layer.intensityMap[gridY][gridX] = clamp(value, 0, 1);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Illuminance Control (Adaptive Lighting)
  // ─────────────────────────────────────────────────────────────

  /**
   * Get illuminance level at a position
   */
  getIlluminanceAt(position: Position): number {
    let illuminance = this.illuminanceState.ambient + this.illuminanceState.artificial;
    
    // Check if near any building with zone lighting
    this.buildings.forEach(building => {
      const buildingCenter = {
        x: building.x + building.width / 2,
        y: building.y + building.height / 2
      };
      const dist = distance(position, buildingCenter);
      const buildingRadius = Math.max(building.width, building.height);
      
      if (dist < buildingRadius * 1.5) {
        const zoneLight = this.illuminanceState.zones.get(building.id) || 0;
        const falloff = 1 - (dist / (buildingRadius * 1.5));
        illuminance += zoneLight * falloff;
      }
    });
    
    return clamp(illuminance, 0, 1);
  }

  /**
   * Increase illuminance in a zone (adaptive response to suspicious activity)
   */
  adjustZoneIlluminance(zoneId: string, adjustment: number): void {
    if (!this.illuminanceState.adaptive) return;
    
    const currentValue = this.illuminanceState.zones.get(zoneId) || 0.5;
    this.illuminanceState.zones.set(
      zoneId, 
      clamp(currentValue + adjustment, 0, 1)
    );
  }

  /**
   * Increase illuminance around a specific position
   */
  increaseIlluminanceAround(position: Position, radius: number, amount: number): void {
    if (!this.illuminanceState.adaptive) return;
    
    this.buildings.forEach(building => {
      const buildingCenter = {
        x: building.x + building.width / 2,
        y: building.y + building.height / 2
      };
      
      if (distance(position, buildingCenter) < radius) {
        this.adjustZoneIlluminance(building.id, amount);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Hiding Spot Analysis
  // ─────────────────────────────────────────────────────────────

  /**
   * Get the best hiding spots (for Red-AI strategy)
   */
  getBestHidingSpots(count: number = 5): HidingSpot[] {
    return [...this.hidingSpots]
      .sort((a, b) => {
        // Score based on concealment, distance from cameras, shadow
        const scoreA = a.concealmentLevel * 0.3 + 
                       Math.min(a.nearestCameraDistance / 200, 1) * 0.4 +
                       (a.isInShadow ? 0.3 : 0);
        const scoreB = b.concealmentLevel * 0.3 + 
                       Math.min(b.nearestCameraDistance / 200, 1) * 0.4 +
                       (b.isInShadow ? 0.3 : 0);
        return scoreB - scoreA;
      })
      .slice(0, count);
  }

  /**
   * Get hiding spot visibility (for Blue-AI analysis)
   */
  getHidingSpotVisibility(spot: HidingSpot): number {
    const illuminance = this.getIlluminanceAt(spot.position);
    const spectralClarity = this.getSpectralIntensityAt(spot.position, 'visible');
    
    // Higher visibility = easier to detect
    let visibility = illuminance * 0.5 + spectralClarity * 0.3;
    
    if (spot.isInShadow) {
      visibility *= 0.6;
    }
    
    return clamp(visibility, 0, 1);
  }

  // ─────────────────────────────────────────────────────────────
  // Camera Coverage Analysis
  // ─────────────────────────────────────────────────────────────

  /**
   * Check if a position is within camera coverage
   */
  isInCameraView(position: Position, camera: Camera): boolean {
    const dist = distance(position, camera.position);
    if (dist > camera.range) return false;
    
    // Calculate angle to position
    const angle = Math.atan2(
      position.y - camera.position.y,
      position.x - camera.position.x
    ) * (180 / Math.PI);
    
    // Normalize angles
    let normalizedAngle = angle - camera.direction;
    while (normalizedAngle > 180) normalizedAngle -= 360;
    while (normalizedAngle < -180) normalizedAngle += 360;
    
    return Math.abs(normalizedAngle) <= camera.fieldOfView / 2;
  }

  /**
   * Get all cameras that can see a position
   */
  getCamerasCovering(position: Position): Camera[] {
    return this.cameras.filter(cam => this.isInCameraView(position, cam));
  }

  /**
   * Get the blind spots (areas with minimal camera coverage)
   */
  getBlindSpots(): Position[] {
    const blindSpots: Position[] = [];
    const checkResolution = 50;
    
    for (let x = 0; x < this.width; x += checkResolution) {
      for (let y = 0; y < this.height; y += checkResolution) {
        const pos = { x, y };
        const coveringCameras = this.getCamerasCovering(pos);
        
        if (coveringCameras.length === 0) {
          blindSpots.push(pos);
        }
      }
    }
    
    return blindSpots;
  }

  // ─────────────────────────────────────────────────────────────
  // Path Analysis
  // ─────────────────────────────────────────────────────────────

  /**
   * Check if a position is on or near a road
   */
  isNearRoad(position: Position, threshold: number = 15): boolean {
    for (const road of this.roads) {
      for (let i = 0; i < road.points.length - 1; i++) {
        const p1 = road.points[i];
        const p2 = road.points[i + 1];
        
        // Point-to-line-segment distance
        const dist = this.pointToLineDistance(position, p1, p2);
        if (dist < road.width / 2 + threshold) {
          return true;
        }
      }
    }
    return false;
  }

  private pointToLineDistance(point: Position, lineStart: Position, lineEnd: Position): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;

    let xx: number, yy: number;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    return Math.sqrt((point.x - xx) ** 2 + (point.y - yy) ** 2);
  }

  // ─────────────────────────────────────────────────────────────
  // Reset / Regenerate
  // ─────────────────────────────────────────────────────────────

  /**
   * Reset the map to initial state
   */
  reset(): void {
    this.initializeMap();
  }

  /**
   * Get map state for serialization
   */
  getState(): object {
    return {
      width: this.width,
      height: this.height,
      buildings: this.buildings,
      roads: this.roads,
      cameras: this.cameras,
      hidingSpots: this.hidingSpots,
      illuminanceState: {
        ...this.illuminanceState,
        zones: Object.fromEntries(this.illuminanceState.zones)
      }
    };
  }
}

export default DigitalTwinMap;
