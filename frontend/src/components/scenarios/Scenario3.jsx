import React, { useEffect, useState } from 'react'
import { Swords, Trophy, TrendingUp, Target, Zap } from 'lucide-react'

// Scenario 3: AI vs AI - Adversarial Wargaming
function Scenario3({ isPlaying }) {
  const [episode, setEpisode] = useState(0)
  const [blueWins, setBlueWins] = useState(0)
  const [redWins, setRedWins] = useState(0)
  const [currentBattle, setCurrentBattle] = useState(null)
  const [blueDetectionRate, setBlueDetectionRate] = useState(0.60)
  const [redSuccessRate, setRedSuccessRate] = useState(0.50)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setEpisode(prev => {
        const next = prev + 1
        
        // Simulate battle
        const blueDetected = Math.random() < blueDetectionRate
        
        if (blueDetected) {
          setBlueWins(w => w + 1)
          setBlueDetectionRate(rate => Math.min(0.95, rate + 0.002))
          setRedSuccessRate(rate => Math.max(0.10, rate - 0.003))
        } else {
          setRedWins(w => w + 1)
          setRedSuccessRate(rate => Math.min(0.90, rate + 0.001))
        }
        
        // Set current battle details
        const tactics = [
          'Blind spot exploitation',
          'Material camouflage',
          'Timing manipulation',
          'Sensor jamming',
          'Crowd blending',
          'Infrastructure hiding'
        ]
        
        const detectionMethods = [
          'Hyperspectral analysis',
          'Acoustic correlation',
          'Thermal signature',
          'Behavioral pattern',
          'Material fingerprinting'
        ]
        
        setCurrentBattle({
          episode: next,
          redTactic: tactics[Math.floor(Math.random() * tactics.length)],
          blueMethod: detectionMethods[Math.floor(Math.random() * detectionMethods.length)],
          detected: blueDetected,
          confidence: Math.random() * 0.3 + 0.7
        })
        
        return next > 1000 ? 1000 : next
      })
    }, isPlaying ? 50 : 1000) // Fast simulation when playing

    return () => clearInterval(interval)
  }, [isPlaying, blueDetectionRate])

  const totalBattles = blueWins + redWins
  const blueWinRate = totalBattles > 0 ? (blueWins / totalBattles * 100) : 0

  return (
    <div className="space-y-6">
      {/* Main Battle Arena */}
      <div className="glass rounded-xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Adversarial AI Wargaming Arena
            </h3>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse-slow" />
              <span className="text-sm text-gray-300">Episode {episode} / 1000</span>
            </div>
          </div>

          {/* Battle Visualization */}
          <div className="grid grid-cols-3 gap-8 items-center mb-8">
            {/* Red AI */}
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center glow-amber relative">
                <Target className="w-16 h-16 text-white" />
                {currentBattle && !currentBattle.detected && (
                  <div className="absolute -top-2 -right-2">
                    <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold text-red-400 mb-1">Red-AI</h4>
                <p className="text-sm text-gray-400">Criminal Simulator</p>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-1">{redWins}</div>
                <div className="text-xs text-gray-400">Successful Evasions</div>
                <div className="mt-2 text-sm text-gray-300">
                  Success Rate: {(redSuccessRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <Swords className="w-16 h-16 mx-auto text-primary-400 mb-4 animate-pulse-slow" />
              {currentBattle && (
                <div className="glass rounded-lg p-4 animate-fade-in">
                  <div className="text-xs text-gray-400 mb-2">Current Battle</div>
                  <div className="text-sm text-accent-400 mb-1">{currentBattle.redTactic}</div>
                  <div className="text-xs text-gray-500">vs</div>
                  <div className="text-sm text-primary-400 mt-1">{currentBattle.blueMethod}</div>
                  <div className="mt-3 text-xs font-semibold">
                    <span className={currentBattle.detected ? 'text-green-400' : 'text-red-400'}>
                      {currentBattle.detected ? '✓ DETECTED' : '✗ EVADED'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Blue AI */}
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center glow relative">
                <Eye className="w-16 h-16 text-white" />
                {currentBattle && currentBattle.detected && (
                  <div className="absolute -top-2 -right-2">
                    <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary-400 mb-1">Blue-AI</h4>
                <p className="text-sm text-gray-400">SCAR-EYE Defense</p>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-1">{blueWins}</div>
                <div className="text-xs text-gray-400">Successful Detections</div>
                <div className="mt-2 text-sm text-gray-300">
                  Detection Rate: {(blueDetectionRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Win Rate Progress</span>
              <span>{blueWinRate.toFixed(1)}% Blue-AI</span>
            </div>
            <div className="h-4 bg-black/40 rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-primary-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${blueWinRate}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                style={{ width: `${100 - blueWinRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Curves */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">Blue-AI Learning Curve</h4>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Detection Rate</span>
                <span>{(blueDetectionRate * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-green-500 transition-all"
                  style={{ width: `${blueDetectionRate * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-green-400">
              ↑ Improving with each episode
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">Red-AI Adaptation</h4>
            <Target className="w-4 h-4 text-red-400" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Success Rate</span>
                <span>{(redSuccessRate * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                  style={{ width: `${redSuccessRate * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-red-400">
              ↓ Decreasing as Blue-AI learns
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-2">{episode}</div>
          <div className="text-sm text-gray-400">Episodes Run</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-primary-400 mb-2">{blueWins}</div>
          <div className="text-sm text-gray-400">Blue-AI Wins</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-red-400 mb-2">{redWins}</div>
          <div className="text-sm text-gray-400">Red-AI Wins</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-accent-400 mb-2">
            {episode > 0 ? Math.floor(episode / ((Date.now() % 10000) / 1000)) : 0}
          </div>
          <div className="text-sm text-gray-400">Episodes/sec</div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="glass rounded-xl p-6 border-l-4 border-primary-500">
        <h4 className="text-lg font-semibold text-white mb-2">Key Insight</h4>
        <p className="text-gray-300 leading-relaxed">
          Through millions of simulated battles, Blue-AI learns to detect tactics that haven't 
          even been used by real criminals yet. This adversarial training creates a defense system 
          that's always ahead of the curve, predicting not just crimes, but the evolution of 
          criminal tactics themselves.
        </p>
      </div>
    </div>
  )
}

// Import Eye icon
import { Eye } from 'lucide-react'

export default Scenario3
