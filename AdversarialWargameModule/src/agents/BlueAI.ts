/**
 * SCAR-EYE Adversarial Wargame Module
 * Blue-AI Agent (SCAR-EYE Defensive System)
 * 
 * Simulated defensive AI that:
 * - Analyzes spectral signatures for anomalies
 * - Detects movement deviations from baseline
 * - Adaptively adjusts illumination for better visibility
 * - Predicts hiding locations via pattern recognition
 * 
 * Educational simulation only - No real surveillance capability
 */

import {
  Position,
  BlueAIOutput,
  SpectralSignature,
  RedAIOutput,
  HidingSpot,
  Camera
} from '../utils/types';

import {
  distance,
  clamp,
  randomInRange,
  randomInt
} from '../utils/mockData';

import { DigitalTwinMap } from '../core/DigitalTwinMap';

// ═══════════════════════════════════════════════════════════════
// Analysis Types
// ═══════════════════════════════════════════════════════════════

interface SpectralAnomaly {
  position: Position;
  severity: number;
  type: 'thermal' | 'infrared' | 'visible' | 'composite';
}

interface MovementPattern {
  path: Position[];
  deviationScore: number;
  suspiciousPoints: Position[];
}

interface PredictionModel {
  weights: Record<string, number>;
  history: Array<{
    predicted: Position;
    actual: Position;
    error: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════
// Blue-AI Agent Class
// ═══════════════════════════════════════════════════════════════

export class BlueAI {
  private map: DigitalTwinMap;
  private roundNumber: number = 0;
  private learningRate: number = 0.15;
  
  // Pattern recognition model
  private predictionModel: PredictionModel = {
    weights: {
      blindSpotBias: 0.3,
      shadowBias: 0.25,
      buildingCornerBias: 0.2,
      alleyBias: 0.15,
      randomBias: 0.1
    },
    history: []
  };
  
  // Baseline spectral readings (for anomaly detection)
  private spectralBaseline: Map<string, number> = new Map();
  
  // Suspicious area tracking
  private suspiciousAreas: Position[] = [];
  
  // Detection history for learning
  private detectionHistory: Array<{
    roundNumber: number;
    detected: boolean;
    confidence: number;
    predictionError: number;
  }> = [];

  constructor(map: DigitalTwinMap) {
    this.map = map;
    this.initializeBaseline();
  }

  // ─────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────

  private initializeBaseline(): void {
    // Sample spectral readings across the map to establish baseline
    const samplePoints = 20;
    
    for (let i = 0; i < samplePoints; i++) {
      for (let j = 0; j < samplePoints; j++) {
        const x = (this.map.width / samplePoints) * i;
        const y = (this.map.height / samplePoints) * j;
        const key = `${Math.floor(x / 50)}-${Math.floor(y / 50)}`;
        
        const reading = this.map.getFullSpectralReadingAt({ x, y });
        const avgIntensity = Object.values(reading).reduce((a, b) => a + b, 0) / 4;
        
        this.spectralBaseline.set(key, avgIntensity);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Main Analysis & Response
  // ─────────────────────────────────────────────────────────────

  /**
   * Analyze Red-AI action and generate response
   */
  analyze(redAction: RedAIOutput): BlueAIOutput {
    this.roundNumber++;
    
    // 1. Spectral Analysis
    const spectralAnomalies = this.performSpectralAnalysis(redAction);
    
    // 2. Movement Pattern Analysis
    const movementAnalysis = this.analyzeMovementPattern(redAction.path);
    
    // 3. Predict hiding location
    const predictedLocation = this.predictHidingLocation(
      spectralAnomalies,
      movementAnalysis,
      redAction
    );
    
    // 4. Calculate detection confidence
    const confidence = this.calculateConfidence(
      spectralAnomalies,
      movementAnalysis,
      predictedLocation,
      redAction.hideLocation
    );
    
    // 5. Determine if detected
    const detected = this.determineDetection(confidence, predictedLocation, redAction.hideLocation);
    
    // 6. Adjust illumination adaptively
    const illuminanceAdjustments = this.adjustIlluminance(
      spectralAnomalies,
      movementAnalysis.suspiciousPoints
    );
    
    // 7. Generate reasoning explanation
    const reasoning = this.generateReasoning(
      spectralAnomalies,
      movementAnalysis,
      detected,
      confidence
    );
    
    // Record for learning
    const predictionError = distance(predictedLocation, redAction.hideLocation);
    this.detectionHistory.push({
      roundNumber: this.roundNumber,
      detected,
      confidence,
      predictionError
    });
    
    return {
      detected,
      confidence,
      predictedLocation,
      reasoning,
      illuminanceAdjustments,
      spectralAnomalies: spectralAnomalies.map(a => a.position)
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Spectral Analysis
  // ─────────────────────────────────────────────────────────────

  private performSpectralAnalysis(redAction: RedAIOutput): SpectralAnomaly[] {
    const anomalies: SpectralAnomaly[] = [];
    
    // Analyze the path for spectral anomalies
    redAction.path.forEach((point, i) => {
      const anomaly = this.detectSpectralAnomaly(point, redAction.camouflageProfile);
      if (anomaly) {
        anomalies.push(anomaly);
      }
    });
    
    // Analyze the hiding location specifically
    const hideAnomaly = this.detectSpectralAnomaly(
      redAction.hideLocation, 
      redAction.camouflageProfile
    );
    if (hideAnomaly) {
      hideAnomaly.severity *= 1.5; // Higher weight for final position
      anomalies.push(hideAnomaly);
    }
    
    return anomalies;
  }

  private detectSpectralAnomaly(
    position: Position, 
    camouflageProfile: SpectralSignature
  ): SpectralAnomaly | null {
    const areaReading = this.map.getFullSpectralReadingAt(position);
    
    // Calculate spectral deviation from camouflage
    const visibleDiff = Math.abs((areaReading['visible'] || 0.5) - camouflageProfile.visible);
    const irDiff = Math.abs((areaReading['near-ir'] || 0.4) - camouflageProfile.nearInfrared);
    const swDiff = Math.abs((areaReading['shortwave-ir'] || 0.3) - camouflageProfile.shortwave);
    const thermalDiff = Math.abs((areaReading['thermal'] || 0.4) - camouflageProfile.thermal);
    
    // Determine anomaly type and severity
    const maxDiff = Math.max(visibleDiff, irDiff, swDiff, thermalDiff);
    const avgDiff = (visibleDiff + irDiff + swDiff + thermalDiff) / 4;
    
    // Threshold for anomaly detection
    if (avgDiff > 0.1 || maxDiff > 0.2) {
      let type: SpectralAnomaly['type'] = 'composite';
      
      if (thermalDiff === maxDiff) type = 'thermal';
      else if (irDiff === maxDiff) type = 'infrared';
      else if (visibleDiff === maxDiff) type = 'visible';
      
      return {
        position,
        severity: clamp(avgDiff * 2 + maxDiff, 0, 1),
        type
      };
    }
    
    // Random chance of detecting even good camouflage
    if (Math.random() < 0.15) {
      return {
        position,
        severity: randomInRange(0.1, 0.3),
        type: 'composite'
      };
    }
    
    return null;
  }

  // ─────────────────────────────────────────────────────────────
  // Movement Pattern Analysis
  // ─────────────────────────────────────────────────────────────

  private analyzeMovementPattern(path: Position[]): MovementPattern {
    const suspiciousPoints: Position[] = [];
    let totalDeviation = 0;
    
    // Analyze path characteristics
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      
      // Check for suspicious movements
      const stepDistance = distance(prev, curr);
      
      // Very long steps are suspicious
      if (stepDistance > 150) {
        suspiciousPoints.push(curr);
        totalDeviation += 0.2;
      }
      
      // Movement into camera blind spots is suspicious
      const coveringCameras = this.map.getCamerasCovering(curr);
      if (coveringCameras.length === 0) {
        suspiciousPoints.push(curr);
        totalDeviation += 0.15;
      }
      
      // Movement towards shadow areas is suspicious
      const illuminance = this.map.getIlluminanceAt(curr);
      if (illuminance < 0.3) {
        suspiciousPoints.push(curr);
        totalDeviation += 0.1;
      }
      
      // Erratic direction changes
      if (i > 1) {
        const prevPrev = path[i - 2];
        const angle1 = Math.atan2(prev.y - prevPrev.y, prev.x - prevPrev.x);
        const angle2 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        const angleDiff = Math.abs(angle1 - angle2);
        
        if (angleDiff > Math.PI / 2) {
          totalDeviation += 0.1;
        }
      }
    }
    
    // Check if path avoids main roads (suspicious)
    let roadProximityCount = 0;
    path.forEach(point => {
      if (this.map.isNearRoad(point, 20)) {
        roadProximityCount++;
      }
    });
    
    const roadAvoidanceRatio = 1 - (roadProximityCount / path.length);
    if (roadAvoidanceRatio > 0.7) {
      totalDeviation += 0.2;
    }
    
    return {
      path,
      deviationScore: clamp(totalDeviation, 0, 1),
      suspiciousPoints
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Location Prediction
  // ─────────────────────────────────────────────────────────────

  private predictHidingLocation(
    anomalies: SpectralAnomaly[],
    movement: MovementPattern,
    redAction: RedAIOutput
  ): Position {
    const candidates: Array<{ position: Position; score: number }> = [];
    
    // Candidate 1: Last path point (often the destination)
    const lastPathPoint = redAction.path[redAction.path.length - 1];
    candidates.push({
      position: lastPathPoint,
      score: 0.6 + movement.deviationScore * 0.3
    });
    
    // Candidate 2: Highest severity anomaly
    if (anomalies.length > 0) {
      const maxAnomaly = anomalies.reduce((a, b) => 
        a.severity > b.severity ? a : b
      );
      candidates.push({
        position: maxAnomaly.position,
        score: maxAnomaly.severity * 0.8
      });
    }
    
    // Candidate 3: Best hiding spots based on model
    const hidingSpots = this.map.getBestHidingSpots(3);
    hidingSpots.forEach(spot => {
      // Check if any path point is near this hiding spot
      const nearPath = redAction.path.some(p => 
        distance(p, spot.position) < 80
      );
      
      if (nearPath) {
        candidates.push({
          position: spot.position,
          score: spot.concealmentLevel * 0.7 * this.predictionModel.weights.blindSpotBias
        });
      }
    });
    
    // Candidate 4: Suspicious points from movement analysis
    movement.suspiciousPoints.forEach(point => {
      candidates.push({
        position: point,
        score: 0.4 + randomInRange(0, 0.2)
      });
    });
    
    // Candidate 5: Use historical learning
    if (this.predictionModel.history.length > 5) {
      const learnedPosition = this.predictFromHistory(redAction);
      if (learnedPosition) {
        candidates.push({
          position: learnedPosition,
          score: 0.5
        });
      }
    }
    
    // Add some randomness/noise to prediction
    const noiseLevel = Math.max(0.1, 0.5 - (this.roundNumber * 0.01));
    
    // Select best candidate with noise
    let bestCandidate = candidates[0];
    candidates.forEach(c => {
      const adjustedScore = c.score + randomInRange(-noiseLevel, noiseLevel);
      if (adjustedScore > bestCandidate.score) {
        bestCandidate = c;
      }
    });
    
    // Add small random offset to prediction
    return {
      x: clamp(bestCandidate.position.x + randomInt(-20, 20), 10, this.map.width - 10),
      y: clamp(bestCandidate.position.y + randomInt(-20, 20), 10, this.map.height - 10)
    };
  }

  private predictFromHistory(redAction: RedAIOutput): Position | null {
    if (this.predictionModel.history.length < 3) return null;
    
    // Use recent history to identify patterns
    const recentErrors = this.predictionModel.history.slice(-10);
    
    // Calculate average offset between predictions and actuals
    let avgOffsetX = 0;
    let avgOffsetY = 0;
    
    recentErrors.forEach(h => {
      avgOffsetX += h.actual.x - h.predicted.x;
      avgOffsetY += h.actual.y - h.predicted.y;
    });
    
    avgOffsetX /= recentErrors.length;
    avgOffsetY /= recentErrors.length;
    
    // Apply learned offset to last path point
    const lastPoint = redAction.path[redAction.path.length - 1];
    
    return {
      x: lastPoint.x + avgOffsetX * 0.5,
      y: lastPoint.y + avgOffsetY * 0.5
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Confidence Calculation
  // ─────────────────────────────────────────────────────────────

  private calculateConfidence(
    anomalies: SpectralAnomaly[],
    movement: MovementPattern,
    predicted: Position,
    actual: Position
  ): number {
    let confidence = 0.3; // Base confidence
    
    // Add confidence from spectral anomalies
    if (anomalies.length > 0) {
      const maxSeverity = Math.max(...anomalies.map(a => a.severity));
      confidence += maxSeverity * 0.3;
    }
    
    // Add confidence from movement analysis
    confidence += movement.deviationScore * 0.25;
    
    // Camera coverage at predicted location
    const cameras = this.map.getCamerasCovering(predicted);
    const spectralCameras = cameras.filter(c => c.spectralCapability);
    
    if (cameras.length > 0) {
      confidence += 0.1 + (spectralCameras.length * 0.05);
    }
    
    // Illuminance at predicted location
    const illuminance = this.map.getIlluminanceAt(predicted);
    confidence += illuminance * 0.1;
    
    // Learning bonus (confidence increases with experience)
    const roundBonus = Math.min(0.1, this.roundNumber * 0.001);
    confidence += roundBonus;
    
    // Detection history bonus
    const recentDetections = this.detectionHistory.slice(-10)
      .filter(d => d.detected).length;
    confidence += recentDetections * 0.01;
    
    return clamp(confidence, 0, 1);
  }

  // ─────────────────────────────────────────────────────────────
  // Detection Determination
  // ─────────────────────────────────────────────────────────────

  private determineDetection(
    confidence: number,
    predicted: Position,
    actual: Position
  ): boolean {
    const predictionError = distance(predicted, actual);
    
    // Detection threshold based on confidence
    const detectionRadius = 100 - (confidence * 60); // 40-100 units
    
    if (predictionError <= detectionRadius) {
      // Close enough - roll for detection based on confidence
      const detectionChance = confidence * 0.8 + 0.1; // 10-90% based on confidence
      return Math.random() < detectionChance;
    }
    
    // Far from actual - small chance of lucky detection
    const luckyChance = Math.max(0.05, 0.3 - (predictionError / 500));
    return Math.random() < luckyChance;
  }

  // ─────────────────────────────────────────────────────────────
  // Adaptive Illuminance
  // ─────────────────────────────────────────────────────────────

  private adjustIlluminance(
    anomalies: SpectralAnomaly[],
    suspiciousPoints: Position[]
  ): Map<string, number> {
    const adjustments = new Map<string, number>();
    
    // Increase illuminance around anomalies (subtle increase)
    anomalies.forEach(anomaly => {
      this.map.increaseIlluminanceAround(
        anomaly.position,
        80,
        anomaly.severity * 0.1 // Subtle increase
      );
    });
    
    // Increase around suspicious points
    suspiciousPoints.forEach(point => {
      this.map.increaseIlluminanceAround(point, 60, 0.05);
    });
    
    // Record adjustments for output
    const buildings = this.map.getBuildings();
    buildings.forEach(b => {
      const illuminance = this.map.getIlluminanceState().zones.get(b.id);
      if (illuminance) {
        adjustments.set(b.id, illuminance);
      }
    });
    
    return adjustments;
  }

  // ─────────────────────────────────────────────────────────────
  // Reasoning Generation
  // ─────────────────────────────────────────────────────────────

  private generateReasoning(
    anomalies: SpectralAnomaly[],
    movement: MovementPattern,
    detected: boolean,
    confidence: number
  ): string {
    const reasons: string[] = [];
    
    // Spectral analysis findings
    if (anomalies.length > 0) {
      const types = [...new Set(anomalies.map(a => a.type))];
      reasons.push(`Detected ${anomalies.length} spectral anomal${anomalies.length > 1 ? 'ies' : 'y'} (${types.join(', ')})`);
      
      const maxSeverity = Math.max(...anomalies.map(a => a.severity));
      if (maxSeverity > 0.6) {
        reasons.push('High-severity spectral deviation detected');
      }
    }
    
    // Movement analysis findings
    if (movement.deviationScore > 0.5) {
      reasons.push('Suspicious movement pattern detected');
    }
    
    if (movement.suspiciousPoints.length > 0) {
      reasons.push(`${movement.suspiciousPoints.length} suspicious waypoints identified`);
    }
    
    // Camera coverage analysis
    reasons.push(`Confidence level: ${(confidence * 100).toFixed(1)}%`);
    
    // Detection result
    if (detected) {
      reasons.push('ALERT: Threat detected and localized');
    } else {
      reasons.push('Threat not definitively confirmed');
    }
    
    return reasons.join('. ');
  }

  // ─────────────────────────────────────────────────────────────
  // Learning / Adaptation
  // ─────────────────────────────────────────────────────────────

  /**
   * Update model based on actual result
   */
  recordActualResult(predicted: Position, actual: Position): void {
    const error = distance(predicted, actual);
    
    this.predictionModel.history.push({
      predicted,
      actual,
      error
    });
    
    // Keep history manageable
    if (this.predictionModel.history.length > 100) {
      this.predictionModel.history = this.predictionModel.history.slice(-50);
    }
    
    // Adjust model weights based on error
    if (error > 100) {
      // Large error - adjust weights
      const actualSpot = this.analyzeLocationCharacteristics(actual);
      
      if (actualSpot.isBlindSpot) {
        this.predictionModel.weights.blindSpotBias += this.learningRate;
      }
      if (actualSpot.isInShadow) {
        this.predictionModel.weights.shadowBias += this.learningRate;
      }
      if (actualSpot.nearBuilding) {
        this.predictionModel.weights.buildingCornerBias += this.learningRate;
      }
      if (actualSpot.nearAlley) {
        this.predictionModel.weights.alleyBias += this.learningRate;
      }
      
      // Normalize weights
      const totalWeight = Object.values(this.predictionModel.weights)
        .reduce((a, b) => a + b, 0);
      
      Object.keys(this.predictionModel.weights).forEach(key => {
        this.predictionModel.weights[key as keyof typeof this.predictionModel.weights] /= totalWeight;
      });
    }
  }

  private analyzeLocationCharacteristics(position: Position): {
    isBlindSpot: boolean;
    isInShadow: boolean;
    nearBuilding: boolean;
    nearAlley: boolean;
  } {
    const cameras = this.map.getCamerasCovering(position);
    const illuminance = this.map.getIlluminanceAt(position);
    const buildings = this.map.getBuildings();
    const roads = this.map.getRoads();
    
    const nearBuilding = buildings.some(b => {
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      return distance(position, { x: cx, y: cy }) < Math.max(b.width, b.height) * 1.2;
    });
    
    const nearAlley = roads.some(r => 
      r.type === 'alley' && 
      r.points.some(p => distance(position, p) < 30)
    );
    
    return {
      isBlindSpot: cameras.length === 0,
      isInShadow: illuminance < 0.35,
      nearBuilding,
      nearAlley
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Statistics & State
  // ─────────────────────────────────────────────────────────────

  /**
   * Get detection rate over recent rounds
   */
  getDetectionRate(window: number = 50): number {
    const recent = this.detectionHistory.slice(-window);
    if (recent.length === 0) return 0;
    
    const detected = recent.filter(d => d.detected).length;
    return detected / recent.length;
  }

  /**
   * Get confidence trend
   */
  getConfidenceTrend(): number[] {
    return this.detectionHistory.map(d => d.confidence);
  }

  /**
   * Get average prediction error
   */
  getAveragePredictionError(window: number = 20): number {
    const recent = this.predictionModel.history.slice(-window);
    if (recent.length === 0) return 0;
    
    const totalError = recent.reduce((sum, h) => sum + h.error, 0);
    return totalError / recent.length;
  }

  /**
   * Reset the agent
   */
  reset(): void {
    this.roundNumber = 0;
    this.detectionHistory = [];
    this.predictionModel.history = [];
    this.suspiciousAreas = [];
    this.initializeBaseline();
  }

  /**
   * Get current model weights
   */
  getModelWeights(): Record<string, number> {
    return { ...this.predictionModel.weights };
  }
}

export default BlueAI;
