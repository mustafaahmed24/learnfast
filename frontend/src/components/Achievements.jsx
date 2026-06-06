import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

const allAchievements = [
  { id: 'first-roadmap', title: 'First Roadmap', description: 'Generated your first learning roadmap!', icon: '🗺️' },
  { id: 'roadmap-complete', title: 'Roadmap Complete', description: 'Completed every node in a roadmap!', icon: '🏆' },
  { id: 'test-ace', title: 'Test Ace', description: 'Passed a knowledge test with flying colors!', icon: '🎯' },
  { id: 'chat-master', title: 'Chat Master', description: 'Asked 10 questions in the AI chat', icon: '💬' },
  { id: 'level-5', title: 'Level 5', description: 'Reached level 5!', icon: '⭐' },
  { id: 'project-builder', title: 'Project Builder', description: 'Generated your first practice project', icon: '🛠' },
]

export default function Achievements() {
  const { achievements, xp, level, user } = useApp()
  const unlockedIds = new Set(achievements.map((a) => a.id))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-display mb-2">Achievements</h1>
          <p className="text-gray-400">
            Level {level} &middot; {xp} Total XP &middot; {achievements.length}/{allAchievements.length} unlocked
            {user && <span className="ml-2 text-learnfast-400"> &middot; {user.display_name || user.email}</span>}
          </p>
        </div>
        <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">&larr; Back</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {allAchievements.map((ach) => {
          const unlocked = unlockedIds.has(ach.id)
          return (
            <div key={ach.id} className={`card flex items-center gap-4 ${unlocked ? '' : 'opacity-40'}`}>
              <span className="text-3xl">{unlocked ? ach.icon : '🔒'}</span>
              <div>
                <h3 className={`font-semibold ${unlocked ? 'text-white' : 'text-gray-500'}`}>{ach.title}</h3>
                <p className="text-sm text-gray-500">{ach.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
