import React, { useEffect, useState } from 'react'
import { 
  CheckCircle, 
  AlertCircle, 
  Wifi, 
  Database,
  Cpu,
  HardDrive,
  Activity,
  Server,
  Eye,
  Layers
} from 'lucide-react'
import axios from 'axios'

function SystemStatus() {
  const [systemHealth, setSystemHealth] = useState({
    status: 'operational',
    uptime: '99.8%',
    lastUpdate: new Date().toISOString()
  })

  const [modules, setModules] = useState([
    {
      id: 'hyperspectral',
      name: 'Hyperspectral Analysis',
      status: 'online',
      performance: 94,
      lastActivity: '2 sec ago',
      icon: Layers
    },
    {
      id: 'lighting',
      name: 'Adaptive Lighting',
      status: 'online',
      performance: 97,
      lastActivity: '5 sec ago',
      icon: Activity
    },
    {
      id: 'audio',
      name: 'Audio Processing',
      status: 'online',
      performance: 91,
      lastActivity: '1 sec ago',
      icon: Wifi
    },
    {
      id: 'wargaming',
      name: 'AI Wargaming',
      status: 'online',
      performance: 89,
      lastActivity: '3 sec ago',
      icon: Cpu
    }
  ])

  const [resources, setResources] = useState({
    cpu: 45,
    memory: 67,
    storage: 34,
    network: 23
  })

  // Fetch system status from API
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get('/api/status')
        if (response.data) {
          // Update with real data
          console.log('System status:', response.data)
        }
      } catch (error) {
        console.log('Using mock data')
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">System Status</h1>
        <p className="text-gray-400">Monitor system health and performance metrics</p>
      </div>

      {/* Overall Health */}
      <div className="glass rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">System Operational</h2>
              <p className="text-gray-400">All core modules functioning normally</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-400 mb-1">{systemHealth.uptime}</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>
      </div>

      {/* Module Status */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Core Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map(module => {
            const Icon = module.icon
            return (
              <div key={module.id} className="glass rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{module.name}</h4>
                      <p className="text-sm text-gray-400">Last activity: {module.lastActivity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
                    <span className="text-xs text-green-400 capitalize">{module.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Performance</span>
                    <span className="text-white font-semibold">{module.performance}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-green-500 transition-all"
                      style={{ width: `${module.performance}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resource Usage */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Resource Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-2xl font-bold text-white">{resources.cpu}%</span>
            </div>
            <div className="text-sm text-gray-400 mb-2">CPU Usage</div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 transition-all"
                style={{ width: `${resources.cpu}%` }}
              ></div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{resources.memory}%</span>
            </div>
            <div className="text-sm text-gray-400 mb-2">Memory</div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${resources.memory}%` }}
              ></div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-2xl font-bold text-white">{resources.storage}%</span>
            </div>
            <div className="text-sm text-gray-400 mb-2">Storage</div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                style={{ width: `${resources.storage}%` }}
              ></div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{resources.network}%</span>
            </div>
            <div className="text-sm text-gray-400 mb-2">Network</div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                style={{ width: `${resources.network}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">API Endpoints</h3>
        <div className="glass rounded-xl p-6">
          <div className="space-y-3">
            {[
              { method: 'GET', endpoint: '/api/status', status: 'active' },
              { method: 'POST', endpoint: '/api/hyperspectral/analyze', status: 'active' },
              { method: 'POST', endpoint: '/api/lighting/adjust', status: 'active' },
              { method: 'POST', endpoint: '/api/wargaming/start', status: 'active' },
              { method: 'POST', endpoint: '/api/audio/process', status: 'active' },
              { method: 'GET', endpoint: '/api/digital-twin/state', status: 'active' },
            ].map((api, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                    api.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'
                  }`}>
                    {api.method}
                  </span>
                  <span className="font-mono text-sm text-gray-300">{api.endpoint}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
                  <span className="text-xs text-green-400">{api.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Server className="w-5 h-5 text-primary-400" />
            <h4 className="font-semibold text-white">Backend</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Framework</span>
              <span className="text-white">FastAPI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Port</span>
              <span className="text-white">8000</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-5 h-5 text-accent-400" />
            <h4 className="font-semibold text-white">Frontend</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Framework</span>
              <span className="text-white">React + Vite</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Port</span>
              <span className="text-white">3000</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-purple-400" />
            <h4 className="font-semibold text-white">Database</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="text-white">In-Memory</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Records</span>
              <span className="text-white">1,247</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemStatus
