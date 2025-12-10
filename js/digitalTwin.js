/* ====================================
   ShaheenEye - Digital Twin Module
   ==================================== */

class DigitalTwin {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.buildings = [];
        this.cameras = [];
        this.lights = [];
        this.vehicles = [];
        this.people = [];
        this.alerts = [];
        this.heatmapData = [];
        
        this.showHeatmap = false;
        this.showCameras = true;
        this.showLights = true;
        
        this.time = 0;
        this.isNight = true;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.generateCity();
        this.animate();
    }
    
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    generateCity() {
        const { randomInt, random } = ShaheenUtils;
        
        // Generate grid-based buildings
        const gridSize = 80;
        const rows = Math.ceil(this.height / gridSize);
        const cols = Math.ceil(this.width / gridSize);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (random(0, 1) > 0.3) { // 70% chance of building
                    const x = col * gridSize + random(5, 15);
                    const y = row * gridSize + random(5, 15);
                    const w = random(40, 60);
                    const h = random(40, 60);
                    
                    this.buildings.push({
                        x, y, w, h,
                        floors: randomInt(2, 8),
                        color: `hsl(${randomInt(200, 230)}, ${randomInt(10, 30)}%, ${randomInt(15, 25)}%)`,
                        windows: []
                    });
                }
            }
        }
        
        // Generate street lights
        for (let i = 0; i < 12; i++) {
            this.lights.push({
                id: `light_${i}`,
                x: random(50, this.width - 50),
                y: random(50, this.height - 50),
                intensity: random(0.5, 1),
                baseIntensity: random(0.5, 1),
                radius: random(60, 100),
                color: '#ffdd88',
                active: true
            });
        }
        
        // Generate cameras
        const cameraPositions = [
            { x: 100, y: 100 },
            { x: this.width - 100, y: 100 },
            { x: 100, y: this.height - 100 },
            { x: this.width - 100, y: this.height - 100 },
            { x: this.width / 2, y: 100 },
            { x: this.width / 2, y: this.height - 100 }
        ];
        
        cameraPositions.forEach((pos, i) => {
            this.cameras.push({
                id: `cam_${i + 1}`,
                x: pos.x,
                y: pos.y,
                angle: random(0, Math.PI * 2),
                fov: Math.PI / 3,
                range: 150,
                active: true,
                detecting: false
            });
        });
        
        // Generate moving entities
        for (let i = 0; i < 5; i++) {
            this.people.push({
                x: random(50, this.width - 50),
                y: random(50, this.height - 50),
                targetX: random(50, this.width - 50),
                targetY: random(50, this.height - 50),
                speed: random(0.3, 0.8),
                suspicious: random(0, 1) > 0.8
            });
        }
        
        for (let i = 0; i < 3; i++) {
            this.vehicles.push({
                x: random(50, this.width - 50),
                y: random(50, this.height - 50),
                targetX: random(50, this.width - 50),
                targetY: random(50, this.height - 50),
                speed: random(1, 2),
                angle: 0
            });
        }
    }
    
    adjustLight(lightId, intensity) {
        const light = this.lights.find(l => l.id === lightId);
        if (light) {
            light.intensity = intensity;
            ShaheenUtils.eventBus.emit('lightAdjusted', { lightId, intensity });
        }
    }
    
    triggerAlert(x, y, type, message) {
        this.alerts.push({
            x, y, type, message,
            timestamp: Date.now(),
            radius: 0,
            maxRadius: 100
        });
        ShaheenUtils.eventBus.emit('mapAlert', { x, y, type, message });
    }
    
    addHeatmapPoint(x, y, intensity) {
        this.heatmapData.push({ x, y, intensity, decay: 1 });
    }
    
    update() {
        const { lerp, random, distance } = ShaheenUtils;
        this.time += 0.016;
        
        // Update people movement
        this.people.forEach(person => {
            const dist = distance(person.x, person.y, person.targetX, person.targetY);
            if (dist < 10) {
                person.targetX = random(50, this.width - 50);
                person.targetY = random(50, this.height - 50);
            }
            
            const dx = person.targetX - person.x;
            const dy = person.targetY - person.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            
            person.x += (dx / len) * person.speed;
            person.y += (dy / len) * person.speed;
        });
        
        // Update vehicles
        this.vehicles.forEach(vehicle => {
            const dist = distance(vehicle.x, vehicle.y, vehicle.targetX, vehicle.targetY);
            if (dist < 20) {
                vehicle.targetX = random(50, this.width - 50);
                vehicle.targetY = random(50, this.height - 50);
            }
            
            const dx = vehicle.targetX - vehicle.x;
            const dy = vehicle.targetY - vehicle.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            
            vehicle.angle = Math.atan2(dy, dx);
            vehicle.x += (dx / len) * vehicle.speed;
            vehicle.y += (dy / len) * vehicle.speed;
        });
        
        // Update camera angles (slow pan)
        this.cameras.forEach(cam => {
            cam.angle += 0.002;
        });
        
        // Update alerts
        this.alerts = this.alerts.filter(alert => {
            alert.radius += 2;
            return alert.radius < alert.maxRadius;
        });
        
        // Decay heatmap
        this.heatmapData = this.heatmapData.filter(point => {
            point.decay -= 0.001;
            return point.decay > 0;
        });
        
        // Light flicker effect
        this.lights.forEach(light => {
            if (light.active) {
                light.intensity = light.baseIntensity + Math.sin(this.time * 5 + light.x) * 0.05;
            }
        });
    }
    
    draw() {
        const ctx = this.ctx;
        const { CanvasUtils } = ShaheenUtils;
        
        // Clear canvas
        ctx.fillStyle = this.isNight ? '#0a1020' : '#1a2a3a';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw heatmap if enabled
        if (this.showHeatmap) {
            this.drawHeatmap();
        }
        
        // Draw buildings
        this.drawBuildings();
        
        // Draw roads
        this.drawRoads();
        
        // Draw street lights
        if (this.showLights) {
            this.drawLights();
        }
        
        // Draw camera coverage
        if (this.showCameras) {
            this.drawCameras();
        }
        
        // Draw vehicles
        this.drawVehicles();
        
        // Draw people
        this.drawPeople();
        
        // Draw alerts
        this.drawAlerts();
        
        // Draw scan lines effect
        this.drawScanLines();
    }
    
    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1;
        
        const gridSize = 40;
        
        for (let x = 0; x < this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }
    
    drawBuildings() {
        const ctx = this.ctx;
        
        this.buildings.forEach(building => {
            // Building shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(building.x + 5, building.y + 5, building.w, building.h);
            
            // Building base
            ctx.fillStyle = building.color;
            ctx.fillRect(building.x, building.y, building.w, building.h);
            
            // Building border
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(building.x, building.y, building.w, building.h);
            
            // Windows
            const windowSize = 6;
            const windowGap = 10;
            ctx.fillStyle = this.isNight ? 'rgba(255, 220, 150, 0.6)' : 'rgba(100, 150, 200, 0.4)';
            
            for (let wx = building.x + 8; wx < building.x + building.w - 8; wx += windowGap) {
                for (let wy = building.y + 8; wy < building.y + building.h - 8; wy += windowGap) {
                    if (Math.random() > 0.3) {
                        ctx.fillRect(wx, wy, windowSize, windowSize);
                    }
                }
            }
        });
    }
    
    drawRoads() {
        const ctx = this.ctx;
        
        // Main roads
        ctx.fillStyle = '#1a2535';
        ctx.fillRect(0, this.height / 2 - 20, this.width, 40);
        ctx.fillRect(this.width / 2 - 20, 0, 40, this.height);
        
        // Road markings
        ctx.strokeStyle = '#ffdd00';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 15]);
        
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(this.width, this.height / 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
    
    drawLights() {
        const ctx = this.ctx;
        
        this.lights.forEach(light => {
            if (!light.active) return;
            
            // Light glow
            const gradient = ctx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, light.radius * light.intensity
            );
            gradient.addColorStop(0, `rgba(255, 221, 136, ${0.3 * light.intensity})`);
            gradient.addColorStop(0.5, `rgba(255, 221, 136, ${0.1 * light.intensity})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(light.x, light.y, light.radius * light.intensity, 0, Math.PI * 2);
            ctx.fill();
            
            // Light pole
            ctx.fillStyle = '#444';
            ctx.fillRect(light.x - 2, light.y - 8, 4, 16);
            
            // Light bulb
            ctx.fillStyle = light.color;
            ctx.beginPath();
            ctx.arc(light.x, light.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawCameras() {
        const ctx = this.ctx;
        
        this.cameras.forEach(cam => {
            if (!cam.active) return;
            
            // Camera FOV cone
            ctx.fillStyle = cam.detecting 
                ? 'rgba(239, 68, 68, 0.15)' 
                : 'rgba(0, 240, 255, 0.1)';
            
            ctx.beginPath();
            ctx.moveTo(cam.x, cam.y);
            ctx.arc(cam.x, cam.y, cam.range, cam.angle - cam.fov / 2, cam.angle + cam.fov / 2);
            ctx.closePath();
            ctx.fill();
            
            // Camera icon
            ctx.fillStyle = cam.detecting ? '#ef4444' : '#00f0ff';
            ctx.beginPath();
            ctx.arc(cam.x, cam.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Camera direction indicator
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cam.x, cam.y);
            ctx.lineTo(
                cam.x + Math.cos(cam.angle) * 15,
                cam.y + Math.sin(cam.angle) * 15
            );
            ctx.stroke();
        });
    }
    
    drawVehicles() {
        const ctx = this.ctx;
        
        this.vehicles.forEach(vehicle => {
            ctx.save();
            ctx.translate(vehicle.x, vehicle.y);
            ctx.rotate(vehicle.angle);
            
            // Vehicle body
            ctx.fillStyle = '#3a4a5a';
            ctx.fillRect(-15, -8, 30, 16);
            
            // Vehicle windows
            ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
            ctx.fillRect(-8, -6, 12, 12);
            
            // Headlights
            ctx.fillStyle = '#ffdd88';
            ctx.fillRect(12, -5, 3, 4);
            ctx.fillRect(12, 1, 3, 4);
            
            ctx.restore();
        });
    }
    
    drawPeople() {
        const ctx = this.ctx;
        
        this.people.forEach(person => {
            // Person dot
            ctx.fillStyle = person.suspicious ? '#ef4444' : '#10b981';
            ctx.beginPath();
            ctx.arc(person.x, person.y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Suspicious indicator
            if (person.suspicious) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(person.x, person.y, 10 + Math.sin(this.time * 5) * 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    }
    
    drawAlerts() {
        const ctx = this.ctx;
        
        this.alerts.forEach(alert => {
            const alpha = 1 - (alert.radius / alert.maxRadius);
            
            ctx.strokeStyle = alert.type === 'critical' 
                ? `rgba(239, 68, 68, ${alpha})` 
                : `rgba(245, 158, 11, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(alert.x, alert.y, alert.radius, 0, Math.PI * 2);
            ctx.stroke();
        });
    }
    
    drawHeatmap() {
        const ctx = this.ctx;
        
        this.heatmapData.forEach(point => {
            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, 50
            );
            gradient.addColorStop(0, `rgba(239, 68, 68, ${0.5 * point.decay * point.intensity})`);
            gradient.addColorStop(0.5, `rgba(245, 158, 11, ${0.3 * point.decay * point.intensity})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 50, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawScanLines() {
        const ctx = this.ctx;
        const scanY = (this.time * 50) % this.height;
        
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(this.width, scanY);
        ctx.stroke();
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    toggleHeatmap() {
        this.showHeatmap = !this.showHeatmap;
    }
    
    toggleCameras() {
        this.showCameras = !this.showCameras;
    }
    
    toggleLights() {
        this.showLights = !this.showLights;
    }
}

// Export
window.DigitalTwin = DigitalTwin;
