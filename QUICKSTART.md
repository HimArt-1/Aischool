# ShaheenEye - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Run the System

**Option A: One Command (Backend Only)**
```bash
python run.py
```

**Option B: Full Stack Development**

Terminal 1 (Backend):
```bash
python run.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Step 3: Access the Application

🌐 **Open in Browser**: http://localhost:3000

## 📋 What to Do First

### 1. Explore Demo Scenarios (Recommended)

Navigate to the **Demo Scenarios** page and try each of the four core innovations:

#### 🌙 Silent Night
- Click the scenario card
- Press **Play** button
- Watch as lighting increases subtly (12%) to improve detection
- **Key Insight**: Imperceptible to humans, dramatically improves camera quality

#### 🔊 Sound Before Sight
- Click the scenario card
- Press **Play** button
- Observe audio detection → spatial triangulation → visual correlation
- **Key Insight**: System hears before it sees, especially useful at night

#### ⚔️ AI vs AI
- Click the scenario card
- Press **Play** button
- Watch thousands of simulated battles between Red-AI and Blue-AI
- **Key Insight**: System learns from simulated adversaries, predicting tactic evolution

#### 💬 The Message
- Click the scenario card
- Press **Play** button
- See all four systems working together in harmony
- **Key Insight**: Integrated intelligence, not separate systems

### 2. View Dashboard

Navigate to **Dashboard** to see:
- Real-time system statistics
- Active cameras, lights, and microphones
- Recent events and alerts
- Wargaming AI performance metrics

### 3. Check System Status

Navigate to **System Status** to monitor:
- Module health (Hyperspectral, Lighting, Audio, Wargaming)
- Resource usage (CPU, Memory, Storage, Network)
- API endpoint status
- System information

## 🎯 For Hackathon Judges

### Quick Demo Path (5 minutes)

1. **Start**: Show the main page with tagline
   > "From Predicting Crime... to Predicting Crime Evolution"

2. **Scenario 1** (1 min): Silent Night
   - Emphasize the 12% subtle increase
   - Show detection quality improvement

3. **Scenario 3** (2 min): AI vs AI
   - Let it run for 30-60 seconds
   - Highlight the learning curve
   - Explain adversarial training concept

4. **Scenario 4** (1.5 min): The Message
   - Show complete integration
   - Emphasize multi-sensor fusion

5. **Dashboard** (30 sec): Show statistics
   - 95% coverage
   - 87% detection rate
   - 15,000+ training episodes

### Key Talking Points

✨ **Innovation 1**: Hyperspectral Material Fingerprinting
- "We see materials, not just colors"
- Detects camouflaged threats

✨ **Innovation 2**: Adaptive Illuminance Response
- "We silently bend light"
- 12% increase = imperceptible but effective

✨ **Innovation 3**: Adversarial AI Wargaming
- "Our AI plays against a criminal AI"
- Learns from millions of simulated attacks
- Predicts tactic evolution

✨ **Innovation 4**: Audio-Visual Spatial Correlation
- "At night, we hear first... then we see"
- Multi-sensor fusion
- Spatial triangulation

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is available
lsof -i :8000

# Try different port in config/config.yaml
```

### Frontend won't start
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "Module not found" errors
```bash
# Reinstall Python dependencies
pip install --force-reinstall -r requirements.txt
```

## 📚 Next Steps

After the quick start:

1. **Read the Architecture** → `ARCHITECTURE.md`
2. **Explore the API** → `API_DOCUMENTATION.md`
3. **Follow Demo Guide** → `DEMO_GUIDE.md`
4. **Check Installation Details** → `INSTALLATION.md`

## 🎬 Recording a Demo Video

Tips for recording:

1. **Clear browser cache** before recording
2. **Use incognito mode** for clean UI
3. **Record at 1920x1080** resolution
4. **Enable animations** - they make it look good
5. **Prepare your script** - use `DEMO_GUIDE.md`

## 🧪 Testing

Run automated tests:

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest tests/ -v
```

## 📞 Getting Help

- **Logs**: Check `logs/shaheeneye.log`
- **API Docs**: http://localhost:8000/docs
- **Interactive API**: Test endpoints in browser
- **Code**: All modules well-documented

## 🎉 Have Fun!

ShaheenEye represents the future of urban security. Enjoy exploring the system!

---

**Remember**: This is a demonstration system. The scenarios are simulated for hackathon purposes, but all core technologies and algorithms are real and functional.
