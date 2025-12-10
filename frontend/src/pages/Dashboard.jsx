import React, { useEffect, useState } from 'react'
import { 
  Eye, 
  Camera, 
  Lightbulb, 
  Mic, 
  Activity,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react'

function Dashboard() {
  const [stats, setStats] = useState({
    cameras: 12,
    lights: 24,
    microphones: 8,
    activeAlerts: 2,
    coverage: 95,
    detectionRate: 87
  })

  const [recentEvents, setRecentEvents] = useState([
    {
      id: 1,
      type: 'hyperspectral',
      severity: 'medium',
      location: 'Zone A-3',
      time: '2 min ago',
      message: 'Material anomaly detected'
    },
    {
      id: 2,
      type: 'audio',
      severity: 'low',
      location: 'Zone B-1',
      time: '5 min ago',
      message: 'Acoustic event recorded'
    },
    {
      id: 3,
      type: 'lighting',
      severity: 'info',
      location: 'Zone C-2',
      time: '8 min ago',
      message: 'Adaptive lighting activated'
    }
  ])

  const [wargamingStats, setWargamingStats] = useState({
    totalEpisodes: 15420,
    blueWinRate: 89.3,
    redWinRate: 10.7,
    currentStreak: 47
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Dashboard</h1>
          <p className="text-gray-400">Real-time monitoring and analytics</p>
        </div>
        <div className="glass rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-gray-300">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.cameras}</div>
          <div className="text-sm text-gray-400">Active Cameras</div>
          <div className="mt-2 text-xs text-green-400">↑ 100% operational</div>
        </div>

        <div className="glass rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.lights}</div>
          <div className="text-sm text-gray-400">Smart Lights</div>
          <div className="mt-2 text-xs text-amber-400">⚡ Adaptive mode</div>
        </div>

        <div className="glass rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Mic className="w-6 h-6 text-purple-400" />
            </div>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.microphones}</div>
          <div className="text-sm text-gray-400">Microphones</div>
          <div className="mt-2 text-xs text-purple-400">🔊 Listening</div>
        </div>

        <div className="glass rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-xs px-2 py-1 bg-red-500/20 rounded-full text-red-400">
              Active
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.activeAlerts}</div>
          <div className="text-sm text-gray-400">Active Alerts</div>
          <div className="mt-2 text-xs text-red-400">⚠ Requires attention</div>
        </div>
      </div>

      {/* Coverage & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Area Coverage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Visual Coverage</span>
                <span className="text-white font-semibold">{stats.coverage}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 transition-all"
                  style={{ width: `${stats.coverage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Acoustic Coverage</span>
                <span className="text-white font-semibold">92%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all w-[92%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Lighting Control</span>
                <span className="text-white font-semibold">88%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all w-[88%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Detection Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <div className="text-sm text-gray-400 mb-1">Overall Detection Rate</div>
                <div className="text-2xl font-bold text-primary-400">{stats.detectionRate}%</div>
              </div>
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
                <Eye className="w-8 h-8 text-primary-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">False Positives</div>
                <div className="text-xl font-bold text-green-400">3.2%</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Response Time</div>
                <div className="text-xl font-bold text-primary-400">1.8s</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wargaming Statistics */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">AI Wargaming Statistics</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{wargamingStats.totalEpisodes.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Episodes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-400 mb-2">{wargamingStats.blueWinRate}%</div>
            <div className="text-sm text-gray-400">Blue-AI Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">{wargamingStats.redWinRate}%</div>
            <div className="text-sm text-gray-400">Red-AI Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{wargamingStats.currentStreak}</div>
            <div className="text-sm text-gray-400">Current Streak</div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Events</h3>
          <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentEvents.map(event => (
            <div key={event.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                event.severity === 'medium' ? 'bg-yellow-500/20' :
                event.severity === 'low' ? 'bg-blue-500/20' :
                'bg-gray-500/20'
              }`}>
                {event.type === 'hyperspectral' && <Eye className="w-5 h-5 text-cyan-400" />}
                {event.type === 'audio' && <Mic className="w-5 h-5 text-purple-400" />}
                {event.type === 'lighting' && <Lightbulb className="w-5 h-5 text-amber-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">{event.message}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
