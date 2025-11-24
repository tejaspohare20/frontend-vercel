import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const Achievements = () => {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await axios.get('/api/achievements/list')
      if (response.data.achievements) {
        setAchievements(response.data.achievements)
      } else {
        setAchievements([
          {
            _id: '1',
            name: 'First Session Completed',
            description: 'Complete your first practice session',
            icon: '🎯',
            unlocked: true,
            unlockedAt: new Date(),
          },
          {
            _id: '2',
            name: '10-Day Streak',
            description: 'Practice for 10 consecutive days',
            icon: '🔥',
            unlocked: true,
            unlockedAt: new Date(),
          },
          {
            _id: '3',
            name: 'Top Weekly Learner',
            description: 'Be in the top 10 learners this week',
            icon: '⭐',
            unlocked: false,
          },
          {
            _id: '4',
            name: '30 Minutes Practice',
            description: 'Practice for 30 minutes total',
            icon: '⏱️',
            unlocked: false,
          },
          {
            _id: '5',
            name: 'Chat Master',
            description: 'Complete 50 peer chat sessions',
            icon: '💬',
            unlocked: false,
          },
          {
            _id: '6',
            name: 'Lesson Master',
            description: 'Complete 20 micro-lessons',
            icon: '📚',
            unlocked: true,
            unlockedAt: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-100 border border-warning-300 mb-4">
            <span className="text-xl">🏆</span>
            <span className="text-xs font-semibold text-warning-700 uppercase tracking-wide">Achievement System</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-neutral-800">Level up your communication avatar</h1>
          <p className="mt-3 text-neutral-600 font-medium">
            {unlockedCount} unlocked • {totalCount - unlockedCount} to go. Collect badges by keeping streaks alive,
            completing micro pods, and leading weekly practice charts.
          </p>
          <div className="mt-6">
            <div className="h-3 rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 via-success-500 to-warning-500 rounded-full transition-all"
                style={{ width: `${totalCount ? (unlockedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 mt-2 font-medium">
              {unlockedCount} / {totalCount} badges secured
            </p>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-neutral-600">Loading achievements...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement._id}
                className={`rounded-2xl p-6 border-2 shadow-card ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-success-50 to-primary-50 border-success-300'
                    : 'bg-white border-neutral-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{achievement.icon}</span>
                  {achievement.unlocked ? (
                    <span className="text-success-600 text-sm font-bold">Unlocked</span>
                  ) : (
                    <span className="text-neutral-500 text-sm uppercase tracking-wide font-semibold">Locked</span>
                  )}
                </div>

                <h3 className="mt-4 text-2xl font-display font-semibold text-neutral-800">{achievement.name}</h3>
                <p className="mt-2 text-neutral-600 text-sm font-medium">{achievement.description}</p>

                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="mt-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Achievements

