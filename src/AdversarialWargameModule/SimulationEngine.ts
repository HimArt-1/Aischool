/**
 * Simulation Engine - محرك المحاكاة
 * يدير الجولات بين Red-AI و Blue-AI ويحفظ النتائج
 */

import { DigitalTwinMap } from './DigitalTwinMap';
import { RedAI } from './RedAI';
import { BlueAI } from './BlueAI';
import type {
  RoundResult,
  SimulationStats,
  SimulationConfig,
  Position,
} from './types';

type SimulationState = 'idle' | 'running' | 'paused' | 'completed';

export class SimulationEngine {
  private map: DigitalTwinMap;
  private redAI: RedAI;
  private blueAI: BlueAI;
  private config: SimulationConfig;
  private state: SimulationState;
  private currentRound: number;
  private results: RoundResult[];
  private startTime: number;
  private listeners: Map<string, Set<Function>>;

  constructor(config?: Partial<SimulationConfig>) {
    this.config = this.initializeConfig(config);
    this.map = new DigitalTwinMap(this.config.mapConfig);
    this.redAI = new RedAI(this.map);
    this.blueAI = new BlueAI(this.map);
    this.state = 'idle';
    this.currentRound = 0;
    this.results = [];
    this.startTime = 0;
    this.listeners = new Map();
  }

  /**
   * تهيئة التكوين
   */
  private initializeConfig(config?: Partial<SimulationConfig>): SimulationConfig {
    return {
      totalRounds: config?.totalRounds || 200,
      speedMultiplier: config?.speedMultiplier || 1,
      enableVisualization: config?.enableVisualization ?? true,
      mapConfig: config?.mapConfig || {
        width: 1000,
        height: 800,
        gridSize: 50,
        buildings: [],
        roads: [],
        hideSpots: [],
        cameras: [],
        ambientLight: 50,
      },
    };
  }

  /**
   * بدء المحاكاة
   */
  public start(): void {
    if (this.state === 'running') {
      console.warn('المحاكاة تعمل بالفعل');
      return;
    }

    this.state = 'running';
    this.startTime = Date.now();
    this.emit('simulationStarted', {
      totalRounds: this.config.totalRounds,
    });

    console.log(`🎯 بدء محاكاة SCAR-EYE - ${this.config.totalRounds} جولة`);
  }

  /**
   * إيقاف مؤقت
   */
  public pause(): void {
    if (this.state === 'running') {
      this.state = 'paused';
      this.emit('simulationPaused', { currentRound: this.currentRound });
      console.log('⏸️ إيقاف مؤقت للمحاكاة');
    }
  }

  /**
   * استئناف
   */
  public resume(): void {
    if (this.state === 'paused') {
      this.state = 'running';
      this.emit('simulationResumed', { currentRound: this.currentRound });
      console.log('▶️ استئناف المحاكاة');
    }
  }

  /**
   * إعادة تعيين
   */
  public reset(): void {
    this.state = 'idle';
    this.currentRound = 0;
    this.results = [];
    
    // إعادة تهيئة الوكلاء
    this.map = new DigitalTwinMap(this.config.mapConfig);
    this.redAI = new RedAI(this.map);
    this.blueAI = new BlueAI(this.map);
    
    this.emit('simulationReset', {});
    console.log('🔄 إعادة تعيين المحاكاة');
  }

  /**
   * تنفيذ جولة واحدة
   */
  public async executeRound(): Promise<RoundResult> {
    if (this.state !== 'running') {
      throw new Error('المحاكاة ليست في وضع التشغيل');
    }

    this.currentRound++;

    // Red-AI ينفذ محاولة إخفاء
    const redAIMove = this.redAI.executeHidingAttempt(this.currentRound);

    // Blue-AI يحاول الكشف
    const blueAIMove = this.blueAI.attemptDetection(redAIMove, this.currentRound);

    // حساب النتيجة الفعلية
    const actualDetection = this.evaluateDetection(
      redAIMove.hideLocation,
      blueAIMove.predictedLocation,
      blueAIMove.confidence
    );

    // حساب خطأ المسافة
    const distanceError = this.calculateDistance(
      redAIMove.hideLocation,
      blueAIMove.predictedLocation
    );

    const result: RoundResult = {
      roundNumber: this.currentRound,
      timestamp: Date.now(),
      redAI: redAIMove,
      blueAI: blueAIMove,
      actualDetection,
      distanceError,
    };

    // حفظ النتيجة
    this.results.push(result);

    // تعلم الوكلاء من النتائج
    this.redAI.learn(actualDetection, redAIMove.strategyUsed);
    this.blueAI.learn(redAIMove.hideLocation, blueAIMove.predictedLocation, actualDetection);

    // إشعار المستمعين
    this.emit('roundCompleted', result);

    // التحقق من انتهاء المحاكاة
    if (this.currentRound >= this.config.totalRounds) {
      this.complete();
    }

    return result;
  }

  /**
   * تقييم نجاح الكشف
   */
  private evaluateDetection(
    actualLocation: Position,
    predictedLocation: Position,
    confidence: number
  ): boolean {
    const distance = this.calculateDistance(actualLocation, predictedLocation);
    
    // الكشف ناجح إذا كانت المسافة قريبة والثقة عالية
    const detectionThreshold = 150; // بكسل
    const confidenceThreshold = 0.5;

    if (distance < detectionThreshold && confidence > confidenceThreshold) {
      return true;
    }

    // احتمال كشف بناءً على المسافة والثقة
    const detectionProbability = 
      (1 - Math.min(distance / 300, 1)) * confidence;

    return Math.random() < detectionProbability;
  }

  /**
   * حساب المسافة بين موقعين
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    );
  }

  /**
   * إكمال المحاكاة
   */
  private complete(): void {
    this.state = 'completed';
    
    const stats = this.getStats();
    const duration = Date.now() - this.startTime;
    
    this.emit('simulationCompleted', {
      stats,
      duration,
    });

    console.log('✅ اكتملت المحاكاة');
    console.log(`📊 معدل الكشف: ${(stats.detectionRate * 100).toFixed(1)}%`);
    console.log(`🎯 متوسط خطأ المسافة: ${stats.averageDistanceError.toFixed(1)} بكسل`);
    console.log(`⏱️ المدة: ${(duration / 1000).toFixed(1)} ثانية`);
  }

  /**
   * تشغيل تلقائي للمحاكاة الكاملة
   */
  public async runAutomatic(
    onProgress?: (round: number, total: number) => void
  ): Promise<SimulationStats> {
    this.start();

    while (this.currentRound < this.config.totalRounds) {
      await this.executeRound();
      
      if (onProgress) {
        onProgress(this.currentRound, this.config.totalRounds);
      }

      // تأخير بناءً على السرعة
      const delay = Math.max(10, 100 / this.config.speedMultiplier);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return this.getStats();
  }

  /**
   * الحصول على الإحصائيات
   */
  public getStats(): SimulationStats {
    if (this.results.length === 0) {
      return {
        totalRounds: 0,
        detectionRate: 0,
        averageConfidence: 0,
        averageDistanceError: 0,
        redAIWins: 0,
        blueAIWins: 0,
        confidenceTrend: [],
      };
    }

    const detections = this.results.filter(r => r.actualDetection).length;
    const detectionRate = detections / this.results.length;

    const totalConfidence = this.results.reduce(
      (sum, r) => sum + r.blueAI.confidence,
      0
    );
    const averageConfidence = totalConfidence / this.results.length;

    const totalDistanceError = this.results.reduce(
      (sum, r) => sum + r.distanceError,
      0
    );
    const averageDistanceError = totalDistanceError / this.results.length;

    const blueAIWins = detections;
    const redAIWins = this.results.length - detections;

    // اتجاه الثقة (كل 10 جولات)
    const confidenceTrend: number[] = [];
    for (let i = 0; i < this.results.length; i += 10) {
      const batch = this.results.slice(i, i + 10);
      const avgConfidence =
        batch.reduce((sum, r) => sum + r.blueAI.confidence, 0) / batch.length;
      confidenceTrend.push(avgConfidence);
    }

    return {
      totalRounds: this.results.length,
      detectionRate,
      averageConfidence,
      averageDistanceError,
      redAIWins,
      blueAIWins,
      confidenceTrend,
    };
  }

  /**
   * نظام الأحداث
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`خطأ في معالج الحدث ${event}:`, error);
        }
      });
    }
  }

  // Getters
  public getMap(): DigitalTwinMap {
    return this.map;
  }

  public getRedAI(): RedAI {
    return this.redAI;
  }

  public getBlueAI(): BlueAI {
    return this.blueAI;
  }

  public getState(): SimulationState {
    return this.state;
  }

  public getCurrentRound(): number {
    return this.currentRound;
  }

  public getResults(): RoundResult[] {
    return [...this.results];
  }

  public getConfig(): SimulationConfig {
    return this.config;
  }

  public getLatestResult(): RoundResult | null {
    return this.results.length > 0 ? this.results[this.results.length - 1] : null;
  }

  /**
   * تصدير النتائج
   */
  public exportResults(): string {
    const data = {
      config: this.config,
      stats: this.getStats(),
      results: this.results,
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }
}
