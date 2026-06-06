import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { xp, level, achievements, user, logout, openLoginModal } = useApp()

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <span className="text-xl font-bold gradient-text font-display">
              LearnFast
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full border border-gray-800">
              <span className="text-sm font-medium text-purple-400">Lv.{level}</span>
              <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-learnfast-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(xp % 500) / 5}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{xp} XP</span>
            </div>

            <Link
              to="/achievements"
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              {achievements.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-learnfast-500 rounded-full text-xs flex items-center justify-center font-bold">
                  {achievements.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 hidden sm:block">{user.display_name || user.email}</span>
                <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={openLoginModal} className="btn-primary text-sm py-2 px-4">
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
