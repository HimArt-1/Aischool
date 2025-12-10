import React, { useEffect, useState } from 'react'
import { 
  Eye, 
  Volume2, 
  Sun, 
  Layers, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Radio
} from 'lucide-react'

// Scenario 4: The Message - Complete System Integration
function Scenario4({ isPlaying }) {
  const [timeline, setTimeline] = useState(0)
  const [activeModules, setActiveModules] = useState({
    hyperspectral: false,
    lighting: false,
    audio: false,
    wargaming: false
  })
  const [threatLevel, setThreatLevel] = useState('low')
  const [detectionConfidence, setDetectionConfidence] = useState(0)
  const [events, setEvents] = useState([])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setTimeline(prev => {
        const next = prev + 1
        
        // Integrated scenario timeline
        if (next === 10) {
          setEvents(e => [...e, {
            time: '00:10',
            module: 'audio',
            message: 'Unusual acoustic activity detected',
            icon: Volume2,
            color: 'text-purple-400'
          }])
          setActiveModules(m => ({ ...m, audio: true }))
        }
        
        if (next === 25) {
          setEvents(e => [...e, {
            time: '00:25',
            module: 'lighting',
            message: 'Adaptive lighting activated in zone',
            icon: Sun,
            color: 'text-amber-400'
          }])
          setActiveModules(m => ({ ...m, lighting: true }))
          setThreatLevel('medium')
        }
        
        if (next === 40) {
          setEvents(e => [...e, {
            time: '00:40',
            module: 'hyperspectral',
            message: 'Material anomaly detected - suspicious signature',
            icon: Layers,
            color: 'text-cyan-400'
          }])
          setActiveModules(m => ({ ...m, hyperspectral: true }))
          setThreatLevel('high')
          setDetectionConfidence(75)
        }
        
        if (next === 55) {
          setEvents(e => [...e, {
            time: '00:55',
            module: 'wargaming',
            message: 'Pattern matches known Red-AI tactic #47',
            icon: Activity,
            color: 'text-red-400'
          }])
          setActiveModules(m => ({ ...m, wargaming: true }))
          setDetectionConfidence(94)
        }
        
        if (next === 70) {
          setEvents(e => [...e, {
            time: '01:10',
            module: 'system',
            message: 'Threat neutralized - All systems coordinated',
            icon: CheckCircle,
            color: 'text-green-400'
          }])
          setThreatLevel('resolved')
        }
        
        return next > 100 ? 0 : next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying])

  const threatColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
    resolved: 'text-blue-400'
  }

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="glass rounded-xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            Integrated System Response
          </h3>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
            <Eye className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-gray-300">All Systems Active</span>
          </div>
        </div>

        {/* Module Status Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className={`glass rounded-xl p-6 text-center transition-all ${
            activeModules.hyperspectral ? 'border-2 border-cyan-500 glow' : 'opacity-50'
          }`}>
            <Layers className={`w-8 h-8 mx-auto mb-3 ${
              activeModules.hyperspectral ? 'text-cyan-400' : 'text-gray-600'
            }`} />
            <div className="text-sm font-semibold text-white mb-1">Hyperspectral</div>
            <div className={`text-xs ${
              activeModules.hyperspectral ? 'text-cyan-400' : 'text-gray-500'
            }`}>
              {activeModules.hyperspectral ? 'Active' : 'Standby'}
            </div>
          </div>

          <div className={`glass rounded-xl p-6 text-center transition-all ${
            activeModules.lighting ? 'border-2 border-amber-500 glow-amber' : 'opacity-50'
          }`}>
            <Sun className={`w-8 h-8 mx-auto mb-3 ${
              activeModules.lighting ? 'text-amber-400' : 'text-gray-600'
            }`} />
            <div className="text-sm font-semibold text-white mb-1">Lighting</div>
            <div className={`text-xs ${
              activeModules.lighting ? 'text-amber-400' : 'text-gray-500'
            }`}>
              {activeModules.lighting ? 'Active' : 'Standby'}
            </div>
          </div>

          <div className={`glass rounded-xl p-6 text-center transition-all ${
            activeModules.audio ? 'border-2 border-purple-500 glow' : 'opacity-50'
          }`}>
            <Volume2 className={`w-8 h-8 mx-auto mb-3 ${
              activeModules.audio ? 'text-purple-400' : 'text-gray-600'
            }`} />
            <div className="text-sm font-semibold text-white mb-1">Audio</div>
            <div className={`text-xs ${
              activeModules.audio ? 'text-purple-400' : 'text-gray-500'
            }`}>
              {activeModules.audio ? 'Active' : 'Standby'}
            </div>
          </div>

          <div className={`glass rounded-xl p-6 text-center transition-all ${
            activeModules.wargaming ? 'border-2 border-red-500 glow-amber' : 'opacity-50'
          }`}>
            <Activity className={`w-8 h-8 mx-auto mb-3 ${
              activeModules.wargaming ? 'text-red-400' : 'text-gray-600'
            }`} />
            <div className="text-sm font-semibold text-white mb-1">Wargaming</div>
            <div className={`text-xs ${
              activeModules.wargaming ? 'text-red-400' : 'text-gray-500'
            }`}>
              {activeModules.wargaming ? 'Active' : 'Standby'}
            </div>
          </div>
        </div>

        {/* Threat Level & Confidence */}
        <div className="grid grid-cols-2 gap-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Threat Level</span>
              <AlertTriangle className={`w-5 h-5 ${threatColors[threatLevel]} ${
                threatLevel === 'high' ? 'animate-pulse-slow' : ''
              }`} />
            </div>
            <div className={`text-3xl font-bold capitalize ${threatColors[threatLevel]}`}>
              {threatLevel}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Detection Confidence</span>
              <Radio className="w-5 h-5 text-primary-400" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">{detectionConfidence}%</div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-green-500 transition-all duration-1000"
                  style={{ width: `${detectionConfidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-400" />
          System Event Log
        </h4>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Waiting for events...
            </div>
          ) : (
            events.map((event, idx) => {
              const Icon = event.icon
              return (
                <div key={idx} className="flex items-start gap-4 glass rounded-lg p-4 animate-fade-in">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-5 h-5 ${event.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white capitalize">{event.module}</span>
                      <span className="text-xs text-gray-500">{event.time}</span>
                    </div>
                    <p className="text-sm text-gray-300">{event.message}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Integration Flow Diagram */}
      <div className="glass rounded-xl p-8">
        <h4 className="text-lg font-semibold text-white mb-6 text-center">
          Multi-Sensor Fusion Pipeline
        </h4>
        
        <div className="flex items-center justify-between">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto">
              <Volume2 className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-sm text-gray-300">Audio</div>
            <div className="text-xs text-gray-500">Detection</div>
          </div>

          <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 mx-4"></div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto">
              <Sun className="w-8 h-8 text-amber-400" />
            </div>
            <div className="text-sm text-gray-300">Lighting</div>
            <div className="text-xs text-gray-500">Enhancement</div>
          </div>

          <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-500 to-cyan-500 mx-4"></div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="text-sm text-gray-300">Hyperspectral</div>
            <div className="text-xs text-gray-500">Analysis</div>
          </div>

          <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-500 to-red-500 mx-4"></div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-sm text-gray-300">Wargaming</div>
            <div className="text-xs text-gray-500">Validation</div>
          </div>

          <div className="flex-1 h-0.5 bg-gradient-to-r from-red-500 to-green-500 mx-4"></div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-sm text-gray-300">Decision</div>
            <div className="text-xs text-gray-500">Action</div>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="glass rounded-xl p-6 border-l-4 border-primary-500">
        <h4 className="text-lg font-semibold text-white mb-2">The Message</h4>
        <p className="text-gray-300 leading-relaxed mb-4">
          This is the power of ShaheenEye: not four separate systems, but one integrated intelligence. 
          When audio hears something suspicious, lighting adapts to help cameras see better. When 
          hyperspectral analysis detects anomalies, the wargaming AI validates if it matches known 
          tactics. Each module enhances the others, creating a defense system that's greater than 
          the sum of its parts.
        </p>
        <p className="text-primary-400 font-semibold">
          "We don't just protect the neighborhood… we learn from every adversarial attempt, even 
          if it's just a simulation."
        </p>
      </div>
    </div>
  )
}

export default Scenario4
