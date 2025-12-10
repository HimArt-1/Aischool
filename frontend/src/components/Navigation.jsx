import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Play, BarChart3, Activity } from 'lucide-react'

function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/demo', label: 'Demo Scenarios', icon: Play },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/status', label: 'System Status', icon: Activity },
  ]
  
  return (
    <nav className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-6 py-4 transition-all
                  ${isActive 
                    ? 'border-b-2 border-primary-500 text-primary-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
