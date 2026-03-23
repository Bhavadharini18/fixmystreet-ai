import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

const API_URL = 'http://localhost:8000'

function ReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReport()
  }, [id])

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/${id}`)
      setReport(response.data)
    } catch (err) {
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading report...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600">{error || 'Report not found'}</p>
        <Link to="/reports" className="text-blue-600 hover:underline">
          Back to reports
        </Link>
      </div>
    )
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/reports" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Reports
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Report Details</h1>
              <p className="text-gray-500">ID: {report.id}</p>
              <p className="text-gray-500">{new Date(report.timestamp).toLocaleString()}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold border-2 ${priorityColors[report.priority]}`}>
              {report.priority.toUpperCase()}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Issues Detected</h3>
              <p className="text-3xl font-bold text-blue-600">{report.issue_count}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
              <p className="text-gray-600">
                Lat: {report.location.latitude.toFixed(6)}
              </p>
              <p className="text-gray-600">
                Lng: {report.location.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Detection Details</h3>
            <div className="space-y-3">
              {report.detections.map((detection, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 capitalize text-lg">
                      {detection.type}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                      {(detection.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Position: x={detection.bbox.x}, y={detection.bbox.y}, 
                    w={detection.bbox.width}, h={detection.bbox.height}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Location Map</h3>
            <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
              <MapContainer 
                center={[report.location.latitude, report.location.longitude]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[report.location.latitude, report.location.longitude]}>
                  <Popup>
                    {report.issue_count} issue{report.issue_count !== 1 ? 's' : ''} detected
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportDetails
