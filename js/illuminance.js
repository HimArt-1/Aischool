/* ====================================
   ShaheenEye - Adaptive Illuminance Module
   ==================================== */

class IlluminanceController {
    constructor() {
        this.canvas = document.getElementById('lightMapCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        this.poles = [];
        this.adjustmentLog = [];
        this.spectralSettings = {
            red: 100,
            green: 100,
            blue: 100,
            infrared: 50
        };
        
        this.time = 0;
        this.ambientLight = 0.2; // Night time
        
        this.init();
    }
    
    init() {
        if (this.canvas) {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.generatePoles();
            this.animate();
        }
        this.initPolesList();
        this.initSpectrumSliders();
    }
    
    resize() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    generatePoles() {
        const { random, randomInt } = ShaheenUtils;
        
        // Generate light poles in a grid pattern
        const gridX = 4;
        const gridY = 3;
        
        for (let i = 0; i < gridX; i++) {
            for (let j = 0; j < gridY; j++) {
                const x = (this.width / (gridX + 1)) * (i + 1);
                const y = (this.height / (gridY + 1)) * (j + 1);
                
                this.poles.push({
                    id: `pole_${i}_${j}`,
                    name: `عمود ${i * gridY + j + 1}`,
                    x: x + random(-20, 20),
                    y: y + random(-20, 20),
                    baseIntensity: random(60, 80),
                    intensity: random(60, 80),
                    targetIntensity: random(60, 80),
                    radius: random(80, 120),
                    color: '#ffdd88',
                    active: true,
                    isAdjusting: false,
                    spectralMode: 'normal' // normal, enhanced, infrared
                });
            }
        }
    }
    
    initPolesList() {
        const list = document.getElementById('polesList');
        if (!list) return;
        
        this.updatePolesList();
    }
    
    updatePolesList() {
        const list = document.getElementById('polesList');
        if (!list) return;
        
        list.innerHTML = this.poles.map(pole => `
            <div class="pole-item" data-pole-id="${pole.id}">
                <div class="pole-icon ${pole.active ? '' : 'inactive'}">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="pole-info">
                    <div class="pole-name">${pole.name}</div>
                    <div class="pole-location">الموقع: (${pole.x.toFixed(0)}, ${pole.y.toFixed(0)})</div>
                </div>
                <div class="pole-controls">
                    <input type="range" class="pole-slider" 
                           min="0" max="100" 
                           value="${pole.intensity}" 
                           data-pole-id="${pole.id}">
                    <span class="pole-value">${pole.intensity.toFixed(0)}%</span>
                </div>
            </div>
        `).join('');
        
        // Add slider event listeners
        list.querySelectorAll('.pole-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const poleId = e.target.dataset.poleId;
                const value = parseFloat(e.target.value);
                this.adjustPole(poleId, value, 'manual');
                
                // Update display value
                e.target.parentElement.querySelector('.pole-value').textContent = `${value.toFixed(0)}%`;
            });
        });
    }
    
    initSpectrumSliders() {
        const container = document.getElementById('spectrumSliders');
        if (!container) return;
        
        const channels = [
            { id: 'red', name: 'أحمر', color: '#ff4444' },
            { id: 'green', name: 'أخضر', color: '#44ff44' },
            { id: 'blue', name: 'أزرق', color: '#4444ff' },
            { id: 'infrared', name: 'تحت الحمراء', color: '#880000' }
        ];
        
        container.innerHTML = channels.map(ch => `
            <div class="spectrum-slider-item">
                <label style="color: ${ch.color}">${ch.name}</label>
                <input type="range" min="0" max="100" value="${this.spectralSettings[ch.id]}" 
                       data-channel="${ch.id}" style="accent-color: ${ch.color}">
                <span class="spectrum-value">${this.spectralSettings[ch.id]}%</span>
            </div>
        `).join('');
        
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                const channel = e.target.dataset.channel;
                const value = parseFloat(e.target.value);
                this.spectralSettings[channel] = value;
                e.target.nextElementSibling.textContent = `${value}%`;
                this.updatePoleColors();
            });
        });
    }
    
    updatePoleColors() {
        const { red, green, blue } = this.spectralSettings;
        
        this.poles.forEach(pole => {
            pole.color = `rgb(${Math.floor(255 * red / 100)}, ${Math.floor(221 * green / 100)}, ${Math.floor(136 * blue / 100)})`;
        });
    }
    
    adjustPole(poleId, intensity, reason = 'auto') {
        const pole = this.poles.find(p => p.id === poleId);
        if (!pole) return;
        
        const oldIntensity = pole.intensity;
        pole.targetIntensity = intensity;
        pole.isAdjusting = true;
        
        // Log adjustment
        this.logAdjustment(pole, oldIntensity, intensity, reason);
        
        ShaheenUtils.eventBus.emit('lightAdjusted', {
            poleId,
            oldIntensity,
            newIntensity: intensity,
            reason
        });
    }
    
    // Adaptive response - adjust based on suspicious activity
    adaptiveResponse(x, y, threatLevel = 'low') {
        const { distance } = ShaheenUtils;
        
        // Find nearby poles
        const nearbyPoles = this.poles.filter(pole => {
            const dist = distance(x, y, pole.x, pole.y);
            return dist < 200;
        });
        
        // Adjustment amount based on threat level
        const adjustments = {
            'low': 10,
            'medium': 15,
            'high': 20
        };
        
        const adjustment = adjustments[threatLevel] || 10;
        
        nearbyPoles.forEach(pole => {
            const dist = distance(x, y, pole.x, pole.y);
            const factor = 1 - (dist / 200);
            const newIntensity = Math.min(100, pole.baseIntensity + adjustment * factor);
            
            this.adjustPole(pole.id, newIntensity, `adaptive_${threatLevel}`);
        });
        
        // Return poles to normal after delay
        setTimeout(() => {
            nearbyPoles.forEach(pole => {
                this.adjustPole(pole.id, pole.baseIntensity, 'reset');
            });
        }, 10000);
    }
    
    // Silent adjustment - subtle changes
    silentAdjust(poleId, amount = 10) {
        const pole = this.poles.find(p => p.id === poleId);
        if (!pole) return;
        
        const newIntensity = Math.min(100, Math.max(0, pole.intensity + amount));
        this.adjustPole(poleId, newIntensity, 'silent');
    }
    
    logAdjustment(pole, oldValue, newValue, reason) {
        const entry = {
            timestamp: Date.now(),
            poleName: pole.name,
            poleId: pole.id,
            oldValue: oldValue,
            newValue: newValue,
            change: newValue - oldValue,
            reason: reason
        };
        
        this.adjustmentLog.unshift(entry);
        
        // Keep only last 50 entries
        if (this.adjustmentLog.length > 50) {
            this.adjustmentLog = this.adjustmentLog.slice(0, 50);
        }
        
        this.updateLogDisplay();
    }
    
    updateLogDisplay() {
        const container = document.getElementById('illuminanceLog');
        if (!container) return;
        
        container.innerHTML = this.adjustmentLog.slice(0, 10).map(entry => {
            const changeText = entry.change >= 0 ? `+${entry.change.toFixed(0)}%` : `${entry.change.toFixed(0)}%`;
            const reasonText = this.getReasonText(entry.reason);
            
            return `
                <div class="log-entry">
                    <span class="log-time">${ShaheenUtils.formatTime(new Date(entry.timestamp))}</span>
                    <span class="log-action">${entry.poleName}: ${reasonText}</span>
                    <span class="log-change">${changeText}</span>
                </div>
            `;
        }).join('');
    }
    
    getReasonText(reason) {
        const texts = {
            'manual': 'تعديل يدوي',
            'auto': 'تعديل تلقائي',
            'adaptive_low': 'استجابة تكيفية (منخفض)',
            'adaptive_medium': 'استجابة تكيفية (متوسط)',
            'adaptive_high': 'استجابة تكيفية (عالي)',
            'silent': 'تعديل صامت',
            'reset': 'إعادة ضبط'
        };
        return texts[reason] || reason;
    }
    
    update() {
        this.time += 0.016;
        
        // Smooth intensity transitions
        this.poles.forEach(pole => {
            if (pole.isAdjusting) {
                const diff = pole.targetIntensity - pole.intensity;
                
                if (Math.abs(diff) < 0.5) {
                    pole.intensity = pole.targetIntensity;
                    pole.isAdjusting = false;
                } else {
                    pole.intensity += diff * 0.1;
                }
            }
            
            // Subtle flicker effect
            pole.flickerOffset = Math.sin(this.time * 3 + pole.x * 0.1) * 2;
        });
    }
    
    draw() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        
        // Night sky background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0f1a');
        gradient.addColorStop(1, '#1a2535');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw streets
        this.drawStreets();
        
        // Draw light coverage areas
        this.poles.forEach(pole => {
            if (!pole.active) return;
            
            const effectiveIntensity = (pole.intensity + pole.flickerOffset) / 100;
            const effectiveRadius = pole.radius * effectiveIntensity;
            
            // Light cone on ground
            const groundGradient = ctx.createRadialGradient(
                pole.x, pole.y, 0,
                pole.x, pole.y, effectiveRadius
            );
            
            const alpha = 0.3 * effectiveIntensity;
            groundGradient.addColorStop(0, `rgba(255, 221, 136, ${alpha})`);
            groundGradient.addColorStop(0.5, `rgba(255, 221, 136, ${alpha * 0.5})`);
            groundGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = groundGradient;
            ctx.beginPath();
            ctx.arc(pole.x, pole.y, effectiveRadius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw poles
        this.poles.forEach(pole => {
            const effectiveIntensity = (pole.intensity + pole.flickerOffset) / 100;
            
            // Pole base
            ctx.fillStyle = '#333';
            ctx.fillRect(pole.x - 3, pole.y - 5, 6, 15);
            
            // Light source glow
            if (pole.active) {
                const glowGradient = ctx.createRadialGradient(
                    pole.x, pole.y, 0,
                    pole.x, pole.y, 30
                );
                glowGradient.addColorStop(0, `rgba(255, 255, 200, ${effectiveIntensity})`);
                glowGradient.addColorStop(0.3, `rgba(255, 221, 136, ${effectiveIntensity * 0.5})`);
                glowGradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(pole.x, pole.y, 30, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Light bulb
            ctx.fillStyle = pole.active ? pole.color : '#333';
            ctx.beginPath();
            ctx.arc(pole.x, pole.y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Intensity label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(`${pole.intensity.toFixed(0)}%`, pole.x, pole.y + 25);
            
            // Adjusting indicator
            if (pole.isAdjusting) {
                ctx.strokeStyle = '#006C35';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(pole.x, pole.y, 15, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
        
        // Draw HUD
        this.drawHUD();
    }
    
    drawStreets() {
        const ctx = this.ctx;
        
        // Main streets
        ctx.fillStyle = '#1a2030';
        ctx.fillRect(0, this.height / 2 - 25, this.width, 50);
        ctx.fillRect(this.width / 2 - 25, 0, 50, this.height);
        
        // Street markings
        ctx.strokeStyle = 'rgba(255, 221, 0, 0.3)';
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
    
    drawHUD() {
        const ctx = this.ctx;
        
        // Info panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 200, 100);
        
        ctx.fillStyle = '#006C35';
        ctx.font = '14px Cairo';
        ctx.textAlign = 'right';
        ctx.fillText('التحكم في الإضاءة', 200, 30);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Cairo';
        ctx.fillText(`إجمالي الأعمدة: ${this.poles.length}`, 200, 50);
        ctx.fillText(`الأعمدة النشطة: ${this.poles.filter(p => p.active).length}`, 200, 70);
        ctx.fillText(`التعديلات: ${this.adjustmentLog.length}`, 200, 90);
        
        // Spectrum indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.width - 110, 10, 100, 30);
        
        const r = this.spectralSettings.red / 100;
        const g = this.spectralSettings.green / 100;
        const b = this.spectralSettings.blue / 100;
        
        ctx.fillStyle = `rgb(${Math.floor(255 * r)}, ${Math.floor(255 * g)}, ${Math.floor(255 * b)})`;
        ctx.fillRect(this.width - 100, 15, 80, 20);
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    // Demo: Simulate suspicious activity and adaptive response
    simulateSuspiciousActivity() {
        const { random } = ShaheenUtils;
        const x = random(100, this.width - 100);
        const y = random(100, this.height - 100);
        
        ShaheenUtils.eventBus.emit('suspiciousActivity', { x, y });
        this.adaptiveResponse(x, y, 'medium');
    }
    
    getStats() {
        return {
            totalPoles: this.poles.length,
            activePoles: this.poles.filter(p => p.active).length,
            averageIntensity: this.poles.reduce((sum, p) => sum + p.intensity, 0) / this.poles.length,
            adjustments: this.adjustmentLog.length
        };
    }
}

// Export
window.IlluminanceController = IlluminanceController;
