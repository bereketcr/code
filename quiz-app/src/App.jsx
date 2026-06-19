// ---------------------------------------------------------------------
// INTERACTIVE STUDENT QUIZ - MAIN COMPONENT
// This file controls the whole quiz app, including the timer, state, 
// scoring, rendering pages, and playing sound feedback.
// Written in a simple, step-by-step way for beginners with detail comments!
// ---------------------------------------------------------------------

import { useState, useEffect } from 'react';

// Import our question list directly from the JSON file
import questions from './data/questions.json';

// Import our simple sound functions
import { 
  playClickSound, 
  playCorrectSound, 
  playIncorrectSound, 
  playVictorySound 
} from './utils/audio';

// Import all our styling rules
import './App.css';

function App() {
  // --- REACT STATE VARIABLES ---
  // State variables let React remember values that change when playing the quiz.

  // 1. Tracks which screen to show: 'welcome' or 'quiz' or 'paused' or 'results'
  const [quizState, setQuizState] = useState('welcome');
  
  // 2. Tracks the student's name entered in the input field
  const [userName, setUserName] = useState('');
  
  // 3. Tracks the total time limit in seconds selected by the student (Default: 120 seconds)
  const [timerDuration, setTimerDuration] = useState(120);

  // 4. Tracks which question index the student is currently looking at (0 is the first question)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 5. Stores the selected answers. Key is the question ID, value is the chosen option index.
  // Example: { 1: 2, 2: 0 } means Question 1 has choice C (index 2), Question 2 has choice A (index 0).
  const [userAnswers, setUserAnswers] = useState({});
  
  // 6. Tracks the number of seconds remaining on the countdown timer
  const [timeLeft, setTimeLeft] = useState(120);

  // 7. Tracks whether the timer is running (true) or paused (false)
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 8. Tracks how many total seconds the student took to finish the quiz
  const [timeSpent, setTimeSpent] = useState(0);

  // --- EFFECT HOOK: COUNTDOWN TIMER ---
  // This hook runs code automatically whenever the timer's running state changes.
  useEffect(() => {
    // If the quiz is not active or timer is paused, do nothing
    if (quizState !== 'quiz' || !isTimerRunning) {
      return;
    }

    // Set up a standard interval that runs every 1 second (1000 milliseconds)
    const interval = setInterval(() => {
      // Decrease the remaining time by 1
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // If time hits 0, clear timer, play wrong sound, and submit automatically
          clearInterval(interval);
          playIncorrectSound();
          alert("Time is up! Let's see your results.");
          setIsTimerRunning(false);
          setQuizState('results');
          playVictorySound();
          return 0;
        }
        return prevTime - 1;
      });

      // Increase the time spent by 1
      setTimeSpent((prevSpent) => prevSpent + 1);
    }, 1000);

    // This clean-up function stops the interval when the component updates or unmounts
    return () => clearInterval(interval);
  }, [quizState, isTimerRunning]);

  // --- INTERACTIVE BUTTON HANDLERS ---

  // Starts the quiz when the "Start Quiz" button is clicked
  function startQuiz() {
    playClickSound(); // Play click sound effect
    setCurrentQuestionIndex(0); // Reset index to the first question
    setUserAnswers({}); // Empty the answers list
    setTimeLeft(timerDuration); // Reset timer to the chosen limit
    setTimeSpent(0); // Reset time spent back to 0
    setQuizState('quiz'); // Switch screen to the quiz screen
    setIsTimerRunning(true); // Start the timer
  }

  // Records the option clicked by the student for the current question
  function selectOption(questionId, optionIndex) {
    playClickSound();
    
    // Save the answer in our state object
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionIndex
    });
  }

  // Go to the next question in the list
  function nextQuestion() {
    playClickSound();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  // Go back to the previous question
  function prevQuestion() {
    playClickSound();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }

  // Skip the current question and go to the next one
  function skipQuestion() {
    playClickSound();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  // Pause the quiz and freeze the timer
  function pauseQuiz() {
    playClickSound();
    setIsTimerRunning(false); // Stop the countdown
    setQuizState('paused'); // Switch screen to paused screen
  }

  // Resume the quiz and start timer countdown again
  function resumeQuiz() {
    playClickSound();
    setIsTimerRunning(true); // Start the countdown
    setQuizState('quiz'); // Switch screen back to quiz screen
  }

  // Manually submits the quiz to see results
  function submitQuiz() {
    playClickSound();
    setIsTimerRunning(false); // Stop the timer
    setQuizState('results'); // Switch screen to results screen
    playVictorySound(); // Play final retro fanfare sound
  }

  // Resets the quiz and returns to the home welcome page
  function restartQuiz() {
    playClickSound();
    setQuizState('welcome'); // Switch screen back to welcome page
  }

  // --- SCORE & ACCURACY CALCULATIONS ---
  // These variables calculate the statistics directly on every render.
  
  let correctCount = 0;   // Correct answers count
  let incorrectCount = 0; // Wrong answers count
  let skippedCount = 0;   // Skipped questions count

  // Loop through all questions to count the stats
  questions.forEach((q) => {
    const userAnswerIndex = userAnswers[q.id];
    
    if (userAnswerIndex === undefined || userAnswerIndex === null) {
      skippedCount++; // Question was skipped
    } else if (userAnswerIndex === q.correctAnswerIndex) {
      correctCount++; // Answer was correct
    } else {
      incorrectCount++; // Answer was wrong
    }
  });

  // Calculate the score percentage (accuracy)
  const totalQuestions = questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Format the time spent into MM:SS format for readability
  const minutesSpent = Math.floor(timeSpent / 60);
  const secondsSpent = timeSpent % 60;
  const formattedTimeSpent = `${minutesSpent}:${secondsSpent < 10 ? '0' : ''}${secondsSpent}`;

  // Formats the timer countdown into MM:SS format
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;
  const formattedTimeLeft = `${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;

  // Determines the styling class for the timer based on remaining time
  let timerClass = 'timer-badge normal';
  if (timeLeft <= 15) {
    timerClass = 'timer-badge critical'; // Pulses red when time is very low
  } else if (timeLeft <= 30) {
    timerClass = 'timer-badge warning'; // Turns yellow when time is low
  }

  // Calculate the offset for the circular gauge ring on the results page
  const radius = 80;
  const circumference = 2 * Math.PI * radius; // Approx 502.65
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="app-container">
      {/* BRAND HEADER */}
      <header className="header-bar">
        <div className="brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          </div>
          <span className="brand-title">SmartQuiz</span>
        </div>
      </header>

      {/* MAIN QUIZ CARD DISPLAY */}
      <main className="quiz-card">
        
        {/* ==========================================
            1. WELCOME SCREEN
            ========================================== */}
        {quizState === 'welcome' && (
          <div className="welcome-screen">
            <div className="welcome-header">
              <h1>Student Knowledge Challenge</h1>
              <p>Test your skills, track your score, and review concepts!</p>
            </div>

            {/* Student Name Input */}
            <div className="input-group">
              <label className="input-label" htmlFor="student-name">Your Name</label>
              <input 
                id="student-name"
                type="text" 
                placeholder="Enter student name (optional)..." 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="name-input"
              />
            </div>

            {/* Time Limit Dropdown Selection */}
            <div className="input-group">
              <label className="input-label" htmlFor="timer-duration">Set Time Limit</label>
              <select 
                id="timer-duration"
                value={timerDuration}
                onChange={(e) => { playClickSound(); setTimerDuration(Number(e.target.value)); }}
                className="custom-select"
              >
                <option value={30}>30 Seconds (Speed run!)</option>
                <option value={60}>1 Minute</option>
                <option value={120}>2 Minutes</option>
                <option value={300}>5 Minutes</option>
                <option value={600}>10 Minutes</option>
              </select>
            </div>

            {/* Start Button */}
            <button className="btn-primary" onClick={startQuiz}>
              Start Quiz
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M12 2C6.5 2 2 6.5 2 12c0 1.25.25 2.5.75 3.5L7 11l5 5 4.5 4.25c1 .5 2.25.75 3.5.75 5.5 0 10-4.5 10-10S17.5 2 12 2z"/><path d="M9 15l-1.5-.5L5 13M15 9l.5-1.5L17 5"/></svg>
            </button>
          </div>
        )}

        {/* ==========================================
            2. ACTIVE PLAYING SCREEN
            ========================================== */}
        {quizState === 'quiz' && questions.length > 0 && (
          <div>
            {/* Top Stats & Timer HUD */}
            <div className="quiz-top-bar">
              <span className="question-tracker">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              
              <div className="timer-container">
                <div className={timerClass} style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formattedTimeLeft}
                </div>
                {/* Pause Button */}
                <button 
                  onClick={pauseQuiz} 
                  className="timer-btn" 
                  title="Pause Quiz"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Current Question and Options */}
            {(() => {
              const currentQuestion = questions[currentQuestionIndex];
              const isSelected = (idx) => userAnswers[currentQuestion.id] === idx;
              
              return (
                <div className="question-box">
                  {/* Category and Difficulty Indicators */}
                  <div className="badge-row">
                    <span className="category-badge">{currentQuestion.category}</span>
                    <span className={`difficulty-badge ${currentQuestion.difficulty.toLowerCase()}`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  {/* Question Title */}
                  <h2 className="question-text">{currentQuestion.question}</h2>
                  
                  {/* Choice Buttons */}
                  <div className="options-grid" style={{ marginTop: '20px' }}>
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        className={`option-card ${isSelected(idx) ? 'selected' : ''}`}
                        onClick={() => selectOption(currentQuestion.id, idx)}
                      >
                        <div>
                          <span className="option-marker">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {option}
                        </div>
                        {isSelected(idx) && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Bottom Navigation Buttons */}
            <footer className="quiz-footer">
              {/* Back Button */}
              <button 
                className="btn-secondary" 
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                style={{ opacity: currentQuestionIndex === 0 ? 0.4 : 1, cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><polyline points="15 18 9 12 15 6"/></svg>
                Previous
              </button>

              {/* Skip Button */}
              <button className="btn-secondary" onClick={skipQuestion}>
                Skip
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}><polyline points="13 18 19 12 13 6"/><polyline points="6 18 12 12 6 6"/></svg>
              </button>

              {/* Next / Submit Button */}
              {currentQuestionIndex < questions.length - 1 ? (
                <button className="btn-primary" style={{ width: 'auto' }} onClick={nextQuestion}>
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ) : (
                <button className="btn-primary" style={{ width: 'auto', backgroundColor: 'var(--color-success)', borderBottomColor: 'darkgreen' }} onClick={submitQuiz}>
                  Submit Quiz
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}><path d="M20 6L9 17l-5-5"/></svg>
                </button>
              )}
            </footer>
          </div>
        )}

        {/* ==========================================
            3. PAUSED SCREEN OVERLAY
            ========================================== */}
        {quizState === 'paused' && (
          <div className="paused-overlay">
            <div className="paused-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            </div>
            <h2>Quiz Paused</h2>
            <p>
              Hey {userName || 'Student'}, your time is frozen. Take a breath and resume whenever you are ready to continue.
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '300px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={restartQuiz}>
                Quit Quiz
              </button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={resumeQuiz}>
                Resume
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            4. RESULTS SCREEN
            ========================================== */}
        {quizState === 'results' && (
          <div className="results-screen">
            <div className="results-header">
              <h1>Quiz Completed!</h1>
              <p>Excellent effort, {userName || 'Student'}! Here are your performance statistics.</p>
            </div>

            {/* Circular Gauge Ring */}
            <div className="score-ring-container">
              <svg className="score-svg">
                <circle className="score-svg-circle-bg" cx="90" cy="90" r="80" />
                <circle 
                  className="score-svg-circle-fill" 
                  cx="90" 
                  cy="90" 
                  r="80" 
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="score-text-overlay">
                <span className="score-percentage">{scorePercent}%</span>
                <span className="score-fraction">{correctCount} / {totalQuestions} Correct</span>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="stats-grid">
              <div className="stat-card correct">
                <div className="stat-val">{correctCount}</div>
                <div className="stat-lbl">Correct</div>
              </div>
              <div className="stat-card incorrect">
                <div className="stat-val">{incorrectCount}</div>
                <div className="stat-lbl">Incorrect</div>
              </div>
              <div className="stat-card skipped">
                <div className="stat-val">{skippedCount}</div>
                <div className="stat-lbl">Skipped</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{formattedTimeSpent}</div>
                <div className="stat-lbl">Time Taken</div>
              </div>
            </div>

            {/* Retake Button */}
            <button className="btn-primary" onClick={restartQuiz}>
              Retake / New Quiz
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            </button>

            {/* Question Performance Review */}
            <div className="review-section">
              <h2 className="review-title">Detailed Performance Review</h2>
              <div className="review-list">
                {questions.map((q, qIndex) => {
                  const selectedIdx = userAnswers[q.id];
                  const isCorrect = selectedIdx === q.correctAnswerIndex;
                  const isSkipped = selectedIdx === undefined || selectedIdx === null;

                  let statusText = 'Correct';
                  let statusClass = 'correct';
                  if (isSkipped) {
                    statusText = 'Skipped';
                    statusClass = 'skipped';
                  } else if (!isCorrect) {
                    statusText = 'Incorrect';
                    statusClass = 'incorrect';
                  }

                  return (
                    <div key={q.id} className="review-item">
                      {/* Review Item Header */}
                      <div className="review-item-header">
                        <span className="review-question-num">Question {qIndex + 1}</span>
                        <span className={`review-status-badge ${statusClass}`}>
                          {statusText}
                        </span>
                      </div>
                      
                      {/* Question Text */}
                      <div className="review-question-text">{q.question}</div>
                      
                      {/* Choice List */}
                      <div className="review-choices">
                        {q.options.map((option, optIdx) => {
                          const isCorrectOpt = optIdx === q.correctAnswerIndex;
                          const isUserSelected = optIdx === selectedIdx;

                          let choiceClass = '';
                          let iconSvg = null;

                          if (isCorrectOpt) {
                            choiceClass = 'correct';
                            iconSvg = (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-success)' }}><polyline points="20 6 9 17 4 12"/></svg>
                            );
                          } else if (isUserSelected && !isCorrectOpt) {
                            choiceClass = 'user-incorrect';
                            iconSvg = (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-danger)' }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            );
                          }

                          return (
                            <div key={optIdx} className={`review-choice ${choiceClass}`}>
                              <span>
                                <strong>{String.fromCharCode(65 + optIdx)}.</strong> {option}
                              </span>
                              {iconSvg && <span className="choice-status-icon" style={{ display: 'flex', alignItems: 'center' }}>{iconSvg}</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Educational Explanation Box */}
                      <div className="review-explanation">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Subtle Author Signature/Breadcrumb Footer */}
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '20px', 
        paddingBottom: '20px',
        fontSize: '0.8rem', 
        color: 'var(--text-muted)',
        fontWeight: '500',
        letterSpacing: '0.5px'
      }}>
        Made with care by <strong>Antigravity AI</strong>
      </footer>
    </div>
  );
}

export default App;
