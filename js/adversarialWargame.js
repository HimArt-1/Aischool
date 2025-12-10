/* ====================================
   ShaheenEye - Adversarial AI Wargaming Module
   Complete Standalone Simulation Module
   ==================================== */

// ========================================
// 1. DIGITAL TWIN MAP
// ========================================

class DigitalTwinMap {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        this.width = 800;
        this.height = 600;
        
        // Map elements
        this.buildings = [];
        this.streets = [];
        this.hideSpots = [];
        this.cameras = [];
        this.lightPoles = [];
        
        // Spectral layers (mock data)
        this.spectralLayers = {
            thermal: [],
            material: [],
            motion: []
        };
        
        // Illuminance settings
        this.globalIlluminance = 0.3; // Night mode default
        this.adaptiveZones = [];
        
        // Animation
        this.time = 0;
        
        this.init();
    }
    
    init() {
        if (!this.canvas) return;
        
        this.resize();
        this.generateCity();
        this.generateSpectralLayers();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth || 800;
            this.canvas.height = container.clientHeight || 600;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
    }
    
    generateCity() {
        // Generate buildings
        const buildingCount = 25;
        for (let i = 0; i < buildingCount; i++) {
            const building = {
                id: `building_${i}`,
                x: 50 + Math.random() * (this.width - 150),
                y: 50 + Math.random() * (this.height - 150),
                width: 40 + Math.random() * 60,
                height: 40 + Math.random() * 60,
                floors: 1 + Math.floor(Math.random() * 5),
                color: `hsl(${200 + Math.random() * 40}, 30%, ${15 + Math.random() * 15}%)`,
                material: this.getRandomMaterial()
            };
            this.buildings.push(building);
        }
        
        // Generate streets (main arteries)
        this.streets = [
            { x1: 0, y1: this.height / 3, x2: this.width, y2: this.height / 3, width: 30 },
            { x1: 0, y1: 2 * this.height / 3, x2: this.width, y2: 2 * this.height / 3, width: 30 },
            { x1: this.width / 3, y1: 0, x2: this.width / 3, y2: this.height, width: 25 },
            { x1: 2 * this.width / 3, y1: 0, x2: 2 * this.width / 3, y2: this.height, width: 25 }
        ];
        
        // Generate hide spots (dark corners, alleys)
        for (let i = 0; i < 15; i++) {
            this.hideSpots.push({
                id: `hide_${i}`,
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 20 + Math.random() * 30,
                darkness: 0.6 + Math.random() * 0.3,
                quality: Math.random() // How good for hiding
            });
        }
        
        // Generate cameras
        for (let i = 0; i < 8; i++) {
            this.cameras.push({
                id: `cam_${i}`,
                x: 50 + Math.random() * (this.width - 100),
                y: 50 + Math.random() * (this.height - 100),
                angle: Math.random() * Math.PI * 2,
                fov: Math.PI / 3,
                range: 100 + Math.random() * 50,
                active: true
            });
        }
        
        // Generate light poles
        for (let i = 0; i < 12; i++) {
            this.lightPoles.push({
                id: `light_${i}`,
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                intensity: 0.3 + Math.random() * 0.3,
                baseIntensity: 0.3,
                targetIntensity: 0.3,
                range: 60 + Math.random() * 40,
                spectrum: { r: 1, g: 0.95, b: 0.9, ir: 0 }
            });
        }
    }
    
    getRandomMaterial() {
        const materials = ['concrete', 'brick', 'metal', 'glass', 'plastic', 'wood'];
        return materials[Math.floor(Math.random() * materials.length)];
    }
    
    generateSpectralLayers() {
        // Thermal layer
        for (let i = 0; i < 50; i++) {
            this.spectralLayers.thermal.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                temperature: 20 + Math.random() * 20,
                radius: 10 + Math.random() * 30
            });
        }
        
        // Material signatures
        this.buildings.forEach(b => {
            this.spectralLayers.material.push({
                x: b.x + b.width / 2,
                y: b.y + b.height / 2,
                material: b.material,
                signature: this.getMaterialSignature(b.material)
            });
        });
    }
    
    getMaterialSignature(material) {
        const signatures = {
            concrete: { r: 0.5, g: 0.5, b: 0.5, spectral: [0.4, 0.45, 0.5, 0.55, 0.6] },
            brick: { r: 0.7, g: 0.3, b: 0.2, spectral: [0.6, 0.4, 0.3, 0.35, 0.4] },
            metal: { r: 0.8, g: 0.8, b: 0.9, spectral: [0.7, 0.8, 0.9, 0.85, 0.8] },
            glass: { r: 0.3, g: 0.5, b: 0.7, spectral: [0.2, 0.4, 0.6, 0.7, 0.8] },
            plastic: { r: 0.6, g: 0.5, b: 0.4, spectral: [0.5, 0.5, 0.5, 0.6, 0.65] },
            wood: { r: 0.6, g: 0.4, b: 0.2, spectral: [0.5, 0.45, 0.35, 0.3, 0.25] },
            explosive: { r: 0.9, g: 0.2, b: 0.1, spectral: [0.8, 0.3, 0.2, 0.15, 0.1] }
        };
        return signatures[material] || signatures.concrete;
    }
    
    // Adaptive illuminance - increase light in a zone
    adjustIlluminance(x, y, intensity, temporary = true) {
        const affectedPoles = this.lightPoles.filter(pole => {
            const dist = Math.hypot(pole.x - x, pole.y - y);
            return dist < 150;
        });
        
        affectedPoles.forEach(pole => {
            pole.targetIntensity = Math.min(1, pole.baseIntensity + intensity);
        });
        
        this.adaptiveZones.push({
            x, y,
            radius: 150,
            intensity,
            timestamp: Date.now(),
            duration: temporary ? 3000 : -1
        });
        
        return affectedPoles.length;
    }
    
    // Check visibility at a point
    getVisibilityAt(x, y) {
        let visibility = this.globalIlluminance;
        
        // Add light pole contributions
        this.lightPoles.forEach(pole => {
            const dist = Math.hypot(pole.x - x, pole.y - y);
            if (dist < pole.range) {
                visibility += pole.intensity * (1 - dist / pole.range);
            }
        });
        
        // Subtract darkness from hide spots
        this.hideSpots.forEach(spot => {
            const dist = Math.hypot(spot.x - x, spot.y - y);
            if (dist < spot.radius) {
                visibility *= (1 - spot.darkness * (1 - dist / spot.radius));
            }
        });
        
        // Check camera coverage
        let inCameraView = false;
        this.cameras.forEach(cam => {
            const dist = Math.hypot(cam.x - x, cam.y - y);
            if (dist < cam.range && cam.active) {
                const angle = Math.atan2(y - cam.y, x - cam.x);
                const angleDiff = Math.abs(this.normalizeAngle(angle - cam.angle));
                if (angleDiff < cam.fov / 2) {
                    inCameraView = true;
                }
            }
        });
        
        return {
            light: Math.min(1, Math.max(0, visibility)),
            cameraVisible: inCameraView,
            quality: visibility * (inCameraView ? 1.5 : 1)
        };
    }
    
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }
    
    // Find best hide spots
    getBestHideSpots(count = 5) {
        const spots = this.hideSpots.map(spot => {
            const visibility = this.getVisibilityAt(spot.x, spot.y);
            return {
                ...spot,
                score: (1 - visibility.light) * spot.quality * (visibility.cameraVisible ? 0.3 : 1)
            };
        });
        
        return spots.sort((a, b) => b.score - a.score).slice(0, count);
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        // Update light poles - smooth transition
        this.lightPoles.forEach(pole => {
            pole.intensity += (pole.targetIntensity - pole.intensity) * 0.05;
        });
        
        // Clean up expired adaptive zones
        const now = Date.now();
        this.adaptiveZones = this.adaptiveZones.filter(zone => {
            if (zone.duration === -1) return true;
            if (now - zone.timestamp > zone.duration) {
                // Reset poles in this zone
                this.lightPoles.forEach(pole => {
                    const dist = Math.hypot(pole.x - zone.x, pole.y - zone.y);
                    if (dist < zone.radius) {
                        pole.targetIntensity = pole.baseIntensity;
                    }
                });
                return false;
            }
            return true;
        });
    }
    
    draw() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        
        // Background - night sky
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0f1a');
        gradient.addColorStop(1, '#151f30');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw streets
        this.drawStreets();
        
        // Draw buildings
        this.drawBuildings();
        
        // Draw hide spots (darker areas)
        this.drawHideSpots();
        
        // Draw light poles and their light
        this.drawLightPoles();
        
        // Draw cameras
        this.drawCameras();
        
        // Draw adaptive zones
        this.drawAdaptiveZones();
        
        // Draw grid overlay
        this.drawGrid();
    }
    
    drawStreets() {
        const ctx = this.ctx;
        ctx.strokeStyle = '#2a3545';
        
        this.streets.forEach(street => {
            ctx.lineWidth = street.width;
            ctx.beginPath();
            ctx.moveTo(street.x1, street.y1);
            ctx.lineTo(street.x2, street.y2);
            ctx.stroke();
            
            // Center line
            ctx.strokeStyle = 'rgba(255, 200, 50, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(street.x1, street.y1);
            ctx.lineTo(street.x2, street.y2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = '#2a3545';
        });
    }
    
    drawBuildings() {
        const ctx = this.ctx;
        
        this.buildings.forEach(building => {
            // Building shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(building.x + 5, building.y + 5, building.width, building.height);
            
            // Building body
            ctx.fillStyle = building.color;
            ctx.fillRect(building.x, building.y, building.width, building.height);
            
            // Building outline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(building.x, building.y, building.width, building.height);
            
            // Windows (lit randomly)
            const windowSize = 6;
            const windowSpacing = 10;
            for (let wx = building.x + 5; wx < building.x + building.width - 5; wx += windowSpacing) {
                for (let wy = building.y + 5; wy < building.y + building.height - 5; wy += windowSpacing) {
                    if (Math.random() > 0.7) {
                        ctx.fillStyle = `rgba(255, 220, 150, ${0.3 + Math.random() * 0.4})`;
                        ctx.fillRect(wx, wy, windowSize, windowSize);
                    }
                }
            }
        });
    }
    
    drawHideSpots() {
        const ctx = this.ctx;
        
        this.hideSpots.forEach(spot => {
            const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.radius);
            gradient.addColorStop(0, `rgba(0, 0, 0, ${spot.darkness * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawLightPoles() {
        const ctx = this.ctx;
        
        this.lightPoles.forEach(pole => {
            // Light glow
            const gradient = ctx.createRadialGradient(pole.x, pole.y, 0, pole.x, pole.y, pole.range);
            const alpha = pole.intensity * 0.3;
            gradient.addColorStop(0, `rgba(255, 220, 150, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 200, 100, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(pole.x, pole.y, pole.range, 0, Math.PI * 2);
            ctx.fill();
            
            // Pole marker
            ctx.fillStyle = pole.intensity > 0.5 ? '#ffd700' : '#888';
            ctx.beginPath();
            ctx.arc(pole.x, pole.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawCameras() {
        const ctx = this.ctx;
        
        this.cameras.forEach(cam => {
            if (!cam.active) return;
            
            // Camera FOV cone
            ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
            ctx.beginPath();
            ctx.moveTo(cam.x, cam.y);
            ctx.arc(cam.x, cam.y, cam.range, cam.angle - cam.fov / 2, cam.angle + cam.fov / 2);
            ctx.closePath();
            ctx.fill();
            
            // Camera marker
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(cam.x, cam.y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Camera icon
            ctx.fillStyle = '#0a0f1a';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📷', cam.x, cam.y + 3);
        });
    }
    
    drawAdaptiveZones() {
        const ctx = this.ctx;
        
        this.adaptiveZones.forEach(zone => {
            const age = (Date.now() - zone.timestamp) / zone.duration;
            const alpha = zone.duration === -1 ? 0.3 : 0.3 * (1 - age);
            
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        });
    }
    
    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }
    
    // Highlight a specific location
    highlightLocation(x, y, color = '#ef4444', label = '') {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        
        // Pulsing ring
        const pulseSize = 20 + Math.sin(this.time * 5) * 5;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        if (label) {
            ctx.fillStyle = color;
            ctx.font = 'bold 12px Cairo';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y - 30);
        }
    }
}

// ========================================
// 2. RED-AI (ATTACKER)
// ========================================

class RedAI {
    constructor(digitalTwin) {
        this.twin = digitalTwin;
        
        this.name = 'Red-AI';
        this.type = 'attacker';
        
        // Stats
        this.totalAttempts = 0;
        this.successfulHides = 0;
        this.successRate = 0;
        
        // Current state
        this.position = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.path = [];
        this.currentHideLocation = null;
        this.camouflageProfile = {};
        
        // Tactics database
        this.tactics = [
            { name: 'التمويه البصري', nameEn: 'Visual Camouflage', successBonus: 0.1, difficulty: 1 },
            { name: 'التمويه الطيفي', nameEn: 'Spectral Camouflage', successBonus: 0.2, difficulty: 2 },
            { name: 'استغلال الظلال', nameEn: 'Shadow Exploitation', successBonus: 0.15, difficulty: 1.5 },
            { name: 'التشتيت', nameEn: 'Distraction', successBonus: 0.1, difficulty: 1.2 },
            { name: 'التنكر المادي', nameEn: 'Material Disguise', successBonus: 0.25, difficulty: 2.5 },
            { name: 'التوقيت الدقيق', nameEn: 'Precise Timing', successBonus: 0.15, difficulty: 1.8 },
            { name: 'المسار المخفي', nameEn: 'Hidden Path', successBonus: 0.2, difficulty: 2 },
            { name: 'الإخفاء المتعدد', nameEn: 'Multi-layer Concealment', successBonus: 0.3, difficulty: 3 }
        ];
        
        this.learnedTactics = [];
        this.currentTactic = null;
        
        // Learning parameters
        this.learningRate = 0.05;
        this.explorationRate = 0.3; // Probability of trying new tactics
    }
    
    // Generate a new hide attempt
    generateHideAttempt() {
        this.totalAttempts++;
        
        // Choose starting position
        this.position = {
            x: Math.random() * this.twin.width * 0.3,
            y: Math.random() * this.twin.height
        };
        
        // Find best hide spots
        const bestSpots = this.twin.getBestHideSpots(5);
        
        // Choose hide location (prefer darker, less visible spots)
        const chosenSpot = this.chooseHideLocation(bestSpots);
        this.currentHideLocation = {
            x: chosenSpot.x + (Math.random() - 0.5) * 20,
            y: chosenSpot.y + (Math.random() - 0.5) * 20
        };
        
        // Generate path (semi-random, avoiding cameras)
        this.path = this.generatePath(this.position, this.currentHideLocation);
        
        // Choose tactic
        this.currentTactic = this.chooseTactic();
        
        // Generate camouflage profile based on tactic
        this.camouflageProfile = this.generateCamouflage();
        
        return {
            hideLocation: { ...this.currentHideLocation },
            camouflageProfile: { ...this.camouflageProfile },
            path: [...this.path],
            tactic: this.currentTactic
        };
    }
    
    chooseHideLocation(spots) {
        // Weighted random selection based on score
        const totalScore = spots.reduce((sum, s) => sum + s.score, 0);
        let random = Math.random() * totalScore;
        
        for (const spot of spots) {
            random -= spot.score;
            if (random <= 0) return spot;
        }
        
        return spots[0];
    }
    
    generatePath(start, end) {
        const path = [{ ...start }];
        const steps = 5 + Math.floor(Math.random() * 5);
        
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const baseX = start.x + (end.x - start.x) * t;
            const baseY = start.y + (end.y - start.y) * t;
            
            // Add randomness to avoid predictable paths
            const deviation = 30 * (1 - t); // Less deviation as approaching target
            path.push({
                x: baseX + (Math.random() - 0.5) * deviation * 2,
                y: baseY + (Math.random() - 0.5) * deviation * 2
            });
        }
        
        path.push({ ...end });
        return path;
    }
    
    chooseTactic() {
        // Exploration vs exploitation
        if (Math.random() < this.explorationRate) {
            // Try random tactic (exploration)
            return this.tactics[Math.floor(Math.random() * this.tactics.length)];
        } else {
            // Use learned tactics (exploitation)
            if (this.learnedTactics.length > 0) {
                // Weighted by success
                const sorted = [...this.learnedTactics].sort((a, b) => b.successCount - a.successCount);
                return sorted[0].tactic;
            }
            return this.tactics[Math.floor(Math.random() * this.tactics.length)];
        }
    }
    
    generateCamouflage() {
        // Generate spectral camouflage based on surroundings
        const nearbyMaterials = this.twin.spectralLayers.material.filter(m => {
            const dist = Math.hypot(m.x - this.currentHideLocation.x, m.y - this.currentHideLocation.y);
            return dist < 100;
        });
        
        // Average nearby signatures
        const avgSignature = { r: 0, g: 0, b: 0 };
        if (nearbyMaterials.length > 0) {
            nearbyMaterials.forEach(m => {
                avgSignature.r += m.signature.r;
                avgSignature.g += m.signature.g;
                avgSignature.b += m.signature.b;
            });
            avgSignature.r /= nearbyMaterials.length;
            avgSignature.g /= nearbyMaterials.length;
            avgSignature.b /= nearbyMaterials.length;
        }
        
        // Add camouflage based on tactic
        const tacticBonus = this.currentTactic.successBonus;
        
        return {
            spectralMatch: 0.5 + Math.random() * 0.3 + tacticBonus,
            thermalMask: 0.3 + Math.random() * 0.4,
            motionMinimization: 0.4 + Math.random() * 0.4,
            baseSignature: avgSignature,
            disguiseMaterial: nearbyMaterials.length > 0 ? 
                nearbyMaterials[Math.floor(Math.random() * nearbyMaterials.length)].material : 
                'concrete'
        };
    }
    
    // Called when hide succeeds
    recordSuccess() {
        this.successfulHides++;
        this.updateSuccessRate();
        this.learn(true);
    }
    
    // Called when hide fails (detected)
    recordFailure() {
        this.updateSuccessRate();
        this.learn(false);
    }
    
    updateSuccessRate() {
        this.successRate = (this.successfulHides / Math.max(1, this.totalAttempts)) * 100;
    }
    
    learn(success) {
        if (!this.currentTactic) return;
        
        // Find or create learned tactic entry
        let learned = this.learnedTactics.find(t => t.tactic.nameEn === this.currentTactic.nameEn);
        
        if (!learned) {
            learned = {
                tactic: this.currentTactic,
                attempts: 0,
                successCount: 0
            };
            this.learnedTactics.push(learned);
        }
        
        learned.attempts++;
        if (success) {
            learned.successCount++;
            // Decrease exploration if succeeding
            this.explorationRate = Math.max(0.1, this.explorationRate - this.learningRate);
        } else {
            // Increase exploration if failing
            this.explorationRate = Math.min(0.5, this.explorationRate + this.learningRate);
        }
    }
    
    getStats() {
        return {
            name: this.name,
            type: this.type,
            totalAttempts: this.totalAttempts,
            successfulHides: this.successfulHides,
            successRate: this.successRate,
            learnedTactics: this.learnedTactics.length,
            currentTactic: this.currentTactic
        };
    }
}

// ========================================
// 3. BLUE-AI (DEFENDER - SCAR-EYE)
// ========================================

class BlueAI {
    constructor(digitalTwin) {
        this.twin = digitalTwin;
        
        this.name = 'Blue-AI';
        this.type = 'defender';
        
        // Stats
        this.totalScans = 0;
        this.detections = 0;
        this.detectionRate = 55; // Base detection rate
        
        // Detection parameters
        this.spectralAnalysisDepth = 0.5;
        this.motionSensitivity = 0.6;
        this.patternRecognition = 0.5;
        
        // Prediction model
        this.predictedLocation = { x: 0, y: 0 };
        this.confidence = 0;
        this.reasoning = '';
        
        // Learning
        this.detectedPatterns = [];
        this.knownTactics = [];
        this.learningRate = 0.03;
        
        // Defenses
        this.defenses = [
            { name: 'المسح الطيفي', nameEn: 'Spectral Scan', effectiveness: 0.8 },
            { name: 'تحليل الحركة', nameEn: 'Motion Analysis', effectiveness: 0.7 },
            { name: 'الربط الصوتي', nameEn: 'Audio Correlation', effectiveness: 0.75 },
            { name: 'الإضاءة التكيفية', nameEn: 'Adaptive Lighting', effectiveness: 0.65 },
            { name: 'التعلم العميق', nameEn: 'Deep Learning', effectiveness: 0.85 },
            { name: 'التحليل السلوكي', nameEn: 'Behavioral Analysis', effectiveness: 0.7 }
        ];
        
        this.evolvedDefenses = 0;
        this.activeDefenses = [];
    }
    
    // Analyze a Red-AI attempt
    analyzeAttempt(redAttempt) {
        this.totalScans++;
        
        const { hideLocation, camouflageProfile, path, tactic } = redAttempt;
        
        // Multi-factor detection analysis
        const spectralScore = this.analyzeSpectral(hideLocation, camouflageProfile);
        const motionScore = this.analyzeMotion(path);
        const patternScore = this.analyzePatterns(tactic, hideLocation);
        const visibilityScore = this.analyzeVisibility(hideLocation);
        
        // Calculate overall detection probability
        const baseDetection = this.detectionRate / 100;
        const tacticPenalty = tactic.difficulty * 0.1;
        const camouflagePenalty = camouflageProfile.spectralMatch * 0.2;
        const learningBonus = this.evolvedDefenses * 0.02;
        
        const combinedScore = (
            spectralScore * 0.3 +
            motionScore * 0.2 +
            patternScore * 0.25 +
            visibilityScore * 0.25
        );
        
        const detectionProbability = Math.min(0.95, Math.max(0.1,
            baseDetection + combinedScore - tacticPenalty - camouflagePenalty + learningBonus
        ));
        
        // Predict location
        this.predictLocation(hideLocation, path, patternScore);
        
        // Make detection decision
        const detected = Math.random() < detectionProbability;
        
        // Use adaptive illuminance if suspicious
        if (detectionProbability > 0.3 && detectionProbability < 0.7) {
            this.triggerAdaptiveIlluminance(this.predictedLocation);
        }
        
        // Generate reasoning
        this.generateReasoning(spectralScore, motionScore, patternScore, visibilityScore, tactic);
        
        // Confidence level
        this.confidence = Math.abs(detectionProbability - 0.5) * 2; // Higher when more certain
        
        if (detected) {
            this.detections++;
            this.learn(true, tactic, hideLocation);
        } else {
            this.learn(false, tactic, hideLocation);
        }
        
        this.updateDetectionRate();
        
        return {
            detected,
            confidence: this.confidence,
            predictedLocation: { ...this.predictedLocation },
            actualLocation: { ...hideLocation },
            reasoning: this.reasoning,
            scores: {
                spectral: spectralScore,
                motion: motionScore,
                pattern: patternScore,
                visibility: visibilityScore
            }
        };
    }
    
    analyzeSpectral(location, camouflage) {
        // Compare camouflage signature with expected materials
        const nearby = this.twin.spectralLayers.material.filter(m => {
            const dist = Math.hypot(m.x - location.x, m.y - location.y);
            return dist < 80;
        });
        
        if (nearby.length === 0) return 0.5;
        
        // Check for anomalies
        let anomalyScore = 0;
        nearby.forEach(m => {
            const sigDiff = Math.abs(m.signature.r - camouflage.baseSignature.r) +
                           Math.abs(m.signature.g - camouflage.baseSignature.g) +
                           Math.abs(m.signature.b - camouflage.baseSignature.b);
            anomalyScore += sigDiff / 3;
        });
        
        anomalyScore /= nearby.length;
        
        // High spectral match = harder to detect
        const matchPenalty = camouflage.spectralMatch * 0.5;
        
        return Math.min(1, Math.max(0, (anomalyScore * this.spectralAnalysisDepth) - matchPenalty + 0.3));
    }
    
    analyzeMotion(path) {
        if (path.length < 2) return 0.3;
        
        // Analyze path for suspicious patterns
        let suspicionScore = 0;
        
        // Check for erratic movement
        for (let i = 1; i < path.length - 1; i++) {
            const prevAngle = Math.atan2(path[i].y - path[i-1].y, path[i].x - path[i-1].x);
            const nextAngle = Math.atan2(path[i+1].y - path[i].y, path[i+1].x - path[i].x);
            const angleDiff = Math.abs(nextAngle - prevAngle);
            
            if (angleDiff > Math.PI / 2) {
                suspicionScore += 0.15; // Sudden direction change
            }
        }
        
        // Check if path avoids cameras
        let cameraAvoidance = 0;
        path.forEach(point => {
            const visibility = this.twin.getVisibilityAt(point.x, point.y);
            if (!visibility.cameraVisible) {
                cameraAvoidance += 0.1;
            }
        });
        
        suspicionScore += Math.min(0.3, cameraAvoidance);
        
        return Math.min(1, suspicionScore * this.motionSensitivity);
    }
    
    analyzePatterns(tactic, location) {
        // Check if we've seen this tactic before
        const knownTactic = this.knownTactics.find(t => t.nameEn === tactic.nameEn);
        
        let patternScore = 0.3; // Base pattern detection
        
        if (knownTactic) {
            // We know this tactic!
            patternScore += 0.2 + knownTactic.timesExperienced * 0.05;
        }
        
        // Check location patterns
        const nearbyPatterns = this.detectedPatterns.filter(p => {
            const dist = Math.hypot(p.x - location.x, p.y - location.y);
            return dist < 100;
        });
        
        if (nearbyPatterns.length > 0) {
            patternScore += 0.15 * Math.min(nearbyPatterns.length, 3);
        }
        
        return Math.min(1, patternScore * this.patternRecognition);
    }
    
    analyzeVisibility(location) {
        const visibility = this.twin.getVisibilityAt(location.x, location.y);
        
        // Low light = harder to detect
        const lightScore = visibility.light * 0.5;
        
        // Camera coverage helps
        const cameraScore = visibility.cameraVisible ? 0.3 : 0;
        
        return lightScore + cameraScore;
    }
    
    predictLocation(actualLocation, path, patternScore) {
        // Weighted prediction based on path endpoint and pattern analysis
        if (path.length > 0) {
            const lastPoints = path.slice(-3);
            const avgX = lastPoints.reduce((s, p) => s + p.x, 0) / lastPoints.length;
            const avgY = lastPoints.reduce((s, p) => s + p.y, 0) / lastPoints.length;
            
            // Add some noise based on our uncertainty
            const noise = (1 - patternScore) * 50;
            
            this.predictedLocation = {
                x: avgX + (Math.random() - 0.5) * noise,
                y: avgY + (Math.random() - 0.5) * noise
            };
        } else {
            this.predictedLocation = { ...actualLocation };
        }
    }
    
    triggerAdaptiveIlluminance(location) {
        // Silently increase lighting in suspicious area
        const intensityIncrease = 0.15; // 15% increase
        this.twin.adjustIlluminance(location.x, location.y, intensityIncrease, true);
        
        this.activeDefenses.push({
            type: 'adaptive_illuminance',
            location: { ...location },
            timestamp: Date.now()
        });
    }
    
    generateReasoning(spectral, motion, pattern, visibility, tactic) {
        const reasons = [];
        
        if (spectral > 0.5) {
            reasons.push('اكتشاف شذوذ طيفي في المنطقة');
        }
        if (motion > 0.4) {
            reasons.push('رصد نمط حركة مريب');
        }
        if (pattern > 0.5) {
            reasons.push(`التعرف على تكتيك مألوف: ${tactic.name}`);
        }
        if (visibility < 0.3) {
            reasons.push('منطقة ذات رؤية منخفضة');
        }
        
        if (reasons.length === 0) {
            reasons.push('لا توجد مؤشرات واضحة');
        }
        
        this.reasoning = reasons.join(' | ');
    }
    
    learn(detected, tactic, location) {
        // Learn from experience
        let knownTactic = this.knownTactics.find(t => t.nameEn === tactic.nameEn);
        
        if (!knownTactic) {
            knownTactic = { ...tactic, timesExperienced: 0 };
            this.knownTactics.push(knownTactic);
        }
        
        knownTactic.timesExperienced++;
        
        if (detected) {
            // Record pattern
            this.detectedPatterns.push({
                x: location.x,
                y: location.y,
                tactic: tactic.nameEn,
                timestamp: Date.now()
            });
            
            // Evolve defenses
            this.evolvedDefenses++;
            
            // Improve detection capabilities
            this.spectralAnalysisDepth = Math.min(1, this.spectralAnalysisDepth + this.learningRate);
            this.patternRecognition = Math.min(1, this.patternRecognition + this.learningRate);
        } else {
            // Missed detection - adjust
            this.motionSensitivity = Math.min(1, this.motionSensitivity + this.learningRate * 0.5);
        }
        
        // Keep patterns manageable
        if (this.detectedPatterns.length > 100) {
            this.detectedPatterns = this.detectedPatterns.slice(-50);
        }
    }
    
    updateDetectionRate() {
        this.detectionRate = (this.detections / Math.max(1, this.totalScans)) * 100;
    }
    
    getStats() {
        return {
            name: this.name,
            type: this.type,
            totalScans: this.totalScans,
            detections: this.detections,
            detectionRate: this.detectionRate,
            evolvedDefenses: this.evolvedDefenses,
            knownTactics: this.knownTactics.length,
            confidence: this.confidence
        };
    }
}

// ========================================
// 4. SIMULATION ENGINE
// ========================================

class SimulationEngine {
    constructor(digitalTwin, redAI, blueAI) {
        this.twin = digitalTwin;
        this.redAI = redAI;
        this.blueAI = blueAI;
        
        this.isRunning = false;
        this.isPaused = false;
        
        this.roundNumber = 0;
        this.maxRounds = 200;
        this.roundDelay = 300; // ms between rounds
        
        this.roundLog = [];
        this.currentRound = null;
        
        // Callbacks
        this.onRoundComplete = null;
        this.onSimulationEnd = null;
        this.onStateChange = null;
        
        // Statistics over time
        this.stats = {
            redSuccessHistory: [],
            blueDetectionHistory: [],
            confidenceTrend: []
        };
    }
    
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        if (this.onStateChange) {
            this.onStateChange({ running: true, paused: false });
        }
        
        await this.runSimulation();
    }
    
    pause() {
        this.isPaused = true;
        if (this.onStateChange) {
            this.onStateChange({ running: this.isRunning, paused: true });
        }
    }
    
    resume() {
        if (!this.isRunning) return;
        this.isPaused = false;
        if (this.onStateChange) {
            this.onStateChange({ running: true, paused: false });
        }
    }
    
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.roundNumber = 0;
        this.roundLog = [];
        this.currentRound = null;
        
        this.stats = {
            redSuccessHistory: [],
            blueDetectionHistory: [],
            confidenceTrend: []
        };
        
        // Reset AIs would require recreation
        if (this.onStateChange) {
            this.onStateChange({ running: false, paused: false, reset: true });
        }
    }
    
    setMaxRounds(rounds) {
        this.maxRounds = rounds;
    }
    
    setRoundDelay(delay) {
        this.roundDelay = delay;
    }
    
    async runSimulation() {
        while (this.isRunning && this.roundNumber < this.maxRounds) {
            if (!this.isPaused) {
                await this.executeRound();
                this.roundNumber++;
            }
            await this.sleep(this.roundDelay);
        }
        
        if (this.roundNumber >= this.maxRounds) {
            this.endSimulation();
        }
    }
    
    async executeRound() {
        // Red AI makes a move
        const redAttempt = this.redAI.generateHideAttempt();
        
        // Update twin
        this.twin.update(this.roundDelay / 1000);
        
        // Blue AI analyzes
        const blueResponse = this.blueAI.analyzeAttempt(redAttempt);
        
        // Record result
        if (blueResponse.detected) {
            this.redAI.recordFailure();
        } else {
            this.redAI.recordSuccess();
        }
        
        // Create round record
        this.currentRound = {
            roundNumber: this.roundNumber + 1,
            hideLocation: redAttempt.hideLocation,
            predictedLocation: blueResponse.predictedLocation,
            path: redAttempt.path,
            tactic: redAttempt.tactic,
            camouflage: redAttempt.camouflageProfile,
            detected: blueResponse.detected,
            confidence: blueResponse.confidence,
            reasoning: blueResponse.reasoning,
            scores: blueResponse.scores,
            timestamp: Date.now()
        };
        
        this.roundLog.push(this.currentRound);
        
        // Update statistics
        this.stats.redSuccessHistory.push(this.redAI.successRate);
        this.stats.blueDetectionHistory.push(this.blueAI.detectionRate);
        this.stats.confidenceTrend.push(blueResponse.confidence * 100);
        
        // Keep logs manageable
        if (this.roundLog.length > 500) {
            this.roundLog = this.roundLog.slice(-250);
        }
        
        // Callback
        if (this.onRoundComplete) {
            this.onRoundComplete(this.currentRound);
        }
    }
    
    endSimulation() {
        this.isRunning = false;
        
        const summary = {
            totalRounds: this.roundNumber,
            redStats: this.redAI.getStats(),
            blueStats: this.blueAI.getStats(),
            winner: this.blueAI.detectionRate > 50 ? 'Blue-AI' : 'Red-AI',
            stats: this.stats
        };
        
        if (this.onSimulationEnd) {
            this.onSimulationEnd(summary);
        }
        
        if (this.onStateChange) {
            this.onStateChange({ running: false, paused: false, ended: true, summary });
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getLog() {
        return [...this.roundLog];
    }
    
    getCurrentRound() {
        return this.currentRound;
    }
    
    getState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            roundNumber: this.roundNumber,
            maxRounds: this.maxRounds,
            redStats: this.redAI.getStats(),
            blueStats: this.blueAI.getStats()
        };
    }
}

// ========================================
// 5. WARGAME DASHBOARD
// ========================================

class WargameDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Dashboard container not found:', containerId);
            return;
        }
        
        this.twin = null;
        this.redAI = null;
        this.blueAI = null;
        this.engine = null;
        
        this.elements = {};
        this.charts = {};
        
        this.animationFrame = null;
        this.lastUpdate = 0;
        
        this.init();
    }
    
    init() {
        this.render();
        this.bindElements();
        this.setupEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="wargame-dashboard">
                <!-- Header -->
                <div class="wg-header">
                    <div class="wg-title">
                        <h1><i class="fas fa-chess"></i> المحاكاة العدائية المتقدمة</h1>
                        <p class="wg-subtitle">Adversarial AI Wargaming - SCAR-EYE</p>
                    </div>
                    <div class="wg-controls">
                        <button class="wg-btn wg-btn-primary" id="wgStartBtn">
                            <i class="fas fa-play"></i> بدء المحاكاة
                        </button>
                        <button class="wg-btn wg-btn-secondary" id="wgPauseBtn" disabled>
                            <i class="fas fa-pause"></i> إيقاف مؤقت
                        </button>
                        <button class="wg-btn wg-btn-danger" id="wgResetBtn">
                            <i class="fas fa-redo"></i> إعادة تعيين
                        </button>
                        <div class="wg-speed-control">
                            <label>السرعة:</label>
                            <input type="range" id="wgSpeedSlider" min="50" max="1000" value="300">
                        </div>
                    </div>
                </div>
                
                <!-- Main Content Grid -->
                <div class="wg-grid">
                    <!-- Digital Twin Map -->
                    <div class="wg-card wg-map-card">
                        <div class="wg-card-header">
                            <h3><i class="fas fa-map"></i> خريطة التوأم الرقمي</h3>
                            <div class="wg-round-counter">
                                الجولة: <span id="wgRoundNum">0</span> / <span id="wgMaxRounds">200</span>
                            </div>
                        </div>
                        <div class="wg-card-body">
                            <div class="wg-map-container">
                                <canvas id="wgTwinCanvas"></canvas>
                                <div class="wg-map-legend">
                                    <span class="legend-item"><span class="dot red"></span> Red-AI</span>
                                    <span class="legend-item"><span class="dot blue"></span> Blue-AI</span>
                                    <span class="legend-item"><span class="dot yellow"></span> أضواء</span>
                                    <span class="legend-item"><span class="dot cyan"></span> كاميرات</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- AI Stats Panel -->
                    <div class="wg-card wg-stats-card">
                        <div class="wg-card-header">
                            <h3><i class="fas fa-chart-bar"></i> إحصائيات الذكاء الاصطناعي</h3>
                        </div>
                        <div class="wg-card-body">
                            <div class="wg-ai-stats">
                                <!-- Red AI -->
                                <div class="wg-ai-panel red">
                                    <div class="wg-ai-header">
                                        <div class="wg-ai-avatar red">
                                            <i class="fas fa-skull"></i>
                                        </div>
                                        <div class="wg-ai-info">
                                            <h4>Red-AI</h4>
                                            <span>المهاجم</span>
                                        </div>
                                    </div>
                                    <div class="wg-ai-metrics">
                                        <div class="wg-metric">
                                            <label>نسبة النجاح</label>
                                            <div class="wg-progress-bar">
                                                <div class="wg-progress red" id="wgRedProgress" style="width: 0%"></div>
                                            </div>
                                            <span class="wg-metric-value" id="wgRedRate">0%</span>
                                        </div>
                                        <div class="wg-metric-row">
                                            <div class="wg-metric-item">
                                                <span class="label">المحاولات</span>
                                                <span class="value" id="wgRedAttempts">0</span>
                                            </div>
                                            <div class="wg-metric-item">
                                                <span class="label">النجاحات</span>
                                                <span class="value" id="wgRedSuccesses">0</span>
                                            </div>
                                            <div class="wg-metric-item">
                                                <span class="label">التكتيكات</span>
                                                <span class="value" id="wgRedTactics">0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- VS Divider -->
                                <div class="wg-vs">
                                    <span>VS</span>
                                </div>
                                
                                <!-- Blue AI -->
                                <div class="wg-ai-panel blue">
                                    <div class="wg-ai-header">
                                        <div class="wg-ai-avatar blue">
                                            <i class="fas fa-eye"></i>
                                        </div>
                                        <div class="wg-ai-info">
                                            <h4>Blue-AI</h4>
                                            <span>SCAR-EYE</span>
                                        </div>
                                    </div>
                                    <div class="wg-ai-metrics">
                                        <div class="wg-metric">
                                            <label>نسبة الكشف</label>
                                            <div class="wg-progress-bar">
                                                <div class="wg-progress blue" id="wgBlueProgress" style="width: 55%"></div>
                                            </div>
                                            <span class="wg-metric-value" id="wgBlueRate">55%</span>
                                        </div>
                                        <div class="wg-metric-row">
                                            <div class="wg-metric-item">
                                                <span class="label">المسوحات</span>
                                                <span class="value" id="wgBlueScans">0</span>
                                            </div>
                                            <div class="wg-metric-item">
                                                <span class="label">الكشوفات</span>
                                                <span class="value" id="wgBlueDetections">0</span>
                                            </div>
                                            <div class="wg-metric-item">
                                                <span class="label">الدفاعات</span>
                                                <span class="value" id="wgBlueDefenses">0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Confidence Trend Chart -->
                    <div class="wg-card wg-chart-card">
                        <div class="wg-card-header">
                            <h3><i class="fas fa-chart-line"></i> اتجاه الثقة والكشف</h3>
                        </div>
                        <div class="wg-card-body">
                            <canvas id="wgTrendCanvas"></canvas>
                        </div>
                    </div>
                    
                    <!-- Battle Log -->
                    <div class="wg-card wg-log-card">
                        <div class="wg-card-header">
                            <h3><i class="fas fa-scroll"></i> سجل المعركة</h3>
                        </div>
                        <div class="wg-card-body">
                            <div class="wg-battle-log" id="wgBattleLog">
                                <div class="wg-log-empty">
                                    <i class="fas fa-hourglass-start"></i>
                                    <p>في انتظار بدء المحاكاة...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Current Round Details -->
                    <div class="wg-card wg-round-card">
                        <div class="wg-card-header">
                            <h3><i class="fas fa-crosshairs"></i> تفاصيل الجولة الحالية</h3>
                        </div>
                        <div class="wg-card-body">
                            <div class="wg-round-details" id="wgRoundDetails">
                                <div class="wg-detail-row">
                                    <span class="wg-detail-label">التكتيك المستخدم:</span>
                                    <span class="wg-detail-value" id="wgCurrentTactic">-</span>
                                </div>
                                <div class="wg-detail-row">
                                    <span class="wg-detail-label">موقع الإخفاء:</span>
                                    <span class="wg-detail-value" id="wgHideLocation">-</span>
                                </div>
                                <div class="wg-detail-row">
                                    <span class="wg-detail-label">موقع التنبؤ:</span>
                                    <span class="wg-detail-value" id="wgPredictLocation">-</span>
                                </div>
                                <div class="wg-detail-row">
                                    <span class="wg-detail-label">نسبة الثقة:</span>
                                    <span class="wg-detail-value" id="wgConfidence">-</span>
                                </div>
                                <div class="wg-detail-row">
                                    <span class="wg-detail-label">النتيجة:</span>
                                    <span class="wg-detail-value" id="wgResult">-</span>
                                </div>
                                <div class="wg-detail-row full">
                                    <span class="wg-detail-label">التحليل:</span>
                                    <span class="wg-detail-value" id="wgReasoning">-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="wg-footer">
                    <div class="wg-footer-info">
                        <span><i class="fas fa-info-circle"></i> هذه محاكاة تعليمية فقط - لا تمثل عمليات حقيقية</span>
                    </div>
                    <div class="wg-footer-brand">
                        <span>عين الشاهين - ShaheenEye</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindElements() {
        this.elements = {
            startBtn: document.getElementById('wgStartBtn'),
            pauseBtn: document.getElementById('wgPauseBtn'),
            resetBtn: document.getElementById('wgResetBtn'),
            speedSlider: document.getElementById('wgSpeedSlider'),
            roundNum: document.getElementById('wgRoundNum'),
            maxRounds: document.getElementById('wgMaxRounds'),
            twinCanvas: document.getElementById('wgTwinCanvas'),
            trendCanvas: document.getElementById('wgTrendCanvas'),
            battleLog: document.getElementById('wgBattleLog'),
            // Red AI
            redProgress: document.getElementById('wgRedProgress'),
            redRate: document.getElementById('wgRedRate'),
            redAttempts: document.getElementById('wgRedAttempts'),
            redSuccesses: document.getElementById('wgRedSuccesses'),
            redTactics: document.getElementById('wgRedTactics'),
            // Blue AI
            blueProgress: document.getElementById('wgBlueProgress'),
            blueRate: document.getElementById('wgBlueRate'),
            blueScans: document.getElementById('wgBlueScans'),
            blueDetections: document.getElementById('wgBlueDetections'),
            blueDefenses: document.getElementById('wgBlueDefenses'),
            // Round details
            currentTactic: document.getElementById('wgCurrentTactic'),
            hideLocation: document.getElementById('wgHideLocation'),
            predictLocation: document.getElementById('wgPredictLocation'),
            confidence: document.getElementById('wgConfidence'),
            result: document.getElementById('wgResult'),
            reasoning: document.getElementById('wgReasoning')
        };
    }
    
    setupEventListeners() {
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.start());
        }
        
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.reset());
        }
        
        if (this.elements.speedSlider) {
            this.elements.speedSlider.addEventListener('input', (e) => {
                if (this.engine) {
                    this.engine.setRoundDelay(parseInt(e.target.value));
                }
            });
        }
    }
    
    initializeSimulation() {
        // Create Digital Twin
        this.twin = new DigitalTwinMap('wgTwinCanvas');
        
        // Create AIs
        this.redAI = new RedAI(this.twin);
        this.blueAI = new BlueAI(this.twin);
        
        // Create Engine
        this.engine = new SimulationEngine(this.twin, this.redAI, this.blueAI);
        
        // Set callbacks
        this.engine.onRoundComplete = (round) => this.onRoundComplete(round);
        this.engine.onSimulationEnd = (summary) => this.onSimulationEnd(summary);
        this.engine.onStateChange = (state) => this.onStateChange(state);
        
        // Start animation loop
        this.startAnimationLoop();
        
        // Update max rounds display
        if (this.elements.maxRounds) {
            this.elements.maxRounds.textContent = this.engine.maxRounds;
        }
    }
    
    start() {
        if (!this.engine) {
            this.initializeSimulation();
        }
        
        this.engine.start();
        
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        
        // Clear empty state
        if (this.elements.battleLog) {
            this.elements.battleLog.innerHTML = '';
        }
    }
    
    togglePause() {
        if (!this.engine) return;
        
        this.engine.togglePause();
        
        if (this.engine.isPaused) {
            this.elements.pauseBtn.innerHTML = '<i class="fas fa-play"></i> استئناف';
        } else {
            this.elements.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> إيقاف مؤقت';
        }
    }
    
    reset() {
        if (this.engine) {
            this.engine.reset();
        }
        
        // Re-initialize
        this.initializeSimulation();
        
        // Reset UI
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> إيقاف مؤقت';
        
        this.updateUI({ roundNumber: 0 });
        
        // Reset battle log
        if (this.elements.battleLog) {
            this.elements.battleLog.innerHTML = `
                <div class="wg-log-empty">
                    <i class="fas fa-hourglass-start"></i>
                    <p>في انتظار بدء المحاكاة...</p>
                </div>
            `;
        }
        
        // Reset round details
        this.elements.currentTactic.textContent = '-';
        this.elements.hideLocation.textContent = '-';
        this.elements.predictLocation.textContent = '-';
        this.elements.confidence.textContent = '-';
        this.elements.result.textContent = '-';
        this.elements.reasoning.textContent = '-';
    }
    
    startAnimationLoop() {
        const animate = (timestamp) => {
            if (timestamp - this.lastUpdate > 16) { // ~60fps
                this.lastUpdate = timestamp;
                
                if (this.twin) {
                    this.twin.update(16 / 1000);
                    this.twin.draw();
                    
                    // Draw current round elements
                    if (this.engine && this.engine.currentRound) {
                        this.drawRoundElements(this.engine.currentRound);
                    }
                }
                
                // Update trend chart
                if (this.engine && this.engine.isRunning) {
                    this.updateTrendChart();
                }
            }
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    drawRoundElements(round) {
        if (!this.twin || !this.twin.ctx) return;
        
        const ctx = this.twin.ctx;
        
        // Draw path
        if (round.path && round.path.length > 1) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(round.path[0].x, round.path[0].y);
            for (let i = 1; i < round.path.length; i++) {
                ctx.lineTo(round.path[i].x, round.path[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Draw hide location
        this.twin.highlightLocation(
            round.hideLocation.x,
            round.hideLocation.y,
            round.detected ? '#00f0ff' : '#ef4444',
            round.detected ? 'مكتشف!' : 'مخفي'
        );
        
        // Draw prediction
        ctx.strokeStyle = '#0080ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(round.predictedLocation.x, round.predictedLocation.y, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw prediction marker
        ctx.fillStyle = '#0080ff';
        ctx.font = '12px Cairo';
        ctx.textAlign = 'center';
        ctx.fillText('⊕', round.predictedLocation.x, round.predictedLocation.y + 4);
    }
    
    onRoundComplete(round) {
        this.updateUI(round);
        this.addLogEntry(round);
        this.updateRoundDetails(round);
    }
    
    onSimulationEnd(summary) {
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        
        // Show winner announcement
        const winner = summary.winner;
        const logEntry = document.createElement('div');
        logEntry.className = `wg-log-entry winner ${winner === 'Blue-AI' ? 'blue' : 'red'}`;
        logEntry.innerHTML = `
            <div class="wg-log-icon">${winner === 'Blue-AI' ? '🏆' : '💀'}</div>
            <div class="wg-log-content">
                <strong>انتهت المحاكاة!</strong>
                <span>الفائز: ${winner} - ${summary.totalRounds} جولة</span>
            </div>
        `;
        
        if (this.elements.battleLog) {
            this.elements.battleLog.prepend(logEntry);
        }
    }
    
    onStateChange(state) {
        if (state.reset) {
            // Handle reset state
        }
    }
    
    updateUI(data) {
        const redStats = this.redAI ? this.redAI.getStats() : {};
        const blueStats = this.blueAI ? this.blueAI.getStats() : {};
        
        // Round counter
        if (this.elements.roundNum) {
            this.elements.roundNum.textContent = this.engine ? this.engine.roundNumber : 0;
        }
        
        // Red AI
        if (this.elements.redProgress) {
            this.elements.redProgress.style.width = `${redStats.successRate || 0}%`;
        }
        if (this.elements.redRate) {
            this.elements.redRate.textContent = `${(redStats.successRate || 0).toFixed(1)}%`;
        }
        if (this.elements.redAttempts) {
            this.elements.redAttempts.textContent = redStats.totalAttempts || 0;
        }
        if (this.elements.redSuccesses) {
            this.elements.redSuccesses.textContent = redStats.successfulHides || 0;
        }
        if (this.elements.redTactics) {
            this.elements.redTactics.textContent = redStats.learnedTactics || 0;
        }
        
        // Blue AI
        if (this.elements.blueProgress) {
            this.elements.blueProgress.style.width = `${blueStats.detectionRate || 55}%`;
        }
        if (this.elements.blueRate) {
            this.elements.blueRate.textContent = `${(blueStats.detectionRate || 55).toFixed(1)}%`;
        }
        if (this.elements.blueScans) {
            this.elements.blueScans.textContent = blueStats.totalScans || 0;
        }
        if (this.elements.blueDetections) {
            this.elements.blueDetections.textContent = blueStats.detections || 0;
        }
        if (this.elements.blueDefenses) {
            this.elements.blueDefenses.textContent = blueStats.evolvedDefenses || 0;
        }
    }
    
    addLogEntry(round) {
        if (!this.elements.battleLog) return;
        
        const entry = document.createElement('div');
        entry.className = `wg-log-entry ${round.detected ? 'detected' : 'hidden'}`;
        entry.innerHTML = `
            <div class="wg-log-icon">${round.detected ? '🔵' : '🔴'}</div>
            <div class="wg-log-content">
                <span class="wg-log-round">جولة ${round.roundNumber}</span>
                <span class="wg-log-tactic">${round.tactic.name}</span>
                <span class="wg-log-result">${round.detected ? 'تم الكشف' : 'نجح الإخفاء'}</span>
            </div>
            <div class="wg-log-confidence" style="color: ${round.detected ? '#00f0ff' : '#ef4444'}">
                ${(round.confidence * 100).toFixed(0)}%
            </div>
        `;
        
        this.elements.battleLog.prepend(entry);
        
        // Keep only last 50 entries
        while (this.elements.battleLog.children.length > 50) {
            this.elements.battleLog.removeChild(this.elements.battleLog.lastChild);
        }
    }
    
    updateRoundDetails(round) {
        if (this.elements.currentTactic) {
            this.elements.currentTactic.textContent = round.tactic.name;
        }
        if (this.elements.hideLocation) {
            this.elements.hideLocation.textContent = `(${round.hideLocation.x.toFixed(0)}, ${round.hideLocation.y.toFixed(0)})`;
        }
        if (this.elements.predictLocation) {
            this.elements.predictLocation.textContent = `(${round.predictedLocation.x.toFixed(0)}, ${round.predictedLocation.y.toFixed(0)})`;
        }
        if (this.elements.confidence) {
            this.elements.confidence.textContent = `${(round.confidence * 100).toFixed(1)}%`;
            this.elements.confidence.style.color = round.detected ? '#00f0ff' : '#ef4444';
        }
        if (this.elements.result) {
            this.elements.result.textContent = round.detected ? 'تم الكشف ✓' : 'نجح الإخفاء ✗';
            this.elements.result.style.color = round.detected ? '#10b981' : '#ef4444';
        }
        if (this.elements.reasoning) {
            this.elements.reasoning.textContent = round.reasoning;
        }
    }
    
    updateTrendChart() {
        if (!this.elements.trendCanvas || !this.engine) return;
        
        const canvas = this.elements.trendCanvas;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Resize canvas
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        
        // Clear
        ctx.fillStyle = '#0a0f1a';
        ctx.fillRect(0, 0, width, height);
        
        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let y = padding; y < height - padding; y += 30) {
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        const stats = this.engine.stats;
        if (!stats.blueDetectionHistory.length) return;
        
        const dataPoints = Math.min(100, stats.blueDetectionHistory.length);
        const startIdx = stats.blueDetectionHistory.length - dataPoints;
        
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;
        
        // Draw Blue detection rate
        ctx.strokeStyle = '#0080ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < dataPoints; i++) {
            const x = padding + (i / dataPoints) * graphWidth;
            const y = height - padding - (stats.blueDetectionHistory[startIdx + i] / 100) * graphHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Draw Red success rate
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < dataPoints; i++) {
            const x = padding + (i / dataPoints) * graphWidth;
            const y = height - padding - (stats.redSuccessHistory[startIdx + i] / 100) * graphHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Draw confidence trend
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let i = 0; i < dataPoints; i++) {
            const x = padding + (i / dataPoints) * graphWidth;
            const y = height - padding - (stats.confidenceTrend[startIdx + i] / 100) * graphHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Legend
        ctx.font = '11px Cairo';
        ctx.fillStyle = '#0080ff';
        ctx.fillText('● Blue-AI (الكشف)', width - 150, 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('● Red-AI (النجاح)', width - 150, 35);
        ctx.fillStyle = '#10b981';
        ctx.fillText('--- الثقة', width - 150, 50);
        
        // Y-axis labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('100%', padding - 5, padding + 5);
        ctx.fillText('50%', padding - 5, height / 2);
        ctx.fillText('0%', padding - 5, height - padding);
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.engine) {
            this.engine.reset();
        }
    }
}

// ========================================
// EXPORTS
// ========================================

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DigitalTwinMap,
        RedAI,
        BlueAI,
        SimulationEngine,
        WargameDashboard
    };
}

// Export for browser
window.AdversarialWargame = {
    DigitalTwinMap,
    RedAI,
    BlueAI,
    SimulationEngine,
    WargameDashboard
};
