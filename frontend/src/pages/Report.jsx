import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

function Report() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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

    setLoading(true)

    try {
      // Get GPS location
      const location = await getLocation()
      
      // Prepare form data
      const formData = new FormData()
      formData.append('image', image)
      formData.append('latitude', location.latitude)
      formData.append('longitude', location.longitude)

      // Submit to backend
      const response = await axios.post(`${API_URL}/report`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Navigate to result page with data
      navigate('/result', { state: { report: response.data } })
    } catch (err) {
      setError(err.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Report Street Issue</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Upload or Capture Image
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
            {loading ? 'Analyzing...' : 'Submit Report'}
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
