import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            🚧 Street Reporter
          </Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <Link to="/report" className="hover:text-blue-200">Report</Link>
            <Link to="/reports" className="hover:text-blue-200">History</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
