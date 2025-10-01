"use client"

import { useState } from "react"
import { storageService } from "../services/storage.js"
import { pomodoroTimer } from "../services/timer.js"

const Settings = ({ onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState(storageService.getSettings())
  const [tempSettings, setTempSettings] = useState(settings)

  const handleSave = () => {
    storageService.saveSettings(tempSettings)
    setSettings(tempSettings)

    pomodoroTimer.setDurations(tempSettings.workDuration, tempSettings.breakDuration)

    if (onSettingsChange) {
      onSettingsChange()
    }

    onClose()
  }

  const handleReset = () => {
    const defaultSettings = {
      workDuration: 25,
      breakDuration: 5,
      soundEnabled: true,
      vibrationEnabled: true,
    }
    setTempSettings(defaultSettings)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4" style={{zIndex: 9999}}>
      <div className="bg-white border-2 border-purple rounded-lg w-full max-w-4xl relative" style={{zIndex: 10000}}>
        {/* Header */}
        <div className="p-6 border-b-2 border-purple bg-focus-stats">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-800">Settings</h2>
            <button onClick={onClose} className="text-purple-500 hover:text-purple-800 transition-colors text-2xl font-bold">
              ×
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border-2 border-orange rounded-lg p-4 bg-work-stats">
              <h3 className="text-xl font-bold text-orange-800 mb-4">Timer Durations</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-orange-700 mb-2">Work Session (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={tempSettings.workDuration}
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        workDuration: Number.parseInt(e.target.value) || 25,
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-orange rounded-lg focus:outline-none focus:border-orange-600 text-lg"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-orange-700 mb-2">Break Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tempSettings.breakDuration}
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        breakDuration: Number.parseInt(e.target.value) || 5,
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-orange rounded-lg focus:outline-none focus:border-orange-600 text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Notification */}
            <div className="border-2 border-teal rounded-lg p-4 bg-break-stats">
              <h3 className="text-xl font-bold text-teal-800 mb-4">Notifications</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border-2 border-teal rounded-lg bg-white hover:bg-teal-50">
                  <input
                    type="checkbox"
                    checked={tempSettings.soundEnabled}
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        soundEnabled: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-teal-600 border-2 border-teal rounded focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-base font-medium text-teal-700">Enable notification sounds</span>
                </label>

                <label className="flex items-center gap-3 p-3 border-2 border-teal rounded-lg bg-white hover:bg-teal-50">
                  <input
                    type="checkbox"
                    checked={tempSettings.vibrationEnabled}
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        vibrationEnabled: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-teal-600 border-2 border-teal rounded focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-base font-medium text-teal-700">Enable vibration</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-purple bg-focus-stats">
          <div className="flex gap-4 max-w-md mx-auto">
            <button 
              onClick={handleReset} 
              className="flex-1 border-2 border-pink btn-switch-mode py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Reset to Default
            </button>
            <button 
              onClick={handleSave} 
              className="flex-1 btn-start border-2 py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
