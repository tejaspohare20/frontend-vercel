import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import AIPractice from './pages/AIPractice'
import PeerChat from './pages/PeerChat'
import MicroLearning from './pages/MicroLearning'
import Progress from './pages/Progress'
import Achievements from './pages/Achievements'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-practice"
            element={
              <ProtectedRoute>
                <AIPractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/peer-chat"
            element={
              <ProtectedRoute>
                <PeerChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/micro-learning"
            element={
              <ProtectedRoute>
                <MicroLearning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

