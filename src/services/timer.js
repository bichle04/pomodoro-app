export class PomodoroTimer {
  constructor() {
    this.workDuration = 25 * 60 // 25p
    this.breakDuration = 5 * 60 // 5p
    this.timeRemaining = this.workDuration
    this.isRunning = false
    this.isWorkSession = true
    this.intervalId = null
    this.callbacks = {
      onTick: null,
      onSessionComplete: null,
      onStateChange: null,
    }
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.intervalId = setInterval(() => {
      this.tick()
    }, 1000)

    this.callbacks.onStateChange?.({
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      timeRemaining: this.timeRemaining,
    })
  }

  pause() {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.callbacks.onStateChange?.({
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      timeRemaining: this.timeRemaining,
    })
  }

  reset() {
    this.pause()
    this.isWorkSession = true
    this.timeRemaining = this.workDuration

    this.callbacks.onStateChange?.({
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      timeRemaining: this.timeRemaining,
    })
  }

  tick() {
    this.timeRemaining--

    this.callbacks.onTick?.({
      timeRemaining: this.timeRemaining,
      isWorkSession: this.isWorkSession,
    })

    if (this.timeRemaining <= 0) {
      this.completeSession()
    }
  }

  completeSession() {
    this.pause()

    const completedSession = {
      type: this.isWorkSession ? "work" : "break",
      duration: this.isWorkSession ? this.workDuration : this.breakDuration,
      completedAt: new Date().toISOString(),
    }

    this.callbacks.onSessionComplete?.(completedSession)
  }

  // Switch to next session (work -> break or break -> work)
  switchToNextSession() {
    this.isWorkSession = !this.isWorkSession
    this.timeRemaining = this.isWorkSession ? this.workDuration : this.breakDuration

    this.callbacks.onStateChange?.({
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      timeRemaining: this.timeRemaining,
    })
  }

  // Format time (mm:ss)
  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  getState() {
    return {
      timeRemaining: this.timeRemaining,
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      formattedTime: PomodoroTimer.formatTime(this.timeRemaining),
    }
  }

  setDurations(workMinutes, breakMinutes) {
    this.workDuration = workMinutes * 60
    this.breakDuration = breakMinutes * 60

    if (!this.isRunning) {
      this.timeRemaining = this.isWorkSession ? this.workDuration : this.breakDuration
    }
  }
}

export const pomodoroTimer = new PomodoroTimer()
