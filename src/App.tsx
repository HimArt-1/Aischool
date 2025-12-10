/**
 * تطبيق SCAR-EYE الرئيسي
 * Main Application Component
 */

import React, { useState, useEffect } from 'react';
import {
  WargameDashboard,
  createSimulation,
  MODULE_INFO,
  type SimulationEngine,
} from './AdversarialWargameModule';

function App() {
  const [engine, setEngine] = useState<SimulationEngine | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    // إنشاء محرك المحاكاة
    const simulation = createSimulation({
      totalRounds: 200,
      speedMultiplier: 1,
      enableVisualization: true,
      mapConfig: {
        width: 1000,
        height: 800,
        gridSize: 50,
        buildings: [],
        roads: [],
        hideSpots: [],
        cameras: [],
        ambientLight: 50,
      },
    });

    setEngine(simulation);
  }, []);

  if (!engine) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner} />
        <div style={styles.loadingText}>جاري تحميل المحاكاة...</div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* شاشة الترحيب */}
      {showInfo && (
        <div style={styles.infoOverlay} onClick={() => setShowInfo(false)}>
          <div style={styles.infoBox} onClick={(e) => e.stopPropagation()}>
            <h1 style={styles.infoTitle}>
              {MODULE_INFO.name}
            </h1>
            <p style={styles.infoDescription}>{MODULE_INFO.description}</p>
            
            <div style={styles.infoSection}>
              <h3 style={styles.infoSectionTitle}>المكونات الرئيسية:</h3>
              <ul style={styles.infoList}>
                <li>🗺️ <strong>DigitalTwinMap</strong> - خريطة التوأم الرقمي مع طبقات طيفية</li>
                <li>🔴 <strong>Red-AI</strong> - ذكاء اصطناعي مهاجم يحاول الإخفاء</li>
                <li>🔵 <strong>Blue-AI (SCAR-EYE)</strong> - نظام دفاعي ذكي للكشف</li>
                <li>⚙️ <strong>SimulationEngine</strong> - محرك المحاكاة (200 جولة)</li>
                <li>📊 <strong>WargameDashboard</strong> - واجهة عرض تفاعلية</li>
              </ul>
            </div>

            <div style={styles.infoSection}>
              <h3 style={styles.warningTitle}>⚠️ ملاحظات هامة:</h3>
              <ul style={styles.warningList}>
                {MODULE_INFO.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>

            <div style={styles.infoSection}>
              <h3 style={styles.infoSectionTitle}>كيفية الاستخدام:</h3>
              <ol style={styles.infoList}>
                <li>اضغط على زر <strong>"▶️ تشغيل"</strong> لبدء المحاكاة</li>
                <li>شاهد المعركة بين Red-AI و Blue-AI على الخريطة</li>
                <li>تابع الإحصائيات ومعدل الكشف في اللوحة الجانبية</li>
                <li>استخدم <strong>"⏸️ إيقاف"</strong> للإيقاف المؤقت</li>
                <li>اضغط <strong>"🔄 إعادة تعيين"</strong> لبدء محاكاة جديدة</li>
              </ol>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              style={styles.startButton}
            >
              🚀 ابدأ المحاكاة
            </button>

            <div style={styles.infoFooter}>
              النسخة {MODULE_INFO.version} | للاستخدام التعليمي فقط
            </div>
          </div>
        </div>
      )}

      {/* لوحة المحاكاة الرئيسية */}
      <WargameDashboard engine={engine} autoPlay={false} />

      {/* زر إعادة فتح المعلومات */}
      <button
        onClick={() => setShowInfo(true)}
        style={styles.infoButton}
        title="عرض المعلومات"
      >
        ℹ️
      </button>
    </div>
  );
}

// الأنماط
const styles: Record<string, React.CSSProperties> = {
  app: {
    width: '100%',
    minHeight: '100vh',
    position: 'relative',
  },
  loading: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
  },
  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '5px solid rgba(255, 255, 255, 0.1)',
    borderTop: '5px solid #00ff88',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '1.2rem',
    color: '#ffffff',
  },
  infoOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(10px)',
  },
  infoBox: {
    background: 'linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '2px solid rgba(0, 255, 136, 0.3)',
    color: '#ffffff',
  },
  infoTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    background: 'linear-gradient(90deg, #00ff88, #00ccff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: '1.2rem',
    color: '#8899aa',
    textAlign: 'center',
    marginBottom: '30px',
    direction: 'rtl',
  },
  infoSection: {
    marginBottom: '25px',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
  },
  infoSectionTitle: {
    fontSize: '1.3rem',
    color: '#00ff88',
    marginBottom: '15px',
  },
  warningTitle: {
    fontSize: '1.3rem',
    color: '#ff8800',
    marginBottom: '15px',
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  warningList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    color: '#ffaa66',
  },
  startButton: {
    width: '100%',
    padding: '15px',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #00ff88, #00cc66)',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'transform 0.2s ease',
  },
  infoFooter: {
    marginTop: '20px',
    textAlign: 'center',
    color: '#6677888',
    fontSize: '0.9rem',
  },
  infoButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ff88, #00cc66)',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.4)',
    zIndex: 999,
    transition: 'transform 0.2s ease',
  },
};

// إضافة CSS للتحريك
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: scale(1.05);
  }
  
  li {
    margin-bottom: 10px;
    line-height: 1.6;
  }
`;
document.head.appendChild(styleSheet);

export default App;
