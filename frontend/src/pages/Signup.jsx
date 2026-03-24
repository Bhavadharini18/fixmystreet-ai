import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    street: '',
    city: '',
    state: '',
    latitude: 0,
    longitude: 0
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationDetected, setLocationDetected] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Automatically detect location when component mounts
    detectLocation()
  }, [])

  const detectLocation = () => {
    setLocationLoading(true)
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }))
        setLocationDetected(true)
        setLocationLoading(false)
      },
      (error) => {
        setError('Unable to detect location. Please enable location services.')
        setLocationLoading(false)
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!locationDetected) {
      setError('Please allow location access to continue')
      return
    }

    setLoading(true)

    try {
      await authAPI.signup(formData)
      // Redirect to login page after successful signup
      navigate('/login', { state: { message: 'Account created successfully! Please login.' } })
    } catch (err) {
      // Handle error properly
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map(e => e.msg).join(', '))
        } else {
          setError(err.response.data.detail)
        }
      } else {
        setError('Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800">Join FixMyStreetAI</h2>
          <p className="text-gray-600 mt-2">Create an account to report street issues</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {locationLoading && (
            <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
              📍 Detecting your location...
            </div>
          )}

          {locationDetected && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              ✅ Location detected successfully!
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Street *</label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your street name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="State"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a strong password"
              required
            />
          </div>

          {!locationDetected && (
            <button
              type="button"
              onClick={detectLocation}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition mb-4"
            >
              📍 Detect My Location
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !locationDetected}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>

          <p className="text-xs text-gray-500 mt-4 text-center">
            * Location access is required to provide street-specific updates
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
