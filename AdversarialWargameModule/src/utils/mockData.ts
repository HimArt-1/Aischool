/**
 * SCAR-EYE Adversarial Wargame Module
 * Mock Data Generator
 * 
 * Generates synthetic data for simulation - No real data used
 */

import {
  Building,
  Road,
  HidingSpot,
  Camera,
  SpectralLayer,
  Position,
  SpectralSignature
} from './types';

// ═══════════════════════════════════════════════════════════════
// Random Utilities
// ═══════════════════════════════════════════════════════════════

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ═══════════════════════════════════════════════════════════════
// Distance & Geometry Utilities
// ═══════════════════════════════════════════════════════════════

export function distance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

export function isInsideRect(point: Position, rect: { x: number; y: number; width: number; height: number }): boolean {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width && 
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
}

// ═══════════════════════════════════════════════════════════════
// Mock Building Generator
// ═══════════════════════════════════════════════════════════════

export function generateMockBuildings(mapWidth: number, mapHeight: number): Building[] {
  const buildings: Building[] = [];
  const buildingTypes: Building['type'][] = ['residential', 'commercial', 'industrial', 'government'];
  
  // Create a grid-like layout with some randomness
  const gridSize = 120;
  const buildingPadding = 30;
  
  for (let gx = 0; gx < mapWidth / gridSize; gx++) {
    for (let gy = 0; gy < mapHeight / gridSize; gy++) {
      // 70% chance of building in each grid cell
      if (Math.random() > 0.3) {
        const baseX = gx * gridSize + buildingPadding;
        const baseY = gy * gridSize + buildingPadding;
        
        const width = randomInt(40, 80);
        const height = randomInt(40, 80);
        
        buildings.push({
          id: `building-${gx}-${gy}`,
          x: baseX + randomInt(-10, 10),
          y: baseY + randomInt(-10, 10),
          width,
          height,
          type: randomChoice(buildingTypes),
          height: randomInt(1, 8),
          shadowCoverage: randomInRange(0.2, 0.7)
        });
      }
    }
  }
  
  return buildings;
}

// ═══════════════════════════════════════════════════════════════
// Mock Road Generator
// ═══════════════════════════════════════════════════════════════

export function generateMockRoads(mapWidth: number, mapHeight: number): Road[] {
  const roads: Road[] = [];
  
  // Main horizontal roads
  for (let i = 1; i <= 3; i++) {
    const y = (mapHeight / 4) * i;
    roads.push({
      id: `road-h-${i}`,
      points: [
        { x: 0, y: y + randomInt(-5, 5) },
        { x: mapWidth * 0.3, y: y + randomInt(-3, 3) },
        { x: mapWidth * 0.7, y: y + randomInt(-3, 3) },
        { x: mapWidth, y: y + randomInt(-5, 5) }
      ],
      width: i === 2 ? 25 : 15,
      type: i === 2 ? 'main' : 'secondary'
    });
  }
  
  // Main vertical roads
  for (let i = 1; i <= 3; i++) {
    const x = (mapWidth / 4) * i;
    roads.push({
      id: `road-v-${i}`,
      points: [
        { x: x + randomInt(-5, 5), y: 0 },
        { x: x + randomInt(-3, 3), y: mapHeight * 0.3 },
        { x: x + randomInt(-3, 3), y: mapHeight * 0.7 },
        { x: x + randomInt(-5, 5), y: mapHeight }
      ],
      width: i === 2 ? 25 : 15,
      type: i === 2 ? 'main' : 'secondary'
    });
  }
  
  // Some alleys
  for (let i = 0; i < 8; i++) {
    const isHorizontal = Math.random() > 0.5;
    if (isHorizontal) {
      const y = randomInt(50, mapHeight - 50);
      const startX = randomInt(0, mapWidth * 0.3);
      const endX = randomInt(mapWidth * 0.4, mapWidth * 0.6);
      roads.push({
        id: `alley-${i}`,
        points: [{ x: startX, y }, { x: endX, y }],
        width: 8,
        type: 'alley'
      });
    } else {
      const x = randomInt(50, mapWidth - 50);
      const startY = randomInt(0, mapHeight * 0.3);
      const endY = randomInt(mapHeight * 0.4, mapHeight * 0.6);
      roads.push({
        id: `alley-${i}`,
        points: [{ x, y: startY }, { x, y: endY }],
        width: 8,
        type: 'alley'
      });
    }
  }
  
  return roads;
}

// ═══════════════════════════════════════════════════════════════
// Mock Camera Generator
// ═══════════════════════════════════════════════════════════════

export function generateMockCameras(
  buildings: Building[],
  mapWidth: number,
  mapHeight: number
): Camera[] {
  const cameras: Camera[] = [];
  
  // Place cameras on some buildings
  const cameraBuildingCount = Math.floor(buildings.length * 0.3);
  const selectedBuildings = [...buildings]
    .sort(() => Math.random() - 0.5)
    .slice(0, cameraBuildingCount);
  
  selectedBuildings.forEach((building, i) => {
    cameras.push({
      id: `camera-${i}`,
      position: {
        x: building.x + building.width / 2,
        y: building.y + building.height / 2
      },
      fieldOfView: randomInt(60, 120),
      direction: randomInt(0, 360),
      range: randomInt(80, 150),
      spectralCapability: Math.random() > 0.6
    });
  });
  
  // Add some street-level cameras
  for (let i = 0; i < 6; i++) {
    cameras.push({
      id: `street-camera-${i}`,
      position: {
        x: randomInt(50, mapWidth - 50),
        y: randomInt(50, mapHeight - 50)
      },
      fieldOfView: 90,
      direction: randomInt(0, 360),
      range: 100,
      spectralCapability: Math.random() > 0.7
    });
  }
  
  return cameras;
}

// ═══════════════════════════════════════════════════════════════
// Mock Hiding Spot Generator
// ═══════════════════════════════════════════════════════════════

export function generateMockHidingSpots(
  buildings: Building[],
  cameras: Camera[],
  mapWidth: number,
  mapHeight: number
): HidingSpot[] {
  const hidingSpots: HidingSpot[] = [];
  
  // Generate hiding spots near building corners, in shadows, etc.
  buildings.forEach((building, bi) => {
    // Corners of buildings
    const corners = [
      { x: building.x - 5, y: building.y - 5 },
      { x: building.x + building.width + 5, y: building.y - 5 },
      { x: building.x - 5, y: building.y + building.height + 5 },
      { x: building.x + building.width + 5, y: building.y + building.height + 5 }
    ];
    
    corners.forEach((corner, ci) => {
      if (corner.x > 0 && corner.x < mapWidth && corner.y > 0 && corner.y < mapHeight) {
        // Calculate distance to nearest camera
        let minCameraDist = Infinity;
        cameras.forEach(cam => {
          const d = distance(corner, cam.position);
          if (d < minCameraDist) minCameraDist = d;
        });
        
        hidingSpots.push({
          id: `hiding-${bi}-${ci}`,
          position: corner,
          concealmentLevel: randomInRange(0.4, 0.9),
          spectralDifficulty: randomInRange(0.3, 0.8),
          nearestCameraDistance: minCameraDist,
          isInShadow: building.shadowCoverage > 0.5 && Math.random() > 0.4
        });
      }
    });
  });
  
  // Add some random spots in dark areas
  for (let i = 0; i < 15; i++) {
    const pos = {
      x: randomInt(20, mapWidth - 20),
      y: randomInt(20, mapHeight - 20)
    };
    
    let minCameraDist = Infinity;
    cameras.forEach(cam => {
      const d = distance(pos, cam.position);
      if (d < minCameraDist) minCameraDist = d;
    });
    
    hidingSpots.push({
      id: `hiding-random-${i}`,
      position: pos,
      concealmentLevel: randomInRange(0.2, 0.6),
      spectralDifficulty: randomInRange(0.2, 0.6),
      nearestCameraDistance: minCameraDist,
      isInShadow: Math.random() > 0.6
    });
  }
  
  return hidingSpots;
}

// ═══════════════════════════════════════════════════════════════
// Mock Spectral Layer Generator
// ═══════════════════════════════════════════════════════════════

export function generateMockSpectralLayers(
  mapWidth: number,
  mapHeight: number,
  gridResolution: number = 20
): SpectralLayer[] {
  const gridWidth = Math.ceil(mapWidth / gridResolution);
  const gridHeight = Math.ceil(mapHeight / gridResolution);
  
  const createIntensityMap = (baseValue: number, variance: number): number[][] => {
    const map: number[][] = [];
    for (let y = 0; y < gridHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < gridWidth; x++) {
        row.push(clamp(baseValue + randomInRange(-variance, variance), 0, 1));
      }
      map.push(row);
    }
    return map;
  };
  
  return [
    {
      id: 'visible',
      name: 'Visible Spectrum',
      wavelengthRange: [400, 700],
      intensityMap: createIntensityMap(0.6, 0.2)
    },
    {
      id: 'near-ir',
      name: 'Near Infrared',
      wavelengthRange: [700, 1000],
      intensityMap: createIntensityMap(0.4, 0.3)
    },
    {
      id: 'shortwave-ir',
      name: 'Shortwave IR',
      wavelengthRange: [1000, 2500],
      intensityMap: createIntensityMap(0.3, 0.25)
    },
    {
      id: 'thermal',
      name: 'Thermal IR',
      wavelengthRange: [8000, 14000],
      intensityMap: createIntensityMap(0.5, 0.15)
    }
  ];
}

// ═══════════════════════════════════════════════════════════════
// Generate Default Spectral Signature
// ═══════════════════════════════════════════════════════════════

export function generateDefaultSpectralSignature(): SpectralSignature {
  return {
    visible: randomInRange(0.3, 0.7),
    nearInfrared: randomInRange(0.2, 0.6),
    shortwave: randomInRange(0.1, 0.5),
    thermal: randomInRange(0.3, 0.6)
  };
}

// ═══════════════════════════════════════════════════════════════
// Generate Camouflage Profile
// ═══════════════════════════════════════════════════════════════

export function generateCamouflageProfile(targetSignature: SpectralSignature): SpectralSignature {
  // Try to match the target signature with some variance
  return {
    visible: clamp(targetSignature.visible + randomInRange(-0.1, 0.1), 0, 1),
    nearInfrared: clamp(targetSignature.nearInfrared + randomInRange(-0.15, 0.15), 0, 1),
    shortwave: clamp(targetSignature.shortwave + randomInRange(-0.2, 0.2), 0, 1),
    thermal: clamp(targetSignature.thermal + randomInRange(-0.1, 0.1), 0, 1)
  };
}
