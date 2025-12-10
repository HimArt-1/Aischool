# ShaheenEye API Documentation

## Base URL

```
http://localhost:8000
```

## Authentication

Currently no authentication required for demo. In production, use JWT tokens.

## Endpoints

### System Status

#### Get System Status

```http
GET /api/status
```

**Response:**
```json
{
  "status": "operational",
  "modules": {
    "hyperspectral": true,
    "lighting": true,
    "wargaming": true,
    "audio": true
  },
  "timestamp": "2025-12-10T12:00:00"
}
```

---

### Hyperspectral Analysis

#### Analyze Material

```http
POST /api/hyperspectral/analyze
```

**Request Body:**
```json
{
  "position": [450, 620],
  "spectral_cube": "base64_encoded_data",
  "region_of_interest": {
    "x": 100,
    "y": 100,
    "width": 50,
    "height": 50
  }
}
```

**Response:**
```json
{
  "status": "analyzed",
  "position": [450, 620],
  "materials": [
    {
      "material": "concrete",
      "confidence": 0.92,
      "anomaly_score": 0.0
    },
    {
      "material": "plastic",
      "confidence": 0.87,
      "anomaly_score": 0.15
    }
  ],
  "suspicious": false,
  "analysis_time": 0.1,
  "wavelength_range": [400, 2500],
  "spectral_bands": 224
}
```

---

### Adaptive Lighting

#### Adjust Lighting

```http
POST /api/lighting/adjust
```

**Request Body:**
```json
{
  "light_ids": ["LIGHT-01", "LIGHT-02", "LIGHT-03"],
  "target_position": [450, 620],
  "reason": "suspicious_activity",
  "priority": "medium"
}
```

**Response:**
```json
{
  "status": "adjusted",
  "adjustments": [
    {
      "light_id": "LIGHT-01",
      "previous_brightness": 100,
      "new_brightness": 112,
      "brightness_increase": 12,
      "previous_spectrum": "normal",
      "new_spectrum": "hyperspectral_optimized",
      "noticeable": false
    }
  ],
  "adaptation_time": 2.0,
  "subtle": true
}
```

#### Adaptive Zone Lighting

```http
POST /api/lighting/zone
```

**Request Body:**
```json
{
  "zone_center": [500, 500],
  "radius": 100,
  "reason": "suspicious_activity"
}
```

**Response:**
```json
{
  "status": "zone_adjusted",
  "zone_center": [500, 500],
  "radius": 100,
  "lights_affected": 5,
  "gradient_applied": true
}
```

---

### Adversarial Wargaming

#### Start Simulation

```http
POST /api/wargaming/start
```

**Request Body:**
```json
{
  "episodes": 1000,
  "parallel_environments": 8,
  "save_results": true
}
```

**Response:**
```json
{
  "status": "completed",
  "episodes_run": 1000,
  "total_episodes": 15420,
  "blue_win_rate": 0.893,
  "red_win_rate": 0.107,
  "results": [
    {
      "episode": 1000,
      "attack_tactic": "blind_spot_exploitation",
      "detected": true,
      "detection_method": "hyperspectral_analysis",
      "confidence": 0.87
    }
  ],
  "statistics": {
    "blue_wins": 893,
    "red_wins": 107,
    "detection_methods_used": {
      "hyperspectral_analysis": 312,
      "acoustic_correlation": 245,
      "thermal_signature": 198,
      "behavioral_pattern": 138
    }
  },
  "improvement": {
    "red_ai_success_rate": 0.15,
    "blue_ai_detection_rate": 0.89
  }
}
```

#### Get Wargaming Statistics

```http
GET /api/wargaming/stats
```

**Response:**
```json
{
  "status": "active",
  "total_episodes": 15420,
  "current_episode": 1000,
  "blue_wins": 13759,
  "red_wins": 1661,
  "blue_win_rate": 0.893,
  "red_win_rate": 0.107,
  "detection_methods": {
    "hyperspectral_analysis": 4812,
    "acoustic_correlation": 3654,
    "thermal_signature": 2987,
    "behavioral_pattern": 2306
  },
  "tactics_attempted": {
    "blind_spot_exploitation": 2134,
    "camouflage_material": 2089,
    "timing_manipulation": 1987,
    "sensor_jamming": 1876
  }
}
```

---

### Audio Processing

#### Process Audio Data

```http
POST /api/audio/process
```

**Request Body:**
```json
{
  "audio_samples": "base64_encoded_audio",
  "microphone_positions": [
    {"id": "MIC-01", "position": [100, 100, 6]},
    {"id": "MIC-02", "position": [200, 100, 6]}
  ],
  "timestamp": "2025-12-10T12:00:00"
}
```

**Response:**
```json
{
  "status": "processed",
  "events_detected": [
    {
      "event_type": "drilling",
      "confidence": 0.87,
      "estimated_location": [450, 620, 0],
      "timestamp": "2025-12-10T12:00:00",
      "duration": 3.2,
      "intensity": 0.85,
      "frequency_range": [200, 4000]
    }
  ],
  "spatial_correlation": true,
  "recommended_action": {
    "severity": "high",
    "priority": 0.87,
    "actions": [
      {
        "type": "camera_focus",
        "target": [450, 620, 0],
        "reason": "Audio event: drilling"
      },
      {
        "type": "lighting_adjustment",
        "target": [450, 620, 0],
        "mode": "subtle_increase"
      }
    ]
  }
}
```

#### Get Acoustic Heatmap

```http
GET /api/audio/heatmap?time_window=60
```

**Response:**
```json
{
  "status": "generated",
  "grid_size": 50,
  "heatmap": [[0.0, 0.1, ...], [0.2, 0.3, ...]],
  "events_analyzed": 20,
  "hotspots": [
    {
      "grid_position": [25, 30],
      "real_position": [500, 600],
      "intensity": 0.85
    }
  ]
}
```

---

### Digital Twin

#### Get Digital Twin State

```http
GET /api/digital-twin/state
```

**Response:**
```json
{
  "timestamp": "2025-12-10T12:00:00",
  "cameras": 12,
  "lights": 24,
  "microphones": 8,
  "active_events": 3,
  "active_alerts": 2,
  "system_health": "optimal",
  "coverage": 0.95
}
```

---

## WebSocket API

### Connect to Real-time Updates

```javascript
const ws = new WebSocket('ws://localhost:8000/ws')

// Subscribe to updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['events', 'alerts', 'stats']
}))

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Update:', data)
}
```

**Message Types:**

1. **Event Update**
```json
{
  "type": "event",
  "data": {
    "event_id": "EVT-00042",
    "event_type": "material_anomaly",
    "location": [450, 620],
    "confidence": 0.87,
    "timestamp": "2025-12-10T12:00:00"
  }
}
```

2. **Alert Update**
```json
{
  "type": "alert",
  "data": {
    "alert_id": "ALT-00015",
    "severity": "high",
    "message": "Suspicious material detected",
    "location": [450, 620],
    "requires_action": true
  }
}
```

3. **Statistics Update**
```json
{
  "type": "stats",
  "data": {
    "wargaming_episodes": 15420,
    "blue_win_rate": 0.893,
    "detection_rate": 0.87
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

**Common Error Codes:**

- `400` - Bad Request (invalid parameters)
- `404` - Not Found (endpoint doesn't exist)
- `500` - Internal Server Error
- `503` - Service Unavailable (module offline)

---

## Rate Limiting

Current implementation has no rate limiting for demo purposes.

Production recommendations:
- 100 requests/minute per IP
- 1000 requests/hour per IP
- WebSocket: 1 connection per session

---

## Interactive API Documentation

FastAPI provides interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interfaces allow you to:
- View all endpoints
- Test API calls directly
- See request/response schemas
- Download OpenAPI specification

---

## Code Examples

### Python

```python
import requests

# Get system status
response = requests.get('http://localhost:8000/api/status')
print(response.json())

# Start wargaming simulation
response = requests.post(
    'http://localhost:8000/api/wargaming/start',
    json={'episodes': 100}
)
print(response.json())
```

### JavaScript

```javascript
// Get system status
fetch('http://localhost:8000/api/status')
  .then(res => res.json())
  .then(data => console.log(data))

// Start wargaming simulation
fetch('http://localhost:8000/api/wargaming/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ episodes: 100 })
})
  .then(res => res.json())
  .then(data => console.log(data))
```

### cURL

```bash
# Get system status
curl http://localhost:8000/api/status

# Start wargaming simulation
curl -X POST http://localhost:8000/api/wargaming/start \
  -H "Content-Type: application/json" \
  -d '{"episodes": 100}'

# Adjust lighting
curl -X POST http://localhost:8000/api/lighting/adjust \
  -H "Content-Type: application/json" \
  -d '{
    "light_ids": ["LIGHT-01"],
    "target_position": [500, 500],
    "reason": "suspicious_activity",
    "priority": "high"
  }'
```

---

## Versioning

Current API Version: `1.0.0`

Future versions will use URL versioning:
- `http://localhost:8000/v1/api/...`
- `http://localhost:8000/v2/api/...`

---

## Support

For API issues or questions:
- Check logs: `logs/shaheeneye.log`
- View interactive docs: http://localhost:8000/docs
- Report issues on GitHub
