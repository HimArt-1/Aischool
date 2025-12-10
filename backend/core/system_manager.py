"""
System Manager - Orchestrates all ShaheenEye components
"""

import asyncio
from typing import Dict, Any
from datetime import datetime
from loguru import logger
import numpy as np


class SystemManager:
    """Central system manager for ShaheenEye"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.digital_twin_state = {
            'map_size': config['digital_twin']['map_size'],
            'resolution': config['digital_twin']['resolution'],
            'cameras': [],
            'lights': [],
            'microphones': [],
            'events': [],
            'alerts': []
        }
        self.is_initialized = False
        logger.info("SystemManager initialized")
    
    async def initialize(self):
        """Initialize all system components"""
        logger.info("Initializing system components...")
        
        # Initialize digital twin
        await self._init_digital_twin()
        
        # Initialize camera network
        await self._init_cameras()
        
        # Initialize lighting network
        await self._init_lighting()
        
        # Initialize microphone array
        await self._init_microphones()
        
        self.is_initialized = True
        logger.info("✓ All components initialized successfully")
    
    async def _init_digital_twin(self):
        """Initialize digital twin environment"""
        # Create a simulated urban area
        map_size = self.config['digital_twin']['map_size']
        resolution = self.config['digital_twin']['resolution']
        
        # Generate grid
        grid_x = int(map_size[0] / resolution)
        grid_y = int(map_size[1] / resolution)
        
        self.digital_twin_state['grid'] = {
            'size': [grid_x, grid_y],
            'resolution': resolution,
            'occupancy': np.zeros((grid_x, grid_y)),
            'thermal': np.random.normal(20, 2, (grid_x, grid_y)),  # Temperature map
            'activity': np.zeros((grid_x, grid_y))
        }
        
        logger.info(f"Digital Twin initialized: {grid_x}x{grid_y} grid")
    
    async def _init_cameras(self):
        """Initialize camera network"""
        # Simulate 12 cameras in strategic positions
        num_cameras = 12
        map_size = self.config['digital_twin']['map_size']
        
        cameras = []
        for i in range(num_cameras):
            angle = (360 / num_cameras) * i
            radius = min(map_size) * 0.4
            
            camera = {
                'id': f'CAM-{i+1:02d}',
                'position': [
                    map_size[0]/2 + radius * np.cos(np.radians(angle)),
                    map_size[1]/2 + radius * np.sin(np.radians(angle)),
                    12.0  # 12 meters height
                ],
                'orientation': angle + 180,
                'fov': 90,  # Field of view
                'range': 150,  # meters
                'status': 'active',
                'capabilities': ['rgb', 'hyperspectral', 'thermal']
            }
            cameras.append(camera)
        
        self.digital_twin_state['cameras'] = cameras
        logger.info(f"Camera network initialized: {num_cameras} cameras")
    
    async def _init_lighting(self):
        """Initialize smart lighting network"""
        # Simulate 24 smart light poles
        num_lights = 24
        map_size = self.config['digital_twin']['map_size']
        
        lights = []
        for i in range(num_lights):
            angle = (360 / num_lights) * i
            radius = min(map_size) * 0.35
            
            light = {
                'id': f'LIGHT-{i+1:02d}',
                'position': [
                    map_size[0]/2 + radius * np.cos(np.radians(angle)),
                    map_size[1]/2 + radius * np.sin(np.radians(angle)),
                    8.0  # 8 meters height
                ],
                'brightness': 100,  # percentage
                'spectrum': 'normal',
                'status': 'active',
                'last_adjustment': None
            }
            lights.append(light)
        
        self.digital_twin_state['lights'] = lights
        logger.info(f"Lighting network initialized: {num_lights} lights")
    
    async def _init_microphones(self):
        """Initialize microphone array"""
        num_mics = self.config['audio']['microphone_array_size']
        map_size = self.config['digital_twin']['map_size']
        
        microphones = []
        for i in range(num_mics):
            angle = (360 / num_mics) * i
            radius = min(map_size) * 0.3
            
            mic = {
                'id': f'MIC-{i+1:02d}',
                'position': [
                    map_size[0]/2 + radius * np.cos(np.radians(angle)),
                    map_size[1]/2 + radius * np.sin(np.radians(angle)),
                    6.0  # 6 meters height
                ],
                'sensitivity': 0.8,
                'status': 'active',
                'last_detection': None
            }
            microphones.append(mic)
        
        self.digital_twin_state['microphones'] = microphones
        logger.info(f"Microphone array initialized: {num_mics} microphones")
    
    async def get_digital_twin_state(self) -> Dict[str, Any]:
        """Get current digital twin state"""
        return {
            'timestamp': datetime.now().isoformat(),
            'cameras': len(self.digital_twin_state['cameras']),
            'lights': len(self.digital_twin_state['lights']),
            'microphones': len(self.digital_twin_state['microphones']),
            'active_events': len(self.digital_twin_state['events']),
            'active_alerts': len(self.digital_twin_state['alerts']),
            'system_health': 'optimal',
            'coverage': 0.95  # 95% area coverage
        }
    
    async def add_event(self, event: Dict[str, Any]):
        """Add a new event to the system"""
        event['timestamp'] = datetime.now().isoformat()
        event['id'] = f"EVT-{len(self.digital_twin_state['events']):05d}"
        self.digital_twin_state['events'].append(event)
        logger.info(f"Event added: {event['id']} - {event.get('type', 'unknown')}")
    
    async def create_alert(self, alert: Dict[str, Any]):
        """Create a new alert"""
        alert['timestamp'] = datetime.now().isoformat()
        alert['id'] = f"ALT-{len(self.digital_twin_state['alerts']):05d}"
        self.digital_twin_state['alerts'].append(alert)
        logger.warning(f"Alert created: {alert['id']} - {alert.get('level', 'unknown')}")
    
    async def shutdown(self):
        """Shutdown system gracefully"""
        logger.info("Shutting down system components...")
        self.is_initialized = False
        logger.info("✓ System shutdown complete")
