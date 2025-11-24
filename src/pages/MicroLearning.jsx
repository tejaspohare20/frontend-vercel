import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const MicroLearning = () => {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const response = await axios.get('/api/micro-lessons')
      if (response.data.lessons) {
        setLessons(response.data.lessons)
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
      setLessons([
        {
          _id: '1',
          title: 'Introduction to Greetings',
          difficulty: 'Beginner',
          estimatedTime: 5,
          completed: false,
          description: 'Learn basic greetings and how to introduce yourself.',
        },
        {
          _id: '2',
          title: 'Asking Questions',
          difficulty: 'Beginner',
          estimatedTime: 7,
          completed: false,
          description: 'Master the art of asking questions in English.',
        },
        {
          _id: '3',
          title: 'Business Communication',
          difficulty: 'Intermediate',
          estimatedTime: 10,
          completed: true,
          description: 'Professional communication skills for the workplace.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteLesson = async (lessonId) => {
    try {
      await axios.post(`/api/micro-lessons/${lessonId}/complete`)
      setLessons((prev) => prev.map((lesson) => (lesson._id === lessonId ? { ...lesson, completed: true } : lesson)))
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    }
  }

  const pillStyles = {
    Beginner: 'from-success-100 to-success-50 text-success-700 border-success-300',
    Intermediate: 'from-warning-100 to-warning-50 text-warning-700 border-warning-300',
    Advanced: 'from-red-100 to-red-50 text-red-700 border-red-300',
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-100 border border-success-300 mb-4">
            <span className="text-xl">📚</span>
            <span className="text-xs font-semibold text-success-700 uppercase tracking-wide">Micro Learning Pods</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-neutral-800">Learn in beautifully small loops</h1>
          <p className="mt-3 text-neutral-600 max-w-2xl font-medium">
            Story-driven lessons engineered for attention, retention, and rapid feedback cycles. Each pod takes less than
            10 minutes.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-3 text-neutral-600">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-primary-500"></div>
              <p className="font-medium">Loading your pods...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col space-y-4 shadow-card hover:shadow-hover transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">Lesson</p>
                    <h3 className="text-xl font-display font-semibold text-neutral-800">{lesson.title}</h3>
                  </div>
                  {lesson.completed && <span className="text-success-600 text-sm font-bold">Completed</span>}
                </div>

                <p className="text-neutral-600 text-sm flex-1 font-medium">{lesson.description}</p>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 bg-gradient-to-r ${
                      pillStyles[lesson.difficulty] || 'bg-neutral-100 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    {lesson.difficulty}
                  </span>
                  <span className="text-neutral-600 text-sm font-medium">⏱ {lesson.estimatedTime} min</span>
                </div>

                <button
                  onClick={() => handleCompleteLesson(lesson._id)}
                  disabled={lesson.completed}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    lesson.completed
                      ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed border-2 border-neutral-200'
                      : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                  }`}
                >
                  {lesson.completed ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MicroLearning

