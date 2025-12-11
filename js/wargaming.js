/* ====================================
   ShaheenEye - Adversarial AI Wargaming Module
   ==================================== */

class WargamingSimulator {
    constructor() {
        this.canvas = document.getElementById('battleCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        this.isRunning = false;
        this.isPaused = false;
        this.roundNumber = 0;
        this.maxRounds = 100;
        
        // AI Statistics
        this.redAI = {
            name: 'Red-AI',
            type: 'attacker',
            successRate: 45,
            attempts: 0,
            successes: 0,
            tacticsDiscovered: 0,
            currentTactic: null,
            position: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
            hiddenObjects: []
        };
        
        this.blueAI = {
            name: 'Blue-AI',
            type: 'defender',
            detectionRate: 55,
            detections: 0,
            missedThreats: 0,
            defensesEvolved: 0,
            scanPosition: { x: 0, y: 0 },
            coverage: []
        };
        
        this.battleLog = [];
        this.tactics = [
            { name: 'تمويه بصري', nameEn: 'Visual Camouflage', difficulty: 1 },
            { name: 'تمويه طيفي', nameEn: 'Spectral Camouflage', difficulty: 2 },
            { name: 'استغلال الظلال', nameEn: 'Shadow Exploitation', difficulty: 1.5 },
            { name: 'التشتيت', nameEn: 'Distraction', difficulty: 1.2 },
            { name: 'التنكر المادي', nameEn: 'Material Disguise', difficulty: 2.5 },
            { name: 'التوقيت الدقيق', nameEn: 'Precise Timing', difficulty: 1.8 },
            { name: 'المسار المخفي', nameEn: 'Hidden Path', difficulty: 2 },
            { name: 'الإخفاء المتعدد', nameEn: 'Multi-layer Concealment', difficulty: 3 }
        ];
        
        this.defenses = [
            { name: 'المسح الطيفي', nameEn: 'Spectral Scan', effectiveness: 0.8 },
            { name: 'تحليل الحركة', nameEn: 'Motion Analysis', effectiveness: 0.7 },
            { name: 'الربط الصوتي', nameEn: 'Audio Correlation', effectiveness: 0.75 },
            { name: 'الإضاءة التكيفية', nameEn: 'Adaptive Lighting', effectiveness: 0.65 },
            { name: 'التعلم العميق', nameEn: 'Deep Learning', effectiveness: 0.85 },
            { name: 'التحليل السلوكي', nameEn: 'Behavioral Analysis', effectiveness: 0.7 }
        ];
        
        this.hiddenThreats = [];
        this.detectedThreats = [];
        
        this.init();
    }
    
    init() {
        if (this.canvas) {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.setupControls();
            this.animate();
        }
    }
    
    resize() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Initialize positions
        this.redAI.position = { x: 50, y: this.height / 2 };
        this.blueAI.scanPosition = { x: this.width - 50, y: this.height / 2 };
    }
    
    setupControls() {
        const startBtn = document.getElementById('startBattle');
        const pauseBtn = document.getElementById('pauseBattle');
        const resetBtn = document.getElementById('resetBattle');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        document.getElementById('startBattle').disabled = true;
        document.getElementById('pauseBattle').disabled = false;
        
        this.runSimulation();
        
        ShaheenUtils.eventBus.emit('wargameStarted');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBattle').innerHTML = this.isPaused 
            ? '<i class="fas fa-play"></i> استئناف' 
            : '<i class="fas fa-pause"></i> إيقاف';
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.roundNumber = 0;
        
        this.redAI.successRate = 45;
        this.redAI.attempts = 0;
        this.redAI.successes = 0;
        this.redAI.tacticsDiscovered = 0;
        this.redAI.hiddenObjects = [];
        
        this.blueAI.detectionRate = 55;
        this.blueAI.detections = 0;
        this.blueAI.missedThreats = 0;
        this.blueAI.defensesEvolved = 0;
        
        this.battleLog = [];
        this.hiddenThreats = [];
        this.detectedThreats = [];
        
        document.getElementById('startBattle').disabled = false;
        document.getElementById('pauseBattle').disabled = true;
        document.getElementById('pauseBattle').innerHTML = '<i class="fas fa-pause"></i> إيقاف';
        
        this.updateUI();
        
        ShaheenUtils.eventBus.emit('wargameReset');
    }
    
    async runSimulation() {
        while (this.isRunning && this.roundNumber < this.maxRounds) {
            if (!this.isPaused) {
                await this.executeRound();
                this.roundNumber++;
                this.updateUI();
            }
            await ShaheenUtils.sleep(500);
        }
        
        if (this.roundNumber >= this.maxRounds) {
            this.endSimulation();
        }
    }
    
    async executeRound() {
        const { random, randomInt } = ShaheenUtils;
        
        // Red AI chooses a tactic and attempts to hide a threat
        const tactic = this.tactics[randomInt(0, this.tactics.length)];
        this.redAI.currentTactic = tactic;
        this.redAI.attempts++;
        
        // Create hidden threat
        const threat = {
            id: ShaheenUtils.generateId(),
            x: random(100, this.width - 100),
            y: random(100, this.height - 100),
            tactic: tactic,
            concealment: random(0.3, 0.9) * tactic.difficulty,
            detected: false,
            timestamp: Date.now()
        };
        
        this.hiddenThreats.push(threat);
        
        // Log Red AI action
        this.addBattleEvent('red', `استخدام تكتيك: ${tactic.name}`, 'attack');
        
        // Blue AI attempts detection
        await ShaheenUtils.sleep(200);
        
        // Calculate detection probability
        const baseDetection = this.blueAI.detectionRate / 100;
        const tacticPenalty = tactic.difficulty * 0.1;
        const learningBonus = this.blueAI.defensesEvolved * 0.02;
        const detectionChance = Math.min(0.95, baseDetection - tacticPenalty + learningBonus);
        
        const detected = random(0, 1) < detectionChance;
        
        if (detected) {
            threat.detected = true;
            this.detectedThreats.push(threat);
            this.blueAI.detections++;
            
            // Blue AI learns from success
            this.blueAI.detectionRate = Math.min(95, this.blueAI.detectionRate + 0.5);
            this.blueAI.defensesEvolved++;
            
            this.addBattleEvent('blue', `تم الكشف! (${(detectionChance * 100).toFixed(1)}%)`, 'detect');
            
            ShaheenUtils.eventBus.emit('threatDetected', threat);
        } else {
            this.redAI.successes++;
            this.blueAI.missedThreats++;
            
            // Red AI success - learns new variation
            this.redAI.tacticsDiscovered++;
            this.redAI.successRate = Math.min(80, this.redAI.successRate + 0.3);
            
            this.addBattleEvent('red', `نجح الإخفاء!`, 'success');
            
            // Blue AI adapts after failure
            this.blueAI.detectionRate = Math.min(95, this.blueAI.detectionRate + 0.2);
        }
        
        // Remove old threats
        this.hiddenThreats = this.hiddenThreats.filter(t => 
            Date.now() - t.timestamp < 5000
        );
        this.detectedThreats = this.detectedThreats.filter(t => 
            Date.now() - t.timestamp < 5000
        );
        
        // Update success/detection rates
        this.redAI.successRate = (this.redAI.successes / Math.max(1, this.redAI.attempts)) * 100;
        this.blueAI.detectionRate = (this.blueAI.detections / Math.max(1, this.redAI.attempts)) * 100;
    }
    
    addBattleEvent(side, message, type) {
        const event = {
            id: ShaheenUtils.generateId(),
            side,
            message,
            type,
            timestamp: Date.now(),
            round: this.roundNumber
        };
        
        this.battleLog.unshift(event);
        
        // Keep only last 50 events
        if (this.battleLog.length > 50) {
            this.battleLog = this.battleLog.slice(0, 50);
        }
        
        this.updateBattleLog();
    }
    
    updateBattleLog() {
        const container = document.getElementById('battleLog');
        if (!container) return;
        
        container.innerHTML = this.battleLog.slice(0, 10).map(event => {
            const icon = event.side === 'red' ? '🔴' : '🔵';
            return `
                <div class="battle-event ${event.side}">
                    <span class="event-icon">${icon}</span>
                    <div class="event-content">
                        <span>${event.message}</span>
                        <span class="event-time">جولة ${event.round}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateUI() {
        // Update round counter
        const roundNum = document.getElementById('roundNumber');
        if (roundNum) roundNum.textContent = this.roundNumber;
        
        // Update Red AI stats
        const redSuccess = document.getElementById('redSuccessRate');
        const redSuccessVal = document.getElementById('redSuccessValue');
        const redAttempts = document.getElementById('redAttempts');
        const redTactics = document.getElementById('redTactics');
        
        if (redSuccess) redSuccess.style.width = `${this.redAI.successRate}%`;
        if (redSuccessVal) redSuccessVal.textContent = `${this.redAI.successRate.toFixed(1)}%`;
        if (redAttempts) redAttempts.textContent = this.redAI.attempts;
        if (redTactics) redTactics.textContent = this.redAI.tacticsDiscovered;
        
        // Update Blue AI stats
        const blueDetection = document.getElementById('blueDetectionRate');
        const blueDetectionVal = document.getElementById('blueDetectionValue');
        const blueDetections = document.getElementById('blueDetections');
        const blueDefenses = document.getElementById('blueDefenses');
        
        if (blueDetection) blueDetection.style.width = `${this.blueAI.detectionRate}%`;
        if (blueDetectionVal) blueDetectionVal.textContent = `${this.blueAI.detectionRate.toFixed(1)}%`;
        if (blueDetections) blueDetections.textContent = this.blueAI.detections;
        if (blueDefenses) blueDefenses.textContent = this.blueAI.defensesEvolved;
        
        // Update wins
        const redWins = document.getElementById('redWins');
        const blueWins = document.getElementById('blueWins');
        if (redWins) redWins.textContent = this.redAI.successes;
        if (blueWins) blueWins.textContent = this.blueAI.detections;
    }
    
    endSimulation() {
        this.isRunning = false;
        document.getElementById('startBattle').disabled = false;
        document.getElementById('pauseBattle').disabled = true;
        
        const winner = this.blueAI.detections > this.redAI.successes ? 'Blue-AI' : 'Red-AI';
        
        this.addBattleEvent(
            winner === 'Blue-AI' ? 'blue' : 'red',
            `انتهت المحاكاة - الفائز: ${winner}`,
            'end'
        );
        
        ShaheenUtils.eventBus.emit('wargameEnded', {
            winner,
            rounds: this.roundNumber,
            redStats: { ...this.redAI },
            blueStats: { ...this.blueAI }
        });
    }
    
    update() {
        const { random, lerp } = ShaheenUtils;
        
        // Animate Red AI position (stalking behavior)
        if (this.isRunning && !this.isPaused) {
            this.redAI.position.x = lerp(this.redAI.position.x, 
                this.width / 4 + Math.sin(Date.now() / 1000) * 50, 0.02);
            this.redAI.position.y = lerp(this.redAI.position.y,
                this.height / 2 + Math.cos(Date.now() / 800) * 80, 0.02);
        }
        
        // Animate Blue AI scan position
        if (this.isRunning && !this.isPaused) {
            this.blueAI.scanPosition.x = this.width * 0.75 + Math.sin(Date.now() / 500) * 30;
            this.blueAI.scanPosition.y = this.height / 2 + Math.cos(Date.now() / 600) * 60;
        }
    }
    
    draw() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        
        // Background
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#0a0f1a');
        gradient.addColorStop(1, '#1a1525');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Grid
        this.drawGrid();
        
        // Battle zone divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Zone labels
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(0, 0, this.width / 2, this.height);
        
        ctx.fillStyle = 'rgba(0, 128, 255, 0.2)';
        ctx.fillRect(this.width / 2, 0, this.width / 2, this.height);
        
        // Draw hidden threats
        this.hiddenThreats.forEach(threat => {
            if (!threat.detected) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
                ctx.beginPath();
                ctx.arc(threat.x, threat.y, 15, 0, Math.PI * 2);
                ctx.fill();
                
                // Question mark
                ctx.fillStyle = '#ef4444';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('?', threat.x, threat.y + 5);
            }
        });
        
        // Draw detected threats
        this.detectedThreats.forEach(threat => {
            ctx.strokeStyle = '#006C35';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(threat.x, threat.y, 20, 0, Math.PI * 2);
            ctx.stroke();
            
            // Crosshair
            ctx.beginPath();
            ctx.moveTo(threat.x - 25, threat.y);
            ctx.lineTo(threat.x + 25, threat.y);
            ctx.moveTo(threat.x, threat.y - 25);
            ctx.lineTo(threat.x, threat.y + 25);
            ctx.stroke();
            
            // Check mark
            ctx.fillStyle = '#006C35';
            ctx.font = '16px Arial';
            ctx.fillText('✓', threat.x, threat.y + 5);
        });
        
        // Draw Red AI
        this.drawRedAI();
        
        // Draw Blue AI
        this.drawBlueAI();
        
        // Draw HUD
        this.drawHUD();
    }
    
    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }
    
    drawRedAI() {
        const ctx = this.ctx;
        const { x, y } = this.redAI.position;
        
        // Glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('☠', x, y + 7);
        
        // Label
        ctx.fillStyle = '#ef4444';
        ctx.font = '12px Cairo';
        ctx.fillText('Red-AI', x, y + 45);
        
        // Current tactic
        if (this.redAI.currentTactic && this.isRunning) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.font = '10px Cairo';
            ctx.fillText(this.redAI.currentTactic.name, x, y + 60);
        }
    }
    
    drawBlueAI() {
        const ctx = this.ctx;
        const { x, y } = this.blueAI.scanPosition;
        
        // Scan radius
        const scanRadius = 80 + Math.sin(Date.now() / 200) * 10;
        
        ctx.strokeStyle = 'rgba(0, 128, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, scanRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Scan sweep
        const sweepAngle = (Date.now() / 500) % (Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, scanRadius, sweepAngle, sweepAngle + Math.PI / 3);
        ctx.closePath();
        ctx.fill();
        
        // Glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
        gradient.addColorStop(0, 'rgba(0, 128, 255, 0.3)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = '#008542';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👁', x, y + 7);
        
        // Label
        ctx.fillStyle = '#008542';
        ctx.font = '12px Cairo';
        ctx.fillText('Blue-AI', x, y + 45);
    }
    
    drawHUD() {
        const ctx = this.ctx;
        
        // Status
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 180, 60);
        
        ctx.fillStyle = this.isRunning ? '#10b981' : '#ef4444';
        ctx.font = '14px Cairo';
        ctx.textAlign = 'right';
        ctx.fillText(this.isRunning ? (this.isPaused ? 'متوقف مؤقتاً' : 'جاري المحاكاة...') : 'في الانتظار', 180, 35);
        
        ctx.fillStyle = '#006C35';
        ctx.fillText(`الجولة: ${this.roundNumber} / ${this.maxRounds}`, 180, 55);
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    getStats() {
        return {
            roundNumber: this.roundNumber,
            redAI: { ...this.redAI },
            blueAI: { ...this.blueAI },
            isRunning: this.isRunning
        };
    }
}

// Export
window.WargamingSimulator = WargamingSimulator;
