/* ====================================
   ShaheenEye - Alerts System Module
   ==================================== */

class AlertsManager {
    constructor() {
        this.alerts = [];
        this.toasts = [];
        this.maxAlerts = 100;
        this.filters = {
            current: 'all'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initFilters();
        
        // Generate some initial alerts
        this.generateInitialAlerts();
    }
    
    setupEventListeners() {
        // Listen for various system events
        ShaheenUtils.eventBus.on('dangerDetected', (data) => {
            this.addAlert({
                type: 'critical',
                title: 'كشف مادة خطرة!',
                description: `تم اكتشاف ${data.material.name} في الموقع (${data.location.x.toFixed(0)}, ${data.location.y.toFixed(0)})`,
                source: 'hyperspectral',
                data
            });
        });
        
        ShaheenUtils.eventBus.on('suspiciousDetected', (data) => {
            this.addAlert({
                type: 'warning',
                title: 'مادة مشبوهة',
                description: `تم اكتشاف ${data.material.name} - الثقة: ${data.confidence.toFixed(1)}%`,
                source: 'hyperspectral',
                data
            });
        });
        
        ShaheenUtils.eventBus.on('suspiciousSound', (data) => {
            this.addAlert({
                type: 'warning',
                title: 'صوت مشبوه',
                description: `تم رصد صوت ${data.type} - المدة: ${data.duration.toFixed(1)} ثانية`,
                source: 'audio',
                data
            });
        });
        
        ShaheenUtils.eventBus.on('threatDetected', (data) => {
            this.addAlert({
                type: 'info',
                title: 'كشف تهديد في المحاكاة',
                description: `Blue-AI اكتشف تهديد باستخدام تكتيك "${data.tactic.name}"`,
                source: 'wargaming',
                data
            });
        });
        
        ShaheenUtils.eventBus.on('lightAdjusted', (data) => {
            if (data.reason.includes('adaptive')) {
                this.addAlert({
                    type: 'info',
                    title: 'تعديل إضاءة تكيفي',
                    description: `تم تعديل ${data.poleId} من ${data.oldIntensity.toFixed(0)}% إلى ${data.newIntensity.toFixed(0)}%`,
                    source: 'illuminance',
                    data
                });
            }
        });
    }
    
    initFilters() {
        const buttons = document.querySelectorAll('.alerts-filters .filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filters.current = btn.dataset.filter;
                this.renderAlerts();
            });
        });
    }
    
    generateInitialAlerts() {
        const initialAlerts = [
            {
                type: 'info',
                title: 'بدء تشغيل النظام',
                description: 'تم تهيئة جميع الوحدات بنجاح',
                source: 'system'
            },
            {
                type: 'info',
                title: 'اتصال الكاميرات',
                description: 'جميع الكاميرات متصلة وتعمل بشكل طبيعي',
                source: 'cameras'
            },
            {
                type: 'info',
                title: 'معايرة التحليل الطيفي',
                description: 'تمت معايرة وحدة التحليل الطيفي',
                source: 'hyperspectral'
            }
        ];
        
        initialAlerts.forEach(alert => {
            this.addAlert(alert, false);
        });
    }
    
    addAlert(alertData, showToast = true) {
        const alert = {
            id: ShaheenUtils.generateId(),
            type: alertData.type || 'info',
            title: alertData.title,
            description: alertData.description,
            source: alertData.source || 'system',
            timestamp: Date.now(),
            read: false,
            data: alertData.data || null
        };
        
        this.alerts.unshift(alert);
        
        // Trim alerts if too many
        if (this.alerts.length > this.maxAlerts) {
            this.alerts = this.alerts.slice(0, this.maxAlerts);
        }
        
        // Update UI
        this.renderAlerts();
        this.updateAlertBadge();
        
        // Show toast notification
        if (showToast) {
            this.showToast(alert);
        }
        
        return alert;
    }
    
    showToast(alert) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const icons = {
            critical: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            success: 'fa-check-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${alert.type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[alert.type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${alert.title}</div>
                <div class="toast-message">${alert.description}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    renderAlerts() {
        const container = document.getElementById('alertsList');
        if (!container) return;
        
        let filteredAlerts = this.alerts;
        
        if (this.filters.current !== 'all') {
            filteredAlerts = this.alerts.filter(a => a.type === this.filters.current);
        }
        
        if (filteredAlerts.length === 0) {
            container.innerHTML = `
                <div class="no-alerts" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-bell-slash" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>لا توجد تنبيهات</p>
                </div>
            `;
            return;
        }
        
        const icons = {
            critical: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            success: 'fa-check-circle'
        };
        
        const sourceNames = {
            system: 'النظام',
            hyperspectral: 'التحليل الطيفي',
            illuminance: 'الإضاءة',
            wargaming: 'المحاكاة',
            audio: 'الصوت',
            cameras: 'الكاميرات'
        };
        
        container.innerHTML = filteredAlerts.map(alert => `
            <div class="alert-item ${alert.type} ${alert.read ? 'read' : ''}" data-alert-id="${alert.id}">
                <div class="alert-icon">
                    <i class="fas ${icons[alert.type]}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-desc">${alert.description}</div>
                    <div class="alert-meta">
                        <span><i class="fas fa-clock"></i> ${ShaheenUtils.formatTime(new Date(alert.timestamp))}</span>
                        <span><i class="fas fa-tag"></i> ${sourceNames[alert.source] || alert.source}</span>
                    </div>
                </div>
                <div class="alert-actions">
                    <button class="alert-action-btn" onclick="alertsManager.markAsRead('${alert.id}')">
                        <i class="fas fa-check"></i> تم
                    </button>
                    <button class="alert-action-btn" onclick="alertsManager.dismissAlert('${alert.id}')">
                        <i class="fas fa-times"></i> حذف
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    markAsRead(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.read = true;
            this.renderAlerts();
            this.updateAlertBadge();
        }
    }
    
    dismissAlert(alertId) {
        this.alerts = this.alerts.filter(a => a.id !== alertId);
        this.renderAlerts();
        this.updateAlertBadge();
    }
    
    updateAlertBadge() {
        const badge = document.getElementById('alertCount');
        if (badge) {
            const unreadCount = this.alerts.filter(a => !a.read).length;
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }
    
    getUnreadCount() {
        return this.alerts.filter(a => !a.read).length;
    }
    
    clearAll() {
        this.alerts = [];
        this.renderAlerts();
        this.updateAlertBadge();
    }
    
    markAllAsRead() {
        this.alerts.forEach(a => a.read = true);
        this.renderAlerts();
        this.updateAlertBadge();
    }
}

// Export & Global instance
window.AlertsManager = AlertsManager;
