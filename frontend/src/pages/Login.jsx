import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authAPI, setToken } from '../utils/api'

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      setToken(response.data.access_token)
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user))
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      // Handle error properly
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          setError(err.response.data.detail)
        } else {
          setError('Login failed. Please check your credentials.')
        }
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to FixMyStreetAI</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
