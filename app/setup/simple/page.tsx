import React from 'react'

export default function SimpleSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00437f] to-[#003366] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Setup Wizard</h1>
        <p className="text-white/80 text-center mb-6">Welcome to the setup wizard!</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Store Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your store name"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Store Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your store email"
            />
          </div>
          
          <button className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200">
            Continue Setup
          </button>
        </div>
      </div>
    </div>
  )
} 