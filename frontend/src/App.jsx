import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Report from './pages/Report'
import Result from './pages/Result'
import Reports from './pages/Reports'
import ReportDetails from './pages/ReportDetails'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/result" element={<Result />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
