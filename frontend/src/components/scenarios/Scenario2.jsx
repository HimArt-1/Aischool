import React, { useEffect, useState } from 'react'
import { Volume2, MapPin, Radio, Waves } from 'lucide-react'

// Scenario 2: Sound Before Sight - Audio-Visual Correlation
function Scenario2({ isPlaying }) {
  const [audioEvent, setAudioEvent] = useState(null)
  const [heatmapData, setHeatmapData] = useState([])
  const [correlation, setCorrelation] = useState(null)
  const [timeline, setTimeline] = useState(0)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setTimeline(prev => {
        const next = prev + 1
        
        // Simulation timeline
        if (next === 20) {
          setAudioEvent({
            type: 'drilling',
            confidence: 0.87,
            duration: 3.2,
            location: [450, 620]
          })
        } else if (next === 40) {
          // Generate heatmap
          const heatmap = []
          for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
              const distance = Math.sqrt((i-4.5)**2 + (j-6.2)**2)
              const intensity = Math.max(0, 1 - distance/5)
              if (intensity > 0.2) {
                heatmap.push({ x: i, y: j, intensity })
              }
            }
          }
          setHeatmapData(heatmap)
        } else if (next === 60) {
          setCorrelation({
            visual_objects: 2,
            match_confidence: 0.91,
            recommended_action: 'Camera focus + lighting adjustment'
          })
        }
        
        return next > 100 ? 0 : next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="space-y-6">
      {/* Main Visualization */}
      <div className="glass rounded-xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-white mb-2">
              Acoustic Monitoring - Night Mode
            </h3>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Radio className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Audio Array Active</span>
            </div>
          </div>

          {/* Microphone Array Visualization */}
          <div className="relative h-96 bg-black/20 rounded-xl p-8">
            {/* Grid */}
            <div className="absolute inset-8 border border-white/10">
              {/* Microphones positioned in circle */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                const radius = 160
                const x = 50 + Math.cos(angle * Math.PI / 180) * 40
                const y = 50 + Math.sin(angle * Math.PI / 180) * 40
                
                return (
                  <div
                    key={idx}
                    className="absolute w-8 h-8 -ml-4 -mt-4"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-all ${
                      audioEvent ? 'border-purple-500 bg-purple-500/20 animate-pulse-slow' : 'border-gray-600 bg-gray-800'
                    }`}>
                      <Volume2 className={`w-4 h-4 ${audioEvent ? 'text-purple-400' : 'text-gray-500'}`} />
                    </div>
                  </div>
                )
              })}

              {/* Heatmap */}
              {heatmapData.map((point, idx) => (
                <div
                  key={idx}
                  className="absolute w-12 h-12 rounded-full animate-fade-in"
                  style={{
                    left: `${point.x * 10}%`,
                    top: `${point.y * 10}%`,
                    background: `radial-gradient(circle, rgba(168, 85, 247, ${point.intensity * 0.6}), transparent)`,
                  }}
                ></div>
              ))}

              {/* Event Marker */}
              {audioEvent && (
                <div
                  className="absolute animate-fade-in"
                  style={{ left: '45%', top: '62%' }}
                >
                  <div className="relative">
                    <MapPin className="w-8 h-8 text-red-500 animate-pulse-slow" />
                    <div className="absolute -top-8 left-10 whitespace-nowrap bg-black/80 px-3 py-1 rounded-lg text-xs">
                      <div className="text-white font-semibold">{audioEvent.type}</div>
                      <div className="text-gray-400">{(audioEvent.confidence * 100).toFixed(0)}% confidence</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Event Details */}
      {audioEvent && (
        <div className="glass rounded-xl p-6 border-l-4 border-purple-500 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Waves className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Audio Event Detected</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Event Type</div>
                  <div className="text-lg font-semibold text-purple-400 capitalize">{audioEvent.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Confidence</div>
                  <div className="text-lg font-semibold text-white">{(audioEvent.confidence * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Duration</div>
                  <div className="text-lg font-semibold text-white">{audioEvent.duration}s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Correlation Results */}
      {correlation && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h4 className="text-lg font-semibold text-white mb-4">Audio-Visual Correlation</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <span className="text-gray-300">Visual objects in area</span>
              <span className="text-2xl font-bold text-white">{correlation.visual_objects}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <span className="text-gray-300">Match confidence</span>
              <span className="text-2xl font-bold text-green-400">{(correlation.match_confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-500/20 border border-primary-500/50 rounded-lg">
              <span className="text-gray-300">Recommended action</span>
              <span className="text-sm font-semibold text-primary-400">{correlation.recommended_action}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">8</div>
          <div className="text-sm text-gray-400">Active Microphones</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-primary-400 mb-2">2.0m</div>
          <div className="text-sm text-gray-400">Spatial Resolution</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-accent-400 mb-2">48kHz</div>
          <div className="text-sm text-gray-400">Sample Rate</div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="glass rounded-xl p-6 border-l-4 border-purple-500">
        <h4 className="text-lg font-semibold text-white mb-2">Key Insight</h4>
        <p className="text-gray-300 leading-relaxed">
          At night when cameras struggle, the microphone array detected drilling sounds and 
          triangulated the exact location. The system then directed cameras to focus on that 
          spot and adjusted lighting, revealing suspicious activity that would have been missed 
          by vision alone.
        </p>
      </div>
    </div>
  )
}

export default Scenario2
