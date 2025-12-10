# عين الشاهين – ShaheenEye (SCAR-EYE)

**From Predicting Crime… to Predicting Crime Evolution.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)

## 🦅 Overview

ShaheenEye is an intelligent urban security system that combines cutting-edge AI technologies to create a proactive defense system. Instead of merely detecting crimes, it predicts and learns from potential criminal tactics through adversarial simulation.

**🎯 Built for Hackathons | 🚀 Production-Ready Architecture | 💡 Novel AI Approach**

## 🌟 Core Innovations

### 1. Hyperspectral Material Fingerprinting
**"We don't just see colors… we see materials."**

- Goes beyond RGB vision to analyze material composition
- Detects camouflaged objects by their spectral signature
- Identifies suspicious materials (explosives, drugs) hidden in plain sight

### 2. Adaptive Illuminance Response
**"We silently bend the light to see more… without anyone noticing."**

- Intelligent integration with smart street lighting
- Subtly adjusts lighting levels (10-15% increase) to improve camera visibility
- Changes light spectrum to enhance detection without alerting suspects

### 3. Adversarial AI Wargaming
**"Our AI plays against a criminal AI… so it can beat real criminals later."**

- Red-AI simulates criminal tactics in a Digital Twin environment
- Blue-AI (SCAR-EYE) learns to counter novel attack strategies
- Millions of simulation rounds create unprecedented threat detection capabilities

### 4. Audio-Visual Spatial Correlation
**"At night, we hear first… then we see."**

- Directional microphone array for spatial audio detection
- Correlates sound events with visual data in 3D space
- Detects suspicious activities when visual data is insufficient

## 🏗️ Architecture

```
shaheeneye/
├── backend/              # Python backend with AI models
│   ├── api/             # REST API endpoints
│   ├── core/            # Core system logic
│   ├── hyperspectral/   # Hyperspectral analysis
│   ├── lighting/        # Adaptive lighting control
│   ├── wargaming/       # Adversarial simulation
│   └── audio/           # Audio processing
├── frontend/            # React-based demo UI
├── digital_twin/        # 3D environment simulation
└── models/              # Pre-trained AI models

```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- CUDA-capable GPU (recommended)

### Installation (3 Steps)

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install Node dependencies
cd frontend && npm install && cd ..

# 3. Run the system
python run.py
```

**That's it!** Open http://localhost:3000 in your browser.

### For Full Development Setup

**Terminal 1** (Backend):
```bash
python run.py
```

**Terminal 2** (Frontend):
```bash
cd frontend && npm run dev
```

📖 **Need help?** See [QUICKSTART.md](QUICKSTART.md) or [INSTALLATION.md](INSTALLATION.md)

## 🎮 Demo Scenarios

The system includes 4 interactive demo scenarios:

1. **Silent Night** - Adaptive illuminance in action
2. **Sound Before Sight** - Audio-visual correlation
3. **AI vs AI** - Adversarial wargaming simulation
4. **The Message** - Complete system integration

## 📊 Technology Stack

- **AI/ML**: PyTorch, TensorFlow, OpenCV
- **Simulation**: Unity3D/Unreal Engine integration
- **Frontend**: React, Three.js, D3.js
- **Backend**: FastAPI, WebSocket
- **Audio**: librosa, pyaudio
- **Hyperspectral**: Spectral Python

## 🎯 Use Cases

- Urban security monitoring
- Critical infrastructure protection
- Event security management
- Border surveillance
- Smart city integration

## 📂 Project Stats

- **40+** Source and documentation files
- **18** Python modules
- **13** React components
- **9** Comprehensive documentation files
- **8,000+** Lines of code
- **4** Revolutionary innovations

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](QUICKSTART.md) | Get started in 5 minutes |
| [DEMO_GUIDE.md](DEMO_GUIDE.md) | Perfect your demo presentation |
| [INSTALLATION.md](INSTALLATION.md) | Detailed installation guide |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical deep-dive |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Complete API reference |
| [PRESENTATION.md](PRESENTATION.md) | Slide-by-slide outline |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete project overview |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre-demo checklist |

## 🎮 Interactive Features

- ✅ **4 Demo Scenarios**: Full interactive demonstrations
- ✅ **Real-time Dashboard**: Live system monitoring
- ✅ **System Status**: Health and performance metrics
- ✅ **WebSocket Streaming**: Real-time updates
- ✅ **RESTful API**: 12+ endpoints
- ✅ **Auto-generated Docs**: http://localhost:8000/docs

## 🧪 Testing

```bash
# Run automated tests
pytest tests/ -v

# Test API endpoints
curl http://localhost:8000/api/status
```

## 🎯 Demo Flow (5 minutes)

1. **Intro** (30s): Show main page with tagline
2. **Scenario 1** (1m): Silent Night - Adaptive lighting
3. **Scenario 3** (2m): AI vs AI - Adversarial training
4. **Scenario 4** (1.5m): The Message - Full integration
5. **Dashboard** (30s): Show statistics

💡 **Pro tip**: See [DEMO_GUIDE.md](DEMO_GUIDE.md) for detailed presentation flow

## 🔗 API Endpoints

```
GET  /api/status                    # System health
POST /api/hyperspectral/analyze     # Material analysis
POST /api/lighting/adjust           # Lighting control
POST /api/wargaming/start           # Start AI simulation
POST /api/audio/process             # Audio processing
GET  /api/digital-twin/state        # Environment state
```

📖 Full API docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🏆 Why ShaheenEye is Unique

| Feature | Traditional CCTV | Smart Systems | **ShaheenEye** |
|---------|-----------------|---------------|----------------|
| Detection | ✓ | ✓ | ✓ |
| Multi-sensor Fusion | ✗ | ✓ | ✓ |
| Hyperspectral | ✗ | ✗ | ✓ |
| Adversarial AI | ✗ | ✗ | **✓** |
| Subtle Lighting | ✗ | ✗ | **✓** |
| Predicts Evolution | ✗ | ✗ | **✓** |

## 🌍 Target Applications

- 🏛️ Critical Infrastructure
- 🌆 Smart Cities
- 🎉 Event Security
- 🛂 Border Control
- 🏢 Commercial Complexes
- 🚇 Public Transportation

## 🚀 Roadmap

### Phase 1 (Done ✅)
- Core system implementation
- 4 demo scenarios
- Complete documentation
- Testing suite

### Phase 2 (Future)
- Real sensor integration
- Production ML models
- Cloud deployment
- Mobile app

### Phase 3 (Vision)
- Multi-site coordination
- City-wide deployment
- International expansion

## 🤝 Contributing

This is a hackathon project, but contributions are welcome:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 👥 Team

ShaheenEye Development Team

## 🙏 Acknowledgments

- Hackathon organizers
- Open source communities
- AI/ML research community
- Everyone who supported this project

## 📞 Contact

- **GitHub**: [Repository URL]
- **Demo**: http://localhost:3000
- **API**: http://localhost:8000/docs

---

## 💬 Final Quote

*"We don't just protect the neighborhood… we learn from every adversarial attempt, even if it's just a simulation."*

**From predicting crime to predicting crime evolution.** 🦅

---

**⭐ If you like this project, please star it!**
