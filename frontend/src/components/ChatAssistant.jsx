import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your LearnFast AI tutor. Ask me anything about your current topic!",
    },
  ])
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { selectedNode, roadmap } = useApp()
  const { sendChat } = useApi()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || chatLoading) return

    const userMsg = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setChatLoading(true)

    const context = selectedNode
      ? `Learning: ${selectedNode.title} - ${selectedNode.description}`
      : roadmap
      ? `Learning roadmap: ${roadmap.title}`
      : ''

    const history = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const reply = await sendChat(input.trim(), context, history)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-learnfast-500 to-purple-600 
                   rounded-full flex items-center justify-center shadow-lg shadow-learnfast-500/30 
                   hover:shadow-learnfast-500/50 transition-all duration-200 hover:scale-105"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] card flex flex-col shadow-2xl border-gray-700 animate-slide-up">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800 mb-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-white">AI Tutor</span>
            <span className="text-xs text-gray-500 ml-auto">
              {selectedNode ? `Learning: ${selectedNode.title}` : 'General'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-3 px-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-learnfast-500/20 text-learnfast-200 rounded-tr-sm'
                      : 'bg-gray-800 text-gray-300 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl 
                         placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-learnfast-500"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || chatLoading}
              className="p-2 bg-learnfast-500 text-white rounded-xl hover:bg-learnfast-600 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
