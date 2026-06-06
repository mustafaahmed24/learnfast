import { useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Roadmap from './components/Roadmap'
import NodeDetail from './components/NodeDetail'
import ChatAssistant from './components/ChatAssistant'
import Achievements from './components/Achievements'
import LoginModal from './components/LoginModal'
import { Routes, Route } from 'react-router-dom'

export default function App() {
  const { view, selectedNode } = useApp()

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <main className="relative">
            {view === 'landing' && <div className="animate-fade-in"><Hero /></div>}
            {view === 'roadmap' && <div className="animate-fade-in"><Roadmap /></div>}
            {view === 'node-detail' && selectedNode && <div className="animate-fade-in"><NodeDetail /></div>}
          </main>
        } />
        <Route path="/achievements" element={<Achievements />} />
      </Routes>
      <ChatAssistant />
      <LoginModal />
    </div>
  )
}
