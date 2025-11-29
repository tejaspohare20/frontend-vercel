import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const Admin = () => {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [cacheClearing, setCacheClearing] = useState(false)

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

  const clearLeaderboardCache = async () => {
    setCacheClearing(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }
      
      await axios.post('/api/admin/leaderboard/clear-cache', {}, { headers })
      
      // Show success message
      alert('Leaderboard cache cleared successfully!')
      
      // Refresh the data
      fetchAllData()
    } catch (error) {
      console.error('Failed to clear leaderboard cache:', error)
      alert('Failed to clear leaderboard cache: ' + (error.response?.data?.message || error.message))
    } finally {
      setCacheClearing(false)
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
          <div className="flex gap-3 mt-4">
            <button
              onClick={fetchAllData}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all font-semibold shadow-sm"
            >
              🔄 Refresh Data
            </button>
            <button
              onClick={clearLeaderboardCache}
              disabled={cacheClearing}
              className={`px-4 py-2 rounded-xl font-semibold shadow-sm transition-all ${
                cacheClearing 
                  ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed' 
                  : 'bg-warning-500 text-white hover:bg-warning-600'
              }`}
            >
              {cacheClearing ? 'Clearing...' : '🧹 Clear Leaderboard Cache'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Total Users</p>
            <p className="mt-3 text-4xl font-display font-bold text-neutral-800">{stats?.statistics?.totalUsers || 0}</p>
            <p className="mt-2 text-sm text-neutral-600 font-medium">Registered accounts</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">New Today</p>
            <p className="mt-3 text-4xl font-display font-bold text-success-600">{stats?.statistics?.newUsersToday || 0}</p>
            <p className="mt-2 text-sm text-neutral-600 font-medium">Last 24 hours</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">New This Week</p>
            <p className="mt-3 text-4xl font-display font-bold text-purple-600">{stats?.statistics?.newUsersThisWeek || 0}</p>
            <p className="mt-2 text-sm text-neutral-600 font-medium">Last 7 days</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Sessions</p>
            <p className="mt-3 text-4xl font-display font-bold text-neutral-800">{stats?.statistics?.totalSessions || 0}</p>
            <p className="mt-2 text-sm text-neutral-600 font-medium">Practice total</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Achievements</p>
            <p className="mt-3 text-4xl font-display font-bold text-neutral-800">{stats?.statistics?.totalAchievements || 0}</p>
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
                        {/* Removed email for security */}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-800">{user.totalPoints} pts</p>
                      <p className="text-xs text-neutral-600">Level {user.level}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-600 text-sm">No top performers found</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
            <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-4">⚡ Recent Activity</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.slice(0, 10).map((session) => (
                  <div key={session._id} className="flex items-center justify-between bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                    <div>
                      <p className="font-semibold text-neutral-800 text-sm">{session.userId?.username || session.user?.username || 'Unknown User'}</p>
                      {/* Removed email for security */}
                      <p className="text-xs text-neutral-600">
                        {new Date(session.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-800">{session.score}/100</p>
                      <p className="text-xs text-neutral-600">
                        {Math.floor(session.duration / 60)} min
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-600 text-sm">No recent activity found</p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed User List */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-4">👥 Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">User</th>
                  {/* Removed Email column for security */}
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">Points</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">Level</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-neutral-500 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats?.users && stats.users.length > 0 ? (
                  stats.users.map((user) => (
                    <tr key={user._id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <p className="text-neutral-800 font-semibold">{user.username}</p>
                      </td>
                      {/* Removed email cell for security */}
                      <td className="py-3 px-4 font-bold text-neutral-800">{user.totalPoints || 0}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold">
                          {user.level || 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-neutral-600">
                      {/* Updated colspan to match new column count */}
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin