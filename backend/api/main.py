"""
ShaheenEye API - Main FastAPI Application
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
import asyncio
from datetime import datetime
import yaml
from pathlib import Path

# Import core modules
from backend.core.system_manager import SystemManager
from backend.hyperspectral.analyzer import HyperspectralAnalyzer
from backend.lighting.controller import LightingController
from backend.wargaming.simulator import WargamingSimulator
from backend.audio.processor import AudioProcessor

# Load configuration
config_path = Path("config/config.yaml")
with open(config_path, 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

# Initialize FastAPI app
app = FastAPI(
    title="ShaheenEye API",
    description="Urban Intelligence Security System",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config['api']['cors_origins'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize system components
system_manager = SystemManager(config)
hyperspectral = HyperspectralAnalyzer(config)
lighting = LightingController(config)
wargaming = WargamingSimulator(config)
audio = AudioProcessor(config)

# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "system": "ShaheenEye (SCAR-EYE)",
        "tagline": "From Predicting Crime... to Predicting Crime Evolution",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    """Get system status"""
    return {
        "status": "operational",
        "modules": {
            "hyperspectral": hyperspectral.is_active(),
            "lighting": lighting.is_active(),
            "wargaming": wargaming.is_active(),
            "audio": audio.is_active()
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/hyperspectral/analyze")
async def analyze_hyperspectral(data: dict):
    """Analyze hyperspectral data"""
    result = await hyperspectral.analyze(data)
    return result

@app.post("/api/lighting/adjust")
async def adjust_lighting(data: dict):
    """Adjust lighting parameters"""
    result = await lighting.adjust(data)
    return result

@app.post("/api/wargaming/start")
async def start_wargaming(config_data: dict):
    """Start adversarial wargaming simulation"""
    result = await wargaming.start_simulation(config_data)
    return result

@app.get("/api/wargaming/stats")
async def get_wargaming_stats():
    """Get wargaming statistics"""
    return await wargaming.get_stats()

@app.post("/api/audio/process")
async def process_audio(data: dict):
    """Process audio data"""
    result = await audio.process(data)
    return result

@app.get("/api/digital-twin/state")
async def get_digital_twin_state():
    """Get current digital twin state"""
    return await system_manager.get_digital_twin_state()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Receive data from client
            data = await websocket.receive_json()
            
            # Process based on message type
            if data.get('type') == 'ping':
                await websocket.send_json({'type': 'pong', 'timestamp': datetime.now().isoformat()})
            
            elif data.get('type') == 'subscribe':
                # Subscribe to real-time updates
                await websocket.send_json({
                    'type': 'subscribed',
                    'channels': data.get('channels', [])
                })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.on_event("startup")
async def startup_event():
    """Initialize system on startup"""
    print("🦅 Initializing ShaheenEye components...")
    await system_manager.initialize()
    print("✓ System ready")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🦅 Shutting down ShaheenEye...")
    await system_manager.shutdown()
    print("✓ Shutdown complete")
