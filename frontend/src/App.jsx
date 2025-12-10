import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DemoScenarios from './pages/DemoScenarios'
import SystemStatus from './pages/SystemStatus'
import Header from './components/Header'
import Navigation from './components/Navigation'

function App() {
  const [currentPage, setCurrentPage] = useState('demo')

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0d1234] to-[#0a0e27]">
        <Header />
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/demo" replace />} />
            <Route path="/demo" element={<DemoScenarios />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/status" element={<SystemStatus />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
