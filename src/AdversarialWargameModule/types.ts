/**
 * SCAR-EYE Adversarial Wargame Module - Type Definitions
 * تعريفات الأنواع للوحدة المحاكاة
 */

// إحداثيات الموقع
export interface Position {
  x: number;
  y: number;
}

// كائن في الخريطة
export interface MapObject {
  id: string;
  type: 'building' | 'road' | 'hidespot' | 'camera';
  position: Position;
  width: number;
  height: number;
  properties?: Record<string, any>;
}

// البصمة الطيفية
export interface SpectralSignature {
  wavelengths: number[]; // الأطوال الموجية بالنانومتر
  intensity: number[]; // الشدة لكل طول موجي
  temperature?: number; // درجة الحرارة (IR)
  reflectance?: number; // معامل الانعكاس
}

// ملف التمويه
export interface CamouflageProfile {
  visible: number; // 0-1 (مدى الرؤية في الضوء المرئي)
  infrared: number; // 0-1 (مدى الرؤية في الأشعة تحت الحمراء)
  thermal: number; // 0-1 (البصمة الحرارية)
  hyperspectral: Record<string, number>; // بصمات طيفية متعددة
}

// مخرجات Red-AI
export interface RedAIOutput {
  hideLocation: Position;
  camouflageProfile: CamouflageProfile;
  path: Position[];
  confidence: number; // ثقة المهاجم في الإخفاء
  strategyUsed: string;
}

// مخرجات Blue-AI
export interface BlueAIOutput {
  detected: boolean;
  confidence: number;
  predictedLocation: Position;
  reasoning: string;
  illuminanceAdjustment: number; // تعديل الإضاءة (0-100)
  spectralAnalysis: {
    anomalyScore: number;
    suspiciousRegions: Position[];
  };
}

// نتيجة جولة
export interface RoundResult {
  roundNumber: number;
  timestamp: number;
  redAI: RedAIOutput;
  blueAI: BlueAIOutput;
  actualDetection: boolean; // هل تم الكشف فعلياً؟
  distanceError: number; // المسافة بين الموقع الحقيقي والمتوقع
}

// إحصائيات المحاكاة
export interface SimulationStats {
  totalRounds: number;
  detectionRate: number; // نسبة الكشف الناجح
  averageConfidence: number;
  averageDistanceError: number;
  redAIWins: number;
  blueAIWins: number;
  confidenceTrend: number[]; // اتجاه الثقة عبر الجولات
}

// إعدادات الخريطة
export interface MapConfig {
  width: number;
  height: number;
  gridSize: number;
  buildings: MapObject[];
  roads: MapObject[];
  hideSpots: MapObject[];
  cameras: MapObject[];
  ambientLight: number; // الإضاءة المحيطة (0-100)
}

// إعدادات المحاكاة
export interface SimulationConfig {
  totalRounds: number;
  speedMultiplier: number; // سرعة المحاكاة
  enableVisualization: boolean;
  mapConfig: MapConfig;
}
