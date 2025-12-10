/**
 * Wargame Dashboard - واجهة العرض التفاعلية
 * عرض مذهل للمحاكاة مع خريطة حية وإحصائيات
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimulationEngine } from './SimulationEngine';
import type { RoundResult, SimulationStats, MapObject, Position } from './types';

interface WargameDashboardProps {
  engine: SimulationEngine;
  autoPlay?: boolean;
}

export const WargameDashboard: React.FC<WargameDashboardProps> = ({
  engine,
  autoPlay = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [latestResult, setLatestResult] = useState<RoundResult | null>(null);
  const [stats, setStats] = useState<SimulationStats | null>(null);
  const animationFrameRef = useRef<number>();

  /**
   * رسم الخريطة والعناصر
   */
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const map = engine.getMap();
    const config = map.getConfig();

    // مسح الشاشة
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم الشبكة
    drawGrid(ctx, config.width, config.height, config.gridSize);

    // رسم الطرق
    const roads = map.getRoads();
    roads.forEach(road => {
      ctx.fillStyle = '#1a1f3a';
      ctx.fillRect(road.position.x, road.position.y, road.width, road.height);
    });

    // رسم المباني
    const buildings = map.getBuildings();
    buildings.forEach(building => {
      ctx.fillStyle = '#2a2f4a';
      ctx.strokeStyle = '#3a4f6a';
      ctx.lineWidth = 2;
      ctx.fillRect(
        building.position.x,
        building.position.y,
        building.width,
        building.height
      );
      ctx.strokeRect(
        building.position.x,
        building.position.y,
        building.width,
        building.height
      );
    });

    // رسم نقاط الإخفاء
    const hideSpots = map.getHideSpots();
    hideSpots.forEach(spot => {
      ctx.fillStyle = 'rgba(255, 200, 100, 0.2)';
      ctx.beginPath();
      ctx.arc(
        spot.position.x + spot.width / 2,
        spot.position.y + spot.height / 2,
        spot.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // رسم الكاميرات
    const cameras = map.getCameras();
    cameras.forEach(camera => {
      // الكاميرا
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(
        camera.position.x + camera.width / 2,
        camera.position.y + camera.height / 2,
        camera.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // مدى الرؤية
      const range = camera.properties?.range || 150;
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        camera.position.x + camera.width / 2,
        camera.position.y + camera.height / 2,
        range,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });

    // رسم آخر محاولة إذا وجدت
    if (latestResult) {
      drawLatestAttempt(ctx, latestResult);
    }
  }, [engine, latestResult]);

  /**
   * رسم الشبكة
   */
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    gridSize: number
  ) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  /**
   * رسم آخر محاولة
   */
  const drawLatestAttempt = (ctx: CanvasRenderingContext2D, result: RoundResult) => {
    // رسم مسار Red-AI
    const path = result.redAI.path;
    if (path.length > 1) {
      ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // نقاط المسار
      path.forEach((pos, i) => {
        ctx.fillStyle = i === path.length - 1 ? '#ff3333' : 'rgba(255, 50, 50, 0.6)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, i === path.length - 1 ? 10 : 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // موقع الإخفاء الفعلي (Red-AI)
    const hideLocation = result.redAI.hideLocation;
    ctx.fillStyle = result.actualDetection ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 100, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(hideLocation.x, hideLocation.y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // حلقة خارجية نابضة
    ctx.strokeStyle = result.actualDetection ? '#ff0000' : '#ff6600';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hideLocation.x, hideLocation.y, 20 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
    ctx.stroke();

    // الموقع المتوقع (Blue-AI)
    const predictedLocation = result.blueAI.predictedLocation;
    ctx.fillStyle = result.actualDetection
      ? 'rgba(0, 255, 136, 0.8)'
      : 'rgba(100, 150, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(predictedLocation.x, predictedLocation.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // خط يربط بين الموقع الفعلي والمتوقع
    ctx.strokeStyle = result.actualDetection
      ? 'rgba(0, 255, 136, 0.5)'
      : 'rgba(255, 255, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(hideLocation.x, hideLocation.y);
    ctx.lineTo(predictedLocation.x, predictedLocation.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // عرض المسافة
    const distance = Math.sqrt(
      Math.pow(hideLocation.x - predictedLocation.x, 2) +
        Math.pow(hideLocation.y - predictedLocation.y, 2)
    );
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(
      `${distance.toFixed(0)}px`,
      (hideLocation.x + predictedLocation.x) / 2,
      (hideLocation.y + predictedLocation.y) / 2 - 10
    );
  };

  /**
   * تشغيل/إيقاف المحاكاة
   */
  const togglePlayPause = () => {
    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      if (engine.getState() === 'idle') {
        engine.start();
      } else if (engine.getState() === 'paused') {
        engine.resume();
      }
      setIsPlaying(true);
      runSimulation();
    }
  };

  /**
   * تشغيل المحاكاة
   */
  const runSimulation = async () => {
    const executeNext = async () => {
      if (engine.getState() !== 'running') {
        setIsPlaying(false);
        return;
      }

      try {
        const result = await engine.executeRound();
        setCurrentRound(result.roundNumber);
        setLatestResult(result);
        setStats(engine.getStats());

        if (engine.getState() === 'running') {
          setTimeout(executeNext, 50); // 50ms delay between rounds
        } else {
          setIsPlaying(false);
        }
      } catch (error) {
        console.error('خطأ في تنفيذ الجولة:', error);
        setIsPlaying(false);
      }
    };

    executeNext();
  };

  /**
   * إعادة تعيين
   */
  const handleReset = () => {
    engine.reset();
    setCurrentRound(0);
    setLatestResult(null);
    setStats(null);
    setIsPlaying(false);
  };

  /**
   * حلقة الرسم
   */
  useEffect(() => {
    const animate = () => {
      drawMap();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawMap]);

  /**
   * تشغيل تلقائي
   */
  useEffect(() => {
    if (autoPlay && !isPlaying) {
      togglePlayPause();
    }
  }, [autoPlay]);

  /**
   * الاستماع لأحداث المحرك
   */
  useEffect(() => {
    const handleSimulationCompleted = () => {
      setIsPlaying(false);
      setStats(engine.getStats());
    };

    engine.on('simulationCompleted', handleSimulationCompleted);

    return () => {
      engine.off('simulationCompleted', handleSimulationCompleted);
    };
  }, [engine]);

  return (
    <div style={styles.container}>
      {/* العنوان */}
      <header style={styles.header}>
        <h1 style={styles.title}>
          🎯 SCAR-EYE Adversarial Wargame Simulation
        </h1>
        <div style={styles.subtitle}>
          محاكاة تفاعلية لصراع AI ضد AI | Red-AI vs Blue-AI (SCAR-EYE)
        </div>
      </header>

      <div style={styles.mainContent}>
        {/* الخريطة */}
        <div style={styles.mapContainer}>
          <canvas
            ref={canvasRef}
            width={1000}
            height={800}
            style={styles.canvas}
          />
          
          {/* أزرار التحكم */}
          <div style={styles.controls}>
            <button
              onClick={togglePlayPause}
              style={{
                ...styles.button,
                ...(isPlaying ? styles.pauseButton : styles.playButton),
              }}
            >
              {isPlaying ? '⏸️ إيقاف' : '▶️ تشغيل'}
            </button>
            <button onClick={handleReset} style={styles.button}>
              🔄 إعادة تعيين
            </button>
          </div>

          {/* معلومات الجولة الحالية */}
          <div style={styles.roundInfo}>
            <div style={styles.roundNumber}>
              الجولة: {currentRound} / {engine.getConfig().totalRounds}
            </div>
            {latestResult && (
              <div style={styles.roundStatus}>
                {latestResult.actualDetection ? (
                  <span style={styles.detected}>✓ تم الكشف</span>
                ) : (
                  <span style={styles.notDetected}>✗ لم يتم الكشف</span>
                )}
                <span style={styles.confidence}>
                  ثقة: {(latestResult.blueAI.confidence * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* اللوحة الجانبية */}
        <div style={styles.sidebar}>
          {/* الإحصائيات */}
          {stats && (
            <div style={styles.statsContainer}>
              <h2 style={styles.sectionTitle}>📊 الإحصائيات</h2>
              
              <div style={styles.statCard}>
                <div style={styles.statLabel}>معدل الكشف</div>
                <div style={styles.statValue}>
                  {(stats.detectionRate * 100).toFixed(1)}%
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${stats.detectionRate * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>متوسط الثقة</div>
                <div style={styles.statValue}>
                  {(stats.averageConfidence * 100).toFixed(1)}%
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>متوسط خطأ المسافة</div>
                <div style={styles.statValue}>
                  {stats.averageDistanceError.toFixed(0)} بكسل
                </div>
              </div>

              <div style={styles.scoreBoard}>
                <div style={styles.scoreItem}>
                  <div style={styles.scoreLabel}>🔴 Red-AI</div>
                  <div style={styles.scoreValue}>{stats.redAIWins}</div>
                </div>
                <div style={styles.scoreItem}>
                  <div style={styles.scoreLabel}>🔵 Blue-AI</div>
                  <div style={styles.scoreValue}>{stats.blueAIWins}</div>
                </div>
              </div>

              {/* اتجاه الثقة */}
              {stats.confidenceTrend.length > 0 && (
                <div style={styles.trendContainer}>
                  <div style={styles.trendTitle}>اتجاه الثقة</div>
                  <div style={styles.trendChart}>
                    {stats.confidenceTrend.map((value, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.trendBar,
                          height: `${value * 100}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* معلومات آخر جولة */}
          {latestResult && (
            <div style={styles.detailsContainer}>
              <h2 style={styles.sectionTitle}>🔍 تفاصيل آخر جولة</h2>
              
              <div style={styles.detailCard}>
                <div style={styles.detailLabel}>استراتيجية Red-AI:</div>
                <div style={styles.detailValue}>
                  {latestResult.redAI.strategyUsed}
                </div>
              </div>

              <div style={styles.detailCard}>
                <div style={styles.detailLabel}>تحليل Blue-AI:</div>
                <div style={styles.detailReasoning}>
                  {latestResult.blueAI.reasoning}
                </div>
              </div>

              <div style={styles.detailCard}>
                <div style={styles.detailLabel}>خطأ المسافة:</div>
                <div style={styles.detailValue}>
                  {latestResult.distanceError.toFixed(0)} بكسل
                </div>
              </div>

              <div style={styles.detailCard}>
                <div style={styles.detailLabel}>تعديل الإضاءة:</div>
                <div style={styles.detailValue}>
                  +{latestResult.blueAI.illuminanceAdjustment.toFixed(1)}
                </div>
              </div>
            </div>
          )}

          {/* المفتاح */}
          <div style={styles.legend}>
            <h3 style={styles.legendTitle}>المفتاح</h3>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: '#ff3333' }} />
              <span>موقع Red-AI الفعلي</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: '#00ff88' }} />
              <span>توقع Blue-AI</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: '#3a4f6a' }} />
              <span>مباني</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: '#00ff88' }} />
              <span>كاميرات</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// الأنماط
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
    color: '#ffffff',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    background: 'linear-gradient(90deg, #00ff88, #00ccff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#8899aa',
    direction: 'rtl',
  },
  mainContent: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  mapContainer: {
    flex: '1 1 1000px',
    position: 'relative',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  canvas: {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  controls: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    justifyContent: 'center',
  },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    background: 'linear-gradient(135deg, #00ff88, #00cc66)',
    color: '#000',
  },
  pauseButton: {
    background: 'linear-gradient(135deg, #ff8800, #ff6600)',
    color: '#fff',
  },
  roundInfo: {
    marginTop: '15px',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    textAlign: 'center',
  },
  roundNumber: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  roundStatus: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    fontSize: '1.1rem',
  },
  detected: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  notDetected: {
    color: '#ff6600',
    fontWeight: 'bold',
  },
  confidence: {
    color: '#00ccff',
  },
  sidebar: {
    flex: '1 1 400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statsContainer: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '15px',
    color: '#00ff88',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#8899aa',
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#00ff88',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    marginTop: '10px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00ff88, #00ccff)',
    transition: 'width 0.3s ease',
  },
  scoreBoard: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
  scoreItem: {
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: '1rem',
    marginBottom: '5px',
  },
  scoreValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#00ccff',
  },
  trendContainer: {
    marginTop: '20px',
  },
  trendTitle: {
    fontSize: '1rem',
    marginBottom: '10px',
    color: '#8899aa',
  },
  trendChart: {
    display: 'flex',
    alignItems: 'flex-end',
    height: '100px',
    gap: '3px',
  },
  trendBar: {
    flex: 1,
    background: 'linear-gradient(180deg, #00ff88, #00cc66)',
    borderRadius: '3px 3px 0 0',
    minHeight: '5px',
  },
  detailsContainer: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  detailCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  detailLabel: {
    fontSize: '0.85rem',
    color: '#8899aa',
    marginBottom: '5px',
  },
  detailValue: {
    fontSize: '1.1rem',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  detailReasoning: {
    fontSize: '0.9rem',
    color: '#ccddee',
    lineHeight: '1.5',
    direction: 'rtl',
  },
  legend: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  legendTitle: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    color: '#00ff88',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    fontSize: '0.95rem',
  },
  legendDot: {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    display: 'inline-block',
  },
};
