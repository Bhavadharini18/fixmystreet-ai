import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reportsAPI } from '../utils/api'

function Report() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [category, setCategory] = useState('pothole')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const categories = [
    { value: 'pothole', label: 'Pothole', icon: '🕳️' },
    { value: 'garbage', label: 'Garbage', icon: '🗑️' },
    { value: 'water_logging', label: 'Water Logging', icon: '💧' },
    { value: 'streetlight', label: 'Streetlight Fault', icon: '💡' },
    { value: 'drain_block', label: 'Drain Block', icon: '🚰' }
  ]

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
        (error) => reject(error)
      )
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!image) {
      setError('Please select an image')
      return
    }

    if (!category) {
      setError('Please select a category')
      return
    }

    setLoading(true)

    try {
      // Get GPS location
      const location = await getLocation()
      
      // Prepare form data
      const formData = new FormData()
      formData.append('image', image)
      formData.append('category', category)
      formData.append('latitude', location.latitude)
      formData.append('longitude', location.longitude)

      // Submit to backend
      const response = await reportsAPI.create(formData)

      // Navigate to result page with data
      navigate('/result', { state: { report: response.data } })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Report Street Issue</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              Select Issue Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-lg border-2 transition ${
                    category === cat.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-semibold">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Upload or Capture Image *
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {preview && (
            <div className="mb-6">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full rounded-lg shadow-md"
              />
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !image}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Analyzing with AI...' : 'Submit Report'}
          </button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            📍 Location will be captured automatically
          </p>
        </form>
      </div>
    </div>
  )
}

export default Report
