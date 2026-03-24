import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, removeToken } from '../utils/api'

function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = isAuthenticated()

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            🚧 FixMyStreetAI
          </Link>
          <div className="space-x-4 flex items-center">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            {isLoggedIn ? (
              <>
                <Link to="/report" className="hover:text-blue-200">Report</Link>
                <Link to="/reports" className="hover:text-blue-200">History</Link>
                <Link to="/map" className="hover:text-blue-200">Map</Link>
                <Link to="/leaderboard" className="hover:text-blue-200">Leaderboard</Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/signup" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
