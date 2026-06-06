import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'
import confetti from 'canvas-confetti'

export default function Roadmap() {
  const { roadmap, selectNode, completeNode, completedNodes, xp, level, achievements, addAchievement, user, token, lastNodeId } = useApp()
  const { generateProjects, syncProgress } = useApi()
  const [projects, setProjects] = useState(null)
  const [projectLoading, setProjectLoading] = useState(false)

  useEffect(() => {
    if (lastNodeId && user && token) {
      syncProgress({ xp, level, achievements, completed_nodes: {} })
    }
  }, [lastNodeId])

  if (!roadmap) return null

  const totalNodes = roadmap.stages.reduce((sum, s) => sum + s.nodes.length, 0)
  const progress = Math.round((completedNodes.length / totalNodes) * 100)

  async function handleGenerateProjects() {
    setProjectLoading(true)
    try {
      const result = await generateProjects(roadmap.title, '', 'intermediate')
      setProjects(result)
    } catch { /* ignore */ } finally { setProjectLoading(false) }
  }

  function handleCompleteNode(node) {
    completeNode(node.id)
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7', '#ec4899'] })
    if (completedNodes.length + 1 === totalNodes) {
      addAchievement({ id: 'roadmap-complete', title: 'Roadmap Complete', description: 'Completed every node in a roadmap!', icon: '🏆' })
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white font-display">{roadmap.title}</h1>
          <span className="text-sm text-gray-400">{completedNodes.length}/{totalNodes} nodes</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-learnfast-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
      </div>

      <div className="space-y-6">
        {roadmap.stages.map((stage, index) => {
          const stageNodes = stage.nodes
          const completedInStage = stageNodes.filter((n) => completedNodes.includes(n.id)).length
          return (
            <div key={stage.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-learnfast-500/20 text-learnfast-400 text-sm font-bold">{index + 1}</span>
                    <h2 className="text-xl font-semibold text-white">{stage.title}</h2>
                  </div>
                  <p className="text-gray-400 text-sm ml-9">{stage.description}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{completedInStage}/{stageNodes.length}</span>
              </div>
              <div className="grid gap-3 ml-9">
                {stageNodes.map((node) => {
                  const isCompleted = completedNodes.includes(node.id)
                  return (
                    <button key={node.id} onClick={() => selectNode(node)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${isCompleted ? 'bg-green-500/10 border border-green-500/20' : 'bg-gray-800/50 border border-gray-800 hover:border-gray-700 hover:bg-gray-800'}`}>
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                        {isCompleted ? '✓' : node.type === 'project' ? '🛠' : node.type === 'quiz' ? '📝' : '📖'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-sm font-medium truncate ${isCompleted ? 'text-green-400' : 'text-gray-200'}`}>{node.title}</span>
                        <span className="text-xs text-gray-500">{node.xp} XP</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8">
        <button onClick={handleGenerateProjects} disabled={projectLoading} className="btn-secondary w-full">
          {projectLoading ? 'Generating projects...' : 'Generate Practice Projects'}
        </button>
        {projects && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="card">
                <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 text-xs bg-learnfast-500/10 text-learnfast-400 rounded-full">{skill}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>~{project.estimatedHours}h</span>
                  <span className="text-learnfast-400">{project.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
