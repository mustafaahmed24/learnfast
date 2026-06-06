import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'

const examples = [
  'React from scratch',
  'Machine Learning fundamentals',
  'Python for data science',
  'System design for interviews',
  'Full-stack web development',
  'Rust programming language',
]

export default function Hero() {
  const [input, setInput] = useState('')
  const { setTopic, setRoadmap, setLoading, setError, loading, error, addAchievement, user, loadRemoteState, setSavedRoadmaps } = useApp()
  const { generateRoadmap, saveRoadmap, fetchUserState } = useApi()

  useEffect(() => {
    if (user) {
      fetchUserState().then((state) => {
        if (state?.authenticated) {
          loadRemoteState(state.user)
          setSavedRoadmaps(state.roadmaps || [])
        }
      })
    }
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    setTopic(input.trim())
    setLoading(true)
    try {
      const roadmap = await generateRoadmap(input.trim())
      setRoadmap(roadmap)
      addAchievement({
        id: 'first-roadmap',
        title: 'First Roadmap',
        description: 'Generated your first learning roadmap!',
        icon: '🗺️',
      })
      if (user) {
        await saveRoadmap(input.trim(), roadmap.title, roadmap)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  function handleExample(example) {
    setInput(example)
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-learnfast-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-learnfast-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-gray-900/80 border border-gray-800 rounded-full text-sm text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          AI-Powered Learning Companion
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
          <span className="gradient-text">Learn to code</span>
          <br />
          <span className="text-white">with an AI guide</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Type any topic and get a personalized, interactive learning roadmap.
          <br className="hidden sm:block" />
          No more tutorial paralysis. Just a clear path from zero to confident.
        </p>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you want to learn?"
              className="input-primary pr-32 h-14 text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 h-10 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Roadmap'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
            {error.includes('RESOURCE_EXHAUSTED') && (
              <p className="text-gray-400 text-xs mt-2">
                The Gemini API key has hit its free tier limit.{' '}
                <a href="https://aistudio.google.com/apikey" className="text-learnfast-400 hover:underline" target="_blank" rel="noopener noreferrer">
                  Create a new API key
                </a>{' '}
                and update <code className="text-gray-300">backend/.env</code>.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-sm text-gray-500 mr-1">Try:</span>
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => handleExample(ex)}
              className="px-3 py-1 text-sm text-gray-400 bg-gray-900/80 border border-gray-800 
                         rounded-full hover:border-gray-700 hover:text-gray-200 transition-all"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
