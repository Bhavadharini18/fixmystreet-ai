import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports`)
      setReports(response.data.reports)
    } catch (err) {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading reports...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Reports History</h1>
          <span className="text-gray-600">{reports.length} total reports</span>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No reports yet</p>
            <Link 
              to="/report" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Link 
                key={report.id} 
                to={`/reports/${report.id}`}
                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {report.issue_count} Issue{report.issue_count !== 1 ? 's' : ''} Detected
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColors[report.priority]}`}>
                    {report.priority.toUpperCase()}
                  </span>
                </div>

                <div className="flex gap-4 text-sm text-gray-600">
                  <span>📍 {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}</span>
                  <span>🔍 {report.detections.map(d => d.type).join(', ')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
