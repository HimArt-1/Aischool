/* ====================================
   ShaheenEye - Hyperspectral Analysis Module
   ==================================== */

class HyperspectralAnalyzer {
    constructor() {
        this.canvas = document.getElementById('spectralCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.graphCanvas = document.getElementById('spectralGraph');
        this.graphCtx = this.graphCanvas ? this.graphCanvas.getContext('2d') : null;
        
        this.materials = [];
        this.detections = [];
        this.scanObjects = [];
        this.currentView = 'rgb';
        this.scanProgress = 0;
        this.isScanning = false;
        
        this.spectralSignatures = {
            'concrete': { wavelengths: [400, 500, 600, 700, 800, 900], values: [0.3, 0.35, 0.4, 0.42, 0.45, 0.5] },
            'brick': { wavelengths: [400, 500, 600, 700, 800, 900], values: [0.25, 0.3, 0.45, 0.55, 0.5, 0.45] },
            'plastic': { wavelengths: [400, 500, 600, 700, 800, 900], values: [0.4, 0.5, 0.55, 0.6, 0.7, 0.75] },
            'metal': { wavelengths: [400, 500, 600, 700, 800, 900], values: [0.6, 0.65, 0.7, 0.72, 0.75, 0.8] },
            'explosive': { wavelengths: [400, 500, 600, 700, 800, 900], values: [0.2, 0.35, 0.5, 0.65, 0.8, 0.85] },
            'organic': { wavelengths: [400, 500, 600, 700, 800, 900], values: [0.15, 0.25, 0.35, 0.5, 0.65, 0.7] },
            'glass': { wavelengths: [400, 500, 600, 700, 800, 900], values: [0.7, 0.72, 0.75, 0.78, 0.8, 0.82] },
            'fabric': { wavelengths: [400, 500, 600, 700, 800, 900], values: [0.35, 0.4, 0.45, 0.48, 0.5, 0.52] }
        };
        
        this.materialDatabase = [
            { name: 'خرسانة', nameEn: 'Concrete', signature: 'concrete', icon: '🧱', status: 'safe', color: '#808080' },
            { name: 'طوب', nameEn: 'Brick', signature: 'brick', icon: '🟫', status: 'safe', color: '#b87333' },
            { name: 'بلاستيك', nameEn: 'Plastic', signature: 'plastic', icon: '📦', status: 'suspicious', color: '#87ceeb' },
            { name: 'معدن', nameEn: 'Metal', signature: 'metal', icon: '⚙️', status: 'safe', color: '#c0c0c0' },
            { name: 'مواد متفجرة', nameEn: 'Explosive', signature: 'explosive', icon: '💥', status: 'danger', color: '#ff4444' },
            { name: 'مواد عضوية', nameEn: 'Organic', signature: 'organic', icon: '🌿', status: 'safe', color: '#228b22' },
            { name: 'زجاج', nameEn: 'Glass', signature: 'glass', icon: '🪟', status: 'safe', color: '#add8e6' },
            { name: 'قماش', nameEn: 'Fabric', signature: 'fabric', icon: '🧵', status: 'safe', color: '#deb887' }
        ];
        
        this.init();
    }
    
    init() {
        if (this.canvas) {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.generateScene();
            this.animate();
        }
        this.initMaterialList();
        this.initViewToggle();
    }
    
    resize() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        if (this.graphCanvas) {
            const graphContainer = this.graphCanvas.parentElement;
            this.graphCanvas.width = graphContainer.clientWidth;
            this.graphCanvas.height = 200;
        }
    }
    
    generateScene() {
        const { random, randomInt } = ShaheenUtils;
        
        // Generate random objects in the scene
        for (let i = 0; i < 15; i++) {
            const material = this.materialDatabase[randomInt(0, this.materialDatabase.length)];
            this.scanObjects.push({
                x: random(50, this.width - 50),
                y: random(50, this.height - 50),
                width: random(30, 80),
                height: random(30, 80),
                material: material,
                detected: false,
                scanLine: 0,
                rgbColor: material.color,
                spectralColor: this.getSpectralColor(material.signature)
            });
        }
    }
    
    getSpectralColor(signature) {
        const sig = this.spectralSignatures[signature];
        if (!sig) return '#ffffff';
        
        // Create a color based on spectral signature
        const avgValue = sig.values.reduce((a, b) => a + b, 0) / sig.values.length;
        const hue = Math.floor(avgValue * 360);
        return `hsl(${hue}, 70%, 50%)`;
    }
    
    initMaterialList() {
        const list = document.getElementById('materialList');
        if (!list) return;
        
        list.innerHTML = this.materialDatabase.map(mat => `
            <div class="material-item" data-material="${mat.signature}">
                <div class="material-icon" style="background: ${mat.color};">
                    ${mat.icon}
                </div>
                <div class="material-info">
                    <div class="material-name">${mat.name}</div>
                    <div class="material-signature">${mat.nameEn}</div>
                </div>
                <span class="material-status ${mat.status}">${this.getStatusText(mat.status)}</span>
            </div>
        `).join('');
        
        // Add click handlers
        list.querySelectorAll('.material-item').forEach(item => {
            item.addEventListener('click', () => {
                const signature = item.dataset.material;
                this.highlightMaterial(signature);
            });
        });
    }
    
    getStatusText(status) {
        const texts = {
            'safe': 'آمن',
            'suspicious': 'مشبوه',
            'danger': 'خطر'
        };
        return texts[status] || status;
    }
    
    initViewToggle() {
        const buttons = document.querySelectorAll('.view-toggle .toggle-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
            });
        });
    }
    
    highlightMaterial(signature) {
        this.scanObjects.forEach(obj => {
            obj.highlighted = obj.material.signature === signature;
        });
    }
    
    startScan() {
        this.isScanning = true;
        this.scanProgress = 0;
        
        ShaheenUtils.eventBus.emit('scanStarted');
    }
    
    analyzeMaterial(x, y) {
        // Find object at position
        const obj = this.scanObjects.find(o => 
            x >= o.x && x <= o.x + o.width &&
            y >= o.y && y <= o.y + o.height
        );
        
        if (obj) {
            obj.detected = true;
            
            const detection = {
                id: ShaheenUtils.generateId(),
                material: obj.material,
                confidence: ShaheenUtils.random(85, 99),
                location: { x, y },
                timestamp: Date.now()
            };
            
            this.detections.push(detection);
            this.updateDetectionResults();
            
            if (obj.material.status === 'danger') {
                ShaheenUtils.eventBus.emit('dangerDetected', detection);
            } else if (obj.material.status === 'suspicious') {
                ShaheenUtils.eventBus.emit('suspiciousDetected', detection);
            }
            
            return detection;
        }
        
        return null;
    }
    
    updateDetectionResults() {
        const container = document.getElementById('detectionResults');
        if (!container) return;
        
        container.innerHTML = this.detections.slice(-6).reverse().map(det => `
            <div class="detection-item">
                <div class="detection-header">
                    <span class="detection-type">${det.material.icon} ${det.material.name}</span>
                    <span class="detection-confidence">${det.confidence.toFixed(1)}%</span>
                </div>
                <div class="detection-details">
                    الموقع: (${det.location.x.toFixed(0)}, ${det.location.y.toFixed(0)})
                    <br>
                    التوقيت: ${ShaheenUtils.formatTime(new Date(det.timestamp))}
                </div>
            </div>
        `).join('');
    }
    
    drawSpectralGraph(signature) {
        if (!this.graphCtx || !this.graphCanvas) return;
        
        const ctx = this.graphCtx;
        const width = this.graphCanvas.width;
        const height = this.graphCanvas.height;
        
        // Clear
        ctx.fillStyle = '#1a2234';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 6; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        for (let i = 0; i < 6; i++) {
            const x = (width / 5) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Draw signature
        const sig = this.spectralSignatures[signature];
        if (!sig) return;
        
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        sig.values.forEach((val, i) => {
            const x = (width / (sig.values.length - 1)) * i;
            const y = height - (val * height);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#00f0ff';
        sig.values.forEach((val, i) => {
            const x = (width / (sig.values.length - 1)) * i;
            const y = height - (val * height);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Orbitron';
        ctx.textAlign = 'center';
        
        sig.wavelengths.forEach((wl, i) => {
            const x = (width / (sig.wavelengths.length - 1)) * i;
            ctx.fillText(`${wl}nm`, x, height - 5);
        });
    }
    
    update() {
        if (this.isScanning) {
            this.scanProgress += 0.5;
            
            // Scan objects as line passes
            this.scanObjects.forEach(obj => {
                const scanY = (this.scanProgress / 100) * this.height;
                if (scanY >= obj.y && scanY <= obj.y + obj.height && !obj.detected) {
                    this.analyzeMaterial(obj.x + obj.width / 2, obj.y + obj.height / 2);
                }
            });
            
            if (this.scanProgress >= 100) {
                this.isScanning = false;
                ShaheenUtils.eventBus.emit('scanComplete', this.detections);
            }
        }
    }
    
    draw() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        
        // Background
        ctx.fillStyle = '#0a1525';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        
        // Draw objects
        this.scanObjects.forEach(obj => {
            let color;
            
            switch (this.currentView) {
                case 'rgb':
                    color = obj.rgbColor;
                    break;
                case 'spectral':
                    color = obj.spectralColor;
                    break;
                case 'analysis':
                    color = obj.detected ? 
                        (obj.material.status === 'danger' ? '#ff4444' : 
                         obj.material.status === 'suspicious' ? '#ffaa00' : '#00ff88') 
                        : '#444';
                    break;
                default:
                    color = obj.rgbColor;
            }
            
            // Object shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(obj.x + 3, obj.y + 3, obj.width, obj.height);
            
            // Object fill
            ctx.fillStyle = color;
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            // Border
            ctx.strokeStyle = obj.highlighted ? '#00f0ff' : 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = obj.highlighted ? 3 : 1;
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            
            // Detection marker
            if (obj.detected && this.currentView === 'analysis') {
                ctx.fillStyle = '#fff';
                ctx.font = '12px Cairo';
                ctx.textAlign = 'center';
                ctx.fillText(obj.material.icon, obj.x + obj.width / 2, obj.y + obj.height / 2 + 4);
            }
            
            // Highlighted effect
            if (obj.highlighted) {
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(obj.x - 5, obj.y - 5, obj.width + 10, obj.height + 10);
                ctx.setLineDash([]);
            }
        });
        
        // Draw scan line
        if (this.isScanning) {
            const scanY = (this.scanProgress / 100) * this.height;
            
            // Scan line glow
            const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.5)');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, scanY - 20, this.width, 40);
            
            // Scan line
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, scanY);
            ctx.lineTo(this.width, scanY);
            ctx.stroke();
        }
        
        // HUD overlay
        this.drawHUD();
    }
    
    drawHUD() {
        const ctx = this.ctx;
        
        // Top left info
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 180, 80);
        
        ctx.fillStyle = '#00f0ff';
        ctx.font = '12px Cairo';
        ctx.textAlign = 'right';
        ctx.fillText(`وضع العرض: ${this.currentView.toUpperCase()}`, 180, 30);
        ctx.fillText(`الكائنات المكتشفة: ${this.detections.length}`, 180, 50);
        ctx.fillText(`التقدم: ${this.scanProgress.toFixed(0)}%`, 180, 70);
        
        // Corner brackets
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        
        // Top left
        ctx.beginPath();
        ctx.moveTo(10, 30);
        ctx.lineTo(10, 10);
        ctx.lineTo(30, 10);
        ctx.stroke();
        
        // Top right
        ctx.beginPath();
        ctx.moveTo(this.width - 30, 10);
        ctx.lineTo(this.width - 10, 10);
        ctx.lineTo(this.width - 10, 30);
        ctx.stroke();
        
        // Bottom left
        ctx.beginPath();
        ctx.moveTo(10, this.height - 30);
        ctx.lineTo(10, this.height - 10);
        ctx.lineTo(30, this.height - 10);
        ctx.stroke();
        
        // Bottom right
        ctx.beginPath();
        ctx.moveTo(this.width - 30, this.height - 10);
        ctx.lineTo(this.width - 10, this.height - 10);
        ctx.lineTo(this.width - 10, this.height - 30);
        ctx.stroke();
    }
    
    animate() {
        this.update();
        this.draw();
        
        // Update graph with random material
        if (this.detections.length > 0) {
            const lastDetection = this.detections[this.detections.length - 1];
            this.drawSpectralGraph(lastDetection.material.signature);
        } else {
            this.drawSpectralGraph('concrete');
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    getStats() {
        return {
            totalScans: this.detections.length,
            dangerCount: this.detections.filter(d => d.material.status === 'danger').length,
            suspiciousCount: this.detections.filter(d => d.material.status === 'suspicious').length,
            safeCount: this.detections.filter(d => d.material.status === 'safe').length
        };
    }
}

// Export
window.HyperspectralAnalyzer = HyperspectralAnalyzer;
