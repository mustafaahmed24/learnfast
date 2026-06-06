import { useState } from 'react'

const API_BASE = '/api'

function getHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generateRoadmap(topic) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/roadmap`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ topic }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to generate roadmap')
      return await res.json()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function sendChat(message, context, history) {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message, context, history }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Chat failed')
      return (await res.json()).reply
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  async function generateTest(topic, stageTitle) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/generate-test`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ topic, stage_title: stageTitle }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to generate test')
      return (await res.json()).questions
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function generateProjects(topic, stage, difficulty) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/generate-projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ topic, stage, difficulty }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to generate projects')
      return (await res.json()).projects
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function saveRoadmap(topic, title, roadmapData) {
    try {
      const res = await fetch(`${API_BASE}/progress/save-roadmap`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ topic, title, roadmap_data: roadmapData }),
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  async function syncProgress(data) {
    try {
      const res = await fetch(`${API_BASE}/progress/sync`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  async function fetchUserState() {
    try {
      const res = await fetch(`${API_BASE}/progress/state`, { headers: getHeaders() })
      return await res.json()
    } catch {
      return null
    }
  }

  return { loading, error, generateRoadmap, sendChat, generateTest, generateProjects, saveRoadmap, syncProgress, fetchUserState }
}
