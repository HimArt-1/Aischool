/**
 * Blue-AI Agent (SCAR-EYE) - الذكاء الاصطناعي الدفاعي
 * نظام كشف متقدم يستخدم تحليل طيفي وتعلم آلي لكشف التهديدات
 */

import type { DigitalTwinMap } from './DigitalTwinMap';
import type { BlueAIOutput, Position, RedAIOutput } from './types';

interface PatternMemory {
  location: Position;
  spectralProfile: number[];
  detectedSuccessfully: boolean;
}

export class BlueAI {
  private map: DigitalTwinMap;
  private patternMemory: PatternMemory[];
  private suspicionThreshold: number;
  private learningRate: number;
  private baselineSpectralProfiles: Map<string, number[]>;

  constructor(map: DigitalTwinMap) {
    this.map = map;
    this.patternMemory = [];
    this.suspicionThreshold = 0.5;
    this.learningRate = 0.03;
    this.baselineSpectralProfiles = new Map();
    
    this.establishBaseline();
  }

  /**
   * إنشاء خط أساس للبصمات الطيفية الطبيعية
   */
  private establishBaseline(): void {
    const mapConfig = this.map.getConfig();
    const samplePoints = 50;
    
    const bands = ['visible', 'infrared', 'thermal', 'hyperspectral'];
    
    bands.forEach(band => {
      const profiles: number[][] = [];
      
      for (let i = 0; i < samplePoints; i++) {
        const pos: Position = {
          x: Math.random() * mapConfig.width,
          y: Math.random() * mapConfig.height,
        };
        
        const signature = this.map.getSpectralSignature(band, pos);
        if (signature) {
          profiles.push(signature.intensity);
        }
      }
      
      // حساب المتوسط
      if (profiles.length > 0) {
        const avgProfile = profiles[0].map((_, i) => {
          const sum = profiles.reduce((acc, p) => acc + (p[i] || 0), 0);
          return sum / profiles.length;
        });
        
        this.baselineSpectralProfiles.set(band, avgProfile);
      }
    });
  }

  /**
   * محاولة كشف التهديد
   */
  public attemptDetection(redAIMove: RedAIOutput, roundNumber: number): BlueAIOutput {
    // تحليل طيفي شامل
    const spectralAnalysis = this.performSpectralAnalysis();
    
    // التنبؤ بالمواقع المحتملة
    const predictedLocation = this.predictHidingLocation(spectralAnalysis, roundNumber);
    
    // حساب مسافة الخطأ
    const distance = this.calculateDistance(predictedLocation, redAIMove.hideLocation);
    
    // حساب الثقة بناءً على عدة عوامل
    const confidence = this.calculateDetectionConfidence(
      spectralAnalysis,
      predictedLocation,
      distance
    );
    
    // قرار الكشف
    const detected = this.makeDetectionDecision(confidence, spectralAnalysis.anomalyScore);
    
    // تعديل الإضاءة في المناطق المشبوهة
    const illuminanceAdjustment = this.adjustIlluminance(spectralAnalysis.suspiciousRegions);
    
    // توليد التفسير
    const reasoning = this.generateReasoning(
      spectralAnalysis,
      predictedLocation,
      confidence,
      detected
    );

    const output: BlueAIOutput = {
      detected,
      confidence,
      predictedLocation,
      reasoning,
      illuminanceAdjustment,
      spectralAnalysis,
    };

    // حفظ في الذاكرة للتعلم
    this.storePattern({
      location: redAIMove.hideLocation,
      spectralProfile: this.extractSpectralProfile(redAIMove.hideLocation),
      detectedSuccessfully: detected,
    });

    return output;
  }

  /**
   * تحليل طيفي شامل للخريطة
   */
  private performSpectralAnalysis(): {
    anomalyScore: number;
    suspiciousRegions: Position[];
  } {
    const mapConfig = this.map.getConfig();
    const suspiciousRegions: Position[] = [];
    let totalAnomalyScore = 0;
    const sampleCount = 100;

    for (let i = 0; i < sampleCount; i++) {
      const pos: Position = {
        x: Math.random() * mapConfig.width,
        y: Math.random() * mapConfig.height,
      };

      const anomalyScore = this.detectSpectralAnomaly(pos);
      totalAnomalyScore += anomalyScore;

      if (anomalyScore > this.suspicionThreshold) {
        suspiciousRegions.push(pos);
      }
    }

    return {
      anomalyScore: totalAnomalyScore / sampleCount,
      suspiciousRegions,
    };
  }

  /**
   * كشف الشذوذ الطيفي في موقع معين
   */
  private detectSpectralAnomaly(position: Position): number {
    let anomalyScore = 0;
    const bands = ['visible', 'infrared', 'hyperspectral'];

    for (const band of bands) {
      const signature = this.map.getSpectralSignature(band, position);
      const baseline = this.baselineSpectralProfiles.get(band);

      if (signature && baseline) {
        // حساب الانحراف عن الخط الأساسي
        let deviation = 0;
        for (let i = 0; i < Math.min(signature.intensity.length, baseline.length); i++) {
          deviation += Math.abs(signature.intensity[i] - baseline[i]);
        }
        deviation /= Math.min(signature.intensity.length, baseline.length);
        
        anomalyScore += deviation;
      }
    }

    // تحليل الإضاءة
    const illuminance = this.map.getIlluminance(position);
    if (illuminance < 30) {
      // المناطق المظلمة مشبوهة
      anomalyScore += (30 - illuminance) / 30 * 0.3;
    }

    // التحقق من رؤية الكاميرات
    const cameras = this.map.getCameras();
    let visibleFromCameras = 0;
    for (const camera of cameras) {
      if (this.map.isVisibleFromCamera(position, camera.id)) {
        visibleFromCameras++;
      }
    }
    
    // المناطق غير المرئية للكاميرات مشبوهة
    if (visibleFromCameras === 0) {
      anomalyScore += 0.2;
    }

    return Math.min(1, anomalyScore / bands.length);
  }

  /**
   * التنبؤ بموقع الإخفاء
   */
  private predictHidingLocation(
    spectralAnalysis: { anomalyScore: number; suspiciousRegions: Position[] },
    roundNumber: number
  ): Position {
    // استخدام الذاكرة السابقة
    if (this.patternMemory.length > 5) {
      const recentSuccesses = this.patternMemory
        .slice(-20)
        .filter(p => p.detectedSuccessfully);
      
      if (recentSuccesses.length > 0) {
        // حساب مركز الثقل للنجاحات السابقة
        const centroid = this.calculateCentroid(
          recentSuccesses.map(p => p.location)
        );
        
        // استخدام المركز مع تعديل بناءً على المناطق المشبوهة
        if (spectralAnalysis.suspiciousRegions.length > 0) {
          const closestSuspicious = this.findClosest(
            centroid,
            spectralAnalysis.suspiciousRegions
          );
          
          return {
            x: (centroid.x + closestSuspicious.x) / 2,
            y: (centroid.y + closestSuspicious.y) / 2,
          };
        }
        
        return centroid;
      }
    }

    // إذا لم توجد ذاكرة كافية، استخدم المناطق المشبوهة
    if (spectralAnalysis.suspiciousRegions.length > 0) {
      // اختيار أكثر منطقة مشبوهة
      const scored = spectralAnalysis.suspiciousRegions.map(pos => ({
        pos,
        score: this.detectSpectralAnomaly(pos),
      }));
      
      scored.sort((a, b) => b.score - a.score);
      
      return scored[0].pos;
    }

    // استراتيجية افتراضية: المناطق المظلمة
    return this.findDarkestAccessibleZone();
  }

  /**
   * إيجاد أحلك منطقة قابلة للوصول
   */
  private findDarkestAccessibleZone(): Position {
    const mapConfig = this.map.getConfig();
    const illuminanceMap = this.map.getIlluminanceMap();
    
    let darkest = {
      x: mapConfig.width / 2,
      y: mapConfig.height / 2,
      illuminance: 100,
    };
    
    const gridSize = mapConfig.gridSize;
    
    for (let y = 0; y < illuminanceMap.length; y++) {
      for (let x = 0; x < illuminanceMap[y].length; x++) {
        const pos = {
          x: x * gridSize + gridSize / 2,
          y: y * gridSize + gridSize / 2,
        };
        
        // التحقق من إمكانية الوصول (ليس داخل مبنى)
        if (!this.isInsideBuilding(pos)) {
          if (illuminanceMap[y][x] < darkest.illuminance) {
            darkest = {
              x: pos.x,
              y: pos.y,
              illuminance: illuminanceMap[y][x],
            };
          }
        }
      }
    }
    
    return { x: darkest.x, y: darkest.y };
  }

  /**
   * التحقق من وجود الموقع داخل مبنى
   */
  private isInsideBuilding(position: Position): boolean {
    const buildings = this.map.getBuildings();
    
    for (const building of buildings) {
      if (
        position.x >= building.position.x &&
        position.x <= building.position.x + building.width &&
        position.y >= building.position.y &&
        position.y <= building.position.y + building.height
      ) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * حساب الثقة في الكشف
   */
  private calculateDetectionConfidence(
    spectralAnalysis: { anomalyScore: number; suspiciousRegions: Position[] },
    predictedLocation: Position,
    distanceError: number
  ): number {
    let confidence = 0.3; // ثقة أساسية

    // الشذوذ الطيفي العالي = ثقة أعلى
    confidence += spectralAnalysis.anomalyScore * 0.3;

    // المناطق المشبوهة الكثيرة = ثقة أعلى
    confidence += Math.min(0.2, spectralAnalysis.suspiciousRegions.length * 0.02);

    // الخبرة السابقة
    if (this.patternMemory.length > 10) {
      const recentSuccessRate =
        this.patternMemory.slice(-20).filter(p => p.detectedSuccessfully).length / 
        Math.min(20, this.patternMemory.length);
      
      confidence += recentSuccessRate * 0.2;
    }

    // التحقق من الكاميرات
    const cameras = this.map.getCameras();
    let visibleCameras = 0;
    for (const camera of cameras) {
      if (this.map.isVisibleFromCamera(predictedLocation, camera.id)) {
        visibleCameras++;
      }
    }
    
    confidence += visibleCameras * 0.05;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * اتخاذ قرار الكشف
   */
  private makeDetectionDecision(confidence: number, anomalyScore: number): boolean {
    // الكشف إذا تجاوزت الثقة العتبة
    if (confidence > this.suspicionThreshold) {
      return true;
    }

    // الكشف إذا كان هناك شذوذ كبير
    if (anomalyScore > 0.7) {
      return true;
    }

    // احتمال عشوائي بناءً على الثقة
    return Math.random() < confidence * 0.5;
  }

  /**
   * تعديل الإضاءة في المناطق المشبوهة
   */
  private adjustIlluminance(suspiciousRegions: Position[]): number {
    if (suspiciousRegions.length === 0) {
      return 0;
    }

    // رفع الإضاءة بشكل تدريجي في المناطق المشبوهة
    const adjustment = 5 + suspiciousRegions.length * 2;

    for (const region of suspiciousRegions) {
      this.map.adjustIlluminance(region, 100, adjustment);
    }

    return adjustment;
  }

  /**
   * استخراج الملف الطيفي لموقع
   */
  private extractSpectralProfile(position: Position): number[] {
    const profile: number[] = [];
    const bands = ['visible', 'infrared', 'thermal', 'hyperspectral'];

    for (const band of bands) {
      const signature = this.map.getSpectralSignature(band, position);
      if (signature) {
        profile.push(...signature.intensity);
      }
    }

    return profile;
  }

  /**
   * توليد التفسير
   */
  private generateReasoning(
    spectralAnalysis: { anomalyScore: number; suspiciousRegions: Position[] },
    predictedLocation: Position,
    confidence: number,
    detected: boolean
  ): string {
    const reasons: string[] = [];

    if (spectralAnalysis.anomalyScore > 0.6) {
      reasons.push('كشف شذوذ طيفي كبير في المنطقة');
    }

    if (spectralAnalysis.suspiciousRegions.length > 5) {
      reasons.push(`تحديد ${spectralAnalysis.suspiciousRegions.length} منطقة مشبوهة`);
    }

    const illuminance = this.map.getIlluminance(predictedLocation);
    if (illuminance < 30) {
      reasons.push('منطقة ذات إضاءة منخفضة (مشبوهة)');
    }

    const cameras = this.map.getCameras();
    let visibleCameras = 0;
    for (const camera of cameras) {
      if (this.map.isVisibleFromCamera(predictedLocation, camera.id)) {
        visibleCameras++;
      }
    }

    if (visibleCameras === 0) {
      reasons.push('موقع في نقطة عمياء للكاميرات');
    }

    if (this.patternMemory.length > 10) {
      reasons.push('تحليل بناءً على الأنماط السابقة');
    }

    if (detected) {
      reasons.push(`✓ كشف محتمل بثقة ${(confidence * 100).toFixed(1)}%`);
    } else {
      reasons.push(`✗ لم يتم الكشف - ثقة ${(confidence * 100).toFixed(1)}%`);
    }

    return reasons.join(' | ');
  }

  /**
   * حفظ نمط في الذاكرة
   */
  private storePattern(pattern: PatternMemory): void {
    this.patternMemory.push(pattern);
    
    // الاحتفاظ بآخر 100 نمط فقط
    if (this.patternMemory.length > 100) {
      this.patternMemory.shift();
    }
  }

  /**
   * التعلم من النتائج
   */
  public learn(actualLocation: Position, ourPrediction: Position, detected: boolean): void {
    const distance = this.calculateDistance(actualLocation, ourPrediction);
    
    // تعديل عتبة الشك
    if (detected && distance < 100) {
      // كشف ناجح - يمكن تخفيف العتبة قليلاً
      this.suspicionThreshold = Math.max(0.3, this.suspicionThreshold - this.learningRate);
    } else if (!detected && distance > 200) {
      // فشل كبير - رفع العتبة
      this.suspicionThreshold = Math.min(0.8, this.suspicionThreshold + this.learningRate);
    }
  }

  /**
   * دوال مساعدة
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    );
  }

  private calculateCentroid(positions: Position[]): Position {
    if (positions.length === 0) {
      return { x: 0, y: 0 };
    }

    const sum = positions.reduce(
      (acc, pos) => ({
        x: acc.x + pos.x,
        y: acc.y + pos.y,
      }),
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / positions.length,
      y: sum.y / positions.length,
    };
  }

  private findClosest(target: Position, positions: Position[]): Position {
    if (positions.length === 0) {
      return target;
    }

    let closest = positions[0];
    let minDistance = this.calculateDistance(target, closest);

    for (const pos of positions) {
      const distance = this.calculateDistance(target, pos);
      if (distance < minDistance) {
        closest = pos;
        minDistance = distance;
      }
    }

    return closest;
  }

  /**
   * الحصول على الإحصائيات
   */
  public getStats(): {
    suspicionThreshold: number;
    patternsLearned: number;
    successRate: number;
  } {
    const successRate =
      this.patternMemory.length > 0
        ? this.patternMemory.filter(p => p.detectedSuccessfully).length /
          this.patternMemory.length
        : 0;

    return {
      suspicionThreshold: this.suspicionThreshold,
      patternsLearned: this.patternMemory.length,
      successRate,
    };
  }
}
