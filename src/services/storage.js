export class StorageService {
  constructor() {
    this.storageKey = "pomodoro-sessions"
    this.settingsKey = "pomodoro-settings"
  }

  isLocalStorageAvailable() {
    try {
      return typeof window !== 'undefined' && window.localStorage !== undefined
    } catch (error) {
      return false
    }
  }

  saveSession(session) {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn("localStorage not available")
        return false
      }

      const sessions = this.getSessions()
      sessions.push({
        ...session,
        id: Date.now().toString(),
      })

      // Keep only last 100 sessions
      const recentSessions = sessions.slice(-100)
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this.storageKey, JSON.stringify(recentSessions))
      }

      return true
    } catch (error) {
      console.error("Error saving session:", error)
      return false
    }
  }

  getSessions() {
    try {
      if (!this.isLocalStorageAvailable()) {
        return []
      }
      
      const sessions = localStorage.getItem(this.storageKey)
      return sessions ? JSON.parse(sessions) : []
    } catch (error) {
      console.error("Error loading sessions:", error)
      return []
    }
  }

  getTodaySessions() {
    const sessions = this.getSessions()
    const today = new Date().toDateString()

    return sessions.filter((session) => {
      const sessionDate = new Date(session.completedAt).toDateString()
      return sessionDate === today
    })
  }

  getStats() {
    const sessions = this.getSessions()
    const todaySessions = this.getTodaySessions()

    const totalSessions = sessions.length
    const totalWorkSessions = sessions.filter((s) => s.type === "work").length
    const totalBreakSessions = sessions.filter((s) => s.type === "break").length

    const todayWorkSessions = todaySessions.filter((s) => s.type === "work").length
    const todayBreakSessions = todaySessions.filter((s) => s.type === "break").length

    return {
      total: {
        sessions: totalSessions,
        workSessions: totalWorkSessions,
        breakSessions: totalBreakSessions,
      },
      today: {
        sessions: todaySessions.length,
        workSessions: todayWorkSessions,
        breakSessions: todayBreakSessions,
      },
    }
  }

  saveSettings(settings) {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn("localStorage not available")
        return false
      }

      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this.settingsKey, JSON.stringify(settings))
      }
      return true
    } catch (error) {
      console.error("Error saving settings:", error)
      return false
    }
  }

  getSettings() {
    try {
      if (!this.isLocalStorageAvailable()) {
        return {
          workDuration: 25,
          breakDuration: 5,
          soundEnabled: true,
          vibrationEnabled: true,
        }
      }

      const settings = localStorage.getItem(this.settingsKey)
      return settings
        ? JSON.parse(settings)
        : {
            workDuration: 25,
            breakDuration: 5,
            soundEnabled: true,
            vibrationEnabled: true,
          }
    } catch (error) {
      console.error("Error loading settings:", error)
      return {
        workDuration: 25,
        breakDuration: 5,
        soundEnabled: true,
        vibrationEnabled: true,
      }
    }
  }

  clearAll() {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn("localStorage not available")
        return false
      }

      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(this.storageKey)
        localStorage.removeItem(this.settingsKey)
      }
      return true
    } catch (error) {
      console.error("Error clearing data:", error)
      return false
    }
  }
}

export const storageService = new StorageService()
