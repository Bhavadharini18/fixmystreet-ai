import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { reportsAPI } from '../utils/api'
import 'leaflet/dist/leaflet.css'

function MapView() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMapReports()
  }, [])

  const fetchMapReports = async () => {
    try {
      const response = await reportsAPI.getMapReports()
      setReports(response.data.markers)
    } catch (err) {
      console.error('Failed to load map data')
    } finally {
      setLoading(false)
    }
  }

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports Map</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Low Priority</span>
          </div>
        </div>
      </div>

      <div className="h-[600px] rounded-lg overflow-hidden shadow-md">
        <MapContainer 
          center={[40.7128, -74.0060]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {reports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.location.latitude, report.location.longitude]}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{report.issue_count} issue(s)</p>
                  <p className={`text-${priorityColors[report.priority]}`}>
                    {report.priority.toUpperCase()} Priority
                  </p>
                  <p className="text-gray-600">{report.status}</p>
                  <Link 
                    to={`/reports/${report.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 text-center text-gray-600">
        <p>Total Reports: {reports.length}</p>
      </div>
    </div>
  )
}

export default MapView
