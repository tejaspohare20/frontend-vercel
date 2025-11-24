import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const Admin = () => {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      // Fetch all admin data
      const [statsRes, analyticsRes, activityRes] = await Promise.all([
        axios.get('/api/admin/users/stats', { headers }),
        axios.get('/api/admin/analytics/overview', { headers }),
        axios.get('/api/admin/activity/recent', { headers })
      ])

      setStats(statsRes.data)
      setAnalytics(analyticsRes.data)
      setRecentActivity(activityRes.data.recentSessions || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-300 mb-4">
            <span className="text-xl">🔧</span>
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Admin Panel</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-neutral-800">
            Admin <span className="text-primary-600">Dashboard</span>
          </h1>
          <p className="text-neutral-600 mt-2 font-medium">Monitor platform activity and user statistics</p>
          <button
            onClick={fetchAllData}
            className="mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all font-semibold shadow-sm"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Total Users</p>
            <p className="mt-3 text-4xl font-display font-bold text-neutral-800">{stats?.statistics.totalUsers || 0}</p>
            <p className="mt-2 text-sm text-success-600 font-medium">All time</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">New Today</p>
            <p className="mt-3 text-4xl font-display font-bold text-primary-600">{stats?.statistics.newUsersToday || 0}</p>
            <p className="mt-2 text-sm text-neutral-600 font-medium">Last 24 hours</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">This Week</p>
            <p className="mt-3 text-4xl font-display font-bold text-purple-600">{stats?.statistics.newUsersThisWeek || 0}</p>
            <p className="mt-2 text-sm text-neutral-600 font-medium">Last 7 days</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Sessions</p>
            <p className="mt-3 text-4xl font-display font-bold text-neutral-800">{stats?.statistics.totalSessions || 0}</p>
            <p className="mt-2 text-sm text-neutral-600 font-medium">Practice total</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Achievements</p>
            <p className="mt-3 text-4xl font-display font-bold text-neutral-800">{stats?.statistics.totalAchievements || 0}</p>
            <p className="mt-2 text-sm text-neutral-600 font-medium">Unlocked</p>
          </div>
        </div>

        {/* Top Users and Recent Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performers */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-4">🏆 Top Performers</h2>
            <div className="space-y-3">
              {analytics?.topUsers && analytics.topUsers.length > 0 ? (
                analytics.topUsers.slice(0, 5).map((user, idx) => (
                  <div key={user._id} className="flex items-center justify-between bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-yellow-500 text-neutral-900' : 
                        idx === 1 ? 'bg-neutral-400 text-neutral-900' :
                        idx === 2 ? 'bg-orange-600 text-white' :
                        'bg-neutral-200 text-neutral-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-800">{user.username}</p>
                        <p className="text-xs text-neutral-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-600 font-semibold">{user.totalPoints} pts</p>
                      <p className="text-xs text-neutral-600">Level {user.level}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500">No users yet</p>
              )}
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-4">👥 Recent Users</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                    <div>
                      <p className="font-semibold text-neutral-800">{user.username}</p>
                      <p className="text-xs text-neutral-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-primary-600 font-medium">{user.totalPoints} pts</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500">No users yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-4">📊 Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">User</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">Activity</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">Score</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((session, idx) => (
                    <tr key={session._id || idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <p className="text-neutral-800 font-semibold">{session.userId?.username || 'Unknown'}</p>
                        <p className="text-xs text-neutral-600">{session.userId?.email || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4 text-neutral-700 font-medium">Practice Session</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          session.score >= 80 ? 'bg-success-100 text-success-700' :
                          session.score >= 60 ? 'bg-warning-100 text-warning-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {session.score}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-700 font-medium">{session.duration} sec</td>
                      <td className="py-3 px-4 text-neutral-600 text-sm">
                        {new Date(session.date).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-neutral-500">
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Growth Chart (Simple text-based for now) */}
        {analytics?.userGrowth && analytics.userGrowth.length > 0 && (
          <div className="mt-8 bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-4">📈 User Growth (Last 30 Days)</h2>
            <div className="space-y-2">
              {analytics.userGrowth.slice(-7).map((day) => (
                <div key={day._id} className="flex items-center gap-4">
                  <p className="text-neutral-600 w-28 font-medium">{day._id}</p>
                  <div className="flex-1 bg-neutral-100 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-primary-500 h-full rounded-full flex items-center justify-end px-2"
                      style={{ width: `${(day.count / Math.max(...analytics.userGrowth.map(d => d.count))) * 100}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{day.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
