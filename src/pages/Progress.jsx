import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const Progress = () => {
  const [progress, setProgress] = useState({
    totalMinutes: 0,
    sessionCount: 0,
    streakDays: 0,
    completedLessons: 0,
    lastPracticeDate: null,
  })
  const [weeklyData, setWeeklyData] = useState([])

  useEffect(() => {
    fetchProgress()
    fetchWeeklyData()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await axios.get('/api/progress/update')
      if (response.data.progress) {
        setProgress(response.data.progress)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const fetchWeeklyData = async () => {
    try {
      const response = await axios.get('/api/progress/weekly')
      if (response.data.data) {
        setWeeklyData(response.data.data)
      } else {
        setWeeklyData([
          { day: 'Mon', minutes: 15 },
          { day: 'Tue', minutes: 20 },
          { day: 'Wed', minutes: 10 },
          { day: 'Thu', minutes: 25 },
          { day: 'Fri', minutes: 30 },
          { day: 'Sat', minutes: 18 },
          { day: 'Sun', minutes: 22 },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch weekly data:', error)
    }
  }

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1)

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        <header>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-300 mb-4">
            <span className="text-xl">📊</span>
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Progress Intelligence</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-neutral-800">Streaks, sessions, and signal</h1>
          <p className="mt-3 text-neutral-600 max-w-2xl font-medium">
            Track your growth with daily streaks, practice minutes, and lesson completion metrics. The dashboard updates
            in real-time post session.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Minutes', value: progress.totalMinutes + ' min', detail: '+12% week over week' },
            { label: 'Sessions', value: progress.sessionCount, detail: '3 new sessions' },
            { label: 'Current Streak', value: progress.streakDays + ' days', detail: 'Keep it glowing' },
            { label: 'Lessons', value: progress.completedLessons, detail: 'Consistency unlocks badges' },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card hover:shadow-hover transition-shadow">
              <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">{card.label}</p>
              <p className="mt-3 text-3xl font-display font-bold text-neutral-800">{card.value}</p>
              <p className="mt-2 text-sm text-success-600 font-medium">{card.detail}</p>
            </div>
          ))}
        </section>

        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Weekly Activity</p>
              <h2 className="text-2xl font-display font-semibold text-neutral-800 mt-1">Minutes practiced</h2>
            </div>
            <div className="text-sm text-neutral-600 font-medium">
              Peak day: {weeklyData.sort((a, b) => b.minutes - a.minutes)[0]?.day || '—'}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-7 gap-4 h-64">
            {weeklyData.map((data) => (
              <div key={data.day} className="flex flex-col items-center justify-end space-y-3">
                <div className="flex flex-col justify-end h-full w-full bg-neutral-100 rounded-2xl overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-2xl transition-all"
                    style={{ height: `${(data.minutes / maxMinutes) * 100}%` }}
                  />
                </div>
                <div className="text-sm font-bold text-neutral-800">{data.minutes}m</div>
                <div className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">{data.day}</div>
              </div>
            ))}
          </div>
        </section>

        {progress.lastPracticeDate && (
          <section className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wide text-primary-700 font-semibold">Last practice</p>
            <h2 className="text-2xl font-display font-semibold text-neutral-800 mt-2">
              {new Date(progress.lastPracticeDate).toLocaleString()}
            </h2>
            <p className="text-neutral-700 mt-2 text-sm font-medium">Keep the streak alive — micro sessions count too.</p>
          </section>
        )}
      </div>
    </div>
  )
}

export default Progress

