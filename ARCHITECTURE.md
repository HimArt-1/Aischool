# ShaheenEye System Architecture

## Overview

ShaheenEye is built on a modern, scalable architecture that integrates multiple AI and sensor technologies into a cohesive urban security platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Demo      │  │  Dashboard   │  │    Status    │      │
│  │ Scenarios   │  │  Analytics   │  │  Monitoring  │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/WebSocket
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (FastAPI)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              REST API Endpoints                     │   │
│  │  /api/status  /api/hyperspectral  /api/lighting    │   │
│  │  /api/wargaming  /api/audio  /api/digital-twin     │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    Core System Manager                      │
│             Orchestrates all components                     │
└─────┬──────────┬──────────┬──────────┬──────────────────────┘
      │          │          │          │
      ↓          ↓          ↓          ↓
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Hyperspe- │ │Adaptive  │ │Wargaming │ │  Audio   │
│  ctral   │ │ Lighting │ │Simulator │ │Processor │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │
     └────────────┴────────────┴────────────┘
                    │
                    ↓
          ┌─────────────────┐
          │  Digital Twin   │
          │   Environment   │
          └─────────────────┘
```

## Core Components

### 1. Frontend Layer

**Technology**: React 18 + Vite + TailwindCSS

**Components**:
- **Demo Scenarios**: Interactive demonstrations of all four core innovations
- **Dashboard**: Real-time monitoring and analytics
- **System Status**: Health monitoring and resource tracking
- **3D Visualization**: Digital twin representation (Three.js)

**Key Features**:
- Real-time WebSocket updates
- Responsive design
- Modern glassmorphism UI
- Smooth animations

### 2. API Layer

**Technology**: FastAPI + Uvicorn

**Endpoints**:
```python
GET  /api/status                      # System health
POST /api/hyperspectral/analyze       # Material analysis
POST /api/lighting/adjust             # Lighting control
POST /api/wargaming/start             # Start simulation
GET  /api/wargaming/stats             # Get statistics
POST /api/audio/process               # Audio processing
GET  /api/digital-twin/state          # Environment state
```

**Features**:
- Async request handling
- WebSocket support for real-time updates
- CORS configured for local development
- Auto-generated OpenAPI documentation

### 3. Core Modules

#### Hyperspectral Analyzer

**Purpose**: Material identification beyond RGB vision

**Key Classes**:
- `HyperspectralAnalyzer`: Main analysis engine
- Material database with spectral signatures
- Spectral Angle Mapper (SAM) for similarity detection

**Flow**:
```
Image Input → Spectral Decomposition → Database Matching → 
Anomaly Detection → Confidence Scoring → Alert Generation
```

**Performance**:
- 224 spectral bands
- Processing time: ~100ms per analysis
- Detection threshold: 75% confidence

#### Adaptive Lighting Controller

**Purpose**: Subtle illumination adjustment for enhanced vision

**Key Classes**:
- `LightingController`: Main control system
- Zone-based gradient adjustment
- Spectrum mode selection

**Flow**:
```
Detection Event → Light Selection → Brightness Calculation →
Spectrum Optimization → Gradual Adjustment → Validation
```

**Features**:
- 12% subtle increase (imperceptible)
- 2-second adaptation speed
- Multiple spectrum modes (normal, IR-enhanced, hyperspectral-optimized)

#### Wargaming Simulator

**Purpose**: Adversarial AI training for threat prediction

**Key Classes**:
- `RedAI`: Adversarial attacker simulation
- `BlueAI`: Defense system (SCAR-EYE)
- `WargamingSimulator`: Orchestrator

**Flow**:
```
Episode Start → Red-AI Plans Attack → Blue-AI Detects →
Result Evaluation → Learning Update → Next Episode
```

**Tactics Database**:
- Blind spot exploitation
- Material camouflage
- Timing manipulation
- Sensor jamming
- Crowd blending
- Infrastructure hiding
- Acoustic masking

**Performance**:
- Can run 1000+ episodes in seconds
- Blue-AI improves from 60% → 95% detection rate
- Adaptive difficulty scaling

#### Audio Processor

**Purpose**: Spatial sound detection and correlation

**Key Classes**:
- `AudioProcessor`: Main processing engine
- Sound signature database
- TDOA (Time Difference of Arrival) triangulation

**Flow**:
```
Audio Capture → Event Detection → Spatial Triangulation →
Visual Correlation → Action Recommendation → Integration
```

**Capabilities**:
- 8-microphone directional array
- 48kHz sample rate
- 2-meter spatial resolution
- Events: drilling, dragging, breaking glass, metal cutting, digging

### 4. Digital Twin

**Purpose**: Virtual representation of monitored environment

**Key Classes**:
- `DigitalTwin`: Environment manager
- Building and street generation
- Sensor placement optimization

**Features**:
- 1000m × 1000m simulated area
- 0.5m resolution grid
- Multiple data layers:
  - Occupancy (buildings/obstacles)
  - Elevation (height map)
  - Thermal (temperature)
  - Activity (movement)
  - Visibility (camera coverage)
  - Acoustic (sound level)

**Integration**:
- Provides spatial context for all modules
- Enables simulation and training
- Supports visualization

## Data Flow

### Typical Detection Sequence

1. **Initial Detection**:
   - Audio processor detects suspicious sound
   - Triangulates location using TDOA
   - Confidence: 87%

2. **Lighting Enhancement**:
   - System identifies nearby lights
   - Calculates optimal adjustment (12% increase)
   - Applies gradual change over 2 seconds
   - Visual quality improves

3. **Hyperspectral Analysis**:
   - Enhanced camera captures scene
   - Hyperspectral module analyzes materials
   - Detects anomalous spectral signature
   - Confidence increases to 94%

4. **Wargaming Validation**:
   - Pattern compared against known tactics
   - Matches Red-AI tactic #47
   - Confidence confirmed: 94%

5. **Coordinated Response**:
   - Alert generated
   - Cameras focus on location
   - Operator notified
   - System continues monitoring

## Technology Stack

### Backend
- **Python 3.9+**: Core language
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **PyTorch**: Deep learning
- **NumPy**: Numerical computing
- **OpenCV**: Computer vision
- **Librosa**: Audio processing
- **Spectral**: Hyperspectral analysis

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **Three.js**: 3D visualization
- **D3.js**: Data visualization
- **Framer Motion**: Animations
- **Axios**: HTTP client
- **Zustand**: State management

### Infrastructure
- **WebSocket**: Real-time communication
- **YAML**: Configuration
- **SQLAlchemy**: ORM (future)
- **Redis**: Caching (future)

## Scalability Considerations

### Current Architecture
- Single-process deployment
- In-memory data storage
- Synchronous processing with async I/O

### Production Scaling
1. **Horizontal Scaling**:
   - Deploy multiple API workers
   - Load balancer (Nginx/HAProxy)
   - Shared Redis cache

2. **Microservices**:
   - Separate each module into microservice
   - Message queue (RabbitMQ/Kafka)
   - Service mesh (Istio)

3. **Database**:
   - PostgreSQL for structured data
   - MongoDB for sensor data
   - TimescaleDB for time-series

4. **AI Model Serving**:
   - TensorFlow Serving / TorchServe
   - Model versioning
   - A/B testing

5. **Edge Computing**:
   - Deploy lightweight models on edge devices
   - Local processing for low latency
   - Central aggregation and learning

## Security

### Current Implementation
- CORS configuration
- Input validation
- Rate limiting (future)

### Production Requirements
- Authentication (JWT/OAuth2)
- Authorization (RBAC)
- Encryption (TLS/SSL)
- Audit logging
- Intrusion detection
- Data privacy compliance (GDPR)

## Performance Metrics

### Target Performance
- API Response Time: < 100ms (p95)
- Detection Latency: < 2 seconds
- WebSocket Update: 30 FPS
- Wargaming Speed: 1000 episodes/minute
- System Uptime: 99.9%

### Resource Usage (Demo)
- CPU: 45% average
- Memory: 67% average
- Storage: 34% average
- Network: 23% average

## Future Enhancements

1. **ML Model Improvements**:
   - Real hyperspectral CNN models
   - Advanced audio event classification
   - Transfer learning from simulation to reality

2. **Integration**:
   - Real camera/sensor integration
   - Smart city platform APIs
   - Emergency response systems

3. **Analytics**:
   - Predictive analytics dashboard
   - Threat trend analysis
   - Anomaly pattern recognition

4. **Scalability**:
   - Multi-site deployment
   - Federated learning
   - Cloud-native architecture

---

For implementation details, see the code in:
- `backend/` - Backend modules
- `frontend/src/` - Frontend components
- `digital_twin/` - Environment simulation
- `config/` - System configuration
