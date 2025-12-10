import React from 'react'
import { Eye } from 'lucide-react'

function Header() {
  return (
    <header className="glass border-b border-white/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center glow">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                عين الشاهين - ShaheenEye
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                From Predicting Crime... to Predicting Crime Evolution
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 glass rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
                <span className="text-sm text-gray-300">System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
