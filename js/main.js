/* ====================================
   ShaheenEye - Main Application
   ==================================== */

// Global instances
let digitalTwin = null;
let hyperspectralAnalyzer = null;
let illuminanceController = null;
let wargamingSimulator = null;
let audioVisualCorrelator = null;
let alertsManager = null;
let demoController = null;

// Statistics
const stats = {
    spectralScans: 0,
    lightAdjustments: 0,
    wargameRounds: 0,
    audioEvents: 0
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initLoading();
});

function initLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    const loadingStatus = document.querySelector('.loading-status');
    
    const loadingSteps = [
        'تحميل وحدات النظام...',
        'تهيئة التوأم الرقمي...',
        'معايرة التحليل الطيفي...',
        'ربط أنظمة الإضاءة...',
        'تفعيل المحاكاة العدائية...',
        'تشغيل التحليل الصوتي...',
        'جاري التشغيل...'
    ];
    
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
        if (stepIndex < loadingSteps.length) {
            loadingStatus.textContent = loadingSteps[stepIndex];
            stepIndex++;
        }
    }, 400);
    
    // Initialize after loading animation
    setTimeout(() => {
        clearInterval(stepInterval);
        initializeApp();
        
        // Hide loading, show app
        loadingScreen.classList.add('hidden');
        app.classList.remove('hidden');
    }, 3000);
}

function initializeApp() {
    // Initialize all modules
    initializeModules();
    
    // Setup navigation
    setupNavigation();
    
    // Setup datetime
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Setup live feeds
    setupLiveFeeds();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start statistics updates
    startStatsUpdates();
    
    // Log initialization
    console.log('%c🦅 ShaheenEye System Initialized', 'color: #00f0ff; font-size: 20px; font-weight: bold;');
}

function initializeModules() {
    // Initialize Digital Twin
    digitalTwin = new DigitalTwin('twinCanvas');
    
    // Initialize Hyperspectral Analyzer
    hyperspectralAnalyzer = new HyperspectralAnalyzer();
    
    // Initialize Illuminance Controller
    illuminanceController = new IlluminanceController();
    
    // Initialize Wargaming Simulator
    wargamingSimulator = new WargamingSimulator();
    
    // Initialize Audio-Visual Correlator
    audioVisualCorrelator = new AudioVisualCorrelator();
    
    // Initialize Alerts Manager
    alertsManager = new AlertsManager();
    window.alertsManager = alertsManager; // Make globally accessible for inline handlers
    
    // Initialize Demo Controller
    demoController = new DemoController();
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.panel');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const panelId = item.dataset.panel;
            
            // Update nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update panels
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${panelId}-panel`) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

function updateDateTime() {
    const datetimeEl = document.getElementById('datetime');
    if (datetimeEl) {
        const now = new Date();
        datetimeEl.textContent = ShaheenUtils.formatDateTime(now);
    }
}

function setupLiveFeeds() {
    const feedGrid = document.getElementById('liveFeedGrid');
    if (!feedGrid) return;
    
    // Create 4 camera feeds
    for (let i = 1; i <= 4; i++) {
        const feedItem = document.createElement('div');
        feedItem.className = 'feed-item';
        feedItem.innerHTML = `
            <canvas id="feedCanvas${i}"></canvas>
            <span class="feed-label">كاميرا ${i}</span>
            <span class="feed-status"></span>
        `;
        feedGrid.appendChild(feedItem);
    }
    
    // Initialize feed canvases
    for (let i = 1; i <= 4; i++) {
        const canvas = document.getElementById(`feedCanvas${i}`);
        if (canvas) {
            initializeFeedCanvas(canvas, i);
        }
    }
}

function initializeFeedCanvas(canvas, index) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    let time = 0;
    
    function draw() {
        time += 0.02;
        
        // Dark feed background
        ctx.fillStyle = '#0a1020';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Simulate camera view with noise
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 20;
            data[i] = 15 + noise;     // R
            data[i + 1] = 20 + noise; // G
            data[i + 2] = 30 + noise; // B
            data[i + 3] = 255;        // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add scan line effect
        const scanY = (time * 50) % canvas.height;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(canvas.width, scanY);
        ctx.stroke();
        
        // Camera number overlay
        ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.font = '12px Orbitron';
        ctx.fillText(`CAM-${index}`, 10, 20);
        
        // Timestamp
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '9px Orbitron';
        ctx.fillText(ShaheenUtils.formatTime(new Date()), 10, canvas.height - 10);
        
        requestAnimationFrame(draw);
    }
    
    draw();
}

function setupEventListeners() {
    // Digital Twin controls
    const toggleHeatmap = document.getElementById('toggleHeatmap');
    const toggleCameras = document.getElementById('toggleCameras');
    const toggleLights = document.getElementById('toggleLights');
    
    if (toggleHeatmap) {
        toggleHeatmap.addEventListener('click', () => {
            digitalTwin.toggleHeatmap();
            toggleHeatmap.classList.toggle('active');
        });
    }
    
    if (toggleCameras) {
        toggleCameras.addEventListener('click', () => {
            digitalTwin.toggleCameras();
            toggleCameras.classList.toggle('active');
        });
        toggleCameras.classList.add('active');
    }
    
    if (toggleLights) {
        toggleLights.addEventListener('click', () => {
            digitalTwin.toggleLights();
            toggleLights.classList.toggle('active');
        });
        toggleLights.classList.add('active');
    }
    
    // Listen for module events to update stats
    ShaheenUtils.eventBus.on('scanComplete', () => {
        stats.spectralScans++;
        updateStatsDisplay();
    });
    
    ShaheenUtils.eventBus.on('lightAdjusted', () => {
        stats.lightAdjustments++;
        updateStatsDisplay();
    });
    
    ShaheenUtils.eventBus.on('wargameEnded', (data) => {
        stats.wargameRounds += data.rounds;
        updateStatsDisplay();
    });
    
    ShaheenUtils.eventBus.on('audioEventDetected', () => {
        stats.audioEvents++;
        updateStatsDisplay();
    });
    
    // Periodic events for demo purposes
    setInterval(() => {
        // Trigger random hyperspectral scan
        if (hyperspectralAnalyzer && Math.random() > 0.7) {
            hyperspectralAnalyzer.startScan();
        }
        
        // Trigger adaptive illuminance
        if (illuminanceController && Math.random() > 0.8) {
            illuminanceController.simulateSuspiciousActivity();
        }
        
        // Add heatmap data to digital twin
        if (digitalTwin && Math.random() > 0.6) {
            const x = ShaheenUtils.random(100, digitalTwin.width - 100);
            const y = ShaheenUtils.random(100, digitalTwin.height - 100);
            digitalTwin.addHeatmapPoint(x, y, ShaheenUtils.random(0.5, 1));
        }
    }, 5000);
}

function startStatsUpdates() {
    // Update stats periodically
    setInterval(() => {
        // Simulate increasing stats
        stats.spectralScans += ShaheenUtils.randomInt(0, 2);
        stats.lightAdjustments += ShaheenUtils.randomInt(0, 1);
        stats.audioEvents += ShaheenUtils.randomInt(0, 1);
        
        if (wargamingSimulator && wargamingSimulator.isRunning) {
            stats.wargameRounds = wargamingSimulator.roundNumber;
        }
        
        updateStatsDisplay();
    }, 3000);
    
    // Initial display
    updateStatsDisplay();
}

function updateStatsDisplay() {
    const spectralEl = document.getElementById('spectralScans');
    const lightEl = document.getElementById('lightAdjustments');
    const wargameEl = document.getElementById('wargameRounds');
    const audioEl = document.getElementById('audioEvents');
    
    if (spectralEl) ShaheenUtils.animateValue(spectralEl, parseInt(spectralEl.textContent) || 0, stats.spectralScans, 500);
    if (lightEl) ShaheenUtils.animateValue(lightEl, parseInt(lightEl.textContent) || 0, stats.lightAdjustments, 500);
    if (wargameEl) ShaheenUtils.animateValue(wargameEl, parseInt(wargameEl.textContent) || 0, stats.wargameRounds, 500);
    if (audioEl) ShaheenUtils.animateValue(audioEl, parseInt(audioEl.textContent) || 0, stats.audioEvents, 500);
}

// Add timeline events
function addTimelineEvent(title, description, type = 'info') {
    const timeline = document.getElementById('activityTimeline');
    if (!timeline) return;
    
    const item = document.createElement('div');
    item.className = `timeline-item ${type}`;
    item.innerHTML = `
        <div class="timeline-time">${ShaheenUtils.formatTime(new Date())}</div>
        <div class="timeline-content">
            <div class="timeline-title">${title}</div>
            <div class="timeline-desc">${description}</div>
        </div>
    `;
    
    timeline.insertBefore(item, timeline.firstChild);
    
    // Keep only last 10 events
    while (timeline.children.length > 10) {
        timeline.removeChild(timeline.lastChild);
    }
}

// Add some initial timeline events
setTimeout(() => {
    addTimelineEvent('بدء النظام', 'تم تهيئة جميع الوحدات بنجاح', 'success');
}, 4000);

setTimeout(() => {
    addTimelineEvent('اتصال الكاميرات', '6 كاميرات متصلة وتعمل', 'info');
}, 5000);

setTimeout(() => {
    addTimelineEvent('معايرة التحليل الطيفي', 'تمت معايرة قاعدة بيانات المواد', 'info');
}, 6000);

// Listen for important events and add to timeline
ShaheenUtils.eventBus.on('dangerDetected', (data) => {
    addTimelineEvent('تحذير: مادة خطرة', `تم كشف ${data.material.name}`, 'critical');
});

ShaheenUtils.eventBus.on('suspiciousSound', (data) => {
    addTimelineEvent('صوت مشبوه', `تم رصد صوت ${data.type}`, 'warning');
});

ShaheenUtils.eventBus.on('threatDetected', (data) => {
    addTimelineEvent('كشف تهديد', `المحاكاة: تم كشف تكتيك "${data.tactic.name}"`, 'success');
});

// Expose for console debugging
window.ShaheenEye = {
    digitalTwin,
    hyperspectralAnalyzer,
    illuminanceController,
    wargamingSimulator,
    audioVisualCorrelator,
    alertsManager,
    demoController,
    stats,
    eventBus: ShaheenUtils.eventBus
};

console.log('%cShaheenEye System Ready', 'color: #10b981; font-size: 14px;');
console.log('%cType ShaheenEye in console to access system modules', 'color: #64748b; font-size: 12px;');
