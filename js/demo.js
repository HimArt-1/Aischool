/* ====================================
   ShaheenEye - Demo Mode Module
   ==================================== */

class DemoController {
    constructor() {
        this.isActive = false;
        this.currentStep = 0;
        this.totalSteps = 4;
        
        this.scenes = [
            {
                title: 'المشهد 1',
                subtitle: 'ليلة هادئة... ليست هادئة',
                content: this.getScene1Content(),
                action: () => this.playScene1()
            },
            {
                title: 'المشهد 2',
                subtitle: 'صوت قبل الصورة',
                content: this.getScene2Content(),
                action: () => this.playScene2()
            },
            {
                title: 'المشهد 3',
                subtitle: 'AI ضد AI - المحاكاة العدائية',
                content: this.getScene3Content(),
                action: () => this.playScene3()
            },
            {
                title: 'المشهد 4',
                subtitle: 'الرسالة النهائية',
                content: this.getScene4Content(),
                action: () => this.playScene4()
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupControls();
    }
    
    setupControls() {
        const startBtn = document.getElementById('startDemo');
        const closeBtn = document.getElementById('demoClose');
        const prevBtn = document.getElementById('demoPrev');
        const nextBtn = document.getElementById('demoNext');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
    }
    
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.showOverlay();
        this.renderCurrentScene();
    }
    
    close() {
        this.isActive = false;
        this.hideOverlay();
    }
    
    showOverlay() {
        const overlay = document.getElementById('demoOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }
    
    hideOverlay() {
        const overlay = document.getElementById('demoOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.renderCurrentScene();
        } else {
            this.close();
        }
    }
    
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderCurrentScene();
        }
    }
    
    renderCurrentScene() {
        const scene = this.scenes[this.currentStep];
        
        const titleEl = document.getElementById('demoTitle');
        const subtitleEl = document.getElementById('demoSubtitle');
        const bodyEl = document.getElementById('demoBody');
        const stepEl = document.getElementById('demoStep');
        const totalEl = document.getElementById('demoTotal');
        
        if (titleEl) titleEl.textContent = scene.title;
        if (subtitleEl) subtitleEl.textContent = scene.subtitle;
        if (bodyEl) bodyEl.innerHTML = scene.content;
        if (stepEl) stepEl.textContent = this.currentStep + 1;
        if (totalEl) totalEl.textContent = this.totalSteps;
        
        // Execute scene action
        if (scene.action) {
            scene.action();
        }
    }
    
    getScene1Content() {
        return `
            <div class="demo-scene scene-1">
                <div class="scene-visual">
                    <div class="digital-twin-preview">
                        <canvas id="demoTwinCanvas" width="600" height="300"></canvas>
                    </div>
                </div>
                <div class="scene-description">
                    <div class="feature-highlight">
                        <div class="feature-icon" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b;">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="feature-text">
                            <h4>الاستجابة الضوئية التكيفية</h4>
                            <p>النظام يرفع إنارة عمود قريب بـ 10-15% فقط (غير ملحوظة بشريًا)</p>
                        </div>
                    </div>
                    <div class="scene-quote">
                        <i class="fas fa-quote-right"></i>
                        <p>"We silently bend the light to see more… without anyone noticing."</p>
                    </div>
                    <div class="scene-indicator">
                        <div class="indicator-item">
                            <span class="indicator-label">مستوى الإنارة</span>
                            <div class="indicator-bar">
                                <div class="indicator-fill" id="lightIndicator" style="width: 65%"></div>
                            </div>
                            <span class="indicator-value" id="lightValue">65%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getScene2Content() {
        return `
            <div class="demo-scene scene-2">
                <div class="scene-visual">
                    <div class="audio-detection-preview">
                        <div class="waveform-demo">
                            <canvas id="demoWaveCanvas" width="600" height="150"></canvas>
                        </div>
                        <div class="audio-event-demo">
                            <div class="event-card detected">
                                <div class="event-icon"><i class="fas fa-hammer"></i></div>
                                <div class="event-info">
                                    <span class="event-type">حفر / سحب</span>
                                    <span class="event-duration">المدة: 3 ثوانٍ</span>
                                </div>
                                <div class="event-confidence">87%</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="scene-description">
                    <div class="feature-highlight">
                        <div class="feature-icon" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">
                            <i class="fas fa-microphone"></i>
                        </div>
                        <div class="feature-text">
                            <h4>الارتباط الصوتي المكاني</h4>
                            <p>الميكروفونات تلتقط صوت "جر جسم ثقيل" أو "حفر" - النظام يحدد الموقع ويوجه الكاميرات</p>
                        </div>
                    </div>
                    <div class="scene-quote">
                        <i class="fas fa-quote-right"></i>
                        <p>"At night, we hear first… then we see."</p>
                    </div>
                    <div class="mic-status-demo">
                        <div class="mic-demo active"><i class="fas fa-microphone"></i> MIC-1</div>
                        <div class="mic-demo active"><i class="fas fa-microphone"></i> MIC-2</div>
                        <div class="mic-demo"><i class="fas fa-microphone"></i> MIC-3</div>
                        <div class="mic-demo active"><i class="fas fa-microphone"></i> MIC-4</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getScene3Content() {
        return `
            <div class="demo-scene scene-3">
                <div class="scene-visual">
                    <div class="wargame-preview">
                        <div class="ai-battle">
                            <div class="ai-side red">
                                <div class="ai-icon"><i class="fas fa-user-secret"></i></div>
                                <span class="ai-name">Red-AI</span>
                                <span class="ai-role">المهاجم</span>
                            </div>
                            <div class="vs-indicator">
                                <span>VS</span>
                                <div class="battle-animation">
                                    <div class="spark"></div>
                                </div>
                            </div>
                            <div class="ai-side blue">
                                <div class="ai-icon"><i class="fas fa-shield-alt"></i></div>
                                <span class="ai-name">Blue-AI</span>
                                <span class="ai-role">المدافع</span>
                            </div>
                        </div>
                        <div class="round-counter-demo">
                            <span class="round-label">الجولات</span>
                            <span class="round-value" id="demoRoundCount">0</span>
                        </div>
                    </div>
                </div>
                <div class="scene-description">
                    <div class="feature-highlight">
                        <div class="feature-icon" style="background: rgba(139, 92, 246, 0.2); color: #8b5cf6;">
                            <i class="fas fa-chess"></i>
                        </div>
                        <div class="feature-text">
                            <h4>المحاكاة العدائية</h4>
                            <p>Red-AI يحاول إخفاء تهديدات افتراضية، Blue-AI يتعلم كشفها - ملايين الجولات = تعلم مستمر</p>
                        </div>
                    </div>
                    <div class="scene-quote">
                        <i class="fas fa-quote-right"></i>
                        <p>"Our AI plays against a criminal AI… so it can beat real criminals later."</p>
                    </div>
                    <div class="wargame-stats-demo">
                        <div class="stat-demo">
                            <span class="stat-label">نسبة كشف Blue-AI</span>
                            <div class="stat-bar blue"><div class="stat-fill" id="blueRateDemo" style="width: 55%"></div></div>
                        </div>
                        <div class="stat-demo">
                            <span class="stat-label">نسبة نجاح Red-AI</span>
                            <div class="stat-bar red"><div class="stat-fill" id="redRateDemo" style="width: 45%"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getScene4Content() {
        return `
            <div class="demo-scene scene-4">
                <div class="scene-visual final-message">
                    <div class="shaheen-logo-large">
                        <svg viewBox="0 0 200 200" class="falcon-icon-large">
                            <defs>
                                <linearGradient id="falconGradLarge" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00f0ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0080ff;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#falconGradLarge)" d="M100,20 L120,60 L180,80 L140,100 L160,180 L100,140 L40,180 L60,100 L20,80 L80,60 Z"/>
                            <circle cx="100" cy="85" r="8" fill="#fff"/>
                        </svg>
                    </div>
                    <h2 class="final-title">عين الشاهين</h2>
                    <p class="final-tagline">From Predicting Crime… to Predicting Crime Evolution</p>
                </div>
                <div class="scene-description final">
                    <div class="summary-cards">
                        <div class="summary-card">
                            <i class="fas fa-eye"></i>
                            <span>بصمة المواد الطيفية</span>
                            <small>كشف التمويه المتقن</small>
                        </div>
                        <div class="summary-card">
                            <i class="fas fa-lightbulb"></i>
                            <span>الإضاءة التكيفية</span>
                            <small>رؤية أفضل بدون لفت النظر</small>
                        </div>
                        <div class="summary-card">
                            <i class="fas fa-chess"></i>
                            <span>المحاكاة العدائية</span>
                            <small>تعلم من كل محاولة</small>
                        </div>
                        <div class="summary-card">
                            <i class="fas fa-microphone"></i>
                            <span>الربط الصوتي</span>
                            <small>نسمع قبل أن نرى</small>
                        </div>
                    </div>
                    <div class="final-quote">
                        <p>"نحن لا نحمي الحي فقط…<br>نحن نتعلم من كل محاولة عدائية، حتى لو كانت مجرد محاكاة."</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    async playScene1() {
        await ShaheenUtils.sleep(500);
        
        // Animate light level
        const indicator = document.getElementById('lightIndicator');
        const value = document.getElementById('lightValue');
        
        if (indicator && value) {
            let level = 65;
            const animate = () => {
                level += 0.5;
                if (level > 80) level = 65;
                
                indicator.style.width = `${level}%`;
                value.textContent = `${level.toFixed(0)}%`;
                
                if (this.isActive && this.currentStep === 0) {
                    setTimeout(animate, 100);
                }
            };
            animate();
        }
        
        // Draw simple canvas animation
        const canvas = document.getElementById('demoTwinCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let time = 0;
            
            const draw = () => {
                time += 0.016;
                
                // Night background
                ctx.fillStyle = '#0a1525';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Grid
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
                for (let x = 0; x < canvas.width; x += 30) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, canvas.height);
                    ctx.stroke();
                }
                
                // Buildings
                for (let i = 0; i < 5; i++) {
                    ctx.fillStyle = '#1a2535';
                    ctx.fillRect(50 + i * 110, 100, 80, 150);
                }
                
                // Animated light
                const lightX = 150 + Math.sin(time) * 20;
                const lightY = 80;
                const intensity = 0.5 + Math.sin(time * 3) * 0.2;
                
                const gradient = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 100 * intensity);
                gradient.addColorStop(0, `rgba(255, 221, 136, ${0.4 * intensity})`);
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(lightX, lightY, 100 * intensity, 0, Math.PI * 2);
                ctx.fill();
                
                // Light bulb
                ctx.fillStyle = '#ffdd88';
                ctx.beginPath();
                ctx.arc(lightX, lightY, 6, 0, Math.PI * 2);
                ctx.fill();
                
                if (this.isActive && this.currentStep === 0) {
                    requestAnimationFrame(draw);
                }
            };
            draw();
        }
    }
    
    async playScene2() {
        await ShaheenUtils.sleep(500);
        
        // Animate waveform
        const canvas = document.getElementById('demoWaveCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let time = 0;
            
            const draw = () => {
                time += 0.05;
                
                ctx.fillStyle = '#1a2234';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw waveform
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                for (let x = 0; x < canvas.width; x++) {
                    const y = canvas.height / 2 + 
                        Math.sin(x * 0.05 + time) * 30 +
                        Math.sin(x * 0.1 + time * 2) * 20 +
                        (Math.random() - 0.5) * 10;
                    
                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                
                ctx.stroke();
                
                if (this.isActive && this.currentStep === 1) {
                    requestAnimationFrame(draw);
                }
            };
            draw();
        }
    }
    
    async playScene3() {
        await ShaheenUtils.sleep(500);
        
        // Animate round counter and stats
        const roundCounter = document.getElementById('demoRoundCount');
        const blueRate = document.getElementById('blueRateDemo');
        const redRate = document.getElementById('redRateDemo');
        
        let round = 0;
        let blueSuccess = 55;
        let redSuccess = 45;
        
        const animate = () => {
            round++;
            
            // Simulate AI battle
            if (Math.random() > 0.5) {
                blueSuccess = Math.min(85, blueSuccess + 0.5);
                redSuccess = Math.max(15, redSuccess - 0.3);
            } else {
                redSuccess = Math.min(60, redSuccess + 0.3);
            }
            
            if (roundCounter) roundCounter.textContent = round;
            if (blueRate) blueRate.style.width = `${blueSuccess}%`;
            if (redRate) redRate.style.width = `${redSuccess}%`;
            
            if (this.isActive && this.currentStep === 2 && round < 100) {
                setTimeout(animate, 100);
            }
        };
        animate();
    }
    
    async playScene4() {
        // Final scene - just display
        await ShaheenUtils.sleep(500);
    }
}

// Add demo styles
const demoStyles = document.createElement('style');
demoStyles.textContent = `
    .demo-scene {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        padding: 1rem;
    }
    
    .scene-visual {
        background: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .scene-description {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .feature-highlight {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: var(--radius-md);
    }
    
    .feature-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        flex-shrink: 0;
    }
    
    .feature-text h4 {
        margin-bottom: 0.5rem;
        color: var(--accent-cyan);
    }
    
    .feature-text p {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .scene-quote {
        padding: 1rem;
        background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, transparent 100%);
        border-right: 3px solid var(--accent-cyan);
        border-radius: var(--radius-md);
    }
    
    .scene-quote i {
        color: var(--accent-cyan);
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        display: block;
    }
    
    .scene-quote p {
        font-family: var(--font-en);
        font-style: italic;
        color: var(--accent-cyan);
        font-size: 1rem;
    }
    
    .scene-indicator {
        padding: 1rem;
        background: var(--bg-card);
        border-radius: var(--radius-md);
    }
    
    .indicator-item {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .indicator-label {
        min-width: 100px;
        color: var(--text-secondary);
    }
    
    .indicator-bar {
        flex: 1;
        height: 8px;
        background: var(--bg-tertiary);
        border-radius: 4px;
        overflow: hidden;
    }
    
    .indicator-fill {
        height: 100%;
        background: var(--accent-yellow);
        border-radius: 4px;
        transition: width 0.1s ease;
    }
    
    .indicator-value {
        font-family: var(--font-en);
        color: var(--accent-yellow);
        min-width: 50px;
        text-align: left;
    }
    
    /* Scene 2 */
    .waveform-demo {
        width: 100%;
        margin-bottom: 1rem;
    }
    
    .audio-event-demo {
        width: 100%;
    }
    
    .event-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: var(--radius-md);
    }
    
    .event-card.detected {
        animation: pulse 2s ease-in-out infinite;
    }
    
    .event-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .event-info {
        flex: 1;
    }
    
    .event-type {
        display: block;
        font-weight: 600;
    }
    
    .event-duration {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    
    .event-confidence {
        font-family: var(--font-en);
        font-size: 1.25rem;
        font-weight: 700;
        color: #ef4444;
    }
    
    .mic-status-demo {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .mic-demo {
        padding: 0.5rem 1rem;
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    
    .mic-demo.active {
        background: rgba(16, 185, 129, 0.2);
        color: var(--accent-green);
    }
    
    .mic-demo.active i {
        animation: pulse 1s ease-in-out infinite;
    }
    
    /* Scene 3 */
    .wargame-preview {
        width: 100%;
    }
    
    .ai-battle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    .ai-side {
        text-align: center;
    }
    
    .ai-side .ai-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    .ai-side.red .ai-icon {
        background: rgba(239, 68, 68, 0.2);
        border: 2px solid #ef4444;
        color: #ef4444;
    }
    
    .ai-side.blue .ai-icon {
        background: rgba(0, 128, 255, 0.2);
        border: 2px solid #0080ff;
        color: #0080ff;
    }
    
    .ai-name {
        display: block;
        font-weight: 700;
        font-size: 1.1rem;
    }
    
    .ai-role {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    
    .vs-indicator {
        text-align: center;
    }
    
    .vs-indicator span {
        font-family: var(--font-en);
        font-size: 1.5rem;
        font-weight: 900;
        color: var(--text-muted);
    }
    
    .round-counter-demo {
        text-align: center;
        padding: 1rem;
        background: var(--bg-card);
        border-radius: var(--radius-md);
    }
    
    .round-label {
        display: block;
        font-size: 0.9rem;
        color: var(--text-muted);
    }
    
    .round-value {
        font-family: var(--font-en);
        font-size: 3rem;
        font-weight: 900;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .wargame-stats-demo {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .stat-demo {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .stat-label {
        min-width: 150px;
        font-size: 0.9rem;
    }
    
    .stat-bar {
        flex: 1;
        height: 10px;
        background: var(--bg-tertiary);
        border-radius: 5px;
        overflow: hidden;
    }
    
    .stat-bar.blue .stat-fill {
        background: #0080ff;
    }
    
    .stat-bar.red .stat-fill {
        background: #ef4444;
    }
    
    .stat-fill {
        height: 100%;
        border-radius: 5px;
        transition: width 0.1s ease;
    }
    
    /* Scene 4 */
    .scene-4 {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .final-message {
        padding: 3rem;
    }
    
    .shaheen-logo-large {
        width: 150px;
        height: 150px;
        margin: 0 auto 1rem;
    }
    
    .falcon-icon-large {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 0 30px rgba(0, 240, 255, 0.5));
    }
    
    .final-title {
        font-size: 2.5rem;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    
    .final-tagline {
        font-family: var(--font-en);
        color: var(--text-secondary);
        font-size: 1.1rem;
    }
    
    .scene-description.final {
        max-width: 800px;
        margin: 0 auto;
    }
    
    .summary-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .summary-card {
        padding: 1.5rem 1rem;
        background: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        text-align: center;
    }
    
    .summary-card i {
        font-size: 2rem;
        color: var(--accent-cyan);
        margin-bottom: 0.5rem;
    }
    
    .summary-card span {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    
    .summary-card small {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .final-quote {
        padding: 2rem;
        background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-glow);
    }
    
    .final-quote p {
        font-size: 1.25rem;
        line-height: 1.8;
        color: var(--text-primary);
    }
    
    @media (max-width: 768px) {
        .demo-scene {
            grid-template-columns: 1fr;
        }
        
        .summary-cards {
            grid-template-columns: repeat(2, 1fr);
        }
    }
`;
document.head.appendChild(demoStyles);

// Export
window.DemoController = DemoController;
