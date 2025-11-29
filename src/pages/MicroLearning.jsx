import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from 'axios'

// Utility function to shuffle array
const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

const MicroLearning = () => {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [quizMode, setQuizMode] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [quizResults, setQuizResults] = useState(null)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const navigate = useNavigate()

  const categories = [
    'All',
    'Pronunciation',
    'Fluency',
    'Grammar',
    'Vocabulary',
    'Confidence',
    'Interview',
    'Presentation',
    'Business',
    'General'
  ]

  useEffect(() => {
    fetchLessons()
  }, [selectedCategory])

  const fetchLessons = async () => {
    try {
      setLoading(true)
      let response
      if (selectedCategory === 'All') {
        response = await axios.get('/api/micro-learning')
      } else {
        response = await axios.get(`/api/micro-learning/category/${selectedCategory}`)
      }
      
      if (response.data.lessons) {
        setLessons(response.data.lessons)
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
      // Fallback data
      setLessons([
        {
          _id: '1',
          title: 'Introduction to Greetings',
          difficulty: 'Beginner',
          estimatedTime: 5,
          completed: false,
          description: 'Learn basic greetings and how to introduce yourself.',
          category: 'General'
        },
        {
          _id: '2',
          title: 'Asking Questions',
          difficulty: 'Beginner',
          estimatedTime: 7,
          completed: false,
          description: 'Master the art of asking questions in English.',
          category: 'Grammar'
        },
        {
          _id: '3',
          title: 'Business Communication',
          difficulty: 'Intermediate',
          estimatedTime: 10,
          completed: true,
          description: 'Professional communication skills for the workplace.',
          category: 'Business'
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteLesson = async (lessonId) => {
    try {
      await axios.post(`/api/micro-learning/${lessonId}/complete`)
      setLessons((prev) => prev.map((lesson) => (lesson._id === lessonId ? { ...lesson, completed: true } : lesson)))
      
      // If viewing a lesson detail, update that too
      if (selectedLesson && selectedLesson._id === lessonId) {
        setSelectedLesson({ ...selectedLesson, completed: true })
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    }
  }

  const handleViewLesson = async (lessonId) => {
    try {
      const response = await axios.get(`/api/micro-learning/${lessonId}`)
      if (response.data.lesson) {
        setSelectedLesson(response.data.lesson)
        setQuizMode(false)
        setQuizResults(null)
        setQuizAnswers([])
        setShuffledQuestions([])
      }
    } catch (error) {
      console.error('Failed to fetch lesson details:', error)
    }
  }

  const handleBackToList = () => {
    setSelectedLesson(null)
    setQuizMode(false)
    setQuizResults(null)
    setShuffledQuestions([])
  }

  const handleTakeQuiz = () => {
    if (!selectedLesson || !selectedLesson.quizQuestions) return
    
    // Shuffle questions and their options
    const shuffled = selectedLesson.quizQuestions.map(question => {
      // Create array of option indices
      const optionIndices = question.options.map((_, index) => index)
      // Shuffle the indices
      const shuffledIndices = shuffleArray(optionIndices)
      
      // Create new options array based on shuffled indices
      const shuffledOptions = shuffledIndices.map(index => question.options[index])
      
      // Find new correct answer index
      const newCorrectAnswer = shuffledIndices.indexOf(question.correctAnswer)
      
      return {
        ...question,
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer,
        originalIndices: shuffledIndices // Keep track of original indices for answer mapping
      }
    })
    
    // Shuffle the questions themselves
    const finalShuffledQuestions = shuffleArray(shuffled)
    
    setShuffledQuestions(finalShuffledQuestions)
    setQuizMode(true)
    setQuizAnswers(Array(finalShuffledQuestions.length).fill(null))
  }

  const handleQuizAnswerChange = (questionIndex, optionIndex) => {
    const newAnswers = [...quizAnswers]
    newAnswers[questionIndex] = optionIndex
    setQuizAnswers(newAnswers)
  }

  const handleSubmitQuiz = async () => {
    if (!selectedLesson || (!shuffledQuestions.length && !selectedLesson.quizQuestions)) return
    
    // Check if all questions are answered
    const unanswered = quizAnswers.some(answer => answer === null)
    if (unanswered) {
      alert('Please answer all questions before submitting.')
      return
    }
    
    try {
      setSubmittingQuiz(true)
      
      // Map answers back to original indices if questions were shuffled
      const questionsToUse = shuffledQuestions.length > 0 ? shuffledQuestions : selectedLesson.quizQuestions
      const originalAnswers = quizAnswers.map((answer, index) => {
        const question = questionsToUse[index]
        // If we have original indices mapping, map back to original answer index
        if (question.originalIndices && answer !== null) {
          return question.originalIndices[answer]
        }
        return answer
      })
      
      const response = await axios.post(`/api/micro-learning/${selectedLesson._id}/quiz`, { answers: originalAnswers })
      setQuizResults(response.data)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setSubmittingQuiz(false)
    }
  }

  const pillStyles = {
    Beginner: 'from-success-100 to-success-50 text-success-700 border-success-300',
    Intermediate: 'from-warning-100 to-warning-50 text-warning-700 border-warning-300',
    Advanced: 'from-red-100 to-red-50 text-red-700 border-red-300',
  }

  const categoryStyles = {
    Pronunciation: 'bg-purple-100 text-purple-800',
    Fluency: 'bg-blue-100 text-blue-800',
    Grammar: 'bg-green-100 text-green-800',
    Vocabulary: 'bg-yellow-100 text-yellow-800',
    Confidence: 'bg-pink-100 text-pink-800',
    Interview: 'bg-indigo-100 text-indigo-800',
    Presentation: 'bg-teal-100 text-teal-800',
    Business: 'bg-orange-100 text-orange-800',
    General: 'bg-gray-100 text-gray-800',
  }

  if (selectedLesson && quizResults) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <button 
            onClick={() => {
              setQuizResults(null)
              setQuizMode(false)
            }}
            className="flex items-center gap-2 text-primary-600 font-medium mb-6 hover:text-primary-700 transition-colors"
          >
            ← Back to lesson
          </button>
          
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-card">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-100 text-success-600 mb-4">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-display font-bold text-neutral-800 mb-2">Quiz Results</h1>
              <p className="text-5xl font-display font-bold text-primary-600 mb-2">{quizResults.score}%</p>
              <p className="text-neutral-600">{quizResults.message}</p>
              {quizResults.bonusPoints > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-100 text-success-700">
                  <span>⭐</span>
                  <span>+{quizResults.bonusPoints} bonus points!</span>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {quizResults.results.map((result, index) => (
                <div key={index} className={`border rounded-xl p-5 ${result.isCorrect ? 'border-success-200 bg-success-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${result.isCorrect ? 'bg-success-500' : 'bg-red-500'}`}>
                      {result.isCorrect ? (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-800">{result.question}</h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-neutral-600">Your answer:</p>
                          <p className={`font-medium ${result.isCorrect ? 'text-success-700' : 'text-red-700'}`}>
                            {result.options[result.userAnswer]}
                          </p>
                        </div>
                        {!result.isCorrect && (
                          <div>
                            <p className="text-sm text-neutral-600">Correct answer:</p>
                            <p className="font-medium text-success-700">
                              {result.options[result.correctAnswer]}
                            </p>
                          </div>
                        )}
                      </div>
                      {result.explanation && (
                        <div className="mt-3 p-3 bg-neutral-100 rounded-lg">
                          <p className="text-sm text-neutral-700">
                            <span className="font-medium">Explanation:</span> {result.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  setQuizResults(null)
                  setQuizMode(false)
                }}
                className="flex-1 py-3 rounded-xl font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
              >
                Back to Lesson
              </button>
              <button
                onClick={() => {
                  setQuizResults(null)
                  handleTakeQuiz()
                }}
                className="flex-1 py-3 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedLesson && quizMode && (selectedLesson.quizQuestions || shuffledQuestions.length > 0)) {
    const questionsToDisplay = shuffledQuestions.length > 0 ? shuffledQuestions : selectedLesson.quizQuestions
    
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <button 
            onClick={() => setQuizMode(false)}
            className="flex items-center gap-2 text-primary-600 font-medium mb-6 hover:text-primary-700 transition-colors"
          >
            ← Back to lesson
          </button>
          
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-card">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-neutral-800 mb-2">Quiz: {selectedLesson.title}</h1>
              <p className="text-neutral-600">Test your knowledge with this quick quiz</p>
            </div>
            
            <div className="space-y-8">
              {questionsToDisplay.map((question, qIndex) => (
                <div key={qIndex} className="border border-neutral-200 rounded-xl p-6">
                  <h3 className="font-medium text-neutral-800 mb-4">
                    {qIndex + 1}. {question.question}
                  </h3>
                  
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => (
                      <label 
                        key={oIndex} 
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          quizAnswers[qIndex] === oIndex 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={quizAnswers[qIndex] === oIndex}
                          onChange={() => handleQuizAnswerChange(qIndex, oIndex)}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleSubmitQuiz}
              disabled={submittingQuiz}
              className={`w-full mt-8 py-4 rounded-xl font-bold transition-all ${
                submittingQuiz
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
              }`}
            >
              {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <button 
            onClick={handleBackToList}
            className="flex items-center gap-2 text-primary-600 font-medium mb-6 hover:text-primary-700 transition-colors"
          >
            ← Back to all lessons
          </button>
          
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-neutral-800 mb-2">{selectedLesson.title}</h1>
                <p className="text-neutral-600">{selectedLesson.description}</p>
              </div>
              {selectedLesson.completed && (
                <span className="px-4 py-2 rounded-full bg-success-100 text-success-700 font-bold text-sm">
                  Completed
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryStyles[selectedLesson.category] || 'bg-gray-100 text-gray-800'}`}>
                {selectedLesson.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 bg-gradient-to-r ${
                  pillStyles[selectedLesson.difficulty] || 'bg-neutral-100 text-neutral-700 border-neutral-300'
                }`}
              >
                {selectedLesson.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border-2 border-neutral-300">
                ⏱ {selectedLesson.estimatedTime} min
              </span>
            </div>
            
            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-display font-bold text-neutral-800 mb-4">Lesson Content</h2>
              <p className="text-neutral-700 whitespace-pre-line">{selectedLesson.content}</p>
            </div>
            
            {selectedLesson.keyPoints && selectedLesson.keyPoints.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-display font-bold text-neutral-800 mb-4">Key Points</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedLesson.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span className="text-neutral-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedLesson.practiceExercise && (
              <div className="mb-8">
                <h2 className="text-xl font-display font-bold text-neutral-800 mb-4">Practice Exercise</h2>
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                  <p className="text-neutral-700">{selectedLesson.practiceExercise}</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCompleteLesson(selectedLesson._id)}
                disabled={selectedLesson.completed}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  selectedLesson.completed
                    ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed border-2 border-neutral-200'
                    : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                }`}
              >
                {selectedLesson.completed ? 'Lesson Completed' : 'Mark as Complete'}
              </button>
              
              {selectedLesson.quizQuestions && selectedLesson.quizQuestions.length > 0 && (
                <button
                  onClick={handleTakeQuiz}
                  className="flex-1 py-3 rounded-xl font-bold bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm transition-colors"
                >
                  Take Quiz ({selectedLesson.quizQuestions.length} questions)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

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
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${categoryStyles[lesson.category] || 'bg-gray-100 text-gray-800'}`}>
                        {lesson.category}
                      </span>
                    </div>
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

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewLesson(lesson._id)}
                    className="flex-1 py-2.5 rounded-lg font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleCompleteLesson(lesson._id)}
                    disabled={lesson.completed}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                      lesson.completed
                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed border-2 border-neutral-200'
                        : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                    }`}
                  >
                    {lesson.completed ? 'Done' : 'Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MicroLearning