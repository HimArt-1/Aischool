/**
 * Red-AI Agent - الذكاء الاصطناعي المهاجم
 * يحاول إخفاء هدف افتراضي باستخدام استراتيجيات تمويه متقدمة
 */

import type { DigitalTwinMap } from './DigitalTwinMap';
import type { RedAIOutput, Position, CamouflageProfile } from './types';

export class RedAI {
  private map: DigitalTwinMap;
  private learningRate: number;
  private historyMemory: RedAIOutput[];
  private strategyWeights: Map<string, number>;

  constructor(map: DigitalTwinMap) {
    this.map = map;
    this.learningRate = 0.05;
    this.historyMemory = [];
    this.strategyWeights = new Map([
      ['darkZone', 1.0],
      ['cameraBlind', 1.0],
      ['crowdedArea', 0.8],
      ['spectralCamouflage', 0.9],
      ['randomNoise', 0.3],
    ]);
  }

  /**
   * تنفيذ محاولة إخفاء جديدة
   */
  public executeHidingAttempt(roundNumber: number): RedAIOutput {
    // اختيار استراتيجية بناءً على الأوزان
    const strategy = this.selectStrategy();
    
    // اختيار موقع الإخفاء
    const hideLocation = this.selectHideLocation(strategy);
    
    // إنشاء ملف التمويه
    const camouflageProfile = this.createCamouflageProfile(hideLocation, strategy);
    
    // توليد مسار الحركة
    const path = this.generateMovementPath(hideLocation, strategy);
    
    // حساب الثقة
    const confidence = this.calculateConfidence(hideLocation, camouflageProfile);

    const output: RedAIOutput = {
      hideLocation,
      camouflageProfile,
      path,
      confidence,
      strategyUsed: strategy,
    };

    // حفظ في الذاكرة للتعلم
    this.historyMemory.push(output);
    if (this.historyMemory.length > 50) {
      this.historyMemory.shift();
    }

    return output;
  }

  /**
   * اختيار استراتيجية بناءً على الأوزان
   */
  private selectStrategy(): string {
    const strategies = Array.from(this.strategyWeights.entries());
    const totalWeight = strategies.reduce((sum, [, weight]) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (const [strategy, weight] of strategies) {
      random -= weight;
      if (random <= 0) {
        return strategy;
      }
    }
    
    return 'randomNoise';
  }

  /**
   * اختيار موقع الإخفاء بناءً على الاستراتيجية
   */
  private selectHideLocation(strategy: string): Position {
    const mapConfig = this.map.getConfig();
    
    switch (strategy) {
      case 'darkZone':
        return this.findDarkestZone();
      
      case 'cameraBlind':
        return this.findCameraBlindSpot();
      
      case 'crowdedArea':
        return this.findCrowdedArea();
      
      case 'spectralCamouflage':
        return this.findOptimalSpectralLocation();
      
      default:
        // موقع عشوائي
        return {
          x: Math.random() * mapConfig.width,
          y: Math.random() * mapConfig.height,
        };
    }
  }

  /**
   * إيجاد أحلك منطقة في الخريطة
   */
  private findDarkestZone(): Position {
    const illuminanceMap = this.map.getIlluminanceMap();
    let darkest = { x: 0, y: 0, illuminance: 100 };
    
    const gridSize = this.map.getConfig().gridSize;
    
    for (let y = 0; y < illuminanceMap.length; y++) {
      for (let x = 0; x < illuminanceMap[y].length; x++) {
        if (illuminanceMap[y][x] < darkest.illuminance) {
          darkest = {
            x: x * gridSize + gridSize / 2,
            y: y * gridSize + gridSize / 2,
            illuminance: illuminanceMap[y][x],
          };
        }
      }
    }
    
    // إضافة تشويش عشوائي صغير
    return {
      x: darkest.x + (Math.random() - 0.5) * gridSize,
      y: darkest.y + (Math.random() - 0.5) * gridSize,
    };
  }

  /**
   * إيجاد نقطة عمياء للكاميرات
   */
  private findCameraBlindSpot(): Position {
    const cameras = this.map.getCameras();
    const mapConfig = this.map.getConfig();
    const candidates: Array<{ pos: Position; score: number }> = [];
    
    // عينة عشوائية من المواقع
    for (let i = 0; i < 100; i++) {
      const pos: Position = {
        x: Math.random() * mapConfig.width,
        y: Math.random() * mapConfig.height,
      };
      
      // حساب عدد الكاميرات التي ترى هذا الموقع
      let visibleCount = 0;
      for (const camera of cameras) {
        if (this.map.isVisibleFromCamera(pos, camera.id)) {
          visibleCount++;
        }
      }
      
      candidates.push({
        pos,
        score: visibleCount, // نريد أقل عدد
      });
    }
    
    candidates.sort((a, b) => a.score - b.score);
    
    return candidates[0]?.pos || {
      x: mapConfig.width / 2,
      y: mapConfig.height / 2,
    };
  }

  /**
   * إيجاد منطقة مزدحمة (بالقرب من نقاط الإخفاء)
   */
  private findCrowdedArea(): Position {
    const hideSpots = this.map.getHideSpots();
    
    if (hideSpots.length === 0) {
      const mapConfig = this.map.getConfig();
      return {
        x: Math.random() * mapConfig.width,
        y: Math.random() * mapConfig.height,
      };
    }
    
    // اختيار نقطة إخفاء بناءً على الإخفاء والوصولية
    const scored = hideSpots.map(spot => ({
      pos: spot.position,
      score:
        (spot.properties?.concealment || 0.5) *
        (spot.properties?.accessibility || 0.5),
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    const best = scored[Math.floor(Math.random() * Math.min(3, scored.length))];
    
    return {
      x: best.pos.x + (Math.random() - 0.5) * 20,
      y: best.pos.y + (Math.random() - 0.5) * 20,
    };
  }

  /**
   * إيجاد موقع أمثل بناءً على البصمة الطيفية
   */
  private findOptimalSpectralLocation(): Position {
    const mapConfig = this.map.getConfig();
    const candidates: Array<{ pos: Position; score: number }> = [];
    
    // عينة عشوائية من المواقع
    for (let i = 0; i < 50; i++) {
      const pos: Position = {
        x: Math.random() * mapConfig.width,
        y: Math.random() * mapConfig.height,
      };
      
      // تقييم البصمة الطيفية
      const signature = this.map.getSpectralSignature('hyperspectral', pos);
      const score = signature
        ? signature.intensity.reduce((sum, val) => sum + val, 0) / signature.intensity.length
        : 0.5;
      
      candidates.push({ pos, score });
    }
    
    // نريد مكان بقيمة طيفية متوسطة (يسهل التمويه)
    candidates.sort((a, b) => Math.abs(a.score - 0.5) - Math.abs(b.score - 0.5));
    
    return candidates[0]?.pos || {
      x: mapConfig.width / 2,
      y: mapConfig.height / 2,
    };
  }

  /**
   * إنشاء ملف تمويه
   */
  private createCamouflageProfile(
    location: Position,
    strategy: string
  ): CamouflageProfile {
    const illuminance = this.map.getIlluminance(location);
    const signature = this.map.getSpectralSignature('hyperspectral', location);
    
    // التكيف مع الإضاءة
    const visibleCamo = Math.max(0, 1 - illuminance / 100);
    
    // تمويه الأشعة تحت الحمراء
    const infraredCamo = 0.3 + Math.random() * 0.4;
    
    // البصمة الحرارية (محاولة التقليل)
    const thermalCamo = 0.2 + Math.random() * 0.3;
    
    // البصمة الطيفية المتقدمة
    const hyperspectral: Record<string, number> = {};
    if (signature) {
      signature.wavelengths.forEach((wavelength, i) => {
        // محاولة مطابقة البيئة المحيطة
        hyperspectral[`${wavelength}nm`] = signature.intensity[i] * (0.8 + Math.random() * 0.4);
      });
    }
    
    return {
      visible: strategy === 'darkZone' ? visibleCamo * 0.7 : visibleCamo,
      infrared: strategy === 'spectralCamouflage' ? infraredCamo * 0.6 : infraredCamo,
      thermal: thermalCamo,
      hyperspectral,
    };
  }

  /**
   * توليد مسار حركة
   */
  private generateMovementPath(destination: Position, strategy: string): Position[] {
    const mapConfig = this.map.getConfig();
    const path: Position[] = [];
    
    // نقطة البداية (عشوائية من حافة الخريطة)
    const startSide = Math.floor(Math.random() * 4);
    let start: Position;
    
    switch (startSide) {
      case 0: // أعلى
        start = { x: Math.random() * mapConfig.width, y: 0 };
        break;
      case 1: // يمين
        start = { x: mapConfig.width, y: Math.random() * mapConfig.height };
        break;
      case 2: // أسفل
        start = { x: Math.random() * mapConfig.width, y: mapConfig.height };
        break;
      default: // يسار
        start = { x: 0, y: Math.random() * mapConfig.height };
    }
    
    path.push(start);
    
    // عدد نقاط المسار
    const waypoints = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 1; i < waypoints; i++) {
      const progress = i / waypoints;
      
      // إضافة تشويش عشوائي للمسار
      const noise = {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
      };
      
      path.push({
        x: start.x + (destination.x - start.x) * progress + noise.x,
        y: start.y + (destination.y - start.y) * progress + noise.y,
      });
    }
    
    path.push(destination);
    
    return path;
  }

  /**
   * حساب الثقة في الإخفاء
   */
  private calculateConfidence(
    location: Position,
    camouflage: CamouflageProfile
  ): number {
    let confidence = 0.5;
    
    // الإضاءة المنخفضة = ثقة أعلى
    const illuminance = this.map.getIlluminance(location);
    confidence += (100 - illuminance) / 200;
    
    // التمويه الجيد = ثقة أعلى
    const avgCamo = (camouflage.visible + camouflage.infrared + camouflage.thermal) / 3;
    confidence += avgCamo * 0.3;
    
    // التحقق من الكاميرات
    const cameras = this.map.getCameras();
    let visibleCameras = 0;
    for (const camera of cameras) {
      if (this.map.isVisibleFromCamera(location, camera.id)) {
        visibleCameras++;
      }
    }
    
    confidence -= visibleCameras * 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * التعلم من النتائج السابقة
   */
  public learn(wasDetected: boolean, strategyUsed: string): void {
    const currentWeight = this.strategyWeights.get(strategyUsed) || 0.5;
    
    if (wasDetected) {
      // إذا تم كشفنا، قلل وزن هذه الاستراتيجية
      this.strategyWeights.set(
        strategyUsed,
        Math.max(0.1, currentWeight - this.learningRate)
      );
    } else {
      // إذا نجحنا، زد وزن هذه الاستراتيجية
      this.strategyWeights.set(
        strategyUsed,
        Math.min(2.0, currentWeight + this.learningRate)
      );
    }
  }

  /**
   * الحصول على الإحصائيات
   */
  public getStrategyWeights(): Map<string, number> {
    return new Map(this.strategyWeights);
  }

  public getHistory(): RedAIOutput[] {
    return [...this.historyMemory];
  }
}
