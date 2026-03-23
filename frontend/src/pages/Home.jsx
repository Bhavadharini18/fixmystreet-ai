import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Report Street Issues
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Help make our streets safer by reporting potholes and road damage. 
          Our AI-powered system detects and prioritizes issues automatically.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="font-bold text-lg mb-2">Capture</h3>
            <p className="text-gray-600">Take a photo of the street issue</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="font-bold text-lg mb-2">Detect</h3>
            <p className="text-gray-600">AI analyzes and identifies problems</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="font-bold text-lg mb-2">Track</h3>
            <p className="text-gray-600">Location and priority recorded</p>
          </div>
        </div>

        <Link 
          to="/report" 
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition"
        >
          Report an Issue
        </Link>
      </div>
    </div>
  )
}

export default Home
