# 🎯 SCAR-EYE Adversarial Wargame Module

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Educational-green.svg)
![Status](https://img.shields.io/badge/status-Hackathon%20Ready-brightgreen.svg)

**AI vs AI Simulation • Red Team vs Blue Team • Educational Demo**

</div>

---

## ⚠️ DISCLAIMER

> **This module is for EDUCATIONAL and DEMONSTRATION purposes only.**
> 
> - No real data sources, APIs, or surveillance systems are used
> - All data is synthetically generated for simulation purposes
> - No real offensive or defensive capabilities are implemented
> - Designed for hackathon presentations and learning

---

## 📋 Overview

The SCAR-EYE Adversarial Wargame Module is an interactive simulation that demonstrates AI vs AI adversarial scenarios in a controlled environment. Watch as a Red-AI attacker tries to hide virtual threats while the Blue-AI defensive system (SCAR-EYE) attempts to detect and predict their locations.

### Components

| Component | Description |
|-----------|-------------|
| 🗺️ **DigitalTwinMap** | Simulated neighborhood with buildings, roads, cameras, and hiding spots |
| 🔴 **RedAI** | Adversarial agent that learns to exploit blind spots and use spectral camouflage |
| 🔵 **BlueAI** | SCAR-EYE defensive system using spectral analysis and pattern prediction |
| ⚙️ **SimulationEngine** | Manages rounds, statistics, and AI learning |
| 📊 **WargameDashboard** | Beautiful interactive visualization interface |

---

## 🚀 Quick Start

### Option 1: Direct Browser Use (No Build Required)

Simply open `index.html` in your browser:

```bash
# Using Python's simple server
cd AdversarialWargameModule
python -m http.server 8080
# Open http://localhost:8080

# Or using Node.js
npx http-server . -p 8080 -o
```

### Option 2: Integrate into Existing Project

```html
<!-- Add the script -->
<script src="dist/wargame.bundle.js"></script>

<!-- Create a container -->
<div id="wargame-container"></div>

<!-- Initialize -->
<script>
  const { engine, dashboard } = WargameModule.initWargame('wargame-container', {
    totalRounds: 200,
    mapWidth: 800,
    mapHeight: 600
  });
</script>
```

### Option 3: TypeScript/ES Modules

```typescript
import { initWargame, SimulationEngine, WargameDashboard } from './src/index';

const { engine, dashboard } = initWargame('my-container', {
  totalRounds: 100,
  adaptiveLightingEnabled: true
});

// Listen to events
engine.on((event) => {
  if (event.type === 'ROUND_END') {
    console.log(`Round ${event.result.roundNumber}: ${event.result.detected ? 'DETECTED' : 'MISSED'}`);
  }
});

// Start simulation
engine.start();
```

---

## 🎮 Usage Guide

### Control Buttons

| Button | Action |
|--------|--------|
| ▶ **Start** | Begin automatic simulation |
| ⏸ **Pause/Resume** | Pause or resume running simulation |
| ⏭ **Step** | Advance one round at a time |
| ↺ **Reset** | Reset simulation to initial state |

### Settings

- **Speed Slider**: Control simulation pace (0-200ms delay between rounds)
- **Show Camera Ranges**: Toggle camera coverage visualization
- **Show Hiding Spots**: Display potential hiding locations
- **Spectral Overlay**: Show thermal/spectral map overlay

### Dashboard Panels

1. **Simulation Progress**: Current round and completion status
2. **Battle Statistics**: Detection rate, wins for each side
3. **Confidence Trend**: Graph showing Blue-AI confidence over time
4. **Current Round**: Details of the latest round
5. **Activity Log**: Scrolling log of all round results

---

## 🏗️ Architecture

```
AdversarialWargameModule/
├── src/
│   ├── core/
│   │   ├── DigitalTwinMap.ts    # Map with buildings, roads, cameras
│   │   └── SimulationEngine.ts  # Round management & statistics
│   ├── agents/
│   │   ├── RedAI.ts             # Attacker agent
│   │   └── BlueAI.ts            # SCAR-EYE defender agent
│   ├── ui/
│   │   └── WargameDashboard.ts  # Interactive visualization
│   ├── utils/
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── mockData.ts          # Synthetic data generators
│   └── index.ts                 # Main exports
├── dist/
│   └── wargame.bundle.js        # Standalone browser bundle
├── index.html                   # Demo page
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔴 Red-AI Strategies

The attacker AI uses various strategies that evolve based on success:

| Strategy | Description |
|----------|-------------|
| `EXPLOIT_BLIND_SPOT` | Target areas with no camera coverage |
| `SHADOW_LURK` | Hide in low-illumination zones |
| `SPECTRAL_MIMICRY` | Match spectral signature of environment |
| `ALLEY_SNEAK` | Use narrow passages for approach |
| `BUILDING_COVER` | Hide behind structural obstructions |
| `RANDOM_CHAOS` | Unpredictable random placement |

---

## 🔵 Blue-AI Detection Methods

The SCAR-EYE system employs multiple detection techniques:

- **Spectral Analysis**: Detect anomalies in thermal/IR signatures
- **Movement Pattern Analysis**: Identify suspicious paths
- **Adaptive Illumination**: Automatically increase lighting in suspicious areas
- **Pattern Prediction**: Learn from history to predict hiding locations
- **Multi-sensor Fusion**: Combine camera and spectral data

---

## 📊 Output Data Structures

### Red-AI Output

```typescript
interface RedAIOutput {
  hideLocation: { x: number, y: number };
  camouflageProfile: {
    visible: number;      // 0-1
    nearInfrared: number; // 0-1
    shortwave: number;    // 0-1
    thermal: number;      // 0-1
  };
  path: { x: number, y: number }[];
  strategy: string;
  exploitedWeaknesses: string[];
}
```

### Blue-AI Output

```typescript
interface BlueAIOutput {
  detected: boolean;
  confidence: number;  // 0-1
  predictedLocation: { x: number, y: number };
  reasoning: string;
  illuminanceAdjustments: Map<string, number>;
  spectralAnomalies: { x: number, y: number }[];
}
```

---

## ⚙️ Configuration Options

```typescript
interface SimulationConfig {
  totalRounds: number;           // Default: 200
  mapWidth: number;              // Default: 800
  mapHeight: number;             // Default: 600
  detectionThreshold: number;    // Default: 0.5
  adaptiveLightingEnabled: boolean;  // Default: true
  spectralAnalysisEnabled: boolean;  // Default: true
}
```

---

## 🛠️ Development

### Build from Source

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm start
```

### Project Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Watch mode for development |
| `npm start` | Start local server |
| `npm run clean` | Remove build artifacts |

---

## 🎪 Hackathon Demo Tips

1. **Start with Step Mode**: Use the ⏭ Step button to explain each round
2. **Show Camera Ranges**: Helps audience understand surveillance coverage
3. **Point out Learning**: Note how detection rates change over time
4. **Use Speed Control**: Slow down for explanations, speed up for effect
5. **Highlight Strategies**: Explain Red-AI strategy changes in the log

---

## 📝 License

Educational Use Only - Designed for hackathon demonstrations and learning purposes.

---

## 🙏 Acknowledgments

Built for the SCAR-EYE hackathon demonstration. This module showcases adversarial AI concepts in a safe, educational environment.

---

<div align="center">

**🎯 SCAR-EYE Adversarial Wargame Module**

*AI vs AI • Educational • Hackathon Ready*

</div>
