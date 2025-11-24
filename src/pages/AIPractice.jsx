import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const AIPractice = () => {
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('practice') // 'practice' or 'chat'
  const [transcript, setTranscript] = useState('')
  const [selectedMode, setSelectedMode] = useState('Daily Conversation')
  const recognitionRef = useRef(null)

  const practiceModes = {
    'Daily Conversation': {
      prompt: 'Practice everyday English conversations like ordering food, asking for directions, or talking about hobbies. Focus on natural flow and common phrases.',
      tips: 'Use common expressions, maintain natural rhythm, practice greetings'
    },
    'Business English': {
      prompt: 'Practice professional communication like meetings, presentations, or emails. Focus on formal vocabulary and clear structure.',
      tips: 'Use professional terms, maintain formal tone, structure your points'
    },
    'Pronunciation Practice': {
      prompt: 'Focus on clear pronunciation of challenging words and sounds. Practice tongue twisters and commonly mispronounced words.',
      tips: 'Speak slowly and clearly, focus on difficult sounds, repeat words'
    },
    'Grammar Correction': {
      prompt: 'Practice speaking with correct grammar. Focus on verb tenses, sentence structure, and avoiding common mistakes.',
      tips: 'Check subject-verb agreement, use correct tenses, form complete sentences'
    }
  }

  useEffect(() => {
    fetchSessions()
    
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' '
          } else {
            interimTranscript += transcriptPiece
          }
        }

        setTranscript(prev => prev + finalTranscript)
        setInput(prev => prev + finalTranscript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart if still recording
          recognitionRef.current.start()
        }
      }
    }
  }, [])

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/ai/practice', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.data.sessions) {
        setSessions(response.data.sessions)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/ai/practice', {
        transcript: input,
        duration: 30,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setFeedback(response.data.feedback || 'Great practice! Keep it up.')
      setInput('')
      fetchSessions()
    } catch (error) {
      setFeedback('Error: Could not get AI feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }
    
    try {
      setIsRecording(true)
      setTranscript('')
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting recognition:', error)
      setIsRecording(false)
    }
  }

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false)
      recognitionRef.current.stop()
    }
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = { role: 'user', content: chatInput, timestamp: new Date() }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/ai/chat', {
        message: chatInput,
        history: chatMessages.slice(-5) // Send last 5 messages for context
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const aiMessage = { 
        role: 'assistant', 
        content: response.data.reply || 'I apologize, but I couldn\'t generate a response.',
        timestamp: new Date() 
      }
      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble responding right now. Please try again.',
        timestamp: new Date() 
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  const sessionPalette = ['from-primary-500/40', 'from-secondary-500/40', 'from-success-400/40']

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-300 mb-3">
              <span className="text-xl">🎤</span>
              <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">AI Practice Studio</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-neutral-800">
              Command your voice. <span className="text-primary-600">Train with AI.</span>
            </h1>
            <p className="mt-3 text-neutral-600 max-w-2xl">
              Real-time fluency insights, pronunciation coaching, and transcript intelligence designed to level up your
              delivery in minutes.
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl px-5 py-3 text-sm shadow-sm">
            <span className="text-neutral-800 font-semibold">{sessions.length}</span> <span className="text-neutral-600">sessions logged</span>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="mb-6 flex gap-3 bg-white border border-neutral-200 rounded-xl p-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'practice' 
                ? 'bg-primary-500 text-white shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Practice Mode
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'chat' 
                ? 'bg-primary-500 text-white shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            AI Chatbot
          </button>
        </div>

        {activeTab === 'practice' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-6">
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Session builder</p>
                <h2 className="text-2xl font-display font-semibold text-neutral-800">Design your drill</h2>
              </div>
              <span className="px-4 py-2 rounded-full bg-primary-100 border border-primary-300 text-xs uppercase tracking-wide text-primary-700 font-semibold">
                Beta v2.3
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(practiceModes).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    selectedMode === mode
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Mode</p>
                  <p className="mt-1 font-semibold text-neutral-800">{mode}</p>
                  <p className="mt-1 text-xs text-neutral-600">{practiceModes[mode].tips}</p>
                </button>
              ))}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Prompt: ${practiceModes[selectedMode].prompt}`}
              className="w-full min-h-[200px] rounded-2xl bg-neutral-50 border-2 border-neutral-200 px-5 py-4 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium transition-all"
            />

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isRecording 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-600 shadow-lg animate-pulse' 
                    : 'bg-gradient-to-r from-success-500 to-success-600 text-white border-2 border-success-600 hover:from-success-600 hover:to-success-700 shadow-md'
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="h-3 w-3 rounded-full bg-white animate-pulse" />
                    <span>🎙️ Recording... Click to Stop</span>
                  </>
                ) : (
                  <>
                    <span>🎤 Start Voice Capture</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="flex-1 px-4 py-3 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 transition-all disabled:opacity-60 shadow-sm"
              >
                {loading ? '🔄 Analyzing...' : '🤖 Get AI Feedback'}
              </button>
            </div>

            {feedback && (
              <div className="rounded-2xl border-2 border-success-300 bg-success-50 p-5">
                <p className="text-xs uppercase tracking-wide text-success-700 font-semibold">AI Feedback</p>
                <p className="mt-2 text-success-800 font-medium">{feedback}</p>
              </div>
            )}
          </section>

          <section className="space-y-5">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-semibold text-neutral-800">Recent Intelligence</h3>
                <span className="text-xs text-neutral-500 font-medium">Auto-saved</span>
              </div>
              <div className="mt-5 space-y-4 max-h-[520px] overflow-y-auto pr-2">
                {sessions.length === 0 ? (
                  <p className="text-neutral-500">No practice sessions yet. Start your first drill!</p>
                ) : (
                  sessions.map((session, idx) => (
                    <div
                      key={session._id || idx}
                      className="p-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 hover:border-primary-300 hover:bg-primary-50 transition-all"
                    >
                      <div className="flex items-center justify-between text-sm text-neutral-600 font-medium">
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                        <span className="text-neutral-800 font-semibold">{session.duration} min</span>
                      </div>
                      <p className="mt-3 text-neutral-700 text-sm line-clamp-3 font-medium">{session.transcript}</p>
                      {session.score && (
                        <p className="mt-2 text-xs text-primary-600 font-semibold">Score {session.score} / 100</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-200 rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wide text-primary-700 font-semibold">Coaching focus</p>
              <h3 className="mt-2 text-2xl font-display font-semibold text-neutral-800">Clarity & pace</h3>
              <p className="mt-2 text-neutral-700 text-sm font-medium">
                Slow down on key points, build pauses after insights, and anchor your tone with confidence.
              </p>
            </div>
          </section>
        </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr] gap-6">
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">AI Communication Coach</p>
                <h2 className="text-2xl font-display font-semibold text-neutral-800">Chat with AI</h2>
              </div>
              <button
                onClick={() => setChatMessages([])}
                className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-sm font-medium transition-all"
              >
                Clear Chat
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-500 text-center">
                  <div>
                    <p className="text-2xl mb-2">💬</p>
                    <p className="font-semibold text-neutral-700">Start a conversation with your AI coach!</p>
                    <p className="text-sm mt-2">Ask questions, practice conversations, or get speaking tips.</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 border-2 border-neutral-200 text-neutral-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap font-medium">{msg.content}</p>
                      <p className="text-xs mt-2 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 border-2 border-neutral-200 rounded-2xl px-5 py-3">
                    <p className="text-neutral-600 font-medium">AI is typing...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 rounded-xl bg-neutral-50 border-2 border-neutral-200 px-5 py-3 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium transition-all"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-6 py-3 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60 shadow-sm transition-all"
              >
                Send
              </button>
            </form>
          </section>
        </div>
        )}
      </div>
    </div>
  )
}

export default AIPractice

