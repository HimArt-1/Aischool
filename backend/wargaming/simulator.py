"""
Adversarial AI Wargaming
"Our AI plays against a criminal AI… so it can beat real criminals later."
"""

import numpy as np
from typing import Dict, Any, List, Tuple
from loguru import logger
import asyncio
from datetime import datetime
import random


class RedAI:
    """
    Red Team AI - Simulates adversarial tactics
    Attempts to evade detection and plant threats
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.name = config['name']
        self.difficulty = config['difficulty']
        self.learning_rate = config['learning_rate']
        self.tactics_learned = []
        self.success_rate = 0.5
        
    def generate_attack_plan(self, environment: Dict[str, Any]) -> Dict[str, Any]:
        """Generate an attack strategy"""
        tactics = [
            'blind_spot_exploitation',
            'camouflage_material',
            'timing_manipulation',
            'distraction_creation',
            'sensor_jamming',
            'crowd_blending',
            'infrastructure_hiding',
            'acoustic_masking'
        ]
        
        selected_tactic = random.choice(tactics)
        
        # Generate random target location
        map_size = environment.get('map_size', [1000, 1000])
        target = [
            random.uniform(0, map_size[0]),
            random.uniform(0, map_size[1])
        ]
        
        return {
            'tactic': selected_tactic,
            'target_location': target,
            'camouflage_level': random.uniform(0.5, 0.95),
            'timing': random.choice(['night', 'dawn', 'day', 'dusk']),
            'distractions': random.randint(0, 3)
        }
    
    def learn_from_failure(self, detection_method: str):
        """Adapt based on how attack was detected"""
        self.tactics_learned.append({
            'detected_by': detection_method,
            'timestamp': datetime.now().isoformat()
        })
        
        # Improve for next attempt
        self.success_rate = max(0.1, self.success_rate - 0.05)


class BlueAI:
    """
    Blue Team AI - SCAR-EYE defense system
    Learns to detect and counter Red AI tactics
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.name = config['name']
        self.learning_rate = config['learning_rate']
        self.detection_methods = [
            'hyperspectral_analysis',
            'acoustic_correlation',
            'thermal_signature',
            'behavioral_pattern',
            'material_fingerprinting',
            'temporal_anomaly'
        ]
        self.detection_rate = 0.6
        
    def detect_threat(self, attack: Dict[str, Any]) -> Tuple[bool, str, float]:
        """Attempt to detect an attack"""
        # Simulate detection based on multiple factors
        detection_scores = {}
        
        for method in self.detection_methods:
            # Each method has different effectiveness against different tactics
            score = self._calculate_detection_score(method, attack)
            detection_scores[method] = score
        
        # Use best detection method
        best_method = max(detection_scores, key=detection_scores.get)
        best_score = detection_scores[best_method]
        
        detected = best_score > (1 - self.detection_rate)
        
        return detected, best_method, best_score
    
    def _calculate_detection_score(self, method: str, attack: Dict[str, Any]) -> float:
        """Calculate detection probability for a method against an attack"""
        base_score = random.uniform(0.3, 0.8)
        
        tactic = attack['tactic']
        camouflage = attack['camouflage_level']
        
        # Method effectiveness against specific tactics
        effectiveness = {
            'hyperspectral_analysis': ['camouflage_material', 'infrastructure_hiding'],
            'acoustic_correlation': ['acoustic_masking', 'timing_manipulation'],
            'thermal_signature': ['night', 'timing_manipulation'],
            'behavioral_pattern': ['crowd_blending', 'timing_manipulation'],
            'material_fingerprinting': ['camouflage_material', 'infrastructure_hiding'],
            'temporal_anomaly': ['timing_manipulation', 'distraction_creation']
        }
        
        if tactic in effectiveness.get(method, []):
            base_score *= 1.5
        
        # Camouflage reduces detection
        base_score *= (1 - camouflage * 0.3)
        
        return min(1.0, base_score)
    
    def learn_from_success(self, detection_method: str):
        """Improve detection capabilities"""
        self.detection_rate = min(0.95, self.detection_rate + 0.02)


class WargamingSimulator:
    """
    Orchestrates adversarial simulation between Red-AI and Blue-AI
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config['wargaming']
        self.red_ai = RedAI(self.config['red_ai'])
        self.blue_ai = BlueAI(self.config['blue_ai'])
        
        self.simulation_config = self.config['simulation']
        self.active = self.config['enabled']
        
        self.simulation_history = []
        self.current_episode = 0
        self.total_episodes = 0
        
        self.statistics = {
            'red_wins': 0,
            'blue_wins': 0,
            'detection_methods_used': {},
            'tactics_attempted': {}
        }
        
        logger.info("WargamingSimulator initialized")
    
    async def start_simulation(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Start an adversarial simulation session"""
        num_episodes = config_data.get('episodes', 100)
        
        logger.info(f"🎮 Starting wargaming simulation: {num_episodes} episodes")
        
        # Environment setup
        environment = {
            'map_size': [1000, 1000],
            'cameras': 12,
            'lights': 24,
            'microphones': 8
        }
        
        results = []
        
        for episode in range(num_episodes):
            self.current_episode = episode + 1
            
            # Red-AI generates attack
            attack_plan = self.red_ai.generate_attack_plan(environment)
            
            # Record tactic
            tactic = attack_plan['tactic']
            self.statistics['tactics_attempted'][tactic] = \
                self.statistics['tactics_attempted'].get(tactic, 0) + 1
            
            # Blue-AI attempts detection
            detected, method, confidence = self.blue_ai.detect_threat(attack_plan)
            
            # Record detection method
            if detected:
                self.statistics['detection_methods_used'][method] = \
                    self.statistics['detection_methods_used'].get(method, 0) + 1
            
            # Update statistics
            if detected:
                self.statistics['blue_wins'] += 1
                self.blue_ai.learn_from_success(method)
                self.red_ai.learn_from_failure(method)
            else:
                self.statistics['red_wins'] += 1
            
            episode_result = {
                'episode': episode + 1,
                'attack_tactic': tactic,
                'detected': detected,
                'detection_method': method if detected else None,
                'confidence': confidence,
                'red_success': not detected,
                'blue_success': detected
            }
            
            results.append(episode_result)
            
            # Small delay for realism
            if episode % 10 == 0:
                await asyncio.sleep(0.01)
        
        self.total_episodes += num_episodes
        
        # Calculate improvement metrics
        blue_win_rate = self.statistics['blue_wins'] / self.total_episodes
        
        logger.info(f"✓ Simulation complete: Blue-AI win rate: {blue_win_rate:.2%}")
        
        return {
            'status': 'completed',
            'episodes_run': num_episodes,
            'total_episodes': self.total_episodes,
            'blue_win_rate': blue_win_rate,
            'red_win_rate': 1 - blue_win_rate,
            'results': results[-20:],  # Last 20 episodes
            'statistics': self.statistics,
            'improvement': {
                'red_ai_success_rate': self.red_ai.success_rate,
                'blue_ai_detection_rate': self.blue_ai.detection_rate
            }
        }
    
    async def run_single_episode(self) -> Dict[str, Any]:
        """Run a single wargaming episode"""
        environment = {
            'map_size': [1000, 1000],
            'cameras': 12,
            'lights': 24,
            'microphones': 8
        }
        
        # Generate attack
        attack_plan = self.red_ai.generate_attack_plan(environment)
        
        # Attempt detection
        detected, method, confidence = self.blue_ai.detect_threat(attack_plan)
        
        return {
            'attack': attack_plan,
            'detected': detected,
            'detection_method': method if detected else None,
            'confidence': confidence,
            'winner': 'Blue-AI' if detected else 'Red-AI'
        }
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get current wargaming statistics"""
        if self.total_episodes == 0:
            return {
                'status': 'no_simulations_run',
                'total_episodes': 0
            }
        
        blue_win_rate = self.statistics['blue_wins'] / self.total_episodes
        
        return {
            'status': 'active' if self.active else 'inactive',
            'total_episodes': self.total_episodes,
            'current_episode': self.current_episode,
            'blue_wins': self.statistics['blue_wins'],
            'red_wins': self.statistics['red_wins'],
            'blue_win_rate': blue_win_rate,
            'red_win_rate': 1 - blue_win_rate,
            'detection_methods': self.statistics['detection_methods_used'],
            'tactics_attempted': self.statistics['tactics_attempted'],
            'ai_capabilities': {
                'red_ai_success_rate': self.red_ai.success_rate,
                'blue_ai_detection_rate': self.blue_ai.detection_rate,
                'red_ai_tactics_learned': len(self.red_ai.tactics_learned)
            }
        }
    
    def is_active(self) -> bool:
        """Check if wargaming is active"""
        return self.active
