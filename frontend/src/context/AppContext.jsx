import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

const AppContext = createContext()

const initialState = {
  topic: '',
  roadmap: null,
  selectedNode: null,
  loading: false,
  error: null,
  stageProgress: {},
  completedNodes: [],
  completedNodesMap: {},
  xp: 0,
  level: 1,
  achievements: [],
  chatHistory: [],
  view: 'landing',
  user: null,
  token: null,
  loginModalVisible: false,
  savedRoadmaps: [],
  lastNodeId: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TOPIC':
      return { ...state, topic: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null }
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'SET_ROADMAP':
      return { ...state, roadmap: action.payload, loading: false, view: 'roadmap', completedNodes: [], lastNodeId: null }
    case 'SELECT_NODE':
      return { ...state, selectedNode: action.payload, view: 'node-detail' }
    case 'BACK_TO_ROADMAP':
      return { ...state, selectedNode: null, view: 'roadmap' }
    case 'COMPLETE_NODE': {
      const nodeId = action.payload
      if (state.completedNodes.includes(nodeId)) return state
      const xpGain = state.roadmap?.stages
        ?.flatMap((s) => s.nodes)
        ?.find((n) => n.id === nodeId)?.xp || 50
      const newXp = state.xp + xpGain
      const newLevel = Math.floor(newXp / 500) + 1
      return {
        ...state,
        completedNodes: [...state.completedNodes, nodeId],
        xp: newXp,
        level: newLevel,
        lastNodeId: nodeId,
      }
    }
    case 'SET_VIEW':
      return { ...state, view: action.payload }
    case 'ADD_CHAT':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] }
    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] }
    case 'ADD_ACHIEVEMENT':
      if (state.achievements.find((a) => a.id === action.payload.id)) return state
      return { ...state, achievements: [...state.achievements, action.payload] }
    case 'SET_USER':
      return { ...state, user: action.payload.user, token: action.payload.token }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return { ...state, user: null, token: null }
    case 'SHOW_LOGIN':
      return { ...state, loginModalVisible: true }
    case 'HIDE_LOGIN':
      return { ...state, loginModalVisible: false }
    case 'SET_SAVED_ROADMAPS':
      return { ...state, savedRoadmaps: action.payload }
    case 'LOAD_REMOTE_STATE':
      return { ...state, xp: action.payload.xp, level: action.payload.level, achievements: action.payload.achievements }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((user) => {
          if (user.id) dispatch({ type: 'SET_USER', payload: { user, token } })
          else localStorage.removeItem('token')
        })
        .catch(() => localStorage.removeItem('token'))
    }
  }, [])

  const setTopic = useCallback((t) => dispatch({ type: 'SET_TOPIC', payload: t }), [])
  const setLoading = useCallback((l) => dispatch({ type: 'SET_LOADING', payload: l }), [])
  const setError = useCallback((e) => dispatch({ type: 'SET_ERROR', payload: e }), [])
  const setRoadmap = useCallback((r) => dispatch({ type: 'SET_ROADMAP', payload: r }), [])
  const selectNode = useCallback((n) => dispatch({ type: 'SELECT_NODE', payload: n }), [])
  const backToRoadmap = useCallback(() => dispatch({ type: 'BACK_TO_ROADMAP' }), [])
  const completeNode = useCallback((id) => dispatch({ type: 'COMPLETE_NODE', payload: id }), [])
  const setView = useCallback((v) => dispatch({ type: 'SET_VIEW', payload: v }), [])
  const addChat = useCallback((m) => dispatch({ type: 'ADD_CHAT', payload: m }), [])
  const clearChat = useCallback(() => dispatch({ type: 'CLEAR_CHAT' }), [])
  const addAchievement = useCallback((a) => dispatch({ type: 'ADD_ACHIEVEMENT', payload: a }), [])
  const setUser = useCallback((u) => dispatch({ type: 'SET_USER', payload: u }), [])
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), [])
  const openLoginModal = useCallback(() => dispatch({ type: 'SHOW_LOGIN' }), [])
  const closeLoginModal = useCallback(() => dispatch({ type: 'HIDE_LOGIN' }), [])
  const setSavedRoadmaps = useCallback((r) => dispatch({ type: 'SET_SAVED_ROADMAPS', payload: r }), [])
  const loadRemoteState = useCallback((s) => dispatch({ type: 'LOAD_REMOTE_STATE', payload: s }), [])

  return (
    <AppContext.Provider
      value={{
        ...state,
        setTopic, setLoading, setError, setRoadmap, selectNode,
        backToRoadmap, completeNode, setView, addChat, clearChat,
        addAchievement, setUser, logout, openLoginModal, closeLoginModal,
        setSavedRoadmaps, loadRemoteState,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
