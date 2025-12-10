/**
 * SCAR-EYE Adversarial Wargame Module - Main Export File
 * ملف التصدير الرئيسي للوحدة
 */

// المكونات الرئيسية
export { DigitalTwinMap } from './DigitalTwinMap';
export { RedAI } from './RedAI';
export { BlueAI } from './BlueAI';
export { SimulationEngine } from './SimulationEngine';
export { WargameDashboard } from './WargameDashboard';

// الأنواع
export type {
  Position,
  MapObject,
  SpectralSignature,
  CamouflageProfile,
  RedAIOutput,
  BlueAIOutput,
  RoundResult,
  SimulationStats,
  MapConfig,
  SimulationConfig,
} from './types';

// دالة مساعدة لإنشاء محاكاة جديدة
import { SimulationEngine } from './SimulationEngine';
import type { SimulationConfig } from './types';

/**
 * إنشاء محاكاة جديدة بإعدادات افتراضية
 */
export function createSimulation(config?: Partial<SimulationConfig>): SimulationEngine {
  return new SimulationEngine(config);
}

/**
 * الإصدار
 */
export const VERSION = '1.0.0';

/**
 * معلومات الوحدة
 */
export const MODULE_INFO = {
  name: 'SCAR-EYE Adversarial Wargame Module',
  version: VERSION,
  description: 'وحدة محاكاة تعليمية تفاعلية لصراع AI ضد AI',
  author: 'SCAR-EYE Team',
  license: 'Educational Use Only',
  warnings: [
    '⚠️ هذه محاكاة تعليمية فقط',
    '⚠️ جميع البيانات افتراضية (Mock Data)',
    '⚠️ لا اتصال بأنظمة حقيقية',
    '⚠️ لا عمليات هجومية حقيقية',
  ],
};

/**
 * دالة مساعدة لطباعة معلومات الوحدة
 */
export function printModuleInfo(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🎯 SCAR-EYE Adversarial Wargame Simulation Module          ║
║                                                                ║
║   Version: ${MODULE_INFO.version}                                          ║
║   وحدة محاكاة تعليمية تفاعلية لصراع AI ضد AI                  ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║   المكونات:                                                   ║
║   • DigitalTwinMap - خريطة التوأم الرقمي                      ║
║   • RedAI - الذكاء الاصطناعي المهاجم                          ║
║   • BlueAI (SCAR-EYE) - الذكاء الاصطناعي الدفاعي            ║
║   • SimulationEngine - محرك المحاكاة                          ║
║   • WargameDashboard - واجهة العرض التفاعلية                 ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║   ⚠️ ملاحظات هامة:                                            ║
║   ${MODULE_INFO.warnings.join('\n║   ')}
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

// طباعة معلومات الوحدة عند الاستيراد
if (typeof window !== 'undefined') {
  printModuleInfo();
}
