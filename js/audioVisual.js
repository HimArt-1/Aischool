/* ====================================
   ShaheenEye - Audio-Visual Spatial Correlation Module
   ==================================== */

class AudioVisualCorrelator {
    constructor() {
        this.mapCanvas = document.getElementById('audioMapCanvas');
        this.mapCtx = this.mapCanvas ? this.mapCanvas.getContext('2d') : null;
        
        this.waveCanvas = document.getElementById('waveformCanvas');
        this.waveCtx = this.waveCanvas ? this.waveCanvas.getContext('2d') : null;
        
        this.microphones = [];
        this.audioEvents = [];
        this.heatmapData = [];
        this.waveformData = [];
        
        this.soundCategories = {
            'drilling': { name: 'حفر', icon: '🔨', count: 0, color: '#ef4444' },
            'dragging': { name: 'سحب', icon: '📦', count: 0, color: '#f59e0b' },
            'footsteps': { name: 'خطوات', icon: '👣', count: 0, color: '#006C35' },
            'vehicle': { name: 'مركبة', icon: '🚗', count: 0, color: '#8b5cf6' },
            'voices': { name: 'أصوات', icon: '🗣️', count: 0, color: '#10b981' },
            'glass': { name: 'زجاج', icon: '💥', count: 0, color: '#ec4899' },
            'metal': { name: 'معدن', icon: '⚙️', count: 0, color: '#6366f1' },
            'unknown': { name: 'غير معروف', icon: '❓', count: 0, color: '#64748b' }
        };
        
        this.time = 0;
        this.isListening = true;
        
        this.init();
    }
    
    init() {
        if (this.mapCanvas) {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.generateMicrophones();
            this.initMicGrid();
            this.initSoundCategories();
            this.animate();
            
            // Start simulating audio events
            this.startSimulation();
        }
    }
    
    resize() {
        if (this.mapCanvas) {
            const container = this.mapCanvas.parentElement;
            this.mapCanvas.width = container.clientWidth;
            this.mapCanvas.height = container.clientHeight;
            this.mapWidth = this.mapCanvas.width;
            this.mapHeight = this.mapCanvas.height;
        }
        
        if (this.waveCanvas) {
            const waveContainer = this.waveCanvas.parentElement;
            this.waveCanvas.width = waveContainer.clientWidth;
            this.waveCanvas.height = 150;
        }
    }
    
    generateMicrophones() {
        const { random } = ShaheenUtils;
        
        // Create microphone grid
        const positions = [
            { x: 0.15, y: 0.2 },
            { x: 0.85, y: 0.2 },
            { x: 0.15, y: 0.8 },
            { x: 0.85, y: 0.8 },
            { x: 0.5, y: 0.15 },
            { x: 0.5, y: 0.85 },
            { x: 0.25, y: 0.5 },
            { x: 0.75, y: 0.5 }
        ];
        
        positions.forEach((pos, i) => {
            this.microphones.push({
                id: `mic_${i + 1}`,
                name: `ميكروفون ${i + 1}`,
                x: pos.x * this.mapWidth,
                y: pos.y * this.mapHeight,
                sensitivity: random(0.7, 1),
                level: 0,
                active: true,
                isDetecting: false
            });
        });
    }
    
    initMicGrid() {
        const grid = document.getElementById('micGrid');
        if (!grid) return;
        
        this.updateMicGrid();
    }
    
    updateMicGrid() {
        const grid = document.getElementById('micGrid');
        if (!grid) return;
        
        grid.innerHTML = this.microphones.map(mic => `
            <div class="mic-item" data-mic-id="${mic.id}">
                <div class="mic-icon ${mic.isDetecting ? 'active' : ''}">
                    <i class="fas fa-microphone"></i>
                </div>
                <div class="mic-info">
                    <div class="mic-name">${mic.name}</div>
                    <div class="mic-level">
                        <div class="mic-level-fill" style="width: ${mic.level * 100}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    initSoundCategories() {
        const container = document.getElementById('soundCategories');
        if (!container) return;
        
        this.updateSoundCategories();
    }
    
    updateSoundCategories() {
        const container = document.getElementById('soundCategories');
        if (!container) return;
        
        container.innerHTML = Object.entries(this.soundCategories).map(([key, cat]) => `
            <div class="sound-category" style="border-left: 3px solid ${cat.color}">
                <div class="sound-category-icon">${cat.icon}</div>
                <div class="sound-category-name">${cat.name}</div>
                <div class="sound-category-count">${cat.count}</div>
            </div>
        `).join('');
    }
    
    startSimulation() {
        // Simulate random audio events
        setInterval(() => {
            if (this.isListening && Math.random() > 0.7) {
                this.simulateAudioEvent();
            }
        }, 2000);
    }
    
    simulateAudioEvent() {
        const { random, randomInt, distance } = ShaheenUtils;
        
        // Random position
        const x = random(50, this.mapWidth - 50);
        const y = random(50, this.mapHeight - 50);
        
        // Random sound type
        const types = Object.keys(this.soundCategories);
        const type = types[randomInt(0, types.length)];
        
        // Create event
        const event = {
            id: ShaheenUtils.generateId(),
            x, y,
            type,
            duration: random(0.5, 5),
            intensity: random(0.3, 1),
            timestamp: Date.now(),
            confidence: random(70, 99)
        };
        
        // Calculate which microphones detect this
        this.microphones.forEach(mic => {
            const dist = distance(x, y, mic.x, mic.y);
            const maxRange = 200;
            
            if (dist < maxRange) {
                const strength = (1 - dist / maxRange) * event.intensity * mic.sensitivity;
                mic.level = Math.max(mic.level, strength);
                mic.isDetecting = strength > 0.3;
            }
        });
        
        // Add to events
        this.audioEvents.unshift(event);
        if (this.audioEvents.length > 50) {
            this.audioEvents = this.audioEvents.slice(0, 50);
        }
        
        // Update category count
        this.soundCategories[type].count++;
        
        // Add heatmap point
        this.heatmapData.push({
            x, y,
            intensity: event.intensity,
            decay: 1
        });
        
        // Update displays
        this.updateAudioEventsList();
        this.updateSoundCategories();
        this.updateMicGrid();
        
        // Emit event
        ShaheenUtils.eventBus.emit('audioEventDetected', event);
        
        // Special alerts for suspicious sounds
        if (type === 'drilling' || type === 'glass') {
            ShaheenUtils.eventBus.emit('suspiciousSound', event);
        }
    }
    
    triangulatePosition(micLevels) {
        // Simple triangulation based on microphone levels
        let totalWeight = 0;
        let x = 0;
        let y = 0;
        
        this.microphones.forEach(mic => {
            const weight = mic.level * mic.level; // Square for stronger weighting
            x += mic.x * weight;
            y += mic.y * weight;
            totalWeight += weight;
        });
        
        if (totalWeight > 0) {
            return {
                x: x / totalWeight,
                y: y / totalWeight,
                confidence: Math.min(totalWeight * 100, 99)
            };
        }
        
        return null;
    }
    
    updateAudioEventsList() {
        const container = document.getElementById('audioEventsList');
        if (!container) return;
        
        container.innerHTML = this.audioEvents.slice(0, 8).map(event => {
            const cat = this.soundCategories[event.type];
            return `
                <div class="audio-event-item">
                    <div class="audio-event-icon ${event.type}" style="background: ${cat.color}20; color: ${cat.color}">
                        ${cat.icon}
                    </div>
                    <div class="audio-event-info">
                        <div class="audio-event-type">${cat.name}</div>
                        <div class="audio-event-details">
                            المدة: ${event.duration.toFixed(1)}ث | 
                            الثقة: ${event.confidence.toFixed(0)}%
                        </div>
                    </div>
                    <div class="audio-event-time">
                        ${ShaheenUtils.formatTime(new Date(event.timestamp))}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    generateWaveformData() {
        const { perlin, random } = ShaheenUtils;
        
        this.waveformData = [];
        const points = 200;
        
        for (let i = 0; i < points; i++) {
            // Combine multiple frequencies for realistic waveform
            let value = 0;
            value += Math.sin(i * 0.1 + this.time * 5) * 0.3;
            value += Math.sin(i * 0.05 + this.time * 3) * 0.2;
            value += perlin.noise(i * 0.02 + this.time) * 0.3;
            
            // Add spikes for detected events
            if (this.microphones.some(m => m.isDetecting)) {
                value += Math.sin(i * 0.3 + this.time * 10) * 0.4;
            }
            
            this.waveformData.push(value);
        }
    }
    
    update() {
        this.time += 0.016;
        
        // Decay microphone levels
        this.microphones.forEach(mic => {
            mic.level *= 0.95;
            if (mic.level < 0.1) {
                mic.isDetecting = false;
            }
        });
        
        // Decay heatmap
        this.heatmapData = this.heatmapData.filter(point => {
            point.decay -= 0.005;
            point.intensity *= 0.99;
            return point.decay > 0;
        });
        
        // Generate waveform
        this.generateWaveformData();
    }
    
    drawMap() {
        if (!this.mapCtx) return;
        
        const ctx = this.mapCtx;
        
        // Background
        ctx.fillStyle = '#0a1525';
        ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);
        
        // Grid
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.mapWidth; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.mapHeight);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.mapHeight; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.mapWidth, y);
            ctx.stroke();
        }
        
        // Draw heatmap
        this.heatmapData.forEach(point => {
            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, 60
            );
            
            const alpha = point.decay * point.intensity;
            gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha * 0.6})`);
            gradient.addColorStop(0.5, `rgba(245, 158, 11, ${alpha * 0.3})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 60, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw microphone connections (when detecting)
        this.microphones.forEach(mic => {
            if (mic.isDetecting) {
                // Find closest event
                const recentEvent = this.audioEvents[0];
                if (recentEvent) {
                    ctx.strokeStyle = `rgba(0, 240, 255, ${mic.level * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(mic.x, mic.y);
                    ctx.lineTo(recentEvent.x, recentEvent.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
        });
        
        // Draw microphones
        this.microphones.forEach(mic => {
            // Detection range
            if (mic.active) {
                ctx.strokeStyle = mic.isDetecting 
                    ? 'rgba(0, 240, 255, 0.3)' 
                    : 'rgba(16, 185, 129, 0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(mic.x, mic.y, 100, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Microphone glow
            if (mic.isDetecting) {
                const gradient = ctx.createRadialGradient(
                    mic.x, mic.y, 0,
                    mic.x, mic.y, 30
                );
                gradient.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(mic.x, mic.y, 30, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Microphone dot
            ctx.fillStyle = mic.isDetecting ? '#006C35' : '#10b981';
            ctx.beginPath();
            ctx.arc(mic.x, mic.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Level indicator
            if (mic.level > 0.1) {
                ctx.strokeStyle = '#006C35';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(mic.x, mic.y, 12, 0, Math.PI * 2 * mic.level);
                ctx.stroke();
            }
            
            // Label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px Cairo';
            ctx.textAlign = 'center';
            ctx.fillText(mic.name, mic.x, mic.y + 25);
        });
        
        // Draw recent event markers
        this.audioEvents.slice(0, 5).forEach((event, i) => {
            const age = (Date.now() - event.timestamp) / 1000;
            if (age < 10) {
                const alpha = 1 - (age / 10);
                const cat = this.soundCategories[event.type];
                
                // Pulse effect
                const pulseRadius = 15 + Math.sin(this.time * 5) * 5;
                
                ctx.strokeStyle = cat.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(event.x, event.y, pulseRadius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Icon
                ctx.fillStyle = cat.color;
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(cat.icon, event.x, event.y + 5);
            }
        });
        
        // Draw HUD
        this.drawMapHUD();
    }
    
    drawMapHUD() {
        const ctx = this.mapCtx;
        
        // Info panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 160, 80);
        
        ctx.fillStyle = '#006C35';
        ctx.font = '12px Cairo';
        ctx.textAlign = 'right';
        ctx.fillText('التحليل الصوتي', 160, 28);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Cairo';
        ctx.fillText(`الميكروفونات: ${this.microphones.filter(m => m.active).length}`, 160, 45);
        ctx.fillText(`الأحداث المكتشفة: ${this.audioEvents.length}`, 160, 60);
        ctx.fillText(`النشاط: ${this.microphones.some(m => m.isDetecting) ? 'مكتشف' : 'هادئ'}`, 160, 75);
    }
    
    drawWaveform() {
        if (!this.waveCtx) return;
        
        const ctx = this.waveCtx;
        const width = this.waveCanvas.width;
        const height = this.waveCanvas.height;
        
        // Background
        ctx.fillStyle = '#1a2234';
        ctx.fillRect(0, 0, width, height);
        
        // Grid lines
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let y = 0; y < height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Center line
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Draw waveform
        if (this.waveformData.length > 0) {
            // Fill
            ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            
            this.waveformData.forEach((value, i) => {
                const x = (i / this.waveformData.length) * width;
                const y = height / 2 + value * (height / 3);
                ctx.lineTo(x, y);
            });
            
            ctx.lineTo(width, height / 2);
            ctx.closePath();
            ctx.fill();
            
            // Line
            ctx.strokeStyle = '#006C35';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            this.waveformData.forEach((value, i) => {
                const x = (i / this.waveformData.length) * width;
                const y = height / 2 + value * (height / 3);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Activity indicator
        const isActive = this.microphones.some(m => m.isDetecting);
        ctx.fillStyle = isActive ? '#ef4444' : '#10b981';
        ctx.beginPath();
        ctx.arc(width - 20, 20, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '10px Cairo';
        ctx.textAlign = 'left';
        ctx.fillText(isActive ? 'نشط' : 'هادئ', width - 55, 24);
    }
    
    draw() {
        this.drawMap();
        this.drawWaveform();
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    getStats() {
        return {
            totalEvents: this.audioEvents.length,
            activeMics: this.microphones.filter(m => m.isDetecting).length,
            categories: { ...this.soundCategories }
        };
    }
}

// Export
window.AudioVisualCorrelator = AudioVisualCorrelator;
