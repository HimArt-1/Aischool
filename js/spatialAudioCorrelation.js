/* ====================================
   ShaheenEye - Spatial Audio Correlation Module
   Audio-Visual Spatial Correlation Layer
   ==================================== */

// ========================================
// 1. DIRECTIONAL MIC ARRAY
// ========================================

class DirectionalMicArray {
    constructor(digitalTwinMap = null) {
        this.twin = digitalTwinMap;
        this.microphones = [];
        this.readings = [];
        this.maxReadings = 100;
        
        // Configuration
        this.defaultMicCount = 12;
        this.defaultSensitivity = 0.7;
        this.defaultCoverageAngle = Math.PI / 3; // 60 degrees
        
        this.isActive = false;
        this.updateInterval = null;
        this.updateRate = 100; // ms
        
        this.init();
    }
    
    init() {
        this.generateMicrophoneArray();
    }
    
    generateMicrophoneArray() {
        this.microphones = [];
        
        // If we have a digital twin, place mics on buildings/poles
        if (this.twin) {
            this.placeMicsOnTwin();
        } else {
            // Default grid placement
            this.placeMicsOnGrid(800, 600);
        }
    }
    
    placeMicsOnTwin() {
        const width = this.twin.width || 800;
        const height = this.twin.height || 600;
        
        // Place mics on light poles if available
        if (this.twin.lightPoles && this.twin.lightPoles.length > 0) {
            this.twin.lightPoles.forEach((pole, index) => {
                this.microphones.push({
                    id: `mic_pole_${index}`,
                    position: { x: pole.x, y: pole.y },
                    coverageAngle: this.defaultCoverageAngle,
                    sensitivity: 0.6 + Math.random() * 0.3,
                    type: 'pole',
                    active: true,
                    currentLevel: 0,
                    direction: Math.random() * Math.PI * 2
                });
            });
        }
        
        // Place mics on building corners
        if (this.twin.buildings && this.twin.buildings.length > 0) {
            const selectedBuildings = this.twin.buildings.slice(0, 6);
            selectedBuildings.forEach((building, index) => {
                // Top-left corner
                this.microphones.push({
                    id: `mic_bldg_${index}`,
                    position: { 
                        x: building.x + building.width / 2, 
                        y: building.y 
                    },
                    coverageAngle: Math.PI / 2,
                    sensitivity: 0.7 + Math.random() * 0.2,
                    type: 'building',
                    active: true,
                    currentLevel: 0,
                    direction: Math.PI / 2
                });
            });
        }
        
        // Ensure minimum microphone count
        if (this.microphones.length < 8) {
            this.placeMicsOnGrid(width, height, 8 - this.microphones.length);
        }
    }
    
    placeMicsOnGrid(width, height, count = null) {
        const micCount = count || this.defaultMicCount;
        const cols = Math.ceil(Math.sqrt(micCount));
        const rows = Math.ceil(micCount / cols);
        
        const cellWidth = width / (cols + 1);
        const cellHeight = height / (rows + 1);
        
        let created = 0;
        for (let row = 0; row < rows && created < micCount; row++) {
            for (let col = 0; col < cols && created < micCount; col++) {
                const x = cellWidth * (col + 1) + (Math.random() - 0.5) * 30;
                const y = cellHeight * (row + 1) + (Math.random() - 0.5) * 30;
                
                this.microphones.push({
                    id: `mic_grid_${created}`,
                    position: { x, y },
                    coverageAngle: this.defaultCoverageAngle,
                    sensitivity: this.defaultSensitivity + (Math.random() - 0.5) * 0.2,
                    type: 'grid',
                    active: true,
                    currentLevel: 0,
                    direction: Math.random() * Math.PI * 2
                });
                created++;
            }
        }
    }
    
    // Set digital twin reference
    setDigitalTwin(twin) {
        this.twin = twin;
        this.generateMicrophoneArray();
    }
    
    // Start capturing readings
    start() {
        if (this.isActive) return;
        this.isActive = true;
        
        // Clear previous readings
        this.readings = [];
        
        // Start update loop
        this.updateInterval = setInterval(() => {
            this.updateLevels();
        }, this.updateRate);
    }
    
    // Stop capturing
    stop() {
        this.isActive = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // Update ambient levels (called periodically)
    updateLevels() {
        this.microphones.forEach(mic => {
            if (mic.active) {
                // Simulate ambient noise with slight fluctuation
                mic.currentLevel = Math.max(0, Math.min(1, 
                    mic.currentLevel * 0.9 + (Math.random() * 0.1)
                ));
            }
        });
    }
    
    // Receive audio event from simulator
    receiveAudioEvent(event) {
        const timestamp = Date.now();
        const eventReadings = [];
        
        this.microphones.forEach(mic => {
            if (!mic.active) return;
            
            // Calculate distance to event
            const dx = mic.position.x - event.originPosition.x;
            const dy = mic.position.y - event.originPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate intensity based on distance and sensitivity
            // Inverse square law with sensitivity factor
            const maxRange = 300;
            const rawIntensity = Math.max(0, 1 - (distance / maxRange));
            const intensity = rawIntensity * rawIntensity * mic.sensitivity * event.intensity;
            
            if (intensity > 0.05) {
                // Update mic level
                mic.currentLevel = Math.min(1, mic.currentLevel + intensity);
                
                // Generate frequency profile based on event type
                const frequencyProfile = this.generateFrequencyProfile(event.type, intensity);
                
                const reading = {
                    micId: mic.id,
                    timestamp,
                    intensity,
                    frequencyProfile,
                    eventType: event.type,
                    eventId: event.eventId,
                    distance
                };
                
                eventReadings.push(reading);
                this.readings.push(reading);
            }
        });
        
        // Keep readings manageable
        if (this.readings.length > this.maxReadings) {
            this.readings = this.readings.slice(-this.maxReadings);
        }
        
        return eventReadings;
    }
    
    generateFrequencyProfile(eventType, intensity) {
        // Simulate different frequency signatures for event types
        // Values represent approximate spectral bins (low to high frequency)
        const profiles = {
            dragging: [0.8, 0.6, 0.4, 0.2, 0.1], // Low frequency dominant
            drilling: [0.3, 0.5, 0.9, 0.7, 0.4], // Mid-high frequency
            impact: [0.9, 0.7, 0.5, 0.3, 0.2],   // Sharp low-mid burst
            footsteps: [0.5, 0.4, 0.3, 0.2, 0.1],
            voices: [0.2, 0.4, 0.6, 0.5, 0.3],
            vehicle: [0.7, 0.8, 0.5, 0.3, 0.2]
        };
        
        const baseProfile = profiles[eventType] || profiles.impact;
        
        // Add noise and scale by intensity
        return baseProfile.map(v => {
            const noise = (Math.random() - 0.5) * 0.2;
            return Math.max(0, Math.min(1, (v + noise) * intensity));
        });
    }
    
    // Get recent readings for a specific mic
    getMicReadings(micId, durationMs = 5000) {
        const cutoff = Date.now() - durationMs;
        return this.readings.filter(r => r.micId === micId && r.timestamp >= cutoff);
    }
    
    // Get all recent readings
    getRecentReadings(durationMs = 5000) {
        const cutoff = Date.now() - durationMs;
        return this.readings.filter(r => r.timestamp >= cutoff);
    }
    
    // Get microphone by ID
    getMic(micId) {
        return this.microphones.find(m => m.id === micId);
    }
    
    // Get all microphones
    getAllMics() {
        return [...this.microphones];
    }
    
    // Get active microphones
    getActiveMics() {
        return this.microphones.filter(m => m.active);
    }
    
    // Toggle microphone
    toggleMic(micId, active = null) {
        const mic = this.getMic(micId);
        if (mic) {
            mic.active = active !== null ? active : !mic.active;
        }
    }
}

// ========================================
// 2. AUDIO EVENT SIMULATOR
// ========================================

class AudioEventSimulator {
    constructor(micArray = null, digitalTwin = null) {
        this.micArray = micArray;
        this.twin = digitalTwin;
        
        this.isRunning = false;
        this.simulationInterval = null;
        this.eventInterval = null;
        
        // Event configuration
        this.eventTypes = [
            { 
                type: 'dragging', 
                name: 'جرّ جسم ثقيل',
                nameEn: 'Heavy Object Dragging',
                minDuration: 2000, 
                maxDuration: 8000,
                intensity: 0.7,
                probability: 0.3,
                suspicious: true
            },
            { 
                type: 'drilling', 
                name: 'صوت حفر',
                nameEn: 'Drilling Sound',
                minDuration: 3000, 
                maxDuration: 10000,
                intensity: 0.85,
                probability: 0.2,
                suspicious: true
            },
            { 
                type: 'impact', 
                name: 'ضربات/تكسير',
                nameEn: 'Impact/Breaking',
                minDuration: 500, 
                maxDuration: 2000,
                intensity: 0.9,
                probability: 0.25,
                suspicious: true
            },
            { 
                type: 'footsteps', 
                name: 'خطوات',
                nameEn: 'Footsteps',
                minDuration: 1000, 
                maxDuration: 5000,
                intensity: 0.4,
                probability: 0.5,
                suspicious: false
            },
            { 
                type: 'voices', 
                name: 'أصوات بشرية',
                nameEn: 'Human Voices',
                minDuration: 2000, 
                maxDuration: 10000,
                intensity: 0.5,
                probability: 0.4,
                suspicious: false
            },
            { 
                type: 'vehicle', 
                name: 'مركبة',
                nameEn: 'Vehicle',
                minDuration: 3000, 
                maxDuration: 15000,
                intensity: 0.6,
                probability: 0.3,
                suspicious: false
            }
        ];
        
        // Active events
        this.activeEvents = [];
        this.eventHistory = [];
        this.maxHistory = 50;
        
        // Callbacks
        this.onEventStart = null;
        this.onEventUpdate = null;
        this.onEventEnd = null;
        
        // Event generation settings
        this.minEventInterval = 2000;
        this.maxEventInterval = 8000;
        this.suspiciousEventBias = 0.4; // Probability to generate suspicious events
        
        // Map bounds
        this.mapWidth = 800;
        this.mapHeight = 600;
        
        this.eventIdCounter = 0;
    }
    
    setMicArray(micArray) {
        this.micArray = micArray;
    }
    
    setDigitalTwin(twin) {
        this.twin = twin;
        if (twin) {
            this.mapWidth = twin.width || 800;
            this.mapHeight = twin.height || 600;
        }
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        // Start event generation loop
        this.scheduleNextEvent();
        
        // Start active event update loop
        this.simulationInterval = setInterval(() => {
            this.updateActiveEvents();
        }, 100);
    }
    
    stop() {
        this.isRunning = false;
        
        if (this.eventInterval) {
            clearTimeout(this.eventInterval);
            this.eventInterval = null;
        }
        
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        // End all active events
        this.activeEvents.forEach(event => {
            this.endEvent(event);
        });
        this.activeEvents = [];
    }
    
    scheduleNextEvent() {
        if (!this.isRunning) return;
        
        const delay = this.minEventInterval + 
            Math.random() * (this.maxEventInterval - this.minEventInterval);
        
        this.eventInterval = setTimeout(() => {
            this.generateEvent();
            this.scheduleNextEvent();
        }, delay);
    }
    
    generateEvent(forceType = null) {
        // Choose event type
        let eventConfig;
        if (forceType) {
            eventConfig = this.eventTypes.find(e => e.type === forceType);
        } else {
            // Bias towards suspicious events based on setting
            const useSuspicious = Math.random() < this.suspiciousEventBias;
            const candidates = this.eventTypes.filter(e => 
                useSuspicious ? e.suspicious : !e.suspicious
            );
            
            // Weighted random selection
            const totalProb = candidates.reduce((sum, e) => sum + e.probability, 0);
            let random = Math.random() * totalProb;
            
            for (const candidate of candidates) {
                random -= candidate.probability;
                if (random <= 0) {
                    eventConfig = candidate;
                    break;
                }
            }
            
            if (!eventConfig) eventConfig = candidates[0];
        }
        
        // Generate position
        const position = this.generateEventPosition();
        
        // Calculate duration
        const duration = eventConfig.minDuration + 
            Math.random() * (eventConfig.maxDuration - eventConfig.minDuration);
        
        // Create event
        const event = {
            eventId: `audio_event_${++this.eventIdCounter}`,
            type: eventConfig.type,
            name: eventConfig.name,
            nameEn: eventConfig.nameEn,
            originPosition: position,
            intensity: eventConfig.intensity * (0.8 + Math.random() * 0.4),
            durationMs: duration,
            startTime: Date.now(),
            endTime: Date.now() + duration,
            suspicious: eventConfig.suspicious,
            active: true,
            progress: 0
        };
        
        this.activeEvents.push(event);
        
        if (this.onEventStart) {
            this.onEventStart(event);
        }
        
        // Send to mic array
        if (this.micArray) {
            this.micArray.receiveAudioEvent(event);
        }
        
        return event;
    }
    
    generateEventPosition() {
        // Try to place near interesting locations if digital twin available
        if (this.twin) {
            const rand = Math.random();
            
            // 30% chance near hide spots
            if (rand < 0.3 && this.twin.hideSpots && this.twin.hideSpots.length > 0) {
                const spot = this.twin.hideSpots[
                    Math.floor(Math.random() * this.twin.hideSpots.length)
                ];
                return {
                    x: spot.x + (Math.random() - 0.5) * 50,
                    y: spot.y + (Math.random() - 0.5) * 50
                };
            }
            
            // 30% chance near buildings
            if (rand < 0.6 && this.twin.buildings && this.twin.buildings.length > 0) {
                const building = this.twin.buildings[
                    Math.floor(Math.random() * this.twin.buildings.length)
                ];
                const side = Math.floor(Math.random() * 4);
                let x, y;
                
                switch (side) {
                    case 0: // Top
                        x = building.x + Math.random() * building.width;
                        y = building.y - 20;
                        break;
                    case 1: // Right
                        x = building.x + building.width + 20;
                        y = building.y + Math.random() * building.height;
                        break;
                    case 2: // Bottom
                        x = building.x + Math.random() * building.width;
                        y = building.y + building.height + 20;
                        break;
                    case 3: // Left
                        x = building.x - 20;
                        y = building.y + Math.random() * building.height;
                        break;
                }
                
                return { x, y };
            }
        }
        
        // Random position
        return {
            x: 50 + Math.random() * (this.mapWidth - 100),
            y: 50 + Math.random() * (this.mapHeight - 100)
        };
    }
    
    updateActiveEvents() {
        const now = Date.now();
        
        this.activeEvents = this.activeEvents.filter(event => {
            // Update progress
            const elapsed = now - event.startTime;
            event.progress = Math.min(1, elapsed / event.durationMs);
            
            // Check if ended
            if (now >= event.endTime) {
                this.endEvent(event);
                return false;
            }
            
            // Send continuous readings for ongoing events
            if (this.micArray && event.progress < 1) {
                // Vary intensity slightly
                const variedEvent = {
                    ...event,
                    intensity: event.intensity * (0.8 + Math.random() * 0.4)
                };
                this.micArray.receiveAudioEvent(variedEvent);
            }
            
            if (this.onEventUpdate) {
                this.onEventUpdate(event);
            }
            
            return true;
        });
    }
    
    endEvent(event) {
        event.active = false;
        event.progress = 1;
        
        this.eventHistory.unshift(event);
        
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory = this.eventHistory.slice(0, this.maxHistory);
        }
        
        if (this.onEventEnd) {
            this.onEventEnd(event);
        }
    }
    
    // Manually trigger a specific event type
    triggerEvent(type) {
        return this.generateEvent(type);
    }
    
    // Get active events
    getActiveEvents() {
        return [...this.activeEvents];
    }
    
    // Get suspicious active events
    getSuspiciousEvents() {
        return this.activeEvents.filter(e => e.suspicious);
    }
    
    // Get event history
    getEventHistory() {
        return [...this.eventHistory];
    }
    
    // Configure event generation
    configure(options) {
        if (options.minInterval !== undefined) {
            this.minEventInterval = options.minInterval;
        }
        if (options.maxInterval !== undefined) {
            this.maxEventInterval = options.maxInterval;
        }
        if (options.suspiciousBias !== undefined) {
            this.suspiciousEventBias = options.suspiciousBias;
        }
    }
}

// ========================================
// 3. AUDIO VISUAL CORRELATOR
// ========================================

class AudioVisualCorrelator {
    constructor(micArray = null, digitalTwin = null) {
        this.micArray = micArray;
        this.twin = digitalTwin;
        
        // Correlated events
        this.correlatedEvents = [];
        this.maxCorrelatedEvents = 50;
        
        // Processing settings
        this.triangulationThreshold = 0.15; // Minimum intensity to consider
        this.confirmationDuration = 3000; // Duration needed for high confidence
        this.minMicsRequired = 2; // Minimum mics that must detect
        
        // Mode
        this.mode = 'night'; // 'night' | 'day'
        
        // Camera data (will be populated from twin)
        this.cameras = [];
        
        // Callbacks
        this.onCorrelatedEvent = null;
        this.onConfirmation = null;
        
        // Active correlations being processed
        this.pendingCorrelations = new Map();
        
        this.correlationIdCounter = 0;
    }
    
    setMicArray(micArray) {
        this.micArray = micArray;
    }
    
    setDigitalTwin(twin) {
        this.twin = twin;
        if (twin && twin.cameras) {
            this.cameras = twin.cameras.map(c => ({
                id: c.id,
                x: c.x,
                y: c.y,
                range: c.range || 100
            }));
        }
    }
    
    setMode(mode) {
        this.mode = mode;
    }
    
    // Process mic readings and generate correlated events
    processReadings(readings) {
        if (!readings || readings.length === 0) return null;
        
        // Group readings by event
        const eventGroups = new Map();
        
        readings.forEach(reading => {
            if (reading.intensity < this.triangulationThreshold) return;
            
            const key = reading.eventId || `anon_${reading.timestamp}`;
            if (!eventGroups.has(key)) {
                eventGroups.set(key, []);
            }
            eventGroups.get(key).push(reading);
        });
        
        const results = [];
        
        // Process each event group
        eventGroups.forEach((eventReadings, eventKey) => {
            if (eventReadings.length < this.minMicsRequired) return;
            
            // Triangulate position
            const probableLocation = this.triangulatePosition(eventReadings);
            if (!probableLocation) return;
            
            // Calculate confidence
            const confidence = this.calculateConfidence(eventReadings);
            
            // Get event type
            const eventType = eventReadings[0].eventType || 'unknown';
            
            // Find recommended cameras
            const recommendedCameras = this.findRecommendedCameras(probableLocation);
            
            // Check for existing pending correlation
            let pending = this.pendingCorrelations.get(eventKey);
            
            if (!pending) {
                pending = {
                    firstDetection: Date.now(),
                    readings: [],
                    eventType,
                    location: probableLocation
                };
                this.pendingCorrelations.set(eventKey, pending);
            }
            
            pending.readings.push(...eventReadings);
            pending.lastUpdate = Date.now();
            
            // Check if duration threshold met for high confidence
            const duration = Date.now() - pending.firstDetection;
            const isConfirmed = duration >= this.confirmationDuration && 
                               eventReadings.length >= this.minMicsRequired;
            
            // Create correlated event
            const correlatedEvent = {
                eventId: `corr_${++this.correlationIdCounter}`,
                sourceEventId: eventKey,
                probableLocation,
                confidence: Math.min(1, confidence * (isConfirmed ? 1.3 : 1)),
                eventType,
                eventTypeName: this.getEventTypeName(eventType),
                recommendedCameras,
                status: this.determineStatus(confidence, isConfirmed, duration),
                durationMs: duration,
                micsInvolved: eventReadings.length,
                timestamp: Date.now(),
                mode: this.mode,
                visualCorrelation: this.mode === 'day' ? 'validation_layer' : 'primary'
            };
            
            // Add to correlated events
            this.correlatedEvents.unshift(correlatedEvent);
            if (this.correlatedEvents.length > this.maxCorrelatedEvents) {
                this.correlatedEvents = this.correlatedEvents.slice(0, this.maxCorrelatedEvents);
            }
            
            results.push(correlatedEvent);
            
            // Callbacks
            if (this.onCorrelatedEvent) {
                this.onCorrelatedEvent(correlatedEvent);
            }
            
            if (isConfirmed && this.onConfirmation) {
                this.onConfirmation(correlatedEvent);
                this.pendingCorrelations.delete(eventKey);
            }
        });
        
        // Clean up old pending correlations
        const now = Date.now();
        this.pendingCorrelations.forEach((pending, key) => {
            if (now - pending.lastUpdate > 5000) {
                this.pendingCorrelations.delete(key);
            }
        });
        
        return results;
    }
    
    // Triangulate position using weighted average
    triangulatePosition(readings) {
        if (!this.micArray || readings.length === 0) return null;
        
        let totalWeight = 0;
        let weightedX = 0;
        let weightedY = 0;
        
        readings.forEach(reading => {
            const mic = this.micArray.getMic(reading.micId);
            if (!mic) return;
            
            // Weight by intensity squared (inverse square approximation)
            const weight = reading.intensity * reading.intensity;
            
            weightedX += mic.position.x * weight;
            weightedY += mic.position.y * weight;
            totalWeight += weight;
        });
        
        if (totalWeight === 0) return null;
        
        return {
            x: weightedX / totalWeight,
            y: weightedY / totalWeight
        };
    }
    
    // Calculate confidence based on readings
    calculateConfidence(readings) {
        if (readings.length === 0) return 0;
        
        // Base confidence from number of mics
        const micFactor = Math.min(1, readings.length / 4);
        
        // Average intensity
        const avgIntensity = readings.reduce((sum, r) => sum + r.intensity, 0) / readings.length;
        
        // Consistency of frequency profile
        let profileConsistency = 1;
        if (readings.length > 1) {
            const firstProfile = readings[0].frequencyProfile;
            readings.slice(1).forEach(r => {
                if (r.frequencyProfile && firstProfile) {
                    const diff = r.frequencyProfile.reduce((sum, v, i) => {
                        return sum + Math.abs(v - firstProfile[i]);
                    }, 0) / r.frequencyProfile.length;
                    profileConsistency *= (1 - diff * 0.5);
                }
            });
        }
        
        // Night mode bonus (audio more reliable)
        const modeBonus = this.mode === 'night' ? 1.2 : 1.0;
        
        return Math.min(1, micFactor * avgIntensity * profileConsistency * modeBonus);
    }
    
    // Determine event status
    determineStatus(confidence, isConfirmed, duration) {
        if (isConfirmed && confidence > 0.7) return 'confirmed';
        if (confidence > 0.5 || duration > 2000) return 'pending';
        return 'uncertain';
    }
    
    // Find cameras near the probable location
    findRecommendedCameras(location, maxCount = 3) {
        if (!location) return [];
        
        // Use twin cameras or fallback
        const cameras = this.cameras.length > 0 ? this.cameras : 
            (this.twin && this.twin.cameras ? this.twin.cameras : []);
        
        if (cameras.length === 0) return [];
        
        // Calculate distances and sort
        const camerasWithDistance = cameras.map(cam => {
            const dx = cam.x - location.x;
            const dy = cam.y - location.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return { camera: cam, distance };
        });
        
        camerasWithDistance.sort((a, b) => a.distance - b.distance);
        
        // Return closest cameras that are in range
        return camerasWithDistance
            .filter(c => c.distance < (c.camera.range * 2 || 200))
            .slice(0, maxCount)
            .map(c => c.camera.id);
    }
    
    getEventTypeName(type) {
        const names = {
            dragging: 'جرّ جسم ثقيل',
            drilling: 'صوت حفر',
            impact: 'ضربات/تكسير',
            footsteps: 'خطوات',
            voices: 'أصوات بشرية',
            vehicle: 'مركبة',
            unknown: 'غير محدد'
        };
        return names[type] || names.unknown;
    }
    
    // Get recent correlated events
    getCorrelatedEvents(durationMs = 30000) {
        const cutoff = Date.now() - durationMs;
        return this.correlatedEvents.filter(e => e.timestamp >= cutoff);
    }
    
    // Get confirmed events
    getConfirmedEvents() {
        return this.correlatedEvents.filter(e => e.status === 'confirmed');
    }
    
    // Get suspicious correlated events
    getSuspiciousEvents() {
        const suspiciousTypes = ['dragging', 'drilling', 'impact'];
        return this.correlatedEvents.filter(e => 
            suspiciousTypes.includes(e.eventType) && e.confidence > 0.5
        );
    }
    
    // Manual correlation trigger
    correlateEvent(eventData) {
        if (!this.micArray) return null;
        
        const readings = this.micArray.getRecentReadings(2000);
        const eventReadings = readings.filter(r => 
            r.eventId === eventData.eventId || 
            (r.eventType === eventData.type && r.timestamp >= eventData.startTime)
        );
        
        return this.processReadings(eventReadings);
    }
    
    // Clear all correlations
    clear() {
        this.correlatedEvents = [];
        this.pendingCorrelations.clear();
    }
}

// ========================================
// 4. AUDIO HEATMAP OVERLAY
// ========================================

class AudioHeatmapOverlay {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        
        this.correlator = options.correlator || null;
        this.micArray = options.micArray || null;
        this.twin = options.twin || null;
        
        // Dimensions
        this.width = options.width || 800;
        this.height = options.height || 600;
        
        // Display settings
        this.showMicrophones = true;
        this.showEvents = true;
        this.showHeatmap = true;
        this.showLabels = true;
        
        // Animation
        this.animationFrame = null;
        this.time = 0;
        
        // Event details panel
        this.selectedEvent = null;
        this.detailsPanel = null;
        
        // Events for display
        this.displayEvents = [];
        
        // Callbacks
        this.onEventClick = null;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.createCanvas();
        this.createDetailsPanel();
        this.setupEventListeners();
        this.startAnimation();
    }
    
    createCanvas() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'audio-overlay-canvas';
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: auto;
            z-index: 10;
        `;
        
        this.container.style.position = 'relative';
        this.container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
    }
    
    createDetailsPanel() {
        this.detailsPanel = document.createElement('div');
        this.detailsPanel.className = 'audio-event-details-panel';
        this.detailsPanel.style.cssText = `
            position: absolute;
            display: none;
            background: rgba(10, 14, 23, 0.95);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 8px;
            padding: 12px;
            min-width: 220px;
            z-index: 100;
            color: #fff;
            font-family: 'Cairo', sans-serif;
            font-size: 12px;
            direction: rtl;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
        
        this.container.appendChild(this.detailsPanel);
    }
    
    setupEventListeners() {
        if (!this.canvas) return;
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            this.handleClick(x, y, e.clientX, e.clientY);
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.detailsPanel.contains(e.target) && 
                e.target !== this.canvas) {
                this.hideDetailsPanel();
            }
        });
    }
    
    handleClick(x, y, screenX, screenY) {
        // Check if clicked on an event
        const clickedEvent = this.findEventAtPosition(x, y);
        
        if (clickedEvent) {
            this.selectedEvent = clickedEvent;
            this.showDetailsPanel(clickedEvent, screenX, screenY);
            
            if (this.onEventClick) {
                this.onEventClick(clickedEvent);
            }
        } else {
            this.hideDetailsPanel();
            this.selectedEvent = null;
        }
    }
    
    findEventAtPosition(x, y) {
        const threshold = 30;
        
        for (const event of this.displayEvents) {
            const dx = event.probableLocation.x - x;
            const dy = event.probableLocation.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < threshold) {
                return event;
            }
        }
        
        return null;
    }
    
    showDetailsPanel(event, screenX, screenY) {
        if (!this.detailsPanel) return;
        
        const statusColors = {
            confirmed: '#10b981',
            pending: '#f59e0b',
            uncertain: '#ef4444'
        };
        
        const statusLabels = {
            confirmed: 'مؤكد',
            pending: 'قيد التحقق',
            uncertain: 'غير مؤكد'
        };
        
        this.detailsPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="color: #006C35;">🔊 ${event.eventTypeName}</strong>
                <span style="
                    background: ${statusColors[event.status] || statusColors.uncertain};
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 10px;
                ">${statusLabels[event.status] || event.status}</span>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                <div style="margin-bottom: 4px;">
                    <span style="color: #64748b;">المدة:</span>
                    <span style="margin-right: 5px;">${(event.durationMs / 1000).toFixed(1)} ثانية</span>
                </div>
                <div style="margin-bottom: 4px;">
                    <span style="color: #64748b;">الثقة:</span>
                    <span style="margin-right: 5px; color: ${event.confidence > 0.7 ? '#10b981' : '#f59e0b'};">
                        ${(event.confidence * 100).toFixed(0)}%
                    </span>
                </div>
                <div style="margin-bottom: 4px;">
                    <span style="color: #64748b;">الميكروفونات:</span>
                    <span style="margin-right: 5px;">${event.micsInvolved}</span>
                </div>
                <div style="margin-bottom: 4px;">
                    <span style="color: #64748b;">الموقع:</span>
                    <span style="margin-right: 5px; font-family: 'Orbitron', monospace; font-size: 10px;">
                        (${event.probableLocation.x.toFixed(0)}, ${event.probableLocation.y.toFixed(0)})
                    </span>
                </div>
            </div>
            ${event.recommendedCameras.length > 0 ? `
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 8px;">
                <div style="color: #64748b; margin-bottom: 4px;">الكاميرات المقترحة:</div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    ${event.recommendedCameras.map(cam => `
                        <span style="
                            background: rgba(0, 128, 255, 0.2);
                            border: 1px solid #008542;
                            padding: 2px 6px;
                            border-radius: 4px;
                            font-size: 10px;
                        ">📷 ${cam}</span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            <div style="
                border-top: 1px solid rgba(255,255,255,0.1);
                padding-top: 8px;
                margin-top: 8px;
                font-size: 10px;
                color: #64748b;
            ">
                ${event.mode === 'night' ? '🌙 الوضع الليلي - اعتماد أساسي على الصوت' : '☀️ الوضع النهاري - طبقة تحقق'}
            </div>
        `;
        
        // Position panel
        const containerRect = this.container.getBoundingClientRect();
        let left = screenX - containerRect.left + 10;
        let top = screenY - containerRect.top + 10;
        
        // Keep within bounds
        if (left + 240 > containerRect.width) {
            left = screenX - containerRect.left - 250;
        }
        if (top + 200 > containerRect.height) {
            top = screenY - containerRect.top - 210;
        }
        
        this.detailsPanel.style.left = `${left}px`;
        this.detailsPanel.style.top = `${top}px`;
        this.detailsPanel.style.display = 'block';
    }
    
    hideDetailsPanel() {
        if (this.detailsPanel) {
            this.detailsPanel.style.display = 'none';
        }
    }
    
    setCorrelator(correlator) {
        this.correlator = correlator;
    }
    
    setMicArray(micArray) {
        this.micArray = micArray;
    }
    
    setDigitalTwin(twin) {
        this.twin = twin;
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        if (this.canvas) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }
    
    startAnimation() {
        const animate = () => {
            this.time += 0.016;
            this.update();
            this.draw();
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    update() {
        // Get correlated events
        if (this.correlator) {
            this.displayEvents = this.correlator.getCorrelatedEvents(30000);
        }
    }
    
    draw() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw heatmap
        if (this.showHeatmap) {
            this.drawHeatmap();
        }
        
        // Draw microphones
        if (this.showMicrophones && this.micArray) {
            this.drawMicrophones();
        }
        
        // Draw events
        if (this.showEvents) {
            this.drawEvents();
        }
    }
    
    drawHeatmap() {
        const ctx = this.ctx;
        
        // Create heatmap from mic readings
        if (!this.micArray) return;
        
        const mics = this.micArray.getActiveMics();
        
        mics.forEach(mic => {
            if (mic.currentLevel > 0.1) {
                const gradient = ctx.createRadialGradient(
                    mic.position.x, mic.position.y, 0,
                    mic.position.x, mic.position.y, 80 * mic.currentLevel
                );
                
                const alpha = mic.currentLevel * 0.3;
                gradient.addColorStop(0, `rgba(255, 100, 50, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(255, 150, 0, ${alpha * 0.5})`);
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(mic.position.x, mic.position.y, 80, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    drawMicrophones() {
        const ctx = this.ctx;
        const mics = this.micArray.getAllMics();
        
        mics.forEach(mic => {
            const isActive = mic.active;
            const level = mic.currentLevel;
            
            // Base circle
            ctx.fillStyle = isActive ? 
                `rgba(0, 240, 255, ${0.3 + level * 0.5})` : 
                'rgba(100, 100, 100, 0.3)';
            ctx.beginPath();
            ctx.arc(mic.position.x, mic.position.y, 6 + level * 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Outer ring when active
            if (isActive && level > 0.2) {
                ctx.strokeStyle = `rgba(0, 240, 255, ${level * 0.8})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(mic.position.x, mic.position.y, 12 + level * 8, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Icon
            if (this.showLabels) {
                ctx.fillStyle = isActive ? '#006C35' : '#666';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🎤', mic.position.x, mic.position.y + 4);
            }
        });
    }
    
    drawEvents() {
        const ctx = this.ctx;
        
        this.displayEvents.forEach(event => {
            const { probableLocation, confidence, status, eventType } = event;
            const isSelected = this.selectedEvent && 
                              this.selectedEvent.eventId === event.eventId;
            
            // Determine color based on status
            const colors = {
                confirmed: { r: 16, g: 185, b: 129 },  // Green
                pending: { r: 245, g: 158, b: 11 },    // Orange
                uncertain: { r: 239, g: 68, b: 68 }    // Red
            };
            
            const color = colors[status] || colors.uncertain;
            const pulseScale = 1 + Math.sin(this.time * 4) * 0.15;
            const baseRadius = 20 + confidence * 15;
            const radius = baseRadius * pulseScale;
            
            // Outer glow
            const gradient = ctx.createRadialGradient(
                probableLocation.x, probableLocation.y, 0,
                probableLocation.x, probableLocation.y, radius * 2
            );
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${confidence * 0.5})`);
            gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${confidence * 0.2})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(probableLocation.x, probableLocation.y, radius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner circle
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.6 + confidence * 0.4})`;
            ctx.beginPath();
            ctx.arc(probableLocation.x, probableLocation.y, radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Selection ring
            if (isSelected) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(probableLocation.x, probableLocation.y, radius + 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            
            // Event type icon
            const icons = {
                dragging: '📦',
                drilling: '🔧',
                impact: '💥',
                footsteps: '👣',
                voices: '🗣️',
                vehicle: '🚗'
            };
            
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(icons[eventType] || '🔊', probableLocation.x, probableLocation.y + 5);
            
            // Confidence label
            if (this.showLabels && confidence > 0.3) {
                ctx.fillStyle = '#fff';
                ctx.font = '10px Cairo';
                ctx.fillText(`${(confidence * 100).toFixed(0)}%`, 
                    probableLocation.x, probableLocation.y - radius - 5);
            }
        });
    }
    
    // Toggle display options
    toggle(option, value = null) {
        switch (option) {
            case 'microphones':
                this.showMicrophones = value !== null ? value : !this.showMicrophones;
                break;
            case 'events':
                this.showEvents = value !== null ? value : !this.showEvents;
                break;
            case 'heatmap':
                this.showHeatmap = value !== null ? value : !this.showHeatmap;
                break;
            case 'labels':
                this.showLabels = value !== null ? value : !this.showLabels;
                break;
        }
    }
    
    // Clean up
    destroy() {
        this.stopAnimation();
        if (this.canvas && this.container) {
            this.container.removeChild(this.canvas);
        }
        if (this.detailsPanel && this.container) {
            this.container.removeChild(this.detailsPanel);
        }
    }
}

// ========================================
// 5. SPATIAL AUDIO MODULE (MAIN CONTROLLER)
// ========================================

class SpatialAudioModule {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        // Components
        this.micArray = null;
        this.eventSimulator = null;
        this.correlator = null;
        this.overlay = null;
        
        // External references
        this.digitalTwin = options.digitalTwin || null;
        
        // State
        this.isEnabled = false;
        this.isInitialized = false;
        
        // Configuration
        this.mode = options.mode || 'night';
        this.autoProcess = true;
        this.processInterval = null;
        this.processRate = 200; // ms
        
        // Callbacks
        this.onSuspiciousEvent = options.onSuspiciousEvent || null;
        this.onConfirmedEvent = options.onConfirmedEvent || null;
        
        // Statistics
        this.stats = {
            totalEvents: 0,
            suspiciousEvents: 0,
            confirmedEvents: 0,
            micsActive: 0
        };
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Create components
        this.micArray = new DirectionalMicArray(this.digitalTwin);
        this.eventSimulator = new AudioEventSimulator(this.micArray, this.digitalTwin);
        this.correlator = new AudioVisualCorrelator(this.micArray, this.digitalTwin);
        
        // Create overlay if container exists
        if (this.container) {
            this.overlay = new AudioHeatmapOverlay(this.containerId, {
                correlator: this.correlator,
                micArray: this.micArray,
                twin: this.digitalTwin
            });
        }
        
        // Set up callbacks
        this.eventSimulator.onEventStart = (event) => {
            this.handleEventStart(event);
        };
        
        this.eventSimulator.onEventEnd = (event) => {
            this.handleEventEnd(event);
        };
        
        this.correlator.onCorrelatedEvent = (event) => {
            this.handleCorrelatedEvent(event);
        };
        
        this.correlator.onConfirmation = (event) => {
            this.handleConfirmation(event);
        };
        
        // Set mode
        this.correlator.setMode(this.mode);
        
        this.isInitialized = true;
        this.updateStats();
    }
    
    setDigitalTwin(twin) {
        this.digitalTwin = twin;
        
        if (this.micArray) this.micArray.setDigitalTwin(twin);
        if (this.eventSimulator) this.eventSimulator.setDigitalTwin(twin);
        if (this.correlator) this.correlator.setDigitalTwin(twin);
        if (this.overlay) this.overlay.setDigitalTwin(twin);
    }
    
    enable() {
        if (!this.isInitialized) {
            this.init();
        }
        
        if (this.isEnabled) return;
        
        this.isEnabled = true;
        
        // Start components
        this.micArray.start();
        this.eventSimulator.start();
        
        // Start processing loop
        if (this.autoProcess) {
            this.startProcessing();
        }
        
        this.updateStats();
    }
    
    disable() {
        if (!this.isEnabled) return;
        
        this.isEnabled = false;
        
        // Stop components
        this.micArray.stop();
        this.eventSimulator.stop();
        
        // Stop processing
        this.stopProcessing();
        
        // Clear correlations
        if (this.correlator) {
            this.correlator.clear();
        }
    }
    
    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.isEnabled;
    }
    
    startProcessing() {
        if (this.processInterval) return;
        
        this.processInterval = setInterval(() => {
            this.processAudio();
        }, this.processRate);
    }
    
    stopProcessing() {
        if (this.processInterval) {
            clearInterval(this.processInterval);
            this.processInterval = null;
        }
    }
    
    processAudio() {
        if (!this.isEnabled || !this.correlator || !this.micArray) return;
        
        const readings = this.micArray.getRecentReadings(this.processRate * 2);
        
        if (readings.length > 0) {
            this.correlator.processReadings(readings);
        }
    }
    
    handleEventStart(event) {
        this.stats.totalEvents++;
        if (event.suspicious) {
            this.stats.suspiciousEvents++;
        }
    }
    
    handleEventEnd(event) {
        // Event ended
    }
    
    handleCorrelatedEvent(event) {
        if (event.confidence > 0.6 && 
            ['dragging', 'drilling', 'impact'].includes(event.eventType)) {
            if (this.onSuspiciousEvent) {
                this.onSuspiciousEvent(event);
            }
        }
    }
    
    handleConfirmation(event) {
        this.stats.confirmedEvents++;
        
        if (this.onConfirmedEvent) {
            this.onConfirmedEvent(event);
        }
    }
    
    setMode(mode) {
        this.mode = mode;
        if (this.correlator) {
            this.correlator.setMode(mode);
        }
    }
    
    updateStats() {
        if (this.micArray) {
            this.stats.micsActive = this.micArray.getActiveMics().length;
        }
    }
    
    getStats() {
        this.updateStats();
        return { ...this.stats };
    }
    
    // Manual event trigger
    triggerEvent(type) {
        if (!this.isEnabled || !this.eventSimulator) return null;
        return this.eventSimulator.triggerEvent(type);
    }
    
    // Get active events
    getActiveEvents() {
        return this.eventSimulator ? this.eventSimulator.getActiveEvents() : [];
    }
    
    // Get correlated events
    getCorrelatedEvents() {
        return this.correlator ? this.correlator.getCorrelatedEvents() : [];
    }
    
    // Configure
    configure(options) {
        if (options.eventInterval && this.eventSimulator) {
            this.eventSimulator.configure({
                minInterval: options.eventInterval.min,
                maxInterval: options.eventInterval.max
            });
        }
        
        if (options.suspiciousBias !== undefined && this.eventSimulator) {
            this.eventSimulator.configure({ suspiciousBias: options.suspiciousBias });
        }
        
        if (options.processRate !== undefined) {
            this.processRate = options.processRate;
            if (this.isEnabled) {
                this.stopProcessing();
                this.startProcessing();
            }
        }
    }
    
    // Cleanup
    destroy() {
        this.disable();
        
        if (this.overlay) {
            this.overlay.destroy();
        }
    }
}

// ========================================
// EXPORTS
// ========================================

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DirectionalMicArray,
        AudioEventSimulator,
        AudioVisualCorrelator,
        AudioHeatmapOverlay,
        SpatialAudioModule
    };
}

// Export for browser
window.SpatialAudioCorrelation = {
    DirectionalMicArray,
    AudioEventSimulator,
    AudioVisualCorrelator,
    AudioHeatmapOverlay,
    SpatialAudioModule
};
