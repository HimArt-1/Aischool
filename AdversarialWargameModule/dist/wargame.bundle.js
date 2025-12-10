/**
 * SCAR-EYE Adversarial Wargame Module
 * Standalone Bundle v1.0.0
 * 
 * Educational simulation only - No real operations
 */

(function(global) {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(randomInRange(min, max + 1));
  }

  function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // MOCK DATA GENERATORS
  // ═══════════════════════════════════════════════════════════════

  function generateMockBuildings(mapWidth, mapHeight) {
    const buildings = [];
    const buildingTypes = ['residential', 'commercial', 'industrial', 'government'];
    const gridSize = 120;
    const buildingPadding = 30;

    for (let gx = 0; gx < mapWidth / gridSize; gx++) {
      for (let gy = 0; gy < mapHeight / gridSize; gy++) {
        if (Math.random() > 0.3) {
          const baseX = gx * gridSize + buildingPadding;
          const baseY = gy * gridSize + buildingPadding;
          buildings.push({
            id: `building-${gx}-${gy}`,
            x: baseX + randomInt(-10, 10),
            y: baseY + randomInt(-10, 10),
            width: randomInt(40, 80),
            height: randomInt(40, 80),
            type: randomChoice(buildingTypes),
            floors: randomInt(1, 8),
            shadowCoverage: randomInRange(0.2, 0.7)
          });
        }
      }
    }
    return buildings;
  }

  function generateMockRoads(mapWidth, mapHeight) {
    const roads = [];
    
    // Horizontal roads
    for (let i = 1; i <= 3; i++) {
      const y = (mapHeight / 4) * i;
      roads.push({
        id: `road-h-${i}`,
        points: [
          { x: 0, y: y + randomInt(-5, 5) },
          { x: mapWidth * 0.3, y: y + randomInt(-3, 3) },
          { x: mapWidth * 0.7, y: y + randomInt(-3, 3) },
          { x: mapWidth, y: y + randomInt(-5, 5) }
        ],
        width: i === 2 ? 25 : 15,
        type: i === 2 ? 'main' : 'secondary'
      });
    }

    // Vertical roads
    for (let i = 1; i <= 3; i++) {
      const x = (mapWidth / 4) * i;
      roads.push({
        id: `road-v-${i}`,
        points: [
          { x: x + randomInt(-5, 5), y: 0 },
          { x: x + randomInt(-3, 3), y: mapHeight * 0.3 },
          { x: x + randomInt(-3, 3), y: mapHeight * 0.7 },
          { x: x + randomInt(-5, 5), y: mapHeight }
        ],
        width: i === 2 ? 25 : 15,
        type: i === 2 ? 'main' : 'secondary'
      });
    }

    // Alleys
    for (let i = 0; i < 8; i++) {
      const isHorizontal = Math.random() > 0.5;
      if (isHorizontal) {
        const y = randomInt(50, mapHeight - 50);
        roads.push({
          id: `alley-${i}`,
          points: [
            { x: randomInt(0, mapWidth * 0.3), y },
            { x: randomInt(mapWidth * 0.4, mapWidth * 0.6), y }
          ],
          width: 8,
          type: 'alley'
        });
      } else {
        const x = randomInt(50, mapWidth - 50);
        roads.push({
          id: `alley-${i}`,
          points: [
            { x, y: randomInt(0, mapHeight * 0.3) },
            { x, y: randomInt(mapHeight * 0.4, mapHeight * 0.6) }
          ],
          width: 8,
          type: 'alley'
        });
      }
    }

    return roads;
  }

  function generateMockCameras(buildings, mapWidth, mapHeight) {
    const cameras = [];
    const cameraBuildingCount = Math.floor(buildings.length * 0.3);
    const selectedBuildings = [...buildings].sort(() => Math.random() - 0.5).slice(0, cameraBuildingCount);

    selectedBuildings.forEach((building, i) => {
      cameras.push({
        id: `camera-${i}`,
        position: { x: building.x + building.width / 2, y: building.y + building.height / 2 },
        fieldOfView: randomInt(60, 120),
        direction: randomInt(0, 360),
        range: randomInt(80, 150),
        spectralCapability: Math.random() > 0.6
      });
    });

    for (let i = 0; i < 6; i++) {
      cameras.push({
        id: `street-camera-${i}`,
        position: { x: randomInt(50, mapWidth - 50), y: randomInt(50, mapHeight - 50) },
        fieldOfView: 90,
        direction: randomInt(0, 360),
        range: 100,
        spectralCapability: Math.random() > 0.7
      });
    }

    return cameras;
  }

  function generateMockHidingSpots(buildings, cameras, mapWidth, mapHeight) {
    const hidingSpots = [];

    buildings.forEach((building, bi) => {
      const corners = [
        { x: building.x - 5, y: building.y - 5 },
        { x: building.x + building.width + 5, y: building.y - 5 },
        { x: building.x - 5, y: building.y + building.height + 5 },
        { x: building.x + building.width + 5, y: building.y + building.height + 5 }
      ];

      corners.forEach((corner, ci) => {
        if (corner.x > 0 && corner.x < mapWidth && corner.y > 0 && corner.y < mapHeight) {
          let minCameraDist = Infinity;
          cameras.forEach(cam => {
            const d = distance(corner, cam.position);
            if (d < minCameraDist) minCameraDist = d;
          });

          hidingSpots.push({
            id: `hiding-${bi}-${ci}`,
            position: corner,
            concealmentLevel: randomInRange(0.4, 0.9),
            spectralDifficulty: randomInRange(0.3, 0.8),
            nearestCameraDistance: minCameraDist,
            isInShadow: building.shadowCoverage > 0.5 && Math.random() > 0.4
          });
        }
      });
    });

    for (let i = 0; i < 15; i++) {
      const pos = { x: randomInt(20, mapWidth - 20), y: randomInt(20, mapHeight - 20) };
      let minCameraDist = Infinity;
      cameras.forEach(cam => {
        const d = distance(pos, cam.position);
        if (d < minCameraDist) minCameraDist = d;
      });

      hidingSpots.push({
        id: `hiding-random-${i}`,
        position: pos,
        concealmentLevel: randomInRange(0.2, 0.6),
        spectralDifficulty: randomInRange(0.2, 0.6),
        nearestCameraDistance: minCameraDist,
        isInShadow: Math.random() > 0.6
      });
    }

    return hidingSpots;
  }

  function generateMockSpectralLayers(mapWidth, mapHeight, gridResolution) {
    gridResolution = gridResolution || 20;
    const gridWidth = Math.ceil(mapWidth / gridResolution);
    const gridHeight = Math.ceil(mapHeight / gridResolution);

    function createIntensityMap(baseValue, variance) {
      const map = [];
      for (let y = 0; y < gridHeight; y++) {
        const row = [];
        for (let x = 0; x < gridWidth; x++) {
          row.push(clamp(baseValue + randomInRange(-variance, variance), 0, 1));
        }
        map.push(row);
      }
      return map;
    }

    return [
      { id: 'visible', name: 'Visible Spectrum', wavelengthRange: [400, 700], intensityMap: createIntensityMap(0.6, 0.2) },
      { id: 'near-ir', name: 'Near Infrared', wavelengthRange: [700, 1000], intensityMap: createIntensityMap(0.4, 0.3) },
      { id: 'shortwave-ir', name: 'Shortwave IR', wavelengthRange: [1000, 2500], intensityMap: createIntensityMap(0.3, 0.25) },
      { id: 'thermal', name: 'Thermal IR', wavelengthRange: [8000, 14000], intensityMap: createIntensityMap(0.5, 0.15) }
    ];
  }

  // ═══════════════════════════════════════════════════════════════
  // DIGITAL TWIN MAP
  // ═══════════════════════════════════════════════════════════════

  class DigitalTwinMap {
    constructor(config) {
      config = config || {};
      this.width = config.mapWidth || 800;
      this.height = config.mapHeight || 600;
      this.gridResolution = 20;
      
      this.illuminanceState = {
        ambient: 0.3,
        artificial: 0.5,
        adaptive: config.adaptiveLightingEnabled !== false,
        zones: new Map()
      };

      this._initializeMap();
    }

    _initializeMap() {
      this.buildings = generateMockBuildings(this.width, this.height);
      this.roads = generateMockRoads(this.width, this.height);
      this.cameras = generateMockCameras(this.buildings, this.width, this.height);
      this.hidingSpots = generateMockHidingSpots(this.buildings, this.cameras, this.width, this.height);
      this.spectralLayers = generateMockSpectralLayers(this.width, this.height, this.gridResolution);

      this.buildings.forEach(building => {
        this.illuminanceState.zones.set(building.id, randomInRange(0.3, 0.7));
      });
    }

    getBuildings() { return [...this.buildings]; }
    getRoads() { return [...this.roads]; }
    getCameras() { return [...this.cameras]; }
    getHidingSpots() { return [...this.hidingSpots]; }
    getSpectralLayers() { return [...this.spectralLayers]; }
    getIlluminanceState() { return { ...this.illuminanceState, zones: new Map(this.illuminanceState.zones) }; }

    getSpectralIntensityAt(position, layerId) {
      const layer = this.spectralLayers.find(l => l.id === layerId);
      if (!layer) return 0;
      
      const gridX = Math.floor(position.x / this.gridResolution);
      const gridY = Math.floor(position.y / this.gridResolution);
      
      if (gridY >= 0 && gridY < layer.intensityMap.length && gridX >= 0 && gridX < layer.intensityMap[0].length) {
        return layer.intensityMap[gridY][gridX];
      }
      return 0;
    }

    getFullSpectralReadingAt(position) {
      const readings = {};
      this.spectralLayers.forEach(layer => {
        readings[layer.id] = this.getSpectralIntensityAt(position, layer.id);
      });
      return readings;
    }

    getIlluminanceAt(position) {
      let illuminance = this.illuminanceState.ambient + this.illuminanceState.artificial;
      
      this.buildings.forEach(building => {
        const buildingCenter = { x: building.x + building.width / 2, y: building.y + building.height / 2 };
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

    increaseIlluminanceAround(position, radius, amount) {
      if (!this.illuminanceState.adaptive) return;
      
      this.buildings.forEach(building => {
        const buildingCenter = { x: building.x + building.width / 2, y: building.y + building.height / 2 };
        if (distance(position, buildingCenter) < radius) {
          const current = this.illuminanceState.zones.get(building.id) || 0.5;
          this.illuminanceState.zones.set(building.id, clamp(current + amount, 0, 1));
        }
      });
    }

    getBestHidingSpots(count) {
      count = count || 5;
      return [...this.hidingSpots]
        .sort((a, b) => {
          const scoreA = a.concealmentLevel * 0.3 + Math.min(a.nearestCameraDistance / 200, 1) * 0.4 + (a.isInShadow ? 0.3 : 0);
          const scoreB = b.concealmentLevel * 0.3 + Math.min(b.nearestCameraDistance / 200, 1) * 0.4 + (b.isInShadow ? 0.3 : 0);
          return scoreB - scoreA;
        })
        .slice(0, count);
    }

    isInCameraView(position, camera) {
      const dist = distance(position, camera.position);
      if (dist > camera.range) return false;
      
      const angle = Math.atan2(position.y - camera.position.y, position.x - camera.position.x) * (180 / Math.PI);
      let normalizedAngle = angle - camera.direction;
      while (normalizedAngle > 180) normalizedAngle -= 360;
      while (normalizedAngle < -180) normalizedAngle += 360;
      
      return Math.abs(normalizedAngle) <= camera.fieldOfView / 2;
    }

    getCamerasCovering(position) {
      return this.cameras.filter(cam => this.isInCameraView(position, cam));
    }

    getBlindSpots() {
      const blindSpots = [];
      const checkResolution = 50;
      
      for (let x = 0; x < this.width; x += checkResolution) {
        for (let y = 0; y < this.height; y += checkResolution) {
          if (this.getCamerasCovering({ x, y }).length === 0) {
            blindSpots.push({ x, y });
          }
        }
      }
      return blindSpots;
    }

    isNearRoad(position, threshold) {
      threshold = threshold || 15;
      for (const road of this.roads) {
        for (let i = 0; i < road.points.length - 1; i++) {
          const dist = this._pointToLineDistance(position, road.points[i], road.points[i + 1]);
          if (dist < road.width / 2 + threshold) return true;
        }
      }
      return false;
    }

    _pointToLineDistance(point, lineStart, lineEnd) {
      const A = point.x - lineStart.x;
      const B = point.y - lineStart.y;
      const C = lineEnd.x - lineStart.x;
      const D = lineEnd.y - lineStart.y;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = lenSq !== 0 ? dot / lenSq : -1;
      
      let xx, yy;
      if (param < 0) { xx = lineStart.x; yy = lineStart.y; }
      else if (param > 1) { xx = lineEnd.x; yy = lineEnd.y; }
      else { xx = lineStart.x + param * C; yy = lineStart.y + param * D; }
      
      return Math.sqrt((point.x - xx) ** 2 + (point.y - yy) ** 2);
    }

    reset() { this._initializeMap(); }

    getState() {
      return {
        width: this.width,
        height: this.height,
        buildings: this.buildings,
        roads: this.roads,
        cameras: this.cameras,
        hidingSpots: this.hidingSpots,
        illuminanceState: { ...this.illuminanceState, zones: Object.fromEntries(this.illuminanceState.zones) }
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RED-AI AGENT
  // ═══════════════════════════════════════════════════════════════

  class RedAI {
    constructor(map) {
      this.map = map;
      this.roundNumber = 0;
      this.learningRate = 0.1;
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

    generateAttempt() {
      this.roundNumber++;
      const strategy = this._selectStrategy();
      const hideLocation = this._selectHidingLocation(strategy);
      const path = this._generatePath(hideLocation, strategy);
      const camouflageProfile = this._generateCamouflage(hideLocation);
      const exploitedWeaknesses = this._analyzeExploitedWeaknesses(hideLocation, strategy);

      return { hideLocation, camouflageProfile, path, strategy, exploitedWeaknesses };
    }

    _selectStrategy() {
      const strategies = Object.keys(this.strategyWeights);
      const totalWeight = strategies.reduce((sum, s) => sum + this.strategyWeights[s], 0);
      let random = Math.random() * totalWeight;
      
      for (const strategy of strategies) {
        random -= this.strategyWeights[strategy];
        if (random <= 0) return strategy;
      }
      return 'RANDOM_CHAOS';
    }

    _selectHidingLocation(strategy) {
      const hidingSpots = this.map.getHidingSpots();
      const blindSpots = this.map.getBlindSpots();
      const buildings = this.map.getBuildings();

      switch (strategy) {
        case 'EXPLOIT_BLIND_SPOT':
          if (blindSpots.length > 0) {
            const spot = randomChoice(blindSpots);
            return this._clampToMap({ x: spot.x + randomInt(-20, 20), y: spot.y + randomInt(-20, 20) });
          }
          break;
        case 'SHADOW_LURK':
          const shadowSpots = hidingSpots.filter(s => s.isInShadow);
          if (shadowSpots.length > 0) {
            const best = shadowSpots.reduce((a, b) => a.concealmentLevel > b.concealmentLevel ? a : b);
            return { x: best.position.x + randomInt(-10, 10), y: best.position.y + randomInt(-10, 10) };
          }
          break;
        case 'SPECTRAL_MIMICRY':
          const best = hidingSpots.reduce((a, b) => a.spectralDifficulty > b.spectralDifficulty ? a : b);
          return { x: best.position.x + randomInt(-15, 15), y: best.position.y + randomInt(-15, 15) };
        case 'ALLEY_SNEAK':
          const alleys = this.map.getRoads().filter(r => r.type === 'alley');
          if (alleys.length > 0) {
            const alley = randomChoice(alleys);
            const point = randomChoice(alley.points);
            return { x: point.x + randomInt(-5, 5), y: point.y + randomInt(-5, 5) };
          }
          break;
        case 'BUILDING_COVER':
          if (buildings.length > 0) {
            const building = randomChoice(buildings);
            const corners = [
              { x: building.x - 5, y: building.y - 5 },
              { x: building.x + building.width + 5, y: building.y - 5 },
              { x: building.x - 5, y: building.y + building.height + 5 },
              { x: building.x + building.width + 5, y: building.y + building.height + 5 }
            ];
            return this._clampToMap(randomChoice(corners));
          }
          break;
      }
      return { x: randomInt(20, this.map.width - 20), y: randomInt(20, this.map.height - 20) };
    }

    _generatePath(target, strategy) {
      const path = [];
      const edges = [
        { x: 0, y: randomInt(50, this.map.height - 50) },
        { x: this.map.width, y: randomInt(50, this.map.height - 50) },
        { x: randomInt(50, this.map.width - 50), y: 0 },
        { x: randomInt(50, this.map.width - 50), y: this.map.height }
      ];
      
      let current = randomChoice(edges);
      path.push(current);
      
      const numWaypoints = randomInt(3, 7);
      for (let i = 0; i < numWaypoints; i++) {
        let nextX = current.x + (target.x - current.x) * (0.5 + Math.random() * 0.3);
        let nextY = current.y + (target.y - current.y) * (0.5 + Math.random() * 0.3);
        
        if (strategy === 'RANDOM_CHAOS') {
          nextX += randomInt(-80, 80);
          nextY += randomInt(-80, 80);
        } else {
          nextX += randomInt(-20, 20);
          nextY += randomInt(-20, 20);
        }
        
        current = this._clampToMap({ x: nextX, y: nextY });
        path.push(current);
      }
      
      path.push(target);
      return path;
    }

    _generateCamouflage(location) {
      const areaSpectral = this.map.getFullSpectralReadingAt(location);
      return {
        visible: clamp((areaSpectral['visible'] || 0.5) + randomInRange(-0.1, 0.1), 0, 1),
        nearInfrared: clamp((areaSpectral['near-ir'] || 0.4) + randomInRange(-0.15, 0.15), 0, 1),
        shortwave: clamp((areaSpectral['shortwave-ir'] || 0.3) + randomInRange(-0.2, 0.2), 0, 1),
        thermal: clamp((areaSpectral['thermal'] || 0.4) + randomInRange(-0.1, 0.1), 0, 1)
      };
    }

    _analyzeExploitedWeaknesses(location, strategy) {
      const weaknesses = [];
      const coveringCameras = this.map.getCamerasCovering(location);
      
      if (coveringCameras.length === 0) weaknesses.push('Camera blind spot');
      else if (coveringCameras.length === 1) weaknesses.push('Minimal camera coverage');
      
      if (this.map.getIlluminanceAt(location) < 0.3) weaknesses.push('Low illumination zone');
      
      const strategyWeaknesses = {
        'EXPLOIT_BLIND_SPOT': 'Surveillance gap exploitation',
        'SHADOW_LURK': 'Shadow concealment',
        'SPECTRAL_MIMICRY': 'Spectral signature blending',
        'ALLEY_SNEAK': 'Narrow passage approach',
        'BUILDING_COVER': 'Structural obstruction'
      };
      if (strategyWeaknesses[strategy]) weaknesses.push(strategyWeaknesses[strategy]);
      
      return weaknesses;
    }

    recordResult(location, wasDetected, strategy) {
      this.attemptHistory.push({ location, wasDetected, strategy });
      
      if (wasDetected) {
        this.strategyWeights[strategy] = Math.max(0.1, this.strategyWeights[strategy] - this.learningRate);
      } else {
        this.strategyWeights[strategy] = Math.min(2.0, this.strategyWeights[strategy] + this.learningRate * 1.5);
      }
    }

    _clampToMap(position) {
      return { x: clamp(position.x, 10, this.map.width - 10), y: clamp(position.y, 10, this.map.height - 10) };
    }

    reset() {
      this.roundNumber = 0;
      this.attemptHistory = [];
      this.strategyWeights = {
        'EXPLOIT_BLIND_SPOT': 1.0, 'SHADOW_LURK': 1.0, 'SPECTRAL_MIMICRY': 1.0,
        'RANDOM_CHAOS': 0.5, 'ALLEY_SNEAK': 1.0, 'BUILDING_COVER': 1.0
      };
    }

    getStrategyWeights() { return { ...this.strategyWeights }; }
    getHistory() { return [...this.attemptHistory]; }
  }

  // ═══════════════════════════════════════════════════════════════
  // BLUE-AI AGENT (SCAR-EYE)
  // ═══════════════════════════════════════════════════════════════

  class BlueAI {
    constructor(map) {
      this.map = map;
      this.roundNumber = 0;
      this.learningRate = 0.15;
      this.predictionModel = {
        weights: { blindSpotBias: 0.3, shadowBias: 0.25, buildingCornerBias: 0.2, alleyBias: 0.15, randomBias: 0.1 },
        history: []
      };
      this.spectralBaseline = new Map();
      this.detectionHistory = [];
      this._initializeBaseline();
    }

    _initializeBaseline() {
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          const x = (this.map.width / 20) * i;
          const y = (this.map.height / 20) * j;
          const key = `${Math.floor(x / 50)}-${Math.floor(y / 50)}`;
          const reading = this.map.getFullSpectralReadingAt({ x, y });
          const avgIntensity = Object.values(reading).reduce((a, b) => a + b, 0) / 4;
          this.spectralBaseline.set(key, avgIntensity);
        }
      }
    }

    analyze(redAction) {
      this.roundNumber++;
      
      const spectralAnomalies = this._performSpectralAnalysis(redAction);
      const movementAnalysis = this._analyzeMovementPattern(redAction.path);
      const predictedLocation = this._predictHidingLocation(spectralAnomalies, movementAnalysis, redAction);
      const confidence = this._calculateConfidence(spectralAnomalies, movementAnalysis, predictedLocation, redAction.hideLocation);
      const detected = this._determineDetection(confidence, predictedLocation, redAction.hideLocation);
      const illuminanceAdjustments = this._adjustIlluminance(spectralAnomalies, movementAnalysis.suspiciousPoints);
      const reasoning = this._generateReasoning(spectralAnomalies, movementAnalysis, detected, confidence);

      this.detectionHistory.push({ roundNumber: this.roundNumber, detected, confidence, predictionError: distance(predictedLocation, redAction.hideLocation) });

      return { detected, confidence, predictedLocation, reasoning, illuminanceAdjustments, spectralAnomalies: spectralAnomalies.map(a => a.position) };
    }

    _performSpectralAnalysis(redAction) {
      const anomalies = [];
      
      redAction.path.forEach(point => {
        const anomaly = this._detectSpectralAnomaly(point, redAction.camouflageProfile);
        if (anomaly) anomalies.push(anomaly);
      });
      
      const hideAnomaly = this._detectSpectralAnomaly(redAction.hideLocation, redAction.camouflageProfile);
      if (hideAnomaly) {
        hideAnomaly.severity *= 1.5;
        anomalies.push(hideAnomaly);
      }
      
      return anomalies;
    }

    _detectSpectralAnomaly(position, camouflageProfile) {
      const areaReading = this.map.getFullSpectralReadingAt(position);
      
      const visibleDiff = Math.abs((areaReading['visible'] || 0.5) - camouflageProfile.visible);
      const irDiff = Math.abs((areaReading['near-ir'] || 0.4) - camouflageProfile.nearInfrared);
      const swDiff = Math.abs((areaReading['shortwave-ir'] || 0.3) - camouflageProfile.shortwave);
      const thermalDiff = Math.abs((areaReading['thermal'] || 0.4) - camouflageProfile.thermal);
      
      const maxDiff = Math.max(visibleDiff, irDiff, swDiff, thermalDiff);
      const avgDiff = (visibleDiff + irDiff + swDiff + thermalDiff) / 4;
      
      if (avgDiff > 0.1 || maxDiff > 0.2) {
        let type = 'composite';
        if (thermalDiff === maxDiff) type = 'thermal';
        else if (irDiff === maxDiff) type = 'infrared';
        else if (visibleDiff === maxDiff) type = 'visible';
        
        return { position, severity: clamp(avgDiff * 2 + maxDiff, 0, 1), type };
      }
      
      if (Math.random() < 0.15) {
        return { position, severity: randomInRange(0.1, 0.3), type: 'composite' };
      }
      
      return null;
    }

    _analyzeMovementPattern(path) {
      const suspiciousPoints = [];
      let totalDeviation = 0;
      
      for (let i = 1; i < path.length; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        const stepDistance = distance(prev, curr);
        
        if (stepDistance > 150) { suspiciousPoints.push(curr); totalDeviation += 0.2; }
        if (this.map.getCamerasCovering(curr).length === 0) { suspiciousPoints.push(curr); totalDeviation += 0.15; }
        if (this.map.getIlluminanceAt(curr) < 0.3) { suspiciousPoints.push(curr); totalDeviation += 0.1; }
      }
      
      return { path, deviationScore: clamp(totalDeviation, 0, 1), suspiciousPoints };
    }

    _predictHidingLocation(anomalies, movement, redAction) {
      const candidates = [];
      
      const lastPathPoint = redAction.path[redAction.path.length - 1];
      candidates.push({ position: lastPathPoint, score: 0.6 + movement.deviationScore * 0.3 });
      
      if (anomalies.length > 0) {
        const maxAnomaly = anomalies.reduce((a, b) => a.severity > b.severity ? a : b);
        candidates.push({ position: maxAnomaly.position, score: maxAnomaly.severity * 0.8 });
      }
      
      const hidingSpots = this.map.getBestHidingSpots(3);
      hidingSpots.forEach(spot => {
        const nearPath = redAction.path.some(p => distance(p, spot.position) < 80);
        if (nearPath) {
          candidates.push({ position: spot.position, score: spot.concealmentLevel * 0.7 * this.predictionModel.weights.blindSpotBias });
        }
      });
      
      movement.suspiciousPoints.forEach(point => {
        candidates.push({ position: point, score: 0.4 + randomInRange(0, 0.2) });
      });
      
      const noiseLevel = Math.max(0.1, 0.5 - (this.roundNumber * 0.01));
      
      let bestCandidate = candidates[0];
      candidates.forEach(c => {
        const adjustedScore = c.score + randomInRange(-noiseLevel, noiseLevel);
        if (adjustedScore > bestCandidate.score) bestCandidate = c;
      });
      
      return {
        x: clamp(bestCandidate.position.x + randomInt(-20, 20), 10, this.map.width - 10),
        y: clamp(bestCandidate.position.y + randomInt(-20, 20), 10, this.map.height - 10)
      };
    }

    _calculateConfidence(anomalies, movement, predicted, actual) {
      let confidence = 0.3;
      
      if (anomalies.length > 0) {
        const maxSeverity = Math.max(...anomalies.map(a => a.severity));
        confidence += maxSeverity * 0.3;
      }
      
      confidence += movement.deviationScore * 0.25;
      
      const cameras = this.map.getCamerasCovering(predicted);
      const spectralCameras = cameras.filter(c => c.spectralCapability);
      if (cameras.length > 0) confidence += 0.1 + (spectralCameras.length * 0.05);
      
      confidence += this.map.getIlluminanceAt(predicted) * 0.1;
      confidence += Math.min(0.1, this.roundNumber * 0.001);
      
      return clamp(confidence, 0, 1);
    }

    _determineDetection(confidence, predicted, actual) {
      const predictionError = distance(predicted, actual);
      const detectionRadius = 100 - (confidence * 60);
      
      if (predictionError <= detectionRadius) {
        const detectionChance = confidence * 0.8 + 0.1;
        return Math.random() < detectionChance;
      }
      
      const luckyChance = Math.max(0.05, 0.3 - (predictionError / 500));
      return Math.random() < luckyChance;
    }

    _adjustIlluminance(anomalies, suspiciousPoints) {
      const adjustments = new Map();
      
      anomalies.forEach(anomaly => {
        this.map.increaseIlluminanceAround(anomaly.position, 80, anomaly.severity * 0.1);
      });
      
      suspiciousPoints.forEach(point => {
        this.map.increaseIlluminanceAround(point, 60, 0.05);
      });
      
      return adjustments;
    }

    _generateReasoning(anomalies, movement, detected, confidence) {
      const reasons = [];
      
      if (anomalies.length > 0) {
        const types = [...new Set(anomalies.map(a => a.type))];
        reasons.push(`Detected ${anomalies.length} spectral anomal${anomalies.length > 1 ? 'ies' : 'y'} (${types.join(', ')})`);
      }
      
      if (movement.deviationScore > 0.5) reasons.push('Suspicious movement pattern detected');
      if (movement.suspiciousPoints.length > 0) reasons.push(`${movement.suspiciousPoints.length} suspicious waypoints identified`);
      
      reasons.push(`Confidence level: ${(confidence * 100).toFixed(1)}%`);
      reasons.push(detected ? 'ALERT: Threat detected and localized' : 'Threat not definitively confirmed');
      
      return reasons.join('. ');
    }

    recordActualResult(predicted, actual) {
      const error = distance(predicted, actual);
      this.predictionModel.history.push({ predicted, actual, error });
      if (this.predictionModel.history.length > 100) {
        this.predictionModel.history = this.predictionModel.history.slice(-50);
      }
    }

    getDetectionRate(window) {
      window = window || 50;
      const recent = this.detectionHistory.slice(-window);
      if (recent.length === 0) return 0;
      return recent.filter(d => d.detected).length / recent.length;
    }

    getConfidenceTrend() {
      return this.detectionHistory.map(d => d.confidence);
    }

    reset() {
      this.roundNumber = 0;
      this.detectionHistory = [];
      this.predictionModel.history = [];
      this._initializeBaseline();
    }

    getModelWeights() { return { ...this.predictionModel.weights }; }
  }

  // ═══════════════════════════════════════════════════════════════
  // SIMULATION ENGINE
  // ═══════════════════════════════════════════════════════════════

  class SimulationEngine {
    constructor(config) {
      config = config || {};
      this.config = {
        totalRounds: config.totalRounds || 200,
        mapWidth: config.mapWidth || 800,
        mapHeight: config.mapHeight || 600,
        detectionThreshold: config.detectionThreshold || 0.5,
        adaptiveLightingEnabled: config.adaptiveLightingEnabled !== false,
        spectralAnalysisEnabled: config.spectralAnalysisEnabled !== false
      };
      
      this.map = new DigitalTwinMap(this.config);
      this.redAI = new RedAI(this.map);
      this.blueAI = new BlueAI(this.map);
      
      this.currentRound = 0;
      this.isRunning = false;
      this.isPaused = false;
      this.roundLog = [];
      this.eventListeners = [];
      this.roundDelay = 100;
    }

    async start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.isPaused = false;
      await this._runSimulation();
    }

    pause() { this.isPaused = true; }

    async resume() {
      if (!this.isRunning) return;
      this.isPaused = false;
      await this._runSimulation();
    }

    stop() {
      this.isRunning = false;
      this.isPaused = false;
    }

    reset() {
      this.stop();
      this.currentRound = 0;
      this.roundLog = [];
      this.map.reset();
      this.redAI.reset();
      this.blueAI.reset();
    }

    runSingleRound() {
      if (this.currentRound >= this.config.totalRounds) return null;
      return this._executeRound();
    }

    async _runSimulation() {
      while (this.isRunning && !this.isPaused && this.currentRound < this.config.totalRounds) {
        this._executeRound();
        if (this.roundDelay > 0) await this._delay(this.roundDelay);
      }
      
      if (this.currentRound >= this.config.totalRounds) {
        this.isRunning = false;
        this._emitEvent({ type: 'SIMULATION_COMPLETE', stats: this.getStats() });
      }
    }

    _executeRound() {
      this.currentRound++;
      this._emitEvent({ type: 'ROUND_START', round: this.currentRound });
      
      const redAction = this.redAI.generateAttempt();
      this._emitEvent({ type: 'RED_MOVE', action: redAction });
      
      const blueResponse = this.blueAI.analyze(redAction);
      this._emitEvent({ type: 'BLUE_ANALYZE', response: blueResponse });
      
      const actualDistance = distance(blueResponse.predictedLocation, redAction.hideLocation);
      
      const result = {
        roundNumber: this.currentRound,
        timestamp: Date.now(),
        redAction,
        blueResponse,
        actualDistance,
        detected: blueResponse.detected,
        confidence: blueResponse.confidence
      };
      
      this.roundLog.push(result);
      this.redAI.recordResult(redAction.hideLocation, blueResponse.detected, redAction.strategy);
      this.blueAI.recordActualResult(blueResponse.predictedLocation, redAction.hideLocation);
      
      this._emitEvent({ type: 'ROUND_END', result });
      
      return result;
    }

    getStats() {
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
      
      const windowSize = 10;
      const confidenceTrend = [];
      for (let i = 0; i < this.roundLog.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const window = this.roundLog.slice(start, i + 1);
        confidenceTrend.push(window.reduce((s, r) => s + r.confidence, 0) / window.length);
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

    getRoundLog() { return [...this.roundLog]; }
    
    getDetectionRateTrend(windowSize) {
      windowSize = windowSize || 20;
      const trend = [];
      for (let i = 0; i < this.roundLog.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const window = this.roundLog.slice(start, i + 1);
        trend.push(window.filter(r => r.detected).length / window.length);
      }
      return trend;
    }

    on(callback) {
      this.eventListeners.push(callback);
      return () => {
        const index = this.eventListeners.indexOf(callback);
        if (index > -1) this.eventListeners.splice(index, 1);
      };
    }

    _emitEvent(event) {
      this.eventListeners.forEach(listener => {
        try { listener(event); } catch (e) { console.error('Event listener error:', e); }
      });
    }

    setRoundDelay(delay) { this.roundDelay = Math.max(0, delay); }
    getRoundDelay() { return this.roundDelay; }
    getConfig() { return { ...this.config }; }
    getCurrentRound() { return this.currentRound; }
    getIsRunning() { return this.isRunning; }
    getIsPaused() { return this.isPaused; }
    getIsComplete() { return this.currentRound >= this.config.totalRounds; }
    getMap() { return this.map; }
    getRedAI() { return this.redAI; }
    getBlueAI() { return this.blueAI; }

    _delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  }

  // ═══════════════════════════════════════════════════════════════
  // WARGAME DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  const DASHBOARD_STYLES = `
.wargame-dashboard{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#0a0a1a 0%,#1a1a2e 50%,#0f0f23 100%);border-radius:12px;padding:20px;color:#e0e0e0;box-shadow:0 10px 40px rgba(0,0,0,0.5)}.wargame-dashboard *{box-sizing:border-box}.wargame-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #333}.wargame-title{font-size:28px;font-weight:700;background:linear-gradient(90deg,#00d4ff,#7b2cbf);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0}.wargame-subtitle{font-size:14px;color:#888;margin-top:5px}.wargame-controls{display:flex;gap:10px}.wargame-btn{padding:10px 20px;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.3s ease}.wargame-btn-primary{background:linear-gradient(135deg,#00d4ff,#0099cc);color:#fff}.wargame-btn-primary:hover{transform:translateY(-2px);box-shadow:0 5px 20px rgba(0,212,255,0.4)}.wargame-btn-danger{background:linear-gradient(135deg,#ff4757,#c23616);color:#fff}.wargame-btn-danger:hover{transform:translateY(-2px);box-shadow:0 5px 20px rgba(255,71,87,0.4)}.wargame-btn-secondary{background:#333;color:#fff;border:1px solid #555}.wargame-btn-secondary:hover{background:#444}.wargame-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}.wargame-main{display:grid;grid-template-columns:1fr 350px;gap:20px}.wargame-map-container{background:#111;border-radius:10px;padding:15px;position:relative;overflow:hidden}.wargame-map-canvas{border-radius:8px;display:block}.wargame-sidebar{display:flex;flex-direction:column;gap:15px}.wargame-panel{background:rgba(30,30,50,0.8);border-radius:10px;padding:15px;border:1px solid #333}.wargame-panel-title{font-size:16px;font-weight:600;margin-bottom:12px;color:#00d4ff;display:flex;align-items:center;gap:8px}.wargame-panel-title::before{content:'';width:4px;height:16px;background:#00d4ff;border-radius:2px}.wargame-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.wargame-stat{background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;text-align:center}.wargame-stat-value{font-size:24px;font-weight:700;color:#fff}.wargame-stat-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:4px}.wargame-stat-blue .wargame-stat-value{color:#00d4ff}.wargame-stat-red .wargame-stat-value{color:#ff4757}.wargame-stat-gold .wargame-stat-value{color:#ffd700}.wargame-progress{margin-top:10px}.wargame-progress-bar{height:8px;background:#222;border-radius:4px;overflow:hidden}.wargame-progress-fill{height:100%;background:linear-gradient(90deg,#00d4ff,#7b2cbf);border-radius:4px;transition:width 0.3s ease}.wargame-progress-text{font-size:12px;color:#888;margin-top:5px;display:flex;justify-content:space-between}.wargame-chart-container{height:120px;position:relative}.wargame-chart-canvas{width:100%;height:100%}.wargame-log{max-height:200px;overflow-y:auto;font-family:'Consolas','Monaco',monospace;font-size:11px;line-height:1.6}.wargame-log::-webkit-scrollbar{width:6px}.wargame-log::-webkit-scrollbar-track{background:#111;border-radius:3px}.wargame-log::-webkit-scrollbar-thumb{background:#444;border-radius:3px}.wargame-log-entry{padding:4px 8px;border-radius:4px;margin-bottom:4px}.wargame-log-entry-detected{background:rgba(0,212,255,0.15);border-left:3px solid #00d4ff}.wargame-log-entry-missed{background:rgba(255,71,87,0.15);border-left:3px solid #ff4757}.wargame-legend{display:flex;flex-wrap:wrap;gap:15px;margin-top:10px}.wargame-legend-item{display:flex;align-items:center;gap:6px;font-size:12px}.wargame-legend-color{width:12px;height:12px;border-radius:3px}.wargame-speed-control{display:flex;align-items:center;gap:10px;margin-top:10px}.wargame-speed-label{font-size:12px;color:#888}.wargame-speed-slider{flex:1;-webkit-appearance:none;height:6px;background:#333;border-radius:3px;outline:none}.wargame-speed-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:#00d4ff;border-radius:50%;cursor:pointer}.wargame-toggle-group{display:flex;flex-direction:column;gap:8px;margin-top:10px}.wargame-toggle{display:flex;align-items:center;gap:10px;font-size:12px}.wargame-toggle input{width:16px;height:16px;cursor:pointer}.wargame-current-round{background:linear-gradient(135deg,rgba(0,212,255,0.2),rgba(123,44,191,0.2));border:1px solid #00d4ff;padding:15px;border-radius:10px;margin-bottom:15px}.wargame-round-info{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px}.wargame-round-info div{padding:8px;background:rgba(0,0,0,0.3);border-radius:6px}.wargame-round-label{color:#888;margin-bottom:3px}.wargame-round-value{color:#fff;font-weight:600}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}.wargame-running-indicator{animation:pulse 1s infinite;color:#00d4ff}
`;

  class WargameDashboard {
    constructor(engine, config) {
      config = config || {};
      this.engine = engine;
      this.config = {
        containerId: config.containerId || 'wargame-dashboard',
        showCameraRanges: config.showCameraRanges !== false,
        showHidingSpots: config.showHidingSpots || false,
        showSpectralOverlay: config.showSpectralOverlay || false
      };
      
      this.container = null;
      this.mapCanvas = null;
      this.mapCtx = null;
      this.chartCanvas = null;
      this.chartCtx = null;
      this.elements = {};
      this.currentRoundResult = null;
      this.unsubscribe = null;
    }

    init() {
      this._injectStyles();
      
      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        console.error(`Container #${this.config.containerId} not found`);
        return;
      }
      
      this.container.innerHTML = this._generateHTML();
      this._setupCanvases();
      this._cacheElements();
      this._bindEvents();
      this._subscribeToEngine();
      this.renderMap();
      this._updateStats();
    }

    destroy() {
      if (this.unsubscribe) this.unsubscribe();
      if (this.container) this.container.innerHTML = '';
    }

    _injectStyles() {
      const styleId = 'wargame-dashboard-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = DASHBOARD_STYLES;
        document.head.appendChild(style);
      }
    }

    _generateHTML() {
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
              <canvas id="map-canvas" class="wargame-map-canvas" width="${map.width}" height="${map.height}"></canvas>
              <div class="wargame-legend">
                <div class="wargame-legend-item"><div class="wargame-legend-color" style="background:#444;"></div><span>Buildings</span></div>
                <div class="wargame-legend-item"><div class="wargame-legend-color" style="background:#ff4757;"></div><span>Red-AI Path</span></div>
                <div class="wargame-legend-item"><div class="wargame-legend-color" style="background:#ff4757;border:2px solid #fff;"></div><span>Hide Location</span></div>
                <div class="wargame-legend-item"><div class="wargame-legend-color" style="background:#00d4ff;"></div><span>Blue-AI Prediction</span></div>
                <div class="wargame-legend-item"><div class="wargame-legend-color" style="background:rgba(0,212,255,0.3);"></div><span>Camera Range</span></div>
              </div>
            </div>
            <div class="wargame-sidebar">
              <div class="wargame-panel">
                <div class="wargame-panel-title">Simulation Progress</div>
                <div class="wargame-stats-grid">
                  <div class="wargame-stat"><div class="wargame-stat-value" id="stat-round">0</div><div class="wargame-stat-label">Current Round</div></div>
                  <div class="wargame-stat wargame-stat-gold"><div class="wargame-stat-value" id="stat-total">${this.engine.getConfig().totalRounds}</div><div class="wargame-stat-label">Total Rounds</div></div>
                </div>
                <div class="wargame-progress">
                  <div class="wargame-progress-bar"><div class="wargame-progress-fill" id="progress-fill" style="width:0%"></div></div>
                  <div class="wargame-progress-text"><span id="progress-percent">0%</span><span id="status-text">Ready</span></div>
                </div>
              </div>
              <div class="wargame-panel">
                <div class="wargame-panel-title">Battle Statistics</div>
                <div class="wargame-stats-grid">
                  <div class="wargame-stat wargame-stat-blue"><div class="wargame-stat-value" id="stat-blue-wins">0</div><div class="wargame-stat-label">SCAR-EYE Detections</div></div>
                  <div class="wargame-stat wargame-stat-red"><div class="wargame-stat-value" id="stat-red-wins">0</div><div class="wargame-stat-label">Red-AI Evasions</div></div>
                  <div class="wargame-stat"><div class="wargame-stat-value" id="stat-detection-rate">0%</div><div class="wargame-stat-label">Detection Rate</div></div>
                  <div class="wargame-stat"><div class="wargame-stat-value" id="stat-confidence">0%</div><div class="wargame-stat-label">Avg Confidence</div></div>
                </div>
              </div>
              <div class="wargame-panel">
                <div class="wargame-panel-title">Confidence Trend</div>
                <div class="wargame-chart-container"><canvas id="chart-canvas" class="wargame-chart-canvas"></canvas></div>
              </div>
              <div class="wargame-panel wargame-current-round" id="current-round-panel" style="display:none;">
                <div class="wargame-panel-title">Current Round</div>
                <div class="wargame-round-info" id="round-info"></div>
              </div>
              <div class="wargame-panel">
                <div class="wargame-panel-title">Settings</div>
                <div class="wargame-speed-control">
                  <span class="wargame-speed-label">Speed:</span>
                  <input type="range" id="speed-slider" class="wargame-speed-slider" min="1" max="100" value="50">
                  <span id="speed-value">100ms</span>
                </div>
                <div class="wargame-toggle-group">
                  <label class="wargame-toggle"><input type="checkbox" id="toggle-cameras" checked><span>Show Camera Ranges</span></label>
                  <label class="wargame-toggle"><input type="checkbox" id="toggle-hiding"><span>Show Hiding Spots</span></label>
                  <label class="wargame-toggle"><input type="checkbox" id="toggle-spectral"><span>Spectral Overlay</span></label>
                </div>
              </div>
              <div class="wargame-panel">
                <div class="wargame-panel-title">Activity Log</div>
                <div class="wargame-log" id="activity-log"><div class="wargame-log-entry">Simulation initialized...</div></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    _setupCanvases() {
      this.mapCanvas = document.getElementById('map-canvas');
      this.chartCanvas = document.getElementById('chart-canvas');
      
      if (this.mapCanvas) this.mapCtx = this.mapCanvas.getContext('2d');
      if (this.chartCanvas) {
        const container = this.chartCanvas.parentElement;
        if (container) {
          this.chartCanvas.width = container.clientWidth;
          this.chartCanvas.height = container.clientHeight;
        }
        this.chartCtx = this.chartCanvas.getContext('2d');
      }
    }

    _cacheElements() {
      const ids = ['btn-start', 'btn-pause', 'btn-step', 'btn-reset', 'stat-round', 'stat-total', 
                   'stat-blue-wins', 'stat-red-wins', 'stat-detection-rate', 'stat-confidence',
                   'progress-fill', 'progress-percent', 'status-text', 'speed-slider', 'speed-value',
                   'toggle-cameras', 'toggle-hiding', 'toggle-spectral', 'activity-log', 
                   'current-round-panel', 'round-info'];
      ids.forEach(id => { const el = document.getElementById(id); if (el) this.elements[id] = el; });
    }

    _bindEvents() {
      this.elements['btn-start']?.addEventListener('click', () => this._handleStart());
      this.elements['btn-pause']?.addEventListener('click', () => this._handlePause());
      this.elements['btn-step']?.addEventListener('click', () => this._handleStep());
      this.elements['btn-reset']?.addEventListener('click', () => this._handleReset());
      
      this.elements['speed-slider']?.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const delay = 200 - value * 2;
        this.engine.setRoundDelay(Math.max(0, delay));
        if (this.elements['speed-value']) this.elements['speed-value'].textContent = delay + 'ms';
      });
      
      this.elements['toggle-cameras']?.addEventListener('change', (e) => {
        this.config.showCameraRanges = e.target.checked;
        this.renderMap();
      });
      
      this.elements['toggle-hiding']?.addEventListener('change', (e) => {
        this.config.showHidingSpots = e.target.checked;
        this.renderMap();
      });
      
      this.elements['toggle-spectral']?.addEventListener('change', (e) => {
        this.config.showSpectralOverlay = e.target.checked;
        this.renderMap();
      });
    }

    _subscribeToEngine() {
      this.unsubscribe = this.engine.on((event) => this._handleEngineEvent(event));
    }

    _handleStart() {
      this.engine.start();
      this._updateButtonStates(true, false);
      this._setStatusText('Running...', true);
    }

    _handlePause() {
      if (this.engine.getIsPaused()) {
        this.engine.resume();
        this._updateButtonStates(true, false);
        this._setStatusText('Running...', true);
      } else {
        this.engine.pause();
        this._updateButtonStates(true, true);
        this._setStatusText('Paused');
      }
    }

    _handleStep() {
      const result = this.engine.runSingleRound();
      if (result) {
        this.currentRoundResult = result;
        this.renderMap();
        this._updateStats();
        this._showRoundInfo(result);
        this._addLogEntry(result);
      }
    }

    _handleReset() {
      this.engine.reset();
      this.currentRoundResult = null;
      this._updateButtonStates(false, false);
      this._setStatusText('Ready');
      this._updateStats();
      this.renderMap();
      this._renderChart([]);
      this._clearLog();
      this._hideRoundInfo();
    }

    _handleEngineEvent(event) {
      if (event.type === 'ROUND_END') {
        this.currentRoundResult = event.result;
        this.renderMap();
        this._updateStats();
        this._showRoundInfo(event.result);
        this._addLogEntry(event.result);
      } else if (event.type === 'SIMULATION_COMPLETE') {
        this._updateButtonStates(false, false);
        this._setStatusText('Complete!');
        this._addLogEntry(null, 'Simulation complete! Final detection rate: ' + (event.stats.detectionRate * 100).toFixed(1) + '%');
      }
    }

    _updateButtonStates(running, paused) {
      const startBtn = this.elements['btn-start'];
      const pauseBtn = this.elements['btn-pause'];
      const stepBtn = this.elements['btn-step'];
      
      if (startBtn) startBtn.disabled = running && !paused;
      if (pauseBtn) {
        pauseBtn.disabled = !running;
        pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
      }
      if (stepBtn) stepBtn.disabled = running && !paused;
    }

    _setStatusText(text, running) {
      const el = this.elements['status-text'];
      if (el) {
        el.textContent = text;
        el.className = running ? 'wargame-running-indicator' : '';
      }
    }

    _updateStats() {
      const stats = this.engine.getStats();
      const config = this.engine.getConfig();
      
      this._updateElement('stat-round', stats.completedRounds.toString());
      this._updateElement('stat-blue-wins', stats.blueWins.toString());
      this._updateElement('stat-red-wins', stats.redWins.toString());
      this._updateElement('stat-detection-rate', (stats.detectionRate * 100).toFixed(1) + '%');
      this._updateElement('stat-confidence', (stats.averageConfidence * 100).toFixed(1) + '%');
      
      const progress = (stats.completedRounds / config.totalRounds) * 100;
      if (this.elements['progress-fill']) this.elements['progress-fill'].style.width = progress + '%';
      this._updateElement('progress-percent', progress.toFixed(0) + '%');
      
      this._renderChart(stats.confidenceTrend);
    }

    _updateElement(id, value) {
      const el = this.elements[id];
      if (el) el.textContent = value;
    }

    _showRoundInfo(result) {
      const panel = this.elements['current-round-panel'];
      const info = this.elements['round-info'];
      
      if (panel && info) {
        panel.style.display = 'block';
        info.innerHTML = `
          <div><div class="wargame-round-label">Strategy</div><div class="wargame-round-value">${result.redAction.strategy}</div></div>
          <div><div class="wargame-round-label">Confidence</div><div class="wargame-round-value">${(result.confidence * 100).toFixed(1)}%</div></div>
          <div><div class="wargame-round-label">Detection</div><div class="wargame-round-value" style="color:${result.detected ? '#00d4ff' : '#ff4757'}">${result.detected ? '✓ DETECTED' : '✗ MISSED'}</div></div>
          <div><div class="wargame-round-label">Distance Error</div><div class="wargame-round-value">${result.actualDistance.toFixed(0)}px</div></div>
        `;
      }
    }

    _hideRoundInfo() {
      const panel = this.elements['current-round-panel'];
      if (panel) panel.style.display = 'none';
    }

    _addLogEntry(result, customMessage) {
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
      while (log.children.length > 50) log.removeChild(log.children[0]);
    }

    _clearLog() {
      const log = this.elements['activity-log'];
      if (log) log.innerHTML = '<div class="wargame-log-entry">Simulation reset...</div>';
    }

    renderMap() {
      if (!this.mapCtx || !this.mapCanvas) return;
      
      const ctx = this.mapCtx;
      const map = this.engine.getMap();
      
      ctx.fillStyle = '#0a0a15';
      ctx.fillRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
      
      this._drawGrid(ctx);
      if (this.config.showSpectralOverlay) this._drawSpectralOverlay(ctx);
      this._drawRoads(ctx, map.getRoads());
      if (this.config.showCameraRanges) this._drawCameraRanges(ctx, map.getCameras());
      this._drawBuildings(ctx, map.getBuildings());
      if (this.config.showHidingSpots) this._drawHidingSpots(ctx, map.getHidingSpots());
      this._drawCameras(ctx, map.getCameras());
      if (this.currentRoundResult) this._drawRoundVisualization(ctx, this.currentRoundResult);
    }

    _drawGrid(ctx) {
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 1;
      const gridSize = 50;
      
      for (let x = 0; x < this.mapCanvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.mapCanvas.height); ctx.stroke();
      }
      for (let y = 0; y < this.mapCanvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.mapCanvas.width, y); ctx.stroke();
      }
    }

    _drawSpectralOverlay(ctx) {
      const layers = this.engine.getMap().getSpectralLayers();
      const thermalLayer = layers.find(l => l.id === 'thermal');
      if (!thermalLayer) return;
      
      const cellSize = 20;
      thermalLayer.intensityMap.forEach((row, y) => {
        row.forEach((value, x) => {
          ctx.fillStyle = `rgba(255, 100, 50, ${value * 0.3})`;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        });
      });
    }

    _drawRoads(ctx, roads) {
      roads.forEach(road => {
        ctx.beginPath();
        ctx.strokeStyle = road.type === 'main' ? '#2a2a3e' : road.type === 'secondary' ? '#222233' : '#1a1a28';
        ctx.lineWidth = road.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (road.points.length > 0) {
          ctx.moveTo(road.points[0].x, road.points[0].y);
          road.points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
        }
        ctx.stroke();
      });
    }

    _drawBuildings(ctx, buildings) {
      buildings.forEach(building => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(building.x + 5, building.y + 5, building.width, building.height);
        
        const gradient = ctx.createLinearGradient(building.x, building.y, building.x + building.width, building.y + building.height);
        const baseColor = building.type === 'government' ? '#3a3a5a' : building.type === 'commercial' ? '#3a4a4a' : building.type === 'industrial' ? '#4a3a3a' : '#3a3a4a';
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, '#2a2a3a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(building.x, building.y, building.width, building.height);
        ctx.strokeStyle = '#4a4a5a';
        ctx.lineWidth = 1;
        ctx.strokeRect(building.x, building.y, building.width, building.height);
      });
    }

    _drawCameraRanges(ctx, cameras) {
      cameras.forEach(camera => {
        ctx.beginPath();
        const startAngle = (camera.direction - camera.fieldOfView / 2) * Math.PI / 180;
        const endAngle = (camera.direction + camera.fieldOfView / 2) * Math.PI / 180;
        
        ctx.moveTo(camera.position.x, camera.position.y);
        ctx.arc(camera.position.x, camera.position.y, camera.range, startAngle, endAngle);
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(camera.position.x, camera.position.y, 0, camera.position.x, camera.position.y, camera.range);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0.02)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    }

    _drawCameras(ctx, cameras) {
      cameras.forEach(camera => {
        ctx.beginPath();
        ctx.arc(camera.position.x, camera.position.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = camera.spectralCapability ? '#7b2cbf' : '#00d4ff';
        ctx.fill();
        
        const dirRad = camera.direction * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(camera.position.x, camera.position.y);
        ctx.lineTo(camera.position.x + Math.cos(dirRad) * 12, camera.position.y + Math.sin(dirRad) * 12);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    _drawHidingSpots(ctx, spots) {
      spots.forEach(spot => {
        ctx.beginPath();
        ctx.arc(spot.position.x, spot.position.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = spot.isInShadow ? `rgba(50, 50, 100, ${spot.concealmentLevel})` : `rgba(100, 100, 50, ${spot.concealmentLevel})`;
        ctx.fill();
      });
    }

    _drawRoundVisualization(ctx, result) {
      const { redAction, blueResponse } = result;
      
      // Red-AI path
      if (redAction.path.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(redAction.path[0].x, redAction.path[0].y);
        redAction.path.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
        ctx.setLineDash([]);
        
        redAction.path.forEach((point, i) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = i === redAction.path.length - 1 ? '#ff4757' : '#ff8888';
          ctx.fill();
        });
      }
      
      // Hide location
      ctx.beginPath();
      ctx.arc(redAction.hideLocation.x, redAction.hideLocation.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 71, 87, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(redAction.hideLocation.x, redAction.hideLocation.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4757';
      ctx.fill();
      
      // Blue-AI prediction
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
      const cx = blueResponse.predictedLocation.x;
      const cy = blueResponse.predictedLocation.y;
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10); ctx.stroke();
      
      // Line between prediction and actual
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

    _renderChart(data) {
      if (!this.chartCtx || !this.chartCanvas) return;
      
      const ctx = this.chartCtx;
      const width = this.chartCanvas.width;
      const height = this.chartCanvas.height;
      
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);
      
      if (data.length < 2) return;
      
      // Grid lines
      ctx.strokeStyle = '#2a2a3e';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      
      // Confidence line
      ctx.beginPath();
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      
      const xStep = width / (data.length - 1);
      data.forEach((value, i) => {
        const x = i * xStep;
        const y = height - (value * height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // Gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Detection rate line
      const detectionTrend = this.engine.getDetectionRateTrend();
      if (detectionTrend.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#7b2cbf';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        
        detectionTrend.forEach((value, i) => {
          const x = i * xStep;
          const y = height - (value * height);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // INIT FUNCTION
  // ═══════════════════════════════════════════════════════════════

  function initWargame(containerId, config) {
    config = config || {};
    const engine = new SimulationEngine({
      totalRounds: config.totalRounds || 200,
      mapWidth: config.mapWidth || 800,
      mapHeight: config.mapHeight || 600,
      detectionThreshold: config.detectionThreshold || 0.5,
      adaptiveLightingEnabled: config.adaptiveLightingEnabled !== false,
      spectralAnalysisEnabled: config.spectralAnalysisEnabled !== false
    });
    
    const dashboard = new WargameDashboard(engine, {
      containerId: containerId,
      showCameraRanges: true,
      showHidingSpots: false,
      showSpectralOverlay: false
    });
    
    dashboard.init();
    
    return { engine: engine, dashboard: dashboard };
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORT TO GLOBAL
  // ═══════════════════════════════════════════════════════════════

  global.WargameModule = {
    DigitalTwinMap: DigitalTwinMap,
    RedAI: RedAI,
    BlueAI: BlueAI,
    SimulationEngine: SimulationEngine,
    WargameDashboard: WargameDashboard,
    initWargame: initWargame,
    VERSION: '1.0.0'
  };

})(typeof window !== 'undefined' ? window : this);
