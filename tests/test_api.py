"""
Test Suite for ShaheenEye API
Run with: pytest tests/
"""

import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.api.main import app

client = TestClient(app)


class TestSystemStatus:
    """Test system status endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns system info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["system"] == "ShaheenEye (SCAR-EYE)"
        assert "version" in data
        assert "status" in data
    
    def test_status_endpoint(self):
        """Test system status endpoint"""
        response = client.get("/api/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "modules" in data
        assert "timestamp" in data
        
        # Check all modules are present
        modules = data["modules"]
        assert "hyperspectral" in modules
        assert "lighting" in modules
        assert "wargaming" in modules
        assert "audio" in modules


class TestHyperspectralAnalysis:
    """Test hyperspectral analysis endpoints"""
    
    def test_analyze_material(self):
        """Test material analysis"""
        test_data = {
            "position": [450, 620],
            "spectral_cube": "mock_data"
        }
        
        response = client.post("/api/hyperspectral/analyze", json=test_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "analyzed"
        assert "materials" in data
        assert "position" in data
        assert data["position"] == test_data["position"]


class TestAdaptiveLighting:
    """Test adaptive lighting endpoints"""
    
    def test_adjust_lighting(self):
        """Test lighting adjustment"""
        test_data = {
            "light_ids": ["LIGHT-01", "LIGHT-02"],
            "target_position": [500, 500],
            "reason": "test",
            "priority": "medium"
        }
        
        response = client.post("/api/lighting/adjust", json=test_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "adjusted"
        assert "adjustments" in data
        assert len(data["adjustments"]) == 2
        assert data["subtle"] == True


class TestWargaming:
    """Test wargaming simulation endpoints"""
    
    def test_start_simulation(self):
        """Test starting wargaming simulation"""
        test_data = {
            "episodes": 10  # Small number for testing
        }
        
        response = client.post("/api/wargaming/start", json=test_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "completed"
        assert data["episodes_run"] == 10
        assert "blue_win_rate" in data
        assert "red_win_rate" in data
        assert "statistics" in data
    
    def test_get_stats(self):
        """Test getting wargaming statistics"""
        response = client.get("/api/wargaming/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "total_episodes" in data


class TestAudioProcessing:
    """Test audio processing endpoints"""
    
    def test_process_audio(self):
        """Test audio processing"""
        test_data = {
            "audio_samples": "mock_audio_data",
            "microphone_positions": [
                {"id": "MIC-01", "position": [100, 100, 6]}
            ]
        }
        
        response = client.post("/api/audio/process", json=test_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "processed"
        assert "events_detected" in data


class TestDigitalTwin:
    """Test digital twin endpoints"""
    
    def test_get_state(self):
        """Test getting digital twin state"""
        response = client.get("/api/digital-twin/state")
        assert response.status_code == 200
        data = response.json()
        
        assert "cameras" in data
        assert "lights" in data
        assert "microphones" in data
        assert "system_health" in data
        assert data["system_health"] == "optimal"


class TestIntegration:
    """Integration tests for complete workflows"""
    
    def test_complete_detection_workflow(self):
        """Test a complete detection workflow"""
        
        # 1. Audio detects something
        audio_response = client.post("/api/audio/process", json={
            "audio_samples": "mock_data"
        })
        assert audio_response.status_code == 200
        
        # 2. Lighting adjusts
        lighting_response = client.post("/api/lighting/adjust", json={
            "light_ids": ["LIGHT-01"],
            "target_position": [500, 500],
            "reason": "audio_detection",
            "priority": "high"
        })
        assert lighting_response.status_code == 200
        
        # 3. Hyperspectral analyzes
        hyper_response = client.post("/api/hyperspectral/analyze", json={
            "position": [500, 500]
        })
        assert hyper_response.status_code == 200
        
        # 4. Check system status
        status_response = client.get("/api/status")
        assert status_response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
