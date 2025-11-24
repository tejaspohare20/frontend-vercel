import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5002'

// Development mode - set to false when backend is ready
const DEV_MODE = false

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      if (DEV_MODE) {
        // In dev mode, load user from localStorage
        const savedUser = localStorage.getItem('dev_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
        setLoading(false)
      } else {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        fetchUserProfile()
      }
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile')
      setUser(response.data.user)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // Don't logout immediately, just log the error
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    if (DEV_MODE) {
      // Mock login for development
      const savedUsers = JSON.parse(localStorage.getItem('dev_users') || '[]')
      const foundUser = savedUsers.find(u => u.email === email)
      
      if (foundUser) {
        const mockToken = 'dev_token_' + Date.now()
        localStorage.setItem('token', mockToken)
        localStorage.setItem('dev_user', JSON.stringify(foundUser))
        setToken(mockToken)
        setUser(foundUser)
        return { success: true }
      } else {
        return {
          success: false,
          error: 'User not found. Please sign up first.'
        }
      }
    }

    try {
      console.log('Attempting login with:', email)
      const response = await axios.post('/api/auth/login', { email, password })
      console.log('Login response:', response.data)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const signup = async (name, email, password) => {
    if (DEV_MODE) {
      // Mock signup for development
      const savedUsers = JSON.parse(localStorage.getItem('dev_users') || '[]')
      
      if (savedUsers.find(u => u.email === email)) {
        return {
          success: false,
          error: 'Email already registered'
        }
      }

      const newUser = {
        _id: 'dev_' + Date.now(),
        name,
        email,
        progress: {
          totalMinutes: 0,
          sessionCount: 0,
          streakDays: 0,
          completedLessons: 0
        }
      }

      savedUsers.push(newUser)
      localStorage.setItem('dev_users', JSON.stringify(savedUsers))

      const mockToken = 'dev_token_' + Date.now()
      localStorage.setItem('token', mockToken)
      localStorage.setItem('dev_user', JSON.stringify(newUser))
      setToken(mockToken)
      setUser(newUser)
      return { success: true }
    }

    try {
      console.log('Attempting signup with:', { name, email })
      const response = await axios.post('/api/auth/register', {
        username: name,
        email,
        password
      })
      console.log('Signup response:', response.data)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    if (DEV_MODE) {
      localStorage.removeItem('dev_user')
    }
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

