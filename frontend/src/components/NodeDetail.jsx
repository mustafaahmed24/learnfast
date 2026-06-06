import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'
import confetti from 'canvas-confetti'

export default function NodeDetail() {
  const {
    selectedNode,
    roadmap,
    backToRoadmap,
    completeNode,
    completedNodes,
    addAchievement,
  } = useApp()
  const { generateTest } = useApi()

  const [testQuestions, setTestQuestions] = useState(null)
  const [testAnswers, setTestAnswers] = useState({})
  const [testSubmitted, setTestSubmitted] = useState(false)
  const [testLoading, setTestLoading] = useState(false)

  if (!selectedNode) return null

  const isCompleted = completedNodes.includes(selectedNode.id)

  const stage = roadmap?.stages?.find((s) =>
    s.nodes.find((n) => n.id === selectedNode.id)
  )

  async function handleStartTest() {
    if (!selectedNode) return
    setTestLoading(true)
    try {
      const questions = await generateTest(
        selectedNode.title,
        stage?.title || ''
      )
      setTestQuestions(questions)
      setTestAnswers({})
      setTestSubmitted(false)
    } catch {
      /* ignore */
    } finally {
      setTestLoading(false)
    }
  }

  function handleAnswer(questionId, index) {
    setTestAnswers((prev) => ({ ...prev, [questionId]: index }))
  }

  function handleSubmitTest() {
    setTestSubmitted(true)
    if (testQuestions) {
      const correct = testQuestions.filter(
        (q) => testAnswers[q.id] === q.correctIndex
      ).length
      if (correct === testQuestions.length) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#6366f1', '#a855f7', '#ec4899'],
        })
        if (!isCompleted) {
          completeNode(selectedNode.id)
        }
        addAchievement({
          id: `test-${selectedNode.id}`,
          title: 'Test Ace',
          description: `Passed the ${selectedNode.title} test!`,
          icon: '🎯',
        })
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={backToRoadmap}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Roadmap
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {selectedNode.type === 'project' ? '🛠' : selectedNode.type === 'quiz' ? '📝' : '📖'}
              </span>
              <h1 className="text-2xl font-bold text-white font-display">
                {selectedNode.title}
              </h1>
            </div>
            {stage && (
              <span className="text-sm text-gray-500">
                Stage: {stage.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                Completed
              </span>
            )}
            <span className="px-3 py-1 bg-learnfast-500/20 text-learnfast-400 text-sm rounded-full">
              {selectedNode.xp} XP
            </span>
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed mb-6">
          {selectedNode.description}
        </p>

        {selectedNode.resources?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              {selectedNode.resources.map((resource, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-400"
                >
                  <span className="w-1.5 h-1.5 bg-learnfast-500 rounded-full" />
                  {resource}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isCompleted && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                completeNode(selectedNode.id)
                confetti({
                  particleCount: 60,
                  spread: 60,
                  origin: { y: 0.6 },
                })
              }}
              className="btn-primary"
            >
              Mark as Complete
            </button>
            <button
              onClick={handleStartTest}
              disabled={testLoading}
              className="btn-secondary"
            >
              {testLoading ? 'Generating...' : 'Take Knowledge Test'}
            </button>
          </div>
        )}
      </div>

      {testQuestions && (
        <div className="mt-6 card">
          <h2 className="text-xl font-semibold text-white mb-6 font-display">
            Knowledge Test
          </h2>

          <div className="space-y-6">
            {testQuestions.map((q, qi) => (
              <div key={q.id}>
                <p className="text-gray-200 font-medium mb-3">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option, oi) => {
                    const isSelected = testAnswers[q.id] === oi
                    const isCorrect = q.correctIndex === oi
                    const showResult = testSubmitted

                    let borderClass = 'border-gray-700 hover:border-gray-600'
                    if (showResult && isCorrect) borderClass = 'border-green-500 bg-green-500/10'
                    else if (showResult && isSelected && !isCorrect)
                      borderClass = 'border-red-500 bg-red-500/10'
                    else if (isSelected) borderClass = 'border-learnfast-500 bg-learnfast-500/10'

                    return (
                      <button
                        key={oi}
                        onClick={() => !testSubmitted && handleAnswer(q.id, oi)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${borderClass} ${
                          testSubmitted ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <span
                          className={`text-sm ${
                            showResult && isCorrect
                              ? 'text-green-400'
                              : showResult && isSelected && !isCorrect
                              ? 'text-red-400'
                              : 'text-gray-300'
                          }`}
                        >
                          {option}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {testSubmitted && (
                  <p className="mt-2 text-sm text-gray-500">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>

          {!testSubmitted ? (
            <button
              onClick={handleSubmitTest}
              disabled={Object.keys(testAnswers).length !== testQuestions.length}
              className="btn-primary mt-6"
            >
              Submit Answers
            </button>
          ) : (
            <p className="mt-4 text-center text-gray-400">
              {testQuestions.filter((q) => testAnswers[q.id] === q.correctIndex)
                .length === testQuestions.length
                ? 'All correct! 🎉'
                : `Score: ${
                    testQuestions.filter(
                      (q) => testAnswers[q.id] === q.correctIndex
                    ).length
                  }/${testQuestions.length}. Keep learning and try again!`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
