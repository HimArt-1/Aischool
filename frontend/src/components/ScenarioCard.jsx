import React from 'react'
import { ArrowRight } from 'lucide-react'

function ScenarioCard({ scenario, onClick }) {
  const Icon = scenario.icon
  
  return (
    <div
      onClick={onClick}
      className="glass rounded-xl p-6 cursor-pointer transition-all hover:scale-105 hover:glow group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${scenario.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{scenario.title}</h3>
          <p className="text-sm text-primary-400 mb-3">{scenario.subtitle}</p>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {scenario.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {scenario.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300"
              >
                {feature}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-primary-400 group-hover:gap-3 transition-all">
            <span className="text-sm font-medium">Launch Demo</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScenarioCard
