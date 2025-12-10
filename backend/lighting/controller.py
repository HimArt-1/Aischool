"""
Adaptive Illuminance Response
"We silently bend the light to see more… without anyone noticing."
"""

import numpy as np
from typing import Dict, Any, List
from loguru import logger
import asyncio
from datetime import datetime


class LightingController:
    """
    Controls smart street lighting to adaptively enhance camera visibility
    without alerting potential threats.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config['lighting']
        self.subtle_increase = self.config['subtle_increase']
        self.adaptation_speed = self.config['adaptation_speed']
        self.spectrum_modes = self.config['spectrum_modes']
        
        self.active = self.config['enabled']
        self.light_states = {}
        self.adjustment_history = []
        
        logger.info("LightingController initialized")
    
    async def adjust(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adjust lighting based on detection needs
        
        Args:
            data: Dictionary containing:
                - light_ids: List of light IDs to adjust
                - target_position: [x, y] coordinates
                - reason: Why adjustment is needed
                - priority: low, medium, high
        
        Returns:
            Adjustment results
        """
        if not self.active:
            return {'status': 'disabled'}
        
        light_ids = data.get('light_ids', [])
        target_position = data.get('target_position', [0, 0])
        reason = data.get('reason', 'unknown')
        priority = data.get('priority', 'medium')
        
        adjustments = []
        
        for light_id in light_ids:
            adjustment = await self._adjust_single_light(
                light_id,
                target_position,
                reason,
                priority
            )
            adjustments.append(adjustment)
        
        # Log the adjustment
        self.adjustment_history.append({
            'timestamp': datetime.now().isoformat(),
            'target': target_position,
            'reason': reason,
            'lights_adjusted': len(light_ids),
            'priority': priority
        })
        
        logger.info(f"✨ Lighting adjusted: {len(light_ids)} lights, reason: {reason}")
        
        return {
            'status': 'adjusted',
            'adjustments': adjustments,
            'adaptation_time': self.adaptation_speed,
            'subtle': True
        }
    
    async def _adjust_single_light(
        self,
        light_id: str,
        target_position: List[float],
        reason: str,
        priority: str
    ) -> Dict[str, Any]:
        """Adjust a single light"""
        
        # Get current light state
        current_state = self.light_states.get(light_id, {
            'brightness': 100,
            'spectrum': 'normal'
        })
        
        # Calculate new brightness
        if priority == 'high':
            increase_factor = self.subtle_increase * 1.5
        elif priority == 'low':
            increase_factor = self.subtle_increase * 0.5
        else:
            increase_factor = self.subtle_increase
        
        new_brightness = min(100, current_state['brightness'] * (1 + increase_factor))
        
        # Select optimal spectrum mode
        new_spectrum = self._select_spectrum_mode(reason)
        
        # Simulate gradual adjustment
        await asyncio.sleep(self.adaptation_speed)
        
        # Update state
        new_state = {
            'brightness': new_brightness,
            'spectrum': new_spectrum,
            'last_adjustment': datetime.now().isoformat(),
            'reason': reason
        }
        self.light_states[light_id] = new_state
        
        return {
            'light_id': light_id,
            'previous_brightness': current_state['brightness'],
            'new_brightness': new_brightness,
            'brightness_increase': new_brightness - current_state['brightness'],
            'previous_spectrum': current_state['spectrum'],
            'new_spectrum': new_spectrum,
            'noticeable': False  # Always subtle
        }
    
    def _select_spectrum_mode(self, reason: str) -> str:
        """Select optimal light spectrum based on detection reason"""
        if 'hyperspectral' in reason.lower():
            return 'hyperspectral_optimized'
        elif 'thermal' in reason.lower() or 'night' in reason.lower():
            return 'infrared_enhanced'
        else:
            return 'normal'
    
    async def adaptive_zone_lighting(
        self,
        zone_center: List[float],
        radius: float,
        reason: str = "suspicious_activity"
    ) -> Dict[str, Any]:
        """
        Adaptively adjust lighting in a zone
        
        Creates a gradient lighting effect that's imperceptible
        but improves camera performance
        """
        logger.info(f"Adaptive zone lighting: center={zone_center}, radius={radius}m")
        
        # Simulate finding nearby lights
        # In production, this would query the actual light network
        nearby_lights = self._find_nearby_lights(zone_center, radius)
        
        adjustments = []
        for light in nearby_lights:
            distance = light['distance']
            
            # Calculate adjustment strength based on distance
            # Closer lights adjust more
            strength = max(0, 1 - (distance / radius))
            
            adjustment = await self.adjust({
                'light_ids': [light['id']],
                'target_position': zone_center,
                'reason': reason,
                'priority': 'medium' if strength > 0.5 else 'low'
            })
            
            adjustments.append(adjustment)
        
        return {
            'status': 'zone_adjusted',
            'zone_center': zone_center,
            'radius': radius,
            'lights_affected': len(nearby_lights),
            'adjustments': adjustments,
            'gradient_applied': True
        }
    
    def _find_nearby_lights(self, position: List[float], radius: float) -> List[Dict[str, Any]]:
        """Find lights within radius of position"""
        # Simulate light positions
        # In production, this would query the digital twin
        num_lights = np.random.randint(3, 8)
        
        nearby = []
        for i in range(num_lights):
            angle = np.random.random() * 360
            distance = np.random.random() * radius
            
            light_pos = [
                position[0] + distance * np.cos(np.radians(angle)),
                position[1] + distance * np.sin(np.radians(angle))
            ]
            
            nearby.append({
                'id': f'LIGHT-{np.random.randint(1, 25):02d}',
                'position': light_pos,
                'distance': distance
            })
        
        return nearby
    
    async def reset_to_normal(self, light_ids: List[str] = None) -> Dict[str, Any]:
        """Reset lights to normal operation"""
        if light_ids is None:
            light_ids = list(self.light_states.keys())
        
        reset_count = 0
        for light_id in light_ids:
            if light_id in self.light_states:
                self.light_states[light_id] = {
                    'brightness': 100,
                    'spectrum': 'normal',
                    'last_adjustment': datetime.now().isoformat()
                }
                reset_count += 1
        
        logger.info(f"Reset {reset_count} lights to normal")
        
        return {
            'status': 'reset',
            'lights_reset': reset_count
        }
    
    def is_active(self) -> bool:
        """Check if lighting control is active"""
        return self.active
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get lighting control statistics"""
        return {
            'total_adjustments': len(self.adjustment_history),
            'active_lights': len(self.light_states),
            'recent_adjustments': self.adjustment_history[-10:],
            'subtle_mode': True,
            'average_increase': self.subtle_increase * 100
        }
