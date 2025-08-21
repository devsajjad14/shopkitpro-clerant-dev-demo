'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Styling</h1>
          <p className="text-gray-600">If you can see this with proper styling, Tailwind is working!</p>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-900">Blue Card</h3>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="font-semibold text-green-900">Green Card</h3>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="font-semibold text-purple-900">Purple Card</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}