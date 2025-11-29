import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const Achievements = () => {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, unlocked: 0, locked: 0, percentage: 0 })

  useEffect(() => {
    fetchAchievements()
    fetchStats()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await axios.get('/api/achievements/list')
      if (response.data.achievements) {
        setAchievements(response.data.achievements)
      } else {
        // Fallback data if API fails
        setAchievements([
          {
            _id: '1',
            name: 'First Session Completed',
            description: 'Complete your first practice session',
            icon: '🎯',
            points: 10,
            category: 'milestone',
            unlocked: true,
            unlockedAt: new Date(),
          },
          {
            _id: '2',
            name: '10-Day Streak',
            description: 'Practice for 10 consecutive days',
            icon: '🔥',
            points: 50,
            category: 'streak',
            unlocked: true,
            unlockedAt: new Date(),
          },
          {
            _id: '3',
            name: 'Top Weekly Learner',
            description: 'Be in the top 10 learners this week',
            icon: '⭐',
            points: 75,
            category: 'mastery',
            unlocked: false,
          },
          {
            _id: '4',
            name: '30 Minutes Practice',
            description: 'Practice for 30 minutes total',
            icon: '⏱️',
            points: 30,
            category: 'milestone',
            unlocked: false,
          },
          {
            _id: '5',
            name: 'Chat Master',
            description: 'Complete 50 peer chat sessions',
            icon: '💬',
            points: 100,
            category: 'social',
            unlocked: false,
          },
          {
            _id: '6',
            name: 'Lesson Master',
            description: 'Complete 20 micro-lessons',
            icon: '📚',
            points: 40,
            category: 'milestone',
            unlocked: true,
            unlockedAt: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
      // Fallback data if API fails
      setAchievements([
        {
          _id: '1',
          name: 'First Session Completed',
          description: 'Complete your first practice session',
          icon: '🎯',
          points: 10,
          category: 'milestone',
          unlocked: true,
          unlockedAt: new Date(),
        },
        {
          _id: '2',
          name: '10-Day Streak',
          description: 'Practice for 10 consecutive days',
          icon: '🔥',
          points: 50,
          category: 'streak',
          unlocked: true,
          unlockedAt: new Date(),
        },
        {
          _id: '3',
          name: 'Top Weekly Learner',
          description: 'Be in the top 10 learners this week',
          icon: '⭐',
          points: 75,
          category: 'mastery',
          unlocked: false,
        },
        {
          _id: '4',
          name: '30 Minutes Practice',
          description: 'Practice for 30 minutes total',
          icon: '⏱️',
          points: 30,
          category: 'milestone',
          unlocked: false,
        },
        {
          _id: '5',
          name: 'Chat Master',
          description: 'Complete 50 peer chat sessions',
          icon: '💬',
          points: 100,
          category: 'social',
          unlocked: false,
        },
        {
          _id: '6',
          name: 'Lesson Master',
          description: 'Complete 20 micro-lessons',
          icon: '📚',
          points: 40,
          category: 'milestone',
          unlocked: true,
          unlockedAt: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/achievements/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Fallback stats
      const unlockedCount = achievements.filter((a) => a.unlocked).length
      const totalCount = achievements.length
      setStats({
        total: totalCount,
        unlocked: unlockedCount,
        locked: totalCount - unlockedCount,
        percentage: totalCount ? Math.round((unlockedCount / totalCount) * 100) : 0
      })
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'milestone': return 'from-blue-500 to-indigo-500'
      case 'streak': return 'from-orange-500 to-red-500'
      case 'mastery': return 'from-green-500 to-emerald-500'
      case 'social': return 'from-purple-500 to-pink-500'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'milestone': return 'Milestone'
      case 'streak': return 'Streak'
      case 'mastery': return 'Mastery'
      case 'social': return 'Social'
      default: return 'General'
    }
  }

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
            {stats.unlocked} unlocked • {stats.locked} to go. Collect badges by keeping streaks alive,
            completing micro pods, and leading weekly practice charts.
          </p>
          <div className="mt-6">
            <div className="h-3 rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 via-success-500 to-warning-500 rounded-full transition-all duration-1000"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 mt-2 font-medium">
              {stats.unlocked} / {stats.total} badges secured
            </p>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-500 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading achievements...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement._id}
                className={`rounded-2xl p-6 border-2 shadow-card transition-all duration-300 hover:shadow-lg ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-white to-neutral-50 border-success-300 transform hover:-translate-y-1'
                    : 'bg-white border-neutral-200 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        achievement.unlocked 
                          ? `bg-gradient-to-r ${getCategoryColor(achievement.category)} text-white`
                          : 'bg-neutral-200 text-neutral-800'
                      }`}>
                        {getCategoryLabel(achievement.category)}
                      </span>
                    </div>
                  </div>
                  {achievement.unlocked ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-100 text-success-800">
                      <span className="w-2 h-2 rounded-full bg-success-500 mr-1"></span>
                      Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
                      Locked
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-xl font-display font-semibold text-neutral-800">{achievement.name}</h3>
                <p className="mt-2 text-neutral-600 text-sm">{achievement.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
                    +{achievement.points} pts
                  </span>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-neutral-500 font-medium">
                      {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Achievements