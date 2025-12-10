/**
 * Digital Twin Map - التوأم الرقمي للخريطة
 * محاكاة خريطة حضرية مصغرة مع طبقات طيفية
 */

import type { MapConfig, MapObject, Position, SpectralSignature } from './types';

export class DigitalTwinMap {
  private config: MapConfig;
  private spectralLayers: Map<string, SpectralSignature[][]>;
  private illuminanceMap: number[][];

  constructor(config?: Partial<MapConfig>) {
    this.config = this.initializeDefaultConfig(config);
    this.spectralLayers = new Map();
    this.illuminanceMap = [];
    
    this.initializeSpectralLayers();
    this.initializeIlluminance();
  }

  /**
   * تهيئة التكوين الافتراضي للخريطة
   */
  private initializeDefaultConfig(config?: Partial<MapConfig>): MapConfig {
    const width = config?.width || 1000;
    const height = config?.height || 800;
    const gridSize = config?.gridSize || 50;

    return {
      width,
      height,
      gridSize,
      ambientLight: config?.ambientLight || 50,
      buildings: this.generateBuildings(width, height),
      roads: this.generateRoads(width, height),
      hideSpots: this.generateHideSpots(width, height),
      cameras: this.generateCameras(width, height),
    };
  }

  /**
   * توليد مباني عشوائية
   */
  private generateBuildings(mapWidth: number, mapHeight: number): MapObject[] {
    const buildings: MapObject[] = [];
    const buildingCount = 12;

    for (let i = 0; i < buildingCount; i++) {
      const width = 80 + Math.random() * 120;
      const height = 60 + Math.random() * 100;
      
      buildings.push({
        id: `building-${i}`,
        type: 'building',
        position: {
          x: Math.random() * (mapWidth - width),
          y: Math.random() * (mapHeight - height),
        },
        width,
        height,
        properties: {
          material: ['concrete', 'glass', 'metal'][Math.floor(Math.random() * 3)],
          floors: Math.floor(2 + Math.random() * 8),
        },
      });
    }

    return buildings;
  }

  /**
   * توليد طرق
   */
  private generateRoads(mapWidth: number, mapHeight: number): MapObject[] {
    const roads: MapObject[] = [];

    // طرق أفقية
    for (let i = 0; i < 3; i++) {
      roads.push({
        id: `road-h-${i}`,
        type: 'road',
        position: { x: 0, y: (i + 1) * (mapHeight / 4) },
        width: mapWidth,
        height: 30,
      });
    }

    // طرق عمودية
    for (let i = 0; i < 3; i++) {
      roads.push({
        id: `road-v-${i}`,
        type: 'road',
        position: { x: (i + 1) * (mapWidth / 4), y: 0 },
        width: 30,
        height: mapHeight,
      });
    }

    return roads;
  }

  /**
   * توليد نقاط إخفاء محتملة
   */
  private generateHideSpots(mapWidth: number, mapHeight: number): MapObject[] {
    const hideSpots: MapObject[] = [];
    const spotCount = 20;

    for (let i = 0; i < spotCount; i++) {
      hideSpots.push({
        id: `hidespot-${i}`,
        type: 'hidespot',
        position: {
          x: Math.random() * mapWidth,
          y: Math.random() * mapHeight,
        },
        width: 15,
        height: 15,
        properties: {
          concealment: Math.random(), // 0-1
          accessibility: Math.random(), // 0-1
        },
      });
    }

    return hideSpots;
  }

  /**
   * توليد كاميرات المراقبة
   */
  private generateCameras(mapWidth: number, mapHeight: number): MapObject[] {
    const cameras: MapObject[] = [];
    const cameraCount = 8;

    for (let i = 0; i < cameraCount; i++) {
      cameras.push({
        id: `camera-${i}`,
        type: 'camera',
        position: {
          x: Math.random() * mapWidth,
          y: Math.random() * mapHeight,
        },
        width: 10,
        height: 10,
        properties: {
          range: 150 + Math.random() * 100,
          angle: Math.random() * 360,
          spectralCapability: ['visible', 'infrared', 'thermal'][Math.floor(Math.random() * 3)],
        },
      });
    }

    return cameras;
  }

  /**
   * تهيئة الطبقات الطيفية
   */
  private initializeSpectralLayers(): void {
    const bands = ['visible', 'infrared', 'thermal', 'hyperspectral'];
    
    bands.forEach(band => {
      const layer: SpectralSignature[][] = [];
      
      for (let y = 0; y < this.config.height; y += this.config.gridSize) {
        const row: SpectralSignature[] = [];
        for (let x = 0; x < this.config.width; x += this.config.gridSize) {
          row.push(this.generateSpectralSignature(band, { x, y }));
        }
        layer.push(row);
      }
      
      this.spectralLayers.set(band, layer);
    });
  }

  /**
   * توليد بصمة طيفية لموقع معين
   */
  private generateSpectralSignature(band: string, position: Position): SpectralSignature {
    const baseWavelengths = {
      visible: [400, 500, 600, 700],
      infrared: [800, 1000, 1200, 1400],
      thermal: [8000, 9000, 10000, 11000],
      hyperspectral: Array.from({ length: 10 }, (_, i) => 400 + i * 300),
    };

    const wavelengths = baseWavelengths[band as keyof typeof baseWavelengths] || [400, 500, 600];
    const intensity = wavelengths.map(() => Math.random());

    return {
      wavelengths,
      intensity,
      temperature: 20 + Math.random() * 15, // 20-35°C
      reflectance: Math.random(),
    };
  }

  /**
   * تهيئة خريطة الإضاءة
   */
  private initializeIlluminance(): void {
    const rows = Math.ceil(this.config.height / this.config.gridSize);
    const cols = Math.ceil(this.config.width / this.config.gridSize);

    this.illuminanceMap = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => this.config.ambientLight)
    );
  }

  /**
   * تحديث الإضاءة في منطقة معينة
   */
  public adjustIlluminance(position: Position, radius: number, adjustment: number): void {
    const gridX = Math.floor(position.x / this.config.gridSize);
    const gridY = Math.floor(position.y / this.config.gridSize);
    const gridRadius = Math.ceil(radius / this.config.gridSize);

    for (let dy = -gridRadius; dy <= gridRadius; dy++) {
      for (let dx = -gridRadius; dx <= gridRadius; dx++) {
        const x = gridX + dx;
        const y = gridY + dy;

        if (
          y >= 0 &&
          y < this.illuminanceMap.length &&
          x >= 0 &&
          x < this.illuminanceMap[0].length
        ) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= gridRadius) {
            const falloff = 1 - distance / gridRadius;
            this.illuminanceMap[y][x] = Math.min(
              100,
              Math.max(0, this.illuminanceMap[y][x] + adjustment * falloff)
            );
          }
        }
      }
    }
  }

  /**
   * الحصول على الإضاءة في موقع معين
   */
  public getIlluminance(position: Position): number {
    const gridX = Math.floor(position.x / this.config.gridSize);
    const gridY = Math.floor(position.y / this.config.gridSize);

    if (
      gridY >= 0 &&
      gridY < this.illuminanceMap.length &&
      gridX >= 0 &&
      gridX < this.illuminanceMap[0].length
    ) {
      return this.illuminanceMap[gridY][gridX];
    }

    return this.config.ambientLight;
  }

  /**
   * الحصول على البصمة الطيفية لموقع معين
   */
  public getSpectralSignature(band: string, position: Position): SpectralSignature | null {
    const layer = this.spectralLayers.get(band);
    if (!layer) return null;

    const gridX = Math.floor(position.x / this.config.gridSize);
    const gridY = Math.floor(position.y / this.config.gridSize);

    if (gridY >= 0 && gridY < layer.length && gridX >= 0 && gridX < layer[0].length) {
      return layer[gridY][gridX];
    }

    return null;
  }

  /**
   * التحقق من إمكانية رؤية موقع من كاميرا
   */
  public isVisibleFromCamera(position: Position, cameraId: string): boolean {
    const camera = this.config.cameras.find(c => c.id === cameraId);
    if (!camera) return false;

    const distance = Math.sqrt(
      Math.pow(position.x - camera.position.x, 2) +
      Math.pow(position.y - camera.position.y, 2)
    );

    const range = camera.properties?.range || 150;
    
    // التحقق من عدم وجود عائق
    const hasObstacle = this.checkLineOfSightObstacles(camera.position, position);

    return distance <= range && !hasObstacle;
  }

  /**
   * التحقق من وجود عوائق في خط الرؤية
   */
  private checkLineOfSightObstacles(from: Position, to: Position): boolean {
    // محاكاة بسيطة: التحقق من تقاطع مع المباني
    for (const building of this.config.buildings) {
      if (this.lineIntersectsRect(from, to, building)) {
        return true;
      }
    }
    return false;
  }

  /**
   * التحقق من تقاطع خط مع مستطيل
   */
  private lineIntersectsRect(from: Position, to: Position, rect: MapObject): boolean {
    const { position, width, height } = rect;
    
    // محاكاة بسيطة: التحقق من نقطة المنتصف فقط
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    return (
      midX >= position.x &&
      midX <= position.x + width &&
      midY >= position.y &&
      midY <= position.y + height
    );
  }

  /**
   * الحصول على كافة نقاط الإخفاء الجيدة
   */
  public getBestHideSpots(count: number = 5): MapObject[] {
    return [...this.config.hideSpots]
      .sort((a, b) => {
        const scoreA = (a.properties?.concealment || 0) * (a.properties?.accessibility || 0);
        const scoreB = (b.properties?.concealment || 0) * (b.properties?.accessibility || 0);
        return scoreB - scoreA;
      })
      .slice(0, count);
  }

  // Getters
  public getConfig(): MapConfig {
    return this.config;
  }

  public getBuildings(): MapObject[] {
    return this.config.buildings;
  }

  public getRoads(): MapObject[] {
    return this.config.roads;
  }

  public getHideSpots(): MapObject[] {
    return this.config.hideSpots;
  }

  public getCameras(): MapObject[] {
    return this.config.cameras;
  }

  public getIlluminanceMap(): number[][] {
    return this.illuminanceMap;
  }
}
