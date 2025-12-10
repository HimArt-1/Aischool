/*
 * Adversarial Wargame Module (SCAR-EYE Demonstrator)
 * ---------------------------------------------------
 * Educational-only simulation of AI vs AI hide-and-seek dynamics.
 * This module intentionally uses mock data, synthetic movement, and
 * stylized heuristics to stay far away from any real operational logic.
 */

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, t) => a + (b - a) * t;

class DigitalTwinMap {
  constructor(config = {}) {
    this.width = config.width ?? 820;
    this.height = config.height ?? 520;
    this.blockSize = 40;
    this.buildings = config.buildings ?? this.generateMockBuildings();
    this.roads = config.roads ?? this.generateMockRoads();
    this.hideSpots = config.hideSpots ?? this.generateHideSpots();
    this.spectralLayers = config.spectralLayers ?? this.generateSpectralLayers();
    this.illuminance = {
      base: 0.58,
      current: 0.58,
      min: 0.25,
      max: 1,
      history: [0.58]
    };
  }

  generateMockBuildings() {
    return [
      { id: 'ops', label: 'Ops Center', x: 60, y: 60, width: 120, height: 90, heightLevels: 3 },
      { id: 'market', label: 'Market Hall', x: 240, y: 48, width: 150, height: 120, heightLevels: 2 },
      { id: 'apartments', label: 'Apartments', x: 450, y: 70, width: 140, height: 150, heightLevels: 5 },
      { id: 'garages', label: 'Garages', x: 80, y: 240, width: 180, height: 90, heightLevels: 1 },
      { id: 'school', label: 'Learning Hub', x: 320, y: 250, width: 210, height: 120, heightLevels: 2 },
      { id: 'plaza', label: 'Community Plaza', x: 580, y: 260, width: 160, height: 150, heightLevels: 1 },
      { id: 'warehouse', label: 'Supply Depot', x: 520, y: 110, width: 120, height: 90, heightLevels: 2 },
      { id: 'clinic', label: 'Micro Clinic', x: 180, y: 360, width: 120, height: 110, heightLevels: 1 }
    ];
  }

  generateMockRoads() {
    return [
      { type: 'arterial', width: 14, points: [ { x: 0, y: 150 }, { x: this.width, y: 150 } ] },
      { type: 'arterial', width: 12, points: [ { x: 400, y: 0 }, { x: 400, y: this.height } ] },
      { type: 'alley', width: 6, points: [ { x: 120, y: 0 }, { x: 220, y: 210 }, { x: 220, y: 520 } ] },
      { type: 'alley', width: 6, points: [ { x: 650, y: 80 }, { x: 550, y: 320 }, { x: 420, y: 500 } ] },
      { type: 'service', width: 5, points: [ { x: 300, y: 320 }, { x: 480, y: 360 }, { x: 640, y: 360 } ] }
    ];
  }

  generateHideSpots() {
    const base = [
      { id: 'alley-cache', x: 150, y: 210, radius: 18, shelter: 0.82 },
      { id: 'arcade', x: 300, y: 130, radius: 16, shelter: 0.63 },
      { id: 'service-corner', x: 520, y: 320, radius: 20, shelter: 0.7 },
      { id: 'tree-line', x: 680, y: 220, radius: 22, shelter: 0.76 },
      { id: 'garage-row', x: 110, y: 330, radius: 15, shelter: 0.68 },
      { id: 'sunken-plaza', x: 360, y: 400, radius: 25, shelter: 0.74 }
    ];
    return base.map((spot, index) => ({
      ...spot,
      rank: index + 1,
      visibilityScore: clamp(1 - (spot.shelter + 0.15 * Math.random()), 0.05, 0.95)
    }));
  }

  generateSpectralLayers() {
    return [
      { name: 'Thermal', color: 'rgba(255, 99, 71, 0.16)', frequency: 1.4, intensity: 0.72 },
      { name: 'Short-wave IR', color: 'rgba(144, 202, 249, 0.14)', frequency: 1.1, intensity: 0.64 },
      { name: 'Visible Boost', color: 'rgba(255, 233, 143, 0.08)', frequency: 0.6, intensity: 0.55 },
      { name: 'Synthetic Aperture', color: 'rgba(225, 255, 255, 0.05)', frequency: 0.35, intensity: 0.48 }
    ];
  }

  adjustIlluminance(delta, cause = 'operator override') {
    const next = clamp(this.illuminance.current + delta, this.illuminance.min, this.illuminance.max);
    this.illuminance.current = next;
    this.illuminance.history.push(next);
    if (this.illuminance.history.length > 1024) {
      this.illuminance.history.shift();
    }
    this.illuminance.lastCause = cause;
    return next;
  }

  resetIlluminance() {
    this.illuminance.current = this.illuminance.base;
    this.illuminance.history = [this.illuminance.base];
    this.illuminance.lastCause = 'reset';
  }

  getLowVisibilityZones(threshold = 0.45) {
    const lightingFactor = clamp(1 - this.illuminance.current, 0, 1);
    return this.hideSpots
      .map((spot) => ({
        ...spot,
        compositeScore: clamp((1 - spot.visibilityScore) * 0.7 + lightingFactor * 0.3, 0, 1)
      }))
      .filter((spot) => spot.compositeScore >= threshold)
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }

  getSpectralSnapshot(point = { x: this.width / 2, y: this.height / 2 }) {
    const snapshot = {};
    this.spectralLayers.forEach((layer, index) => {
      const wave = Math.sin((point.x + point.y * 0.75 + index * 60) / (55 / layer.frequency));
      const shimmer = Math.cos(point.y / (35 + index * 10));
      snapshot[layer.name] = clamp(layer.intensity + (wave + shimmer) * 0.05, 0, 1);
    });
    snapshot['Ambient Shadow'] = clamp(1 - this.illuminance.current + Math.random() * 0.05, 0, 1);
    return snapshot;
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#04070f');
    gradient.addColorStop(1, '#0b1a2f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.width; x += this.blockSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.height; y += this.blockSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRoads(ctx) {
    ctx.save();
    ctx.lineCap = 'round';
    this.roads.forEach((road) => {
      ctx.strokeStyle = road.type === 'arterial' ? 'rgba(96, 125, 139, 0.65)' : 'rgba(96, 125, 139, 0.4)';
      ctx.lineWidth = road.width;
      ctx.beginPath();
      road.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
    ctx.restore();
  }

  drawBuildings(ctx) {
    ctx.save();
    this.buildings.forEach((building) => {
      const heightFactor = clamp(building.heightLevels / 5, 0.4, 1);
      ctx.fillStyle = `rgba(49, 76, 109, ${0.45 + heightFactor * 0.4})`;
      ctx.fillRect(building.x, building.y, building.width, building.height);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.strokeRect(building.x, building.y, building.width, building.height);
    });
    ctx.restore();
  }

  drawHideSpots(ctx) {
    ctx.save();
    this.hideSpots.forEach((spot) => {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(29, 233, 182, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(29, 233, 182, 0.08)';
      ctx.fill();
      ctx.setLineDash([]);
    });
    ctx.restore();
  }

  drawSpectralLayers(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.spectralLayers.forEach((layer, index) => {
      const gradient = ctx.createRadialGradient(
        (index + 1) * (this.width / (this.spectralLayers.length + 1)),
        (index % 2 === 0 ? this.height * 0.35 : this.height * 0.65),
        30,
        (index + 1) * (this.width / (this.spectralLayers.length + 1)),
        (index % 2 === 0 ? this.height * 0.35 : this.height * 0.65),
        this.width / 2
      );
      gradient.addColorStop(0, layer.color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    });
    ctx.restore();
  }

  drawAdaptiveIlluminance(ctx) {
    ctx.save();
    const deviation = this.illuminance.current - this.illuminance.base;
    if (deviation !== 0) {
      const shade = deviation > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)';
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    ctx.restore();
  }

  drawPath(ctx, path, color = 'rgba(255, 82, 82, 0.8)') {
    if (!path?.length) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    path.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  drawMarker(ctx, point, color, label) {
    if (!point) return;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label ?? '', point.x, point.y - 12);
    ctx.restore();
  }

  render(ctx, options = {}) {
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground(ctx);
    if (options.showGrid !== false) this.drawGrid(ctx);
    this.drawRoads(ctx);
    this.drawSpectralLayers(ctx);
    this.drawBuildings(ctx);
    this.drawHideSpots(ctx);
    this.drawAdaptiveIlluminance(ctx);
    if (options.path) this.drawPath(ctx, options.path, options.pathColor);
    if (options.hideLocation) this.drawMarker(ctx, options.hideLocation, '#ff5252', 'RED');
    if (options.predictedLocation) this.drawMarker(ctx, options.predictedLocation, '#1de9b6', 'BLUE');
  }
}

class RedAI {
  constructor(config = {}) {
    this.seed = config.seed ?? Date.now();
    this.rng = this.createRng(this.seed);
  }

  createRng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  random() {
    return this.rng();
  }

  pickEntryPoint(map) {
    const edgeRoll = this.random();
    if (edgeRoll < 0.25) return { x: 0, y: this.random() * map.height };
    if (edgeRoll < 0.5) return { x: map.width, y: this.random() * map.height };
    if (edgeRoll < 0.75) return { x: this.random() * map.width, y: 0 };
    return { x: this.random() * map.width, y: map.height };
  }

  pickHideLocation(map) {
    const candidates = map.getLowVisibilityZones(0.3);
    if (!candidates.length) return map.hideSpots[Math.floor(this.random() * map.hideSpots.length)];
    const skewed = candidates[Math.floor(Math.pow(this.random(), 0.35) * candidates.length)];
    const jitter = 1 - map.illuminance.current;
    return {
      x: clamp(skewed.x + (this.random() - 0.5) * 25 * jitter, 20, map.width - 20),
      y: clamp(skewed.y + (this.random() - 0.5) * 25 * jitter, 20, map.height - 20)
    };
  }

  buildCamouflageProfile(map) {
    const profile = {};
    map.spectralLayers.forEach((layer) => {
      const drift = (this.random() - 0.5) * 0.25;
      const shadowDrag = (1 - map.illuminance.current) * 0.15;
      profile[layer.name] = clamp(layer.intensity - 0.08 + drift + shadowDrag, 0, 1);
    });
    profile['Hyperspectral Blur'] = clamp(0.55 + (this.random() - 0.5) * 0.2, 0, 1);
    profile['Dark Current'] = clamp(0.45 + this.random() * 0.25, 0, 1);
    return profile;
  }

  craftPath(entryPoint, destination) {
    const path = [entryPoint];
    const legs = 3 + Math.floor(this.random() * 3);
    for (let i = 1; i < legs; i += 1) {
      const t = i / legs;
      const curvature = Math.sin(t * Math.PI) * (this.random() > 0.5 ? 1 : -1);
      path.push({
        x: lerp(entryPoint.x, destination.x, t) + curvature * 35 * this.random(),
        y: lerp(entryPoint.y, destination.y, t) + (this.random() - 0.5) * 45
      });
    }
    path.push(destination);
    return path;
  }

  planInfiltration(map) {
    const entry = this.pickEntryPoint(map);
    const hideLocation = this.pickHideLocation(map);
    const path = this.craftPath(entry, hideLocation);
    return {
      hideLocation,
      camouflageProfile: this.buildCamouflageProfile(map),
      path
    };
  }
}

class BlueAI {
  constructor(config = {}) {
    this.patternMemory = [];
    this.confidenceHistory = [];
    this.motionBaseline = config.motionBaseline ?? 0.35;
  }

  compareSpectral(profile, map) {
    const baseline = map.spectralLayers.reduce((acc, layer) => {
      acc[layer.name] = layer.intensity;
      return acc;
    }, {});
    const keys = Object.keys(profile);
    if (!keys.length) return 0;
    const divergence = keys.reduce((sum, key) => {
      const base = baseline[key] ?? 0.5;
      const offset = Math.abs(profile[key] - base);
      return sum + offset;
    }, 0);
    return clamp(divergence / keys.length, 0, 1);
  }

  measurePathRisk(path, map) {
    if (!path?.length) return 0;
    const turns = path.slice(1, -1).reduce((sum, point, index) => {
      const prev = path[index];
      const next = path[index + 2];
      if (!prev || !next) return sum;
      const angle1 = Math.atan2(point.y - prev.y, point.x - prev.x);
      const angle2 = Math.atan2(next.y - point.y, next.x - point.x);
      const delta = Math.abs(angle2 - angle1);
      return sum + Math.min(delta, Math.PI * 2 - delta);
    }, 0);
    const darkness = 1 - map.illuminance.current;
    const normalizedTurns = clamp(turns / Math.PI, 0, 1);
    return clamp(0.55 * normalizedTurns + 0.45 * darkness, 0, 1);
  }

  predictHideLocation(path, map) {
    const lookback = path.slice(-3);
    if (!lookback.length) return { x: map.width / 2, y: map.height / 2 };
    const weights = lookback.map((_, idx) => idx + 1);
    const sum = weights.reduce((a, b) => a + b, 0);
    const point = lookback.reduce(
      (acc, node, idx) => ({
        x: acc.x + (node.x * weights[idx]) / sum,
        y: acc.y + (node.y * weights[idx]) / sum
      }),
      { x: 0, y: 0 }
    );
    const bias = map.getLowVisibilityZones(0.4)[0];
    if (bias) {
      point.x = clamp((point.x * 0.7 + bias.x * 0.3), 20, map.width - 20);
      point.y = clamp((point.y * 0.7 + bias.y * 0.3), 20, map.height - 20);
    }
    return point;
  }

  buildReasoning(spectralDeviation, pathRisk, illuminance, detected) {
    const segments = [];
    segments.push(`Spectral delta ${ (spectralDeviation * 100).toFixed(0) }%`);
    segments.push(`Motion anomaly ${ (pathRisk * 100).toFixed(0) }%`);
    segments.push(`Lux boost ${(illuminance * 100).toFixed(0)} au`);
    segments.push(detected ? 'Flagged infiltration attempt' : 'Continuing passive trace');
    return segments.join(' | ');
  }

  evaluate(redAttempt, map) {
    const spectralDeviation = this.compareSpectral(redAttempt.camouflageProfile, map);
    const pathRisk = this.measurePathRisk(redAttempt.path, map);
    const darkness = 1 - map.illuminance.current;
    const suspicion = clamp(0.45 * spectralDeviation + 0.35 * pathRisk + 0.2 * darkness, 0, 1);

    const detectionRoll = suspicion + Math.random() * 0.25;
    const predictedLocation = this.predictHideLocation(redAttempt.path, map);
    let confidence = clamp(0.4 + suspicion * 0.45 + Math.random() * 0.1, 0, 1);
    let detected = detectionRoll > 0.62;

    if (detected) {
      map.adjustIlluminance(0.07, 'Suspicion spike');
      confidence = clamp(confidence + 0.15, 0, 1);
    } else if (suspicion > 0.55) {
      map.adjustIlluminance(0.04, 'Stealth counter');
    } else {
      map.adjustIlluminance(-0.015, 'Energy conservation');
    }

    // detection is stronger if prediction overlaps with hide location
    const predictionMatch = distance(predictedLocation, redAttempt.hideLocation) < 55;
    detected = detected && predictionMatch;

    this.confidenceHistory.push(confidence);
    if (this.confidenceHistory.length > 256) this.confidenceHistory.shift();

    return {
      detected,
      confidence,
      predictedLocation,
      reasoning: this.buildReasoning(spectralDeviation, pathRisk, map.illuminance.current, detected)
    };
  }
}

class SimulationEngine {
  constructor({ map, redAI, blueAI, rounds = 200 } = {}) {
    this.map = map ?? new DigitalTwinMap();
    this.redAI = redAI ?? new RedAI();
    this.blueAI = blueAI ?? new BlueAI();
    this.rounds = rounds;
    this.roundLogs = [];
    this.currentRound = 0;
    this.observers = { round: new Set(), reset: new Set() };
  }

  on(event, handler) {
    if (!this.observers[event]) this.observers[event] = new Set();
    this.observers[event].add(handler);
    return () => this.observers[event].delete(handler);
  }

  emit(event, payload) {
    (this.observers[event] ?? []).forEach((handler) => handler(payload));
  }

  step() {
    if (this.currentRound >= this.rounds) return null;
    const attempt = this.redAI.planInfiltration(this.map);
    const response = this.blueAI.evaluate(attempt, this.map);
    const roundNumber = this.currentRound + 1;
    const entry = {
      roundNumber,
      hideLocation: attempt.hideLocation,
      path: attempt.path,
      camouflageProfile: attempt.camouflageProfile,
      predictedLocation: response.predictedLocation,
      detected: response.detected,
      confidence: response.confidence,
      reasoning: response.reasoning
    };
    this.roundLogs.push(entry);
    this.currentRound = roundNumber;
    this.emit('round', entry);
    return entry;
  }

  runFull() {
    while (this.currentRound < this.rounds) {
      this.step();
    }
    return this.roundLogs;
  }

  reset() {
    this.currentRound = 0;
    this.roundLogs = [];
    this.map.resetIlluminance?.();
    this.blueAI.confidenceHistory = [];
    this.emit('reset');
  }

  isComplete() {
    return this.currentRound >= this.rounds;
  }

  getDetectionRate() {
    if (!this.roundLogs.length) return 0;
    const detections = this.roundLogs.filter((log) => log.detected).length;
    return detections / this.roundLogs.length;
  }

  getConfidenceTrend(windowSize = 40) {
    const history = this.blueAI.confidenceHistory;
    return history.slice(Math.max(0, history.length - windowSize));
  }
}

class WargameDashboard {
  constructor({ map, engine, rootSelector = '.scar-eye-wargame' } = {}) {
    this.map = map;
    this.engine = engine;
    this.root = document.querySelector(rootSelector);
    if (!this.root) return;

    this.canvas = this.root.querySelector('#digitalTwinCanvas');
    this.ctx = this.canvas?.getContext('2d');
    this.confidenceCanvas = this.root.querySelector('#confidenceChart');
    this.confidenceCtx = this.confidenceCanvas?.getContext('2d');
    this.logList = this.root.querySelector('[data-log-list]');
    this.roundLabel = this.root.querySelector('[data-round-count]');
    this.detectionRateLabel = this.root.querySelector('[data-detection-rate]');
    this.illuminanceLabel = this.root.querySelector('[data-illuminance]');
    this.statusLabel = this.root.querySelector('[data-status-msg]');

    this.isRunning = false;
    this.loopHandle = null;

    this.bindEngineEvents();
    this.bindControls();
    this.renderMap();
    this.updateStats();
    this.updateConfidenceChart();
  }

  bindEngineEvents() {
    this.engine.on('round', (entry) => {
      this.renderMap(entry);
      this.logRound(entry);
      this.updateStats(entry);
      this.updateConfidenceChart();
    });
    this.engine.on('reset', () => {
      if (this.logList) this.logList.innerHTML = '';
      this.renderMap();
      this.updateStats();
      this.updateConfidenceChart();
      this.setStatus('Simulation reset to baseline.');
    });
  }

  bindControls() {
    const toggle = this.root.querySelector('[data-action="toggle"]');
    const step = this.root.querySelector('[data-action="step"]');
    const reset = this.root.querySelector('[data-action="reset"]');
    toggle?.addEventListener('click', () => this.toggleRun());
    step?.addEventListener('click', () => {
      this.stopAuto();
      this.advanceRound();
    });
    reset?.addEventListener('click', () => {
      this.stopAuto();
      this.engine.reset();
    });
  }

  toggleRun() {
    if (this.isRunning) {
      this.stopAuto();
    } else {
      this.startAuto();
    }
  }

  startAuto() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.setStatus('Simulation streaming. Tap pause to inspect.');
    this.loopHandle = setInterval(() => {
      if (this.engine.isComplete()) {
        this.stopAuto();
        this.setStatus('Reached configured round limit.');
        return;
      }
      this.advanceRound();
    }, 450);
  }

  stopAuto() {
    if (this.loopHandle) {
      clearInterval(this.loopHandle);
      this.loopHandle = null;
    }
    this.isRunning = false;
    this.setStatus('Standing by. Manual control enabled.');
  }

  advanceRound() {
    if (this.engine.isComplete()) {
      this.setStatus('No more rounds available. Consider resetting.');
      return;
    }
    const entry = this.engine.step();
    if (entry?.detected) {
      this.setStatus(`Round ${entry.roundNumber}: SCAR-EYE flagged the threat.`);
    } else {
      this.setStatus(`Round ${entry?.roundNumber ?? ''}: Monitoring stealth traffic.`);
    }
  }

  renderMap(overlay) {
    if (!this.ctx) return;
    const options = overlay
      ? {
          path: overlay.path,
          hideLocation: overlay.hideLocation,
          predictedLocation: overlay.predictedLocation
        }
      : {};
    this.map.render(this.ctx, options);
  }

  logRound(entry) {
    if (!this.logList || !entry) return;
    const el = document.createElement('article');
    el.className = 'log-entry';
    el.innerHTML = `
      <header>
        <span>Round ${entry.roundNumber}</span>
        <span class="${entry.detected ? 'detected' : 'missed'}">${entry.detected ? 'DETECTED' : 'MISSED'}</span>
      </header>
      <p>${entry.reasoning}</p>
      <footer>
        <span>Confidence ${(entry.confidence * 100).toFixed(0)}%</span>
        <span>Delta ${distance(entry.hideLocation, entry.predictedLocation).toFixed(0)}m</span>
      </footer>
    `;
    this.logList.prepend(el);
    const maxEntries = 30;
    while (this.logList.children.length > maxEntries) {
      this.logList.removeChild(this.logList.lastChild);
    }
  }

  updateStats(entry) {
    if (this.roundLabel) {
      this.roundLabel.textContent = `${this.engine.currentRound} / ${this.engine.rounds}`;
    }
    if (this.detectionRateLabel) {
      this.detectionRateLabel.textContent = `${(this.engine.getDetectionRate() * 100).toFixed(1)}%`;
    }
    if (this.illuminanceLabel) {
      const lux = this.map.illuminance.current;
      this.illuminanceLabel.textContent = `${lux.toFixed(2)} au`;
    }
  }

  updateConfidenceChart() {
    if (!this.confidenceCtx) return;
    const ctx = this.confidenceCtx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(15, 28, 44, 0.9)';
    ctx.fillRect(0, 0, w, h);

    const history = this.engine.getConfidenceTrend(80);
    if (!history.length) return;

    ctx.strokeStyle = 'rgba(29, 233, 182, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((value, index) => {
      const x = (index / (history.length - 1 || 1)) * w;
      const y = h - value * h;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 82, 82, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, h - 0.65 * h);
    ctx.lineTo(w, h - 0.65 * h);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  setStatus(message) {
    if (this.statusLabel) {
      this.statusLabel.textContent = message;
    }
  }
}

function bootstrapWargame() {
  const map = new DigitalTwinMap();
  const redAI = new RedAI();
  const blueAI = new BlueAI();
  const engine = new SimulationEngine({ map, redAI, blueAI, rounds: 200 });
  const dashboard = new WargameDashboard({ map, engine });
  return { map, redAI, blueAI, engine, dashboard };
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.SCAREyeWargame = bootstrapWargame();
  });
}

export {
  DigitalTwinMap,
  RedAI,
  BlueAI,
  SimulationEngine,
  WargameDashboard
};
