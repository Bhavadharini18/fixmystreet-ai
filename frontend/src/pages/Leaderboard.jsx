import { useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await authAPI.getLeaderboard(20)
      setLeaderboard(response.data.leaderboard)
    } catch (err) {
      console.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-600">Top contributors making our streets safer</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="grid grid-cols-4 gap-4 font-semibold">
              <div>Rank</div>
              <div>Username</div>
              <div className="text-right">Reports</div>
              <div className="text-right">Points</div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <div 
                key={entry.rank}
                className={`px-6 py-4 hover:bg-gray-50 transition ${
                  entry.rank <= 3 ? 'bg-yellow-50' : ''
                }`}
              >
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                    {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                    {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                    {entry.rank > 3 && (
                      <span className="text-gray-600 font-semibold">#{entry.rank}</span>
                    )}
                  </div>
                  <div className="font-semibold text-gray-800">{entry.username}</div>
                  <div className="text-right text-gray-600">{entry.reports_count}</div>
                  <div className="text-right font-bold text-blue-600">{entry.points}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-3">How to Earn Points</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Report an issue: <span className="font-semibold">10 points</span></li>
            <li>🎯 Report at new location: <span className="font-semibold">20 points</span></li>
            <li>🏆 Climb the leaderboard and become a top contributor!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
