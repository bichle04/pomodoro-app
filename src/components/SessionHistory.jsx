"use client"

import { useState, useEffect } from "react"
import { storageService } from "../services/storage.js"

const SessionHistory = ({ onClose }) => {
  const [sessions, setSessions] = useState([])
  const [filter, setFilter] = useState("today") // 'today', 'week', 'all'
  const [stats, setStats] = useState(storageService.getStats())

  useEffect(() => {
    loadSessions()
  }, [filter])

  const loadSessions = () => {
    let filteredSessions = []
    const allSessions = storageService.getSessions()

    switch (filter) {
      case "today":
        filteredSessions = storageService.getTodaySessions()
        break
      case "week":
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filteredSessions = allSessions.filter((session) => new Date(session.completedAt) >= weekAgo)
        break
      case "all":
      default:
        filteredSessions = allSessions
        break
    }

    // Sort by most recent first
    filteredSessions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    setSessions(filteredSessions)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }



  const clearAllSessions = async () => {
    const shouldClear = window.confirm("Are you sure you want to clear all session history? This cannot be undone.")
    if (shouldClear) {
      storageService.clearAll()
      setSessions([])
      setStats(storageService.getStats())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4" style={{zIndex: 9999}}>
      <div className="bg-white border-2 border-gray-400 rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden relative" style={{zIndex: 10000}}>
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Session History</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors text-2xl font-bold">
              ×
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            {["today", "week", "all"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 border-2 rounded-lg text-base font-semibold transition-colors ${
                  filter === filterOption
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-3 text-center bg-red-50">
              <div className="text-2xl font-bold text-red-700">
                {filter === "today"
                  ? stats.today.workSessions
                  : filter === "week"
                    ? sessions.filter((s) => s.type === "work").length
                    : stats.total.workSessions}
              </div>
              <div className="text-sm font-medium text-gray-700">Work</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center bg-green-50">
              <div className="text-2xl font-bold text-green-700">
                {filter === "today"
                  ? stats.today.breakSessions
                  : filter === "week"
                    ? sessions.filter((s) => s.type === "break").length
                    : stats.total.breakSessions}
              </div>
              <div className="text-sm font-medium text-gray-700">Break</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center bg-blue-50">
              <div className="text-2xl font-bold text-blue-700">
                {filter === "today" ? stats.today.sessions : filter === "week" ? sessions.length : stats.total.sessions}
              </div>
              <div className="text-sm font-medium text-gray-700">Total</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-96 bg-gray-50">
          {sessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-semibold text-gray-600 mb-2">No sessions found</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className={`w-4 h-4 rounded-full ${
                    session.type === "work" ? "bg-red-500" : "bg-green-500"
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {session.type === "work" ? "Work Session" : "Break Time"}
                    </div>
                    <div className="text-sm text-gray-600">{Math.round(session.duration / 60)} minutes</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{formatDate(session.completedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {sessions.length > 0 && (
          <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
            <button
              onClick={clearAllSessions}
              className="w-full border-2 border-red-400 bg-red-50 text-red-700 py-3 px-4 rounded-lg font-semibold hover:bg-red-100 transition-colors"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionHistory
