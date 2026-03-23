import { useLocation, Link } from 'react-router-dom'

function Result() {
  const location = useLocation()
  const report = location.state?.report

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">No report data found</p>
        <Link to="/report" className="text-blue-600 hover:underline">
          Create a new report
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Report Submitted!</h1>
            <span className={`px-4 py-2 rounded-full font-semibold border-2 ${priorityColors[report.priority]}`}>
              {report.priority.toUpperCase()} Priority
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Detection Summary</h3>
              <p className="text-2xl font-bold text-blue-600">{report.issue_count} Issues Found</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
              <p className="text-gray-600">
                📍 {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Detected Issues</h3>
            <div className="space-y-3">
              {report.detections.map((detection, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800 capitalize">
                      {detection.type}
                    </span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {(detection.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>Report ID: {report.id}</p>
            <p>Timestamp: {new Date(report.timestamp).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link 
            to="/report" 
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition"
          >
            Report Another Issue
          </Link>
          <Link 
            to="/reports" 
            className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-gray-700 transition"
          >
            View All Reports
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Result
