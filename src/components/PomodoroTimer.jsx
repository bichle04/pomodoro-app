"use client"

import { useState, useEffect } from "react"
import { pomodoroTimer, PomodoroTimer } from "../services/timer.js"
import { notificationService } from "../services/notifications.js"
import { storageService } from "../services/storage.js"
import SessionHistory from "./SessionHistory.jsx"
import Settings from "./Settings.jsx"

const TimerComponent = () => {
  const [timerState, setTimerState] = useState(pomodoroTimer.getState())
  const [stats, setStats] = useState({
    today: { workSessions: 0, breakSessions: 0, sessions: 0 },
    total: { workSessions: 0, breakSessions: 0, sessions: 0 }
  })
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setStats(storageService.getStats())
    
    const settings = storageService.getSettings()
    pomodoroTimer.setDurations(settings.workDuration, settings.breakDuration)
  }, [])

  useEffect(() => {
    pomodoroTimer.setCallbacks({
      onTick: (data) => {
        setTimerState((prev) => ({
          ...prev,
          timeRemaining: data.timeRemaining,
          formattedTime: PomodoroTimer.formatTime(data.timeRemaining),
        }))
      },
      onSessionComplete: (completedSession) => {
        if (isClient) {
          storageService.saveSession(completedSession)
          setStats(storageService.getStats())
        }

        // Handle notification and user choice
        notificationService.handleSessionComplete(
          completedSession.type,
          () => {
            // Continue to next session
            pomodoroTimer.switchToNextSession()
            pomodoroTimer.start()
          },
          () => {
            // Stop timer
            pomodoroTimer.reset()
          },
        )
      },
      onStateChange: (state) => {
        setTimerState((prev) => ({
          ...prev,
          ...state,
          formattedTime: PomodoroTimer.formatTime(state.timeRemaining),
        }))
      },
    })

    return () => {
      pomodoroTimer.pause()
    }
  }, [isClient])

  const handleStart = () => {
    pomodoroTimer.start()
  }

  const handlePause = () => {
    pomodoroTimer.pause()
  }

  const handleReset = async () => {
    const shouldReset = await notificationService.showDialog(
      "Reset Timer",
      "Are you sure you want to reset the current session?",
      ["Cancel", "Reset"],
    )

    if (shouldReset) {
      pomodoroTimer.reset()
    }
  }

  const handleSettingsChange = () => {
    const settings = storageService.getSettings()
    pomodoroTimer.setDurations(settings.workDuration, settings.breakDuration)
    
    const currentState = pomodoroTimer.getState()
    setTimerState((prev) => ({
      ...prev,
      ...currentState,
      formattedTime: PomodoroTimer.formatTime(currentState.timeRemaining),
    }))
  }

  const getProgressPercentage = () => {
    const settings = storageService.getSettings()
    const totalTime = timerState.isWorkSession 
      ? settings.workDuration * 60 
      : settings.breakDuration * 60
    const elapsed = totalTime - timerState.timeRemaining
    return (elapsed / totalTime) * 100
  }

  return (
    <div className="min-h-screen bg-main p-4">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex bg-white border-2 border-purple-300 rounded-lg p-2">
          <button
            onClick={() => setShowSettings(false) || setShowHistory(false)}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all border-2 ${
              !showHistory && !showSettings
                ? 'tab-timer-active'
                : 'tab-timer-inactive border-transparent'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => setShowHistory(!showHistory) || setShowSettings(false)}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all border-2 ${
              showHistory
                ? 'tab-history-active'
                : 'tab-history-inactive border-transparent'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setShowSettings(!showSettings) || setShowHistory(false)}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all border-2 ${
              showSettings
                ? 'tab-settings-active'
                : 'tab-settings-inactive border-transparent'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {!showHistory && !showSettings && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border-2 border-purple-300 rounded-lg p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-purple-800 mb-3">Pomodoro Timer</h1>
                <p className="text-purple-600 text-lg">Focus and achieve your goals</p>
              </div>

              <div className="text-center mb-8">
                <div className={`inline-block border-3 px-8 py-4 rounded-lg text-xl font-bold ${
                  timerState.isWorkSession 
                    ? 'border-orange-400 bg-orange-100 text-orange-800' 
                    : 'border-teal-400 bg-teal-100 text-teal-800'
                }`}>
                  {timerState.isWorkSession ? 'Work Session' : 'Break Time'}
                </div>
              </div>

              <div className="border-2 border-purple rounded-lg p-10 mb-8 bg-timer-display">
                <div className="text-center">
                  <div className="w-full bg-purple-200 border-2 border-purple-300 rounded-full h-6 mb-8">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        timerState.isWorkSession 
                          ? 'progress-work' 
                          : 'progress-break'
                      }`}
                      style={{
                        width: `${getProgressPercentage()}%`
                      }}
                    ></div>
                  </div>

                  <div className="text-6xl md:text-8xl font-bold text-purple-800 font-mono mb-6">
                    {timerState.formattedTime}
                  </div>
                  <div className={`text-2xl font-bold ${
                    timerState.isRunning 
                      ? 'text-green-700' 
                      : 'text-purple-600'
                  }`}>
                    {timerState.isRunning ? 'Active' : 'Paused'}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                {!timerState.isRunning ? (
                  <button 
                    onClick={handleStart}
                    className="flex-1 btn-start border-2 py-5 px-8 rounded-lg font-bold text-xl transition-all duration-200"
                  >
                    Start
                  </button>
                ) : (
                  <button 
                    onClick={handlePause}
                    className="flex-1 btn-pause border-2 py-5 px-8 rounded-lg font-bold text-xl transition-all duration-200"
                  >
                    Pause
                  </button>
                )}
                
                <button 
                  onClick={handleReset}
                  className="flex-1 btn-reset border-2 py-5 px-8 rounded-lg font-bold text-xl transition-all duration-200"
                >
                  Reset
                </button>
              </div>

              {/* Switch Mode Button */}
              <button
                onClick={() => pomodoroTimer.switchToNextSession()}
                disabled={timerState.isRunning}
                className="w-full border-2 btn-switch-mode py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Switch to {timerState.isWorkSession ? 'Break' : 'Work'} Mode
              </button>
            </div>

            {/* Stats Sidebar */}
            <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">Today's Progress</h3>
              
              <div className="space-y-4">
                <div className="border-2 border-orange rounded-lg p-4 text-center bg-work-stats">
                  <div className="text-4xl font-bold text-orange-700 mb-2">{stats.today.workSessions}</div>
                  <div className="text-sm font-bold text-orange-600">Work Sessions</div>
                </div>
                
                <div className="border-2 border-teal rounded-lg p-4 text-center bg-break-stats">
                  <div className="text-4xl font-bold text-teal-700 mb-2">{stats.today.breakSessions}</div>
                  <div className="text-sm font-bold text-teal-600">Break Sessions</div>
                </div>

                <div className="border-2 border-purple rounded-lg p-4 text-center bg-focus-stats">
                  <div className="text-3xl font-bold text-purple-700 mb-2">{Math.round(stats.today.workSessions * 25)}</div>
                  <div className="text-sm font-bold text-purple-600">Minutes Focused</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-6">Session History</h2>
            
            <div className="flex gap-3 mb-8">
              {["today", "week", "all"].map((filterOption) => (
                <button
                  key={filterOption}
                  className="px-6 py-3 border-2 border-blue-300 rounded-lg text-base font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="border-2 border-orange-200 rounded-lg p-4 text-center bg-gradient-to-r from-orange-50 to-red-50">
                <div className="text-3xl font-bold text-orange-700">{stats.today.workSessions}</div>
                <div className="text-sm font-bold text-orange-600">Work</div>
              </div>
              <div className="border-2 border-teal-200 rounded-lg p-4 text-center bg-gradient-to-r from-teal-50 to-green-50">
                <div className="text-3xl font-bold text-teal-700">{stats.today.breakSessions}</div>
                <div className="text-sm font-bold text-teal-600">Break</div>
              </div>
              <div className="border-2 border-blue-200 rounded-lg p-4 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="text-3xl font-bold text-blue-700">{stats.today.sessions}</div>
                <div className="text-sm font-bold text-blue-600">Total</div>
              </div>
            </div>

            {/* Session List */}
            <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
              <p className="text-lg font-semibold text-blue-700 text-center">No sessions found</p>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <Settings 
            onClose={() => setShowSettings(false)}
            onSettingsChange={handleSettingsChange}
          />
        )}
      </div>
    </div>
  )
}

export default TimerComponent
