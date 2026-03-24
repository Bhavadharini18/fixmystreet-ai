import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authAPI, reportsAPI } from '../utils/api'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [streetFeed, setStreetFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, feedRes, userRes] = await Promise.all([
        authAPI.dashboard(),
        authAPI.getStreetFeed(),
        authAPI.getMe()
      ])
      
      setStats(dashboardRes.data)
      setStreetFeed(feedRes.data.reports)
      setUser(userRes.data)
    } catch (err) {
      console.error('Failed to load dashboard', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Welcome back, {user?.full_name}!</h1>
          <p className="text-blue-100 mt-2">📍 {user?.street}, {user?.city}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Reports</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.total_reports || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats?.resolved || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Your Points</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.user_points || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-3xl">🏆</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/report"
              className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <span className="text-4xl mb-2">📸</span>
              <span className="font-semibold text-gray-700">Report Issue</span>
            </Link>
            <Link
              to="/reports"
              className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <span className="text-4xl mb-2">📋</span>
              <span className="font-semibold text-gray-700">My Reports</span>
            </Link>
            <Link
              to="/leaderboard"
              className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <span className="text-4xl mb-2">🏆</span>
              <span className="font-semibold text-gray-700">Leaderboard</span>
            </Link>
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
              <span className="text-4xl mb-2">📍</span>
              <span className="font-semibold text-gray-700">{user?.city}</span>
            </div>
          </div>
        </div>

        {/* Street Feed */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Reports from Your Street</h2>
            <span className="text-sm text-gray-500">{streetFeed.length} reports</span>
          </div>

          {streetFeed.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">🏘️</span>
              <p className="text-gray-600 mt-4">No reports from your street yet</p>
              <Link
                to="/report"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Be the first to report!
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {streetFeed.slice(0, 10).map((report) => (
                <ReportCard key={report.id} report={report} onUpdate={fetchDashboardData} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Report Card Component with Social Features
function ReportCard({ report, onUpdate }) {
  const [liked, setLiked] = useState(report.liked_by_user)
  const [likesCount, setLikesCount] = useState(report.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:8000/social/reports/${report.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      setLiked(data.liked)
      setLikesCount(data.likes_count)
    } catch (err) {
      console.error('Failed to like', err)
    }
  }

  const loadComments = async () => {
    try {
      const response = await fetch(`http://localhost:8000/social/reports/${report.id}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setComments(data.comments)
    } catch (err) {
      console.error('Failed to load comments', err)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await fetch(`http://localhost:8000/social/reports/${report.id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newComment })
      })
      setNewComment('')
      loadComments()
    } catch (err) {
      console.error('Failed to comment', err)
    }
  }

  const toggleComments = () => {
    if (!showComments) {
      loadComments()
    }
    setShowComments(!showComments)
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {report.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{report.username}</p>
            <p className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[report.priority]}`}>
            {report.priority.toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[report.status]}`}>
            {report.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-gray-700 mb-2">
          <span className="font-semibold">Category:</span> {report.category}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Issues Found:</span> {report.issue_count}
        </p>
        {report.is_repeat && (
          <p className="text-orange-600 text-sm mt-1">
            ⚠️ Reported {report.repeat_count} times at this location
          </p>
        )}
      </div>

      {/* Social Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-200">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 ${liked ? 'text-red-600' : 'text-gray-600'} hover:text-red-600 transition`}
        >
          <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
          <span className="font-semibold">{likesCount}</span>
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <span className="text-xl">💬</span>
          <span className="font-semibold">{report.comments_count}</span>
        </button>
        <Link
          to={`/reports/${report.id}`}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition ml-auto"
        >
          <span>View Details</span>
          <span>→</span>
        </Link>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <p className="font-semibold text-sm text-gray-800">{comment.username}</p>
                <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comment.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Dashboard
