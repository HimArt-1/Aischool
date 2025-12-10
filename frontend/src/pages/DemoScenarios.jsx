import React, { useState } from 'react'
import { 
  Moon, 
  Volume2, 
  Swords, 
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  ChevronRight
} from 'lucide-react'
import ScenarioCard from '../components/ScenarioCard'
import ScenarioViewer from '../components/ScenarioViewer'

function DemoScenarios() {
  const [activeScenario, setActiveScenario] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const scenarios = [
    {
      id: 'scenario-1',
      title: 'Silent Night',
      subtitle: 'Adaptive Illuminance in Action',
      description: 'Watch as the system subtly adjusts street lighting to improve visibility without alerting potential threats.',
      icon: Moon,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Real-time lighting adjustment',
        '10-15% brightness increase',
        'Imperceptible to human eye',
        'Enhanced camera performance'
      ]
    },
    {
      id: 'scenario-2',
      title: 'Sound Before Sight',
      subtitle: 'Audio-Visual Correlation',
      description: 'Experience how the system detects suspicious sounds and correlates them with visual data in 3D space.',
      icon: Volume2,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Directional audio detection',
        'Spatial sound triangulation',
        '3D acoustic heatmap',
        'Visual-audio fusion'
      ]
    },
    {
      id: 'scenario-3',
      title: 'AI vs AI',
      subtitle: 'Adversarial Wargaming',
      description: 'Watch Red-AI attempt to evade detection while Blue-AI learns to counter novel attack strategies.',
      icon: Swords,
      color: 'from-red-500 to-orange-500',
      features: [
        'Real-time AI battle',
        'Adaptive learning',
        'Thousands of iterations',
        'Evolution tracking'
      ]
    },
    {
      id: 'scenario-4',
      title: 'The Message',
      subtitle: 'Complete System Integration',
      description: 'See all systems working together: hyperspectral analysis, adaptive lighting, audio correlation, and AI wargaming.',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      features: [
        'Full system integration',
        'Multi-sensor fusion',
        'Real-time threat detection',
        'Predictive analytics'
      ]
    }
  ]

  const handleScenarioSelect = (scenario) => {
    setActiveScenario(scenario)
    setIsPlaying(false)
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    // Reset scenario state
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
          Interactive Demo Scenarios
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
          Experience the four core innovations of ShaheenEye through interactive demonstrations
        </p>
      </div>

      {/* Scenario Selection */}
      {!activeScenario ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onClick={() => handleScenarioSelect(scenario)}
            />
          ))}
        </div>
      ) : (
        /* Active Scenario Viewer */
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setActiveScenario(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Scenarios
          </button>

          {/* Scenario Header */}
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${activeScenario.color} rounded-xl flex items-center justify-center glow`}>
                  <activeScenario.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{activeScenario.title}</h2>
                  <p className="text-primary-400 mt-1">{activeScenario.subtitle}</p>
                  <p className="text-gray-400 mt-2">{activeScenario.description}</p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex gap-2">
                <button
                  onClick={handlePlay}
                  className="p-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors glow"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-3 glass hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activeScenario.features.map((feature, index) => (
                <div key={index} className="glass rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-300">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Visualization */}
          <ScenarioViewer 
            scenario={activeScenario} 
            isPlaying={isPlaying}
          />
        </div>
      )}

      {/* Info Cards */}
      {!activeScenario && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="glass rounded-xl p-6 space-y-3">
            <div className="text-4xl font-bold text-primary-400">224</div>
            <div className="text-gray-300">Spectral Bands</div>
            <div className="text-sm text-gray-500">Hyperspectral analysis capability</div>
          </div>
          
          <div className="glass rounded-xl p-6 space-y-3">
            <div className="text-4xl font-bold text-accent-400">12%</div>
            <div className="text-gray-300">Subtle Increase</div>
            <div className="text-sm text-gray-500">Imperceptible lighting adjustment</div>
          </div>
          
          <div className="glass rounded-xl p-6 space-y-3">
            <div className="text-4xl font-bold text-green-400">95%</div>
            <div className="text-gray-300">Detection Rate</div>
            <div className="text-sm text-gray-500">After AI wargaming training</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DemoScenarios
