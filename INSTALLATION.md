# ShaheenEye Installation Guide

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows with WSL2
- **Python**: 3.9 or higher
- **Node.js**: 16 or higher
- **RAM**: 8GB minimum, 16GB recommended
- **GPU**: CUDA-capable GPU recommended (for AI models)

### Required Software
- Python 3.9+
- pip (Python package manager)
- Node.js & npm
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd workspace
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Create Necessary Directories

```bash
mkdir -p logs data/{audio,video,hyperspectral}
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

### 4. Configuration

The system uses `config/config.yaml` for configuration. Default settings are already provided, but you can customize:

- API host and port
- Digital twin parameters
- Sensor configurations
- AI model parameters

### 5. Running the System

#### Option 1: Run Complete System

```bash
# Make sure you're in the root directory with venv activated
python run.py
```

This will start the backend API server on `http://localhost:8000`

#### Option 2: Run Frontend Separately (for development)

In a separate terminal:

```bash
cd frontend
npm run dev
```

This will start the frontend on `http://localhost:3000`

### 6. Access the Application

Open your browser and navigate to:

- **Demo Interface**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Status**: http://localhost:8000/api/status

## Verification

### Test Backend

```bash
curl http://localhost:8000/api/status
```

Expected response:
```json
{
  "status": "operational",
  "modules": {
    "hyperspectral": true,
    "lighting": true,
    "wargaming": true,
    "audio": true
  }
}
```

### Test Frontend

Open http://localhost:3000 in your browser. You should see the ShaheenEye dashboard.

## Troubleshooting

### Port Already in Use

If port 8000 or 3000 is already in use:

**Backend**: Edit `config/config.yaml` and change the port
```yaml
api:
  port: 8080  # Change to your preferred port
```

**Frontend**: Edit `frontend/vite.config.js`
```javascript
server: {
  port: 3001  // Change to your preferred port
}
```

### Python Dependencies Issues

If you encounter issues installing dependencies:

```bash
# Try installing with --no-cache-dir
pip install --no-cache-dir -r requirements.txt

# Or install key packages individually
pip install fastapi uvicorn torch numpy opencv-python
```

### Node Modules Issues

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### GPU/CUDA Not Available

The system will work without GPU, but performance may be slower. If you want to use GPU:

1. Install CUDA Toolkit (version 11.8 or compatible)
2. Install PyTorch with CUDA support:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## Development Mode

### Backend Hot Reload

The backend automatically reloads when you save Python files (uvicorn reload mode).

### Frontend Hot Reload

```bash
cd frontend
npm run dev
```

Vite will automatically reload the browser when you save changes.

## Production Deployment

### Backend

```bash
# Use production ASGI server
pip install gunicorn
gunicorn backend.api.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx or similar
```

## Support

For issues or questions, please refer to:
- API Documentation: http://localhost:8000/docs
- README.md for project overview
- Check logs in `logs/shaheeneye.log`

## Next Steps

1. Explore the Demo Scenarios
2. Review the System Dashboard
3. Check System Status
4. Experiment with API endpoints
5. Review the code and customize for your needs

---

**Note**: This is a hackathon demonstration system. For production deployment, additional security, optimization, and testing are recommended.
