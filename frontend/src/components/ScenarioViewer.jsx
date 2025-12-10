import React, { useEffect, useState } from 'react'
import Scenario1 from './scenarios/Scenario1'
import Scenario2 from './scenarios/Scenario2'
import Scenario3 from './scenarios/Scenario3'
import Scenario4 from './scenarios/Scenario4'

function ScenarioViewer({ scenario, isPlaying }) {
  const scenarioComponents = {
    'scenario-1': Scenario1,
    'scenario-2': Scenario2,
    'scenario-3': Scenario3,
    'scenario-4': Scenario4,
  }
  
  const ScenarioComponent = scenarioComponents[scenario.id]
  
  if (!ScenarioComponent) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-gray-400">Scenario visualization coming soon...</p>
      </div>
    )
  }
  
  return <ScenarioComponent isPlaying={isPlaying} />
}

export default ScenarioViewer
