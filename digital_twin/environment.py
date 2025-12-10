"""
Digital Twin - Virtual Environment Representation
3D simulation of the monitored urban area
"""

import numpy as np
from typing import Dict, Any, List, Tuple
from datetime import datetime
import json


class DigitalTwin:
    """
    Digital Twin of the monitored urban environment
    Provides spatial awareness and simulation capabilities
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.map_size = config['digital_twin']['map_size']
        self.resolution = config['digital_twin']['resolution']
        self.update_frequency = config['digital_twin']['update_frequency']
        
        # Grid representation
        self.grid_size = [
            int(self.map_size[0] / self.resolution),
            int(self.map_size[1] / self.resolution)
        ]
        
        # Environment layers
        self.layers = {
            'occupancy': np.zeros(self.grid_size),  # Building/obstacle map
            'elevation': np.zeros(self.grid_size),  # Height map
            'thermal': np.ones(self.grid_size) * 20,  # Temperature
            'activity': np.zeros(self.grid_size),  # Activity level
            'visibility': np.ones(self.grid_size),  # Camera coverage
            'acoustic': np.zeros(self.grid_size),  # Sound level
        }
        
        # Infrastructure
        self.buildings = []
        self.streets = []
        self.cameras = []
        self.lights = []
        self.microphones = []
        
        # Dynamic entities
        self.entities = []
        
        self._initialize_environment()
    
    def _initialize_environment(self):
        """Initialize the urban environment"""
        # Create building blocks
        self._create_buildings()
        
        # Create street network
        self._create_streets()
        
        print(f"✓ Digital Twin initialized: {self.grid_size[0]}x{self.grid_size[1]} grid")
    
    def _create_buildings(self):
        """Generate building structures"""
        num_buildings = 15
        
        for i in range(num_buildings):
            # Random building parameters
            center_x = np.random.uniform(100, self.map_size[0] - 100)
            center_y = np.random.uniform(100, self.map_size[1] - 100)
            width = np.random.uniform(20, 60)
            height = np.random.uniform(20, 60)
            floors = np.random.randint(2, 8)
            
            building = {
                'id': f'BLDG-{i+1:02d}',
                'center': [center_x, center_y],
                'dimensions': [width, height],
                'floors': floors,
                'height_m': floors * 3.5,
                'type': np.random.choice(['residential', 'commercial', 'mixed'])
            }
            
            self.buildings.append(building)
            
            # Update occupancy layer
            self._mark_building_on_grid(building)
    
    def _mark_building_on_grid(self, building: Dict[str, Any]):
        """Mark building footprint on occupancy grid"""
        center = building['center']
        dims = building['dimensions']
        
        # Convert to grid coordinates
        x_start = int((center[0] - dims[0]/2) / self.resolution)
        x_end = int((center[0] + dims[0]/2) / self.resolution)
        y_start = int((center[1] - dims[1]/2) / self.resolution)
        y_end = int((center[1] + dims[1]/2) / self.resolution)
        
        # Clip to grid bounds
        x_start = max(0, min(self.grid_size[0] - 1, x_start))
        x_end = max(0, min(self.grid_size[0] - 1, x_end))
        y_start = max(0, min(self.grid_size[1] - 1, y_start))
        y_end = max(0, min(self.grid_size[1] - 1, y_end))
        
        # Mark as occupied
        self.layers['occupancy'][x_start:x_end, y_start:y_end] = 1
        self.layers['elevation'][x_start:x_end, y_start:y_end] = building['height_m']
    
    def _create_streets(self):
        """Generate street network"""
        # Main streets (grid pattern)
        num_main_streets = 4
        
        for i in range(num_main_streets):
            # Vertical streets
            x = (i + 1) * (self.map_size[0] / (num_main_streets + 1))
            street_v = {
                'id': f'STREET-V{i+1}',
                'type': 'main',
                'path': [
                    [x, 0],
                    [x, self.map_size[1]]
                ],
                'width': 12
            }
            self.streets.append(street_v)
            
            # Horizontal streets
            y = (i + 1) * (self.map_size[1] / (num_main_streets + 1))
            street_h = {
                'id': f'STREET-H{i+1}',
                'type': 'main',
                'path': [
                    [0, y],
                    [self.map_size[0], y]
                ],
                'width': 12
            }
            self.streets.append(street_h)
    
    def add_camera(self, camera: Dict[str, Any]):
        """Add camera to digital twin"""
        self.cameras.append(camera)
        self._update_visibility_layer()
    
    def add_light(self, light: Dict[str, Any]):
        """Add light to digital twin"""
        self.lights.append(light)
    
    def add_microphone(self, microphone: Dict[str, Any]):
        """Add microphone to digital twin"""
        self.microphones.append(microphone)
    
    def _update_visibility_layer(self):
        """Update camera coverage map"""
        # Reset visibility
        self.layers['visibility'] = np.zeros(self.grid_size)
        
        for camera in self.cameras:
            pos = camera['position']
            fov = camera.get('fov', 90)
            range_m = camera.get('range', 150)
            
            # Simple circular coverage model
            # In production, this would account for FOV and occlusion
            grid_x = int(pos[0] / self.resolution)
            grid_y = int(pos[1] / self.resolution)
            grid_range = int(range_m / self.resolution)
            
            for dx in range(-grid_range, grid_range):
                for dy in range(-grid_range, grid_range):
                    x, y = grid_x + dx, grid_y + dy
                    if 0 <= x < self.grid_size[0] and 0 <= y < self.grid_size[1]:
                        distance = np.sqrt(dx**2 + dy**2) * self.resolution
                        if distance <= range_m:
                            # Coverage decreases with distance
                            coverage = 1.0 - (distance / range_m) * 0.5
                            self.layers['visibility'][x, y] = max(
                                self.layers['visibility'][x, y],
                                coverage
                            )
    
    def add_entity(self, entity: Dict[str, Any]):
        """Add dynamic entity (person, vehicle, etc.)"""
        entity['id'] = f"ENT-{len(self.entities):05d}"
        entity['created_at'] = datetime.now().isoformat()
        self.entities.append(entity)
    
    def update_entity(self, entity_id: str, updates: Dict[str, Any]):
        """Update entity properties"""
        for entity in self.entities:
            if entity['id'] == entity_id:
                entity.update(updates)
                entity['updated_at'] = datetime.now().isoformat()
                break
    
    def get_area_info(self, center: List[float], radius: float) -> Dict[str, Any]:
        """Get information about a specific area"""
        # Convert to grid coordinates
        grid_x = int(center[0] / self.resolution)
        grid_y = int(center[1] / self.resolution)
        grid_radius = int(radius / self.resolution)
        
        # Extract area data
        x_start = max(0, grid_x - grid_radius)
        x_end = min(self.grid_size[0], grid_x + grid_radius)
        y_start = max(0, grid_y - grid_radius)
        y_end = min(self.grid_size[1], grid_y + grid_radius)
        
        area_occupancy = self.layers['occupancy'][x_start:x_end, y_start:y_end]
        area_visibility = self.layers['visibility'][x_start:x_end, y_start:y_end]
        area_activity = self.layers['activity'][x_start:x_end, y_start:y_end]
        
        return {
            'center': center,
            'radius': radius,
            'occupancy_rate': float(np.mean(area_occupancy)),
            'visibility_coverage': float(np.mean(area_visibility)),
            'activity_level': float(np.mean(area_activity)),
            'buildings_nearby': self._count_buildings_in_area(center, radius),
            'cameras_nearby': self._count_cameras_in_area(center, radius),
            'lights_nearby': self._count_lights_in_area(center, radius)
        }
    
    def _count_buildings_in_area(self, center: List[float], radius: float) -> int:
        """Count buildings within radius"""
        count = 0
        for building in self.buildings:
            b_center = building['center']
            distance = np.sqrt(
                (b_center[0] - center[0])**2 +
                (b_center[1] - center[1])**2
            )
            if distance <= radius:
                count += 1
        return count
    
    def _count_cameras_in_area(self, center: List[float], radius: float) -> int:
        """Count cameras within radius"""
        count = 0
        for camera in self.cameras:
            c_pos = camera['position']
            distance = np.sqrt(
                (c_pos[0] - center[0])**2 +
                (c_pos[1] - center[1])**2
            )
            if distance <= radius:
                count += 1
        return count
    
    def _count_lights_in_area(self, center: List[float], radius: float) -> int:
        """Count lights within radius"""
        count = 0
        for light in self.lights:
            l_pos = light['position']
            distance = np.sqrt(
                (l_pos[0] - center[0])**2 +
                (l_pos[1] - center[1])**2
            )
            if distance <= radius:
                count += 1
        return count
    
    def export_for_visualization(self) -> Dict[str, Any]:
        """Export data for 3D visualization"""
        return {
            'map_size': self.map_size,
            'resolution': self.resolution,
            'buildings': self.buildings,
            'streets': self.streets,
            'cameras': self.cameras,
            'lights': self.lights,
            'microphones': self.microphones,
            'entities': self.entities,
            'layers': {
                'occupancy': self.layers['occupancy'].tolist(),
                'visibility': self.layers['visibility'].tolist(),
                'activity': self.layers['activity'].tolist()
            }
        }
    
    def simulate_time_step(self, delta_time: float = 1.0):
        """Simulate one time step"""
        # Update entity positions
        for entity in self.entities:
            if 'velocity' in entity:
                pos = entity['position']
                vel = entity['velocity']
                entity['position'] = [
                    pos[0] + vel[0] * delta_time,
                    pos[1] + vel[1] * delta_time,
                    pos[2] + vel[2] * delta_time if len(pos) > 2 else 0
                ]
        
        # Update activity layer based on entities
        self.layers['activity'] *= 0.95  # Decay
        for entity in self.entities:
            pos = entity['position']
            grid_x = int(pos[0] / self.resolution)
            grid_y = int(pos[1] / self.resolution)
            if 0 <= grid_x < self.grid_size[0] and 0 <= grid_y < self.grid_size[1]:
                self.layers['activity'][grid_x, grid_y] = min(1.0, self.layers['activity'][grid_x, grid_y] + 0.1)
