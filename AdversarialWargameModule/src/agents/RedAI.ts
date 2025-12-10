/**
 * SCAR-EYE Adversarial Wargame Module
 * Red-AI Agent (Attacker)
 * 
 * Simulated adversarial AI that attempts to:
 * - Choose optimal hiding locations for "virtual bomb"
 * - Use spectral camouflage to avoid detection
 * - Exploit dark spots and camera blind spots
 * - Move strategically through the environment
 * 
 * Educational simulation only - No real offensive capability
 */

import {
  Position,
  RedAIOutput,
  SpectralSignature,
  HidingSpot,
  Camera
} from '../utils/types';

import {
  randomInt,
  randomChoice,
  randomInRange,
  distance,
  clamp,
  generateCamouflageProfile
} from '../utils/mockData';

import { DigitalTwinMap } from '../core/DigitalTwinMap';

// ═══════════════════════════════════════════════════════════════
// Red-AI Strategy Types
// ═══════════════════════════════════════════════════════════════

type RedStrategy = 
  | 'EXPLOIT_BLIND_SPOT'
  | 'SHADOW_LURK'
  | 'SPECTRAL_MIMICRY'
  | 'RANDOM_CHAOS'
  | 'ALLEY_SNEAK'
  | 'BUILDING_COVER';

// ═══════════════════════════════════════════════════════════════
// Red-AI Agent Class
// ═══════════════════════════════════════════════════════════════

export class RedAI {
  private map: DigitalTwinMap;
  private roundNumber: number = 0;
  private learningRate: number = 0.1;
  
  // Memory of past attempts and their success
  private attemptHistory: Array<{
    location: Position;
    wasDetected: boolean;
    strategy: RedStrategy;
  }> = [];
  
  // Strategy weights (evolve over time)
  private strategyWeights: Record<RedStrategy, number> = {
    'EXPLOIT_BLIND_SPOT': 1.0,
    'SHADOW_LURK': 1.0,
    'SPECTRAL_MIMICRY': 1.0,
    'RANDOM_CHAOS': 0.5,
    'ALLEY_SNEAK': 1.0,
    'BUILDING_COVER': 1.0
  };

  constructor(map: DigitalTwinMap) {
    this.map = map;
  }

  // ─────────────────────────────────────────────────────────────
  // Main Action Generation
  // ─────────────────────────────────────────────────────────────

  /**
   * Generate a new attack attempt
   */
  generateAttempt(): RedAIOutput {
    this.roundNumber++;
    
    // Select strategy based on weights
    const strategy = this.selectStrategy();
    
    // Generate hiding location based on strategy
    const hideLocation = this.selectHidingLocation(strategy);
    
    // Generate path to the hiding location
    const path = this.generatePath(hideLocation, strategy);
    
    // Create camouflage profile
    const camouflageProfile = this.generateCamouflage(hideLocation);
    
    // Analyze exploited weaknesses
    const exploitedWeaknesses = this.analyzeExploitedWeaknesses(hideLocation, strategy);
    
    return {
      hideLocation,
      camouflageProfile,
      path,
      strategy,
      exploitedWeaknesses
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Strategy Selection
  // ─────────────────────────────────────────────────────────────

  private selectStrategy(): RedStrategy {
    const strategies = Object.keys(this.strategyWeights) as RedStrategy[];
    const totalWeight = strategies.reduce(
      (sum, s) => sum + this.strategyWeights[s], 
      0
    );
    
    let random = Math.random() * totalWeight;
    
    for (const strategy of strategies) {
      random -= this.strategyWeights[strategy];
      if (random <= 0) {
        return strategy;
      }
    }
    
    return 'RANDOM_CHAOS';
  }

  // ─────────────────────────────────────────────────────────────
  // Hiding Location Selection
  // ─────────────────────────────────────────────────────────────

  private selectHidingLocation(strategy: RedStrategy): Position {
    const hidingSpots = this.map.getHidingSpots();
    const blindSpots = this.map.getBlindSpots();
    const buildings = this.map.getBuildings();
    
    switch (strategy) {
      case 'EXPLOIT_BLIND_SPOT':
        return this.selectFromBlindSpots(blindSpots);
        
      case 'SHADOW_LURK':
        return this.selectShadowLocation(hidingSpots);
        
      case 'SPECTRAL_MIMICRY':
        return this.selectSpectrallyConfusingLocation(hidingSpots);
        
      case 'ALLEY_SNEAK':
        return this.selectAlleyLocation();
        
      case 'BUILDING_COVER':
        return this.selectBuildingCoverLocation(buildings);
        
      case 'RANDOM_CHAOS':
      default:
        return this.selectRandomLocation();
    }
  }

  private selectFromBlindSpots(blindSpots: Position[]): Position {
    if (blindSpots.length === 0) {
      return this.selectRandomLocation();
    }
    
    // Prefer blind spots that are also near hiding spots
    const hidingSpots = this.map.getHidingSpots();
    
    let bestSpot = blindSpots[0];
    let bestScore = 0;
    
    blindSpots.forEach(blind => {
      const nearestHiding = hidingSpots.reduce((nearest, spot) => {
        const dist = distance(blind, spot.position);
        const nearestDist = distance(blind, nearest.position);
        return dist < nearestDist ? spot : nearest;
      }, hidingSpots[0]);
      
      if (nearestHiding) {
        const score = nearestHiding.concealmentLevel;
        if (score > bestScore) {
          bestScore = score;
          bestSpot = {
            x: blind.x + randomInt(-20, 20),
            y: blind.y + randomInt(-20, 20)
          };
        }
      }
    });
    
    return this.clampToMap(bestSpot);
  }

  private selectShadowLocation(hidingSpots: HidingSpot[]): Position {
    const shadowSpots = hidingSpots.filter(s => s.isInShadow);
    
    if (shadowSpots.length === 0) {
      return this.selectRandomLocation();
    }
    
    // Select the darkest spot (highest concealment in shadow)
    const best = shadowSpots.reduce((a, b) => 
      a.concealmentLevel > b.concealmentLevel ? a : b
    );
    
    return {
      x: best.position.x + randomInt(-10, 10),
      y: best.position.y + randomInt(-10, 10)
    };
  }

  private selectSpectrallyConfusingLocation(hidingSpots: HidingSpot[]): Position {
    // Select spots where spectral readings are most complex
    const best = hidingSpots.reduce((a, b) => 
      a.spectralDifficulty > b.spectralDifficulty ? a : b
    );
    
    return {
      x: best.position.x + randomInt(-15, 15),
      y: best.position.y + randomInt(-15, 15)
    };
  }

  private selectAlleyLocation(): Position {
    const roads = this.map.getRoads();
    const alleys = roads.filter(r => r.type === 'alley');
    
    if (alleys.length === 0) {
      return this.selectRandomLocation();
    }
    
    const alley = randomChoice(alleys);
    const point = randomChoice(alley.points);
    
    return {
      x: point.x + randomInt(-5, 5),
      y: point.y + randomInt(-5, 5)
    };
  }

  private selectBuildingCoverLocation(buildings: typeof this.map extends DigitalTwinMap ? ReturnType<DigitalTwinMap['getBuildings']> : never): Position {
    if (buildings.length === 0) {
      return this.selectRandomLocation();
    }
    
    const building = randomChoice(buildings);
    
    // Hide at a corner or edge of building
    const corners = [
      { x: building.x - 5, y: building.y - 5 },
      { x: building.x + building.width + 5, y: building.y - 5 },
      { x: building.x - 5, y: building.y + building.height + 5 },
      { x: building.x + building.width + 5, y: building.y + building.height + 5 }
    ];
    
    return this.clampToMap(randomChoice(corners));
  }

  private selectRandomLocation(): Position {
    return {
      x: randomInt(20, this.map.width - 20),
      y: randomInt(20, this.map.height - 20)
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Path Generation
  // ─────────────────────────────────────────────────────────────

  private generatePath(target: Position, strategy: RedStrategy): Position[] {
    const path: Position[] = [];
    
    // Start from a random edge
    const edges = [
      { x: 0, y: randomInt(50, this.map.height - 50) },
      { x: this.map.width, y: randomInt(50, this.map.height - 50) },
      { x: randomInt(50, this.map.width - 50), y: 0 },
      { x: randomInt(50, this.map.width - 50), y: this.map.height }
    ];
    
    let current = randomChoice(edges);
    path.push(current);
    
    // Generate waypoints based on strategy
    const numWaypoints = randomInt(3, 7);
    
    for (let i = 0; i < numWaypoints; i++) {
      const progress = (i + 1) / (numWaypoints + 1);
      
      // Base interpolation towards target
      let nextX = current.x + (target.x - current.x) * (0.5 + Math.random() * 0.3);
      let nextY = current.y + (target.y - current.y) * (0.5 + Math.random() * 0.3);
      
      // Add strategy-specific deviations
      switch (strategy) {
        case 'SHADOW_LURK':
          // Try to stay in shadow areas
          nextX += randomInt(-30, 30);
          nextY += randomInt(-30, 30);
          break;
          
        case 'ALLEY_SNEAK':
          // Follow roads/alleys more closely
          if (Math.random() > 0.5) {
            const nearRoad = this.findNearestRoadPoint({ x: nextX, y: nextY });
            if (nearRoad) {
              nextX = nearRoad.x;
              nextY = nearRoad.y;
            }
          }
          break;
          
        case 'RANDOM_CHAOS':
          // Large random deviations
          nextX += randomInt(-80, 80);
          nextY += randomInt(-80, 80);
          break;
          
        default:
          // Normal path with some randomness
          nextX += randomInt(-20, 20);
          nextY += randomInt(-20, 20);
      }
      
      current = this.clampToMap({ x: nextX, y: nextY });
      path.push(current);
    }
    
    // End at target
    path.push(target);
    
    return path;
  }

  private findNearestRoadPoint(position: Position): Position | null {
    const roads = this.map.getRoads();
    let nearestPoint: Position | null = null;
    let nearestDist = Infinity;
    
    roads.forEach(road => {
      road.points.forEach(point => {
        const dist = distance(position, point);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestPoint = point;
        }
      });
    });
    
    return nearestPoint;
  }

  // ─────────────────────────────────────────────────────────────
  // Camouflage Generation
  // ─────────────────────────────────────────────────────────────

  private generateCamouflage(location: Position): SpectralSignature {
    // Get the spectral signature of the target area
    const areaSpectral = this.map.getFullSpectralReadingAt(location);
    
    // Create a camouflage profile that tries to match the area
    const targetSignature: SpectralSignature = {
      visible: areaSpectral['visible'] || 0.5,
      nearInfrared: areaSpectral['near-ir'] || 0.4,
      shortwave: areaSpectral['shortwave-ir'] || 0.3,
      thermal: areaSpectral['thermal'] || 0.4
    };
    
    // Generate camouflage with some imperfections (intentional)
    return generateCamouflageProfile(targetSignature);
  }

  // ─────────────────────────────────────────────────────────────
  // Weakness Analysis
  // ─────────────────────────────────────────────────────────────

  private analyzeExploitedWeaknesses(location: Position, strategy: RedStrategy): string[] {
    const weaknesses: string[] = [];
    
    // Check camera coverage
    const coveringCameras = this.map.getCamerasCovering(location);
    if (coveringCameras.length === 0) {
      weaknesses.push('Camera blind spot');
    } else if (coveringCameras.length === 1) {
      weaknesses.push('Minimal camera coverage');
    }
    
    // Check illuminance
    const illuminance = this.map.getIlluminanceAt(location);
    if (illuminance < 0.3) {
      weaknesses.push('Low illumination zone');
    }
    
    // Check spectral conditions
    const spectral = this.map.getFullSpectralReadingAt(location);
    if (spectral['thermal'] > 0.6) {
      weaknesses.push('High thermal noise (masking)');
    }
    
    // Strategy-specific
    switch (strategy) {
      case 'EXPLOIT_BLIND_SPOT':
        weaknesses.push('Surveillance gap exploitation');
        break;
      case 'SHADOW_LURK':
        weaknesses.push('Shadow concealment');
        break;
      case 'SPECTRAL_MIMICRY':
        weaknesses.push('Spectral signature blending');
        break;
      case 'ALLEY_SNEAK':
        weaknesses.push('Narrow passage approach');
        break;
      case 'BUILDING_COVER':
        weaknesses.push('Structural obstruction');
        break;
    }
    
    return weaknesses;
  }

  // ─────────────────────────────────────────────────────────────
  // Learning / Adaptation
  // ─────────────────────────────────────────────────────────────

  /**
   * Update Red-AI based on whether the attempt was detected
   */
  recordResult(location: Position, wasDetected: boolean, strategy: RedStrategy): void {
    this.attemptHistory.push({ location, wasDetected, strategy });
    
    // Update strategy weights based on success
    if (wasDetected) {
      // Strategy failed - reduce weight
      this.strategyWeights[strategy] = Math.max(
        0.1,
        this.strategyWeights[strategy] - this.learningRate
      );
    } else {
      // Strategy succeeded - increase weight
      this.strategyWeights[strategy] = Math.min(
        2.0,
        this.strategyWeights[strategy] + this.learningRate * 1.5
      );
    }
  }

  /**
   * Get success rate for a strategy
   */
  getStrategySuccessRate(strategy: RedStrategy): number {
    const attempts = this.attemptHistory.filter(a => a.strategy === strategy);
    if (attempts.length === 0) return 0.5;
    
    const successes = attempts.filter(a => !a.wasDetected).length;
    return successes / attempts.length;
  }

  // ─────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────

  private clampToMap(position: Position): Position {
    return {
      x: clamp(position.x, 10, this.map.width - 10),
      y: clamp(position.y, 10, this.map.height - 10)
    };
  }

  /**
   * Reset the agent state
   */
  reset(): void {
    this.roundNumber = 0;
    this.attemptHistory = [];
    this.strategyWeights = {
      'EXPLOIT_BLIND_SPOT': 1.0,
      'SHADOW_LURK': 1.0,
      'SPECTRAL_MIMICRY': 1.0,
      'RANDOM_CHAOS': 0.5,
      'ALLEY_SNEAK': 1.0,
      'BUILDING_COVER': 1.0
    };
  }

  /**
   * Get current strategy weights
   */
  getStrategyWeights(): Record<string, number> {
    return { ...this.strategyWeights };
  }

  /**
   * Get attempt history
   */
  getHistory(): typeof this.attemptHistory {
    return [...this.attemptHistory];
  }
}

export default RedAI;
