import React, { useEffect, useState } from 'react'
import { Sun, Moon, TrendingUp, Activity } from 'lucide-react'

// Scenario 1: Silent Night - Adaptive Illuminance
function Scenario1({ isPlaying }) {
  const [brightness, setBrightness] = useState(100)
  const [lightStatus, setLightStatus] = useState('normal')
  const [detectionQuality, setDetectionQuality] = useState(70)
  const [timeline, setTimeline] = useState(0)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setTimeline(prev => {
        const next = prev + 1
        
        // Simulation timeline
        if (next === 30) {
          setLightStatus('adjusting')
          setBrightness(112) // 12% increase
        } else if (next === 60) {
          setDetectionQuality(92)
          setLightStatus('enhanced')
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
        {/* Background grid */}
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        
        {/* Scene */}
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-white mb-2">
              Urban Area - Night Mode
            </h3>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Moon className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">23:47 Local Time</span>
            </div>
          </div>

          {/* Street visualization */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((light) => (
              <div key={light} className="text-center space-y-3">
                <div className="relative h-40 flex items-end justify-center">
                  {/* Light pole */}
                  <div className="w-2 h-32 bg-gray-700 rounded-full"></div>
                  
                  {/* Light */}
                  <div 
                    className="absolute top-0 w-8 h-8 rounded-full transition-all duration-1000"
                    style={{
                      background: `radial-gradient(circle, rgba(251, 191, 36, ${brightness/100}), transparent)`,
                      boxShadow: `0 0 ${brightness}px rgba(251, 191, 36, 0.5)`,
                    }}
                  >
                    <Sun className="w-8 h-8 text-amber-300" />
                  </div>
                  
                  {/* Light cone */}
                  <div 
                    className="absolute top-8 w-0 h-0 transition-all duration-1000"
                    style={{
                      borderLeft: '40px solid transparent',
                      borderRight: '40px solid transparent',
                      borderTop: `120px solid rgba(251, 191, 36, ${brightness/300})`,
                    }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-400">
                  LIGHT-{light.toString().padStart(2, '0')}
                </div>
                <div className="text-sm font-mono text-primary-400">
                  {brightness}%
                </div>
              </div>
            ))}
          </div>

          {/* Suspicious Activity Indicator */}
          {timeline > 15 && (
            <div className="text-center mb-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                <Activity className="w-4 h-4 text-red-400 animate-pulse-slow" />
                <span className="text-sm text-red-300">Suspicious movement detected</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Brightness</span>
            <TrendingUp className={`w-4 h-4 ${lightStatus === 'adjusting' ? 'text-green-400 animate-pulse-slow' : 'text-gray-500'}`} />
          </div>
          <div className="text-3xl font-bold text-white">{brightness}%</div>
          <div className="text-xs text-gray-500">
            {lightStatus === 'normal' && 'Normal operation'}
            {lightStatus === 'adjusting' && 'Adjusting lighting...'}
            {lightStatus === 'enhanced' && 'Enhanced mode active'}
          </div>
        </div>

        <div className="glass rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Detection Quality</span>
            <Activity className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-3xl font-bold text-white">{detectionQuality}%</div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-1000"
              style={{ width: `${detectionQuality}%` }}
            ></div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Visibility</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {lightStatus === 'enhanced' ? 'High' : 'Medium'}
          </div>
          <div className="text-xs text-gray-500">
            Camera performance: {lightStatus === 'enhanced' ? 'Optimal' : 'Standard'}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white">Event Timeline</h4>
          <span className="text-xs text-gray-400">{timeline}s</span>
        </div>
        
        <div className="space-y-2">
          {timeline > 0 && (
            <div className="flex items-start gap-3 text-sm animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <div>
                <span className="text-gray-400">00:00</span>
                <span className="text-gray-300 ml-3">System monitoring active</span>
              </div>
            </div>
          )}
          
          {timeline > 15 && (
            <div className="flex items-start gap-3 text-sm animate-fade-in">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 animate-pulse-slow"></div>
              <div>
                <span className="text-gray-400">00:15</span>
                <span className="text-gray-300 ml-3">Movement detected in low visibility area</span>
              </div>
            </div>
          )}
          
          {timeline > 30 && (
            <div className="flex items-start gap-3 text-sm animate-fade-in">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
              <div>
                <span className="text-gray-400">00:30</span>
                <span className="text-gray-300 ml-3">Adaptive lighting activated (+12% brightness)</span>
              </div>
            </div>
          )}
          
          {timeline > 60 && (
            <div className="flex items-start gap-3 text-sm animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <div>
                <span className="text-gray-400">01:00</span>
                <span className="text-gray-300 ml-3">Detection quality improved to 92%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Insight */}
      <div className="glass rounded-xl p-6 border-l-4 border-primary-500">
        <h4 className="text-lg font-semibold text-white mb-2">Key Insight</h4>
        <p className="text-gray-300 leading-relaxed">
          The system increased lighting by just 12% - imperceptible to the human eye - but 
          dramatically improved camera detection quality from 70% to 92%. This subtle adjustment 
          enhances security without alerting potential threats.
        </p>
      </div>
    </div>
  )
}

export default Scenario1
