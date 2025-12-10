"""
Audio-Visual Spatial Correlation
"At night, we hear first… then we see."
"""

import numpy as np
from typing import Dict, Any, List, Tuple
from loguru import logger
import asyncio
from datetime import datetime


class AudioProcessor:
    """
    Processes audio from directional microphone array
    Correlates sound events with spatial locations
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config['audio']
        self.array_size = self.config['microphone_array_size']
        self.sample_rate = self.config['sample_rate']
        self.detection_threshold = self.config['detection_threshold']
        self.spatial_resolution = self.config['spatial_resolution']
        self.events_of_interest = self.config['events_of_interest']
        
        self.active = self.config['enabled']
        self.detected_events = []
        self.sound_signatures = self._load_sound_signatures()
        
        logger.info("AudioProcessor initialized")
    
    def _load_sound_signatures(self) -> Dict[str, np.ndarray]:
        """Load acoustic signatures for events of interest"""
        # Simulated acoustic signatures
        # In production, these would be real spectrograms
        
        signatures = {}
        for event in self.events_of_interest:
            # Create unique frequency pattern for each event
            freq_pattern = np.random.random(100)
            signatures[event] = freq_pattern
        
        logger.info(f"Loaded {len(signatures)} sound signatures")
        return signatures
    
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process audio data from microphone array
        
        Args:
            data: Dictionary containing:
                - audio_samples: Raw audio data
                - microphone_positions: Array of mic positions
                - timestamp: When audio was captured
        
        Returns:
            Processing results with spatial correlation
        """
        if not self.active:
            return {'status': 'disabled'}
        
        # Simulate processing time
        await asyncio.sleep(0.05)
        
        # Simulate audio event detection
        detected_event = np.random.choice(
            self.events_of_interest + ['background_noise'],
            p=[0.1] * len(self.events_of_interest) + [0.5]
        )
        
        if detected_event == 'background_noise':
            return {
                'status': 'processed',
                'events_detected': [],
                'confidence': 0.0
            }
        
        # Calculate spatial location using time difference of arrival (TDOA)
        estimated_location = self._triangulate_sound_source(data)
        
        # Calculate confidence
        confidence = np.random.uniform(self.detection_threshold, 1.0)
        
        event_data = {
            'event_type': detected_event,
            'confidence': float(confidence),
            'estimated_location': estimated_location,
            'timestamp': datetime.now().isoformat(),
            'duration': np.random.uniform(0.5, 5.0),  # seconds
            'intensity': np.random.uniform(0.5, 1.0),
            'frequency_range': [200, 4000]  # Hz
        }
        
        self.detected_events.append(event_data)
        
        logger.warning(f"🔊 Audio event detected: {detected_event} at {estimated_location}")
        
        return {
            'status': 'processed',
            'events_detected': [event_data],
            'spatial_correlation': True,
            'recommended_action': self._recommend_action(event_data)
        }
    
    def _triangulate_sound_source(self, data: Dict[str, Any]) -> List[float]:
        """
        Triangulate sound source position using TDOA
        Time Difference of Arrival from multiple microphones
        """
        # Simulate triangulation
        # In production, this would use actual TDOA algorithms
        
        # Random position in monitored area
        location = [
            np.random.uniform(0, 1000),
            np.random.uniform(0, 1000),
            0  # Ground level
        ]
        
        return location
    
    def _recommend_action(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend action based on detected event"""
        event_type = event['event_type']
        location = event['estimated_location']
        confidence = event['confidence']
        
        # Determine severity
        severity = 'low'
        if event_type in ['metal_cutting', 'drilling', 'breaking_glass']:
            severity = 'high'
        elif event_type in ['dragging', 'digging']:
            severity = 'medium'
        
        actions = []
        
        if severity in ['medium', 'high']:
            actions.append({
                'type': 'camera_focus',
                'target': location,
                'reason': f'Audio event: {event_type}'
            })
            
            actions.append({
                'type': 'lighting_adjustment',
                'target': location,
                'mode': 'subtle_increase',
                'reason': 'enhance_visual_capture'
            })
        
        if severity == 'high':
            actions.append({
                'type': 'alert_operator',
                'priority': 'high',
                'message': f'Suspicious activity detected: {event_type}'
            })
        
        return {
            'severity': severity,
            'priority': confidence,
            'actions': actions
        }
    
    async def create_acoustic_heatmap(
        self,
        time_window: float = 60.0
    ) -> Dict[str, Any]:
        """
        Create acoustic activity heatmap for recent time window
        
        Args:
            time_window: Time window in seconds
        
        Returns:
            Heatmap data
        """
        # Filter recent events
        recent_events = self.detected_events[-20:]  # Last 20 events
        
        if not recent_events:
            return {
                'status': 'no_events',
                'heatmap': None
            }
        
        # Create grid for heatmap
        grid_size = 50
        heatmap = np.zeros((grid_size, grid_size))
        
        for event in recent_events:
            location = event['estimated_location']
            confidence = event['confidence']
            
            # Map to grid coordinates
            x = int((location[0] / 1000) * grid_size)
            y = int((location[1] / 1000) * grid_size)
            
            # Ensure within bounds
            x = max(0, min(grid_size - 1, x))
            y = max(0, min(grid_size - 1, y))
            
            # Add to heatmap with gaussian blur effect
            for dx in range(-2, 3):
                for dy in range(-2, 3):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < grid_size and 0 <= ny < grid_size:
                        distance = np.sqrt(dx**2 + dy**2)
                        weight = np.exp(-distance / 2) * confidence
                        heatmap[nx, ny] += weight
        
        # Normalize
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()
        
        return {
            'status': 'generated',
            'grid_size': grid_size,
            'heatmap': heatmap.tolist(),
            'events_analyzed': len(recent_events),
            'hotspots': self._identify_hotspots(heatmap)
        }
    
    def _identify_hotspots(self, heatmap: np.ndarray) -> List[Dict[str, Any]]:
        """Identify acoustic hotspots from heatmap"""
        threshold = 0.6
        
        hotspots = []
        y_indices, x_indices = np.where(heatmap > threshold)
        
        for x, y in zip(x_indices, y_indices):
            hotspots.append({
                'grid_position': [int(x), int(y)],
                'real_position': [
                    float(x / heatmap.shape[0] * 1000),
                    float(y / heatmap.shape[1] * 1000)
                ],
                'intensity': float(heatmap[y, x])
            })
        
        return hotspots[:10]  # Return top 10
    
    async def correlate_with_visual(
        self,
        audio_event: Dict[str, Any],
        visual_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Correlate audio event with visual data
        
        This is the key feature: combining "hearing" with "seeing"
        """
        audio_location = audio_event['estimated_location']
        audio_time = audio_event['timestamp']
        
        # Calculate spatial correlation
        visual_objects = visual_data.get('detected_objects', [])
        
        correlations = []
        for obj in visual_objects:
            obj_location = obj.get('location', [0, 0, 0])
            
            # Calculate distance
            distance = np.sqrt(
                (audio_location[0] - obj_location[0])**2 +
                (audio_location[1] - obj_location[1])**2
            )
            
            # Time correlation (simplified)
            time_match = 1.0  # In production, compare actual timestamps
            
            # Spatial correlation
            spatial_match = max(0, 1 - (distance / 50))  # 50m threshold
            
            # Combined correlation
            correlation_score = (spatial_match + time_match) / 2
            
            if correlation_score > 0.5:
                correlations.append({
                    'object': obj,
                    'correlation_score': correlation_score,
                    'distance': distance,
                    'confidence': correlation_score * audio_event['confidence']
                })
        
        # Sort by correlation score
        correlations.sort(key=lambda x: x['correlation_score'], reverse=True)
        
        logger.info(f"Audio-visual correlation: {len(correlations)} matches found")
        
        return {
            'status': 'correlated',
            'audio_event': audio_event,
            'correlations': correlations[:5],  # Top 5
            'high_confidence_match': len(correlations) > 0 and correlations[0]['correlation_score'] > 0.8
        }
    
    def is_active(self) -> bool:
        """Check if audio processing is active"""
        return self.active
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get audio processing statistics"""
        event_types = {}
        for event in self.detected_events:
            event_type = event['event_type']
            event_types[event_type] = event_types.get(event_type, 0) + 1
        
        return {
            'total_events': len(self.detected_events),
            'event_types': event_types,
            'microphone_array_size': self.array_size,
            'spatial_resolution': self.spatial_resolution,
            'recent_events': self.detected_events[-10:]
        }
