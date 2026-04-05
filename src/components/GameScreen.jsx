import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { shortcuts, appNames, appIcons } from '../data/shortcuts';
import Keyboard from './Keyboard';

function getQuestions(app, difficulty) {
  const pool = shortcuts[app].filter(s =>
    difficulty === 'beginner' ? s.difficulty === 'beginner' :
    difficulty === 'advanced' ? ['beginner', 'advanced'].includes(s.difficulty) :
    true
  );
  // Shuffle
  return [...pool].sort(() => Math.random() - 0.5);
}

export default function GameScreen({ config, onEnd, onQuit }) {
  const { app, mode, difficulty } = config;
  const [questions] = useState(() => getQuestions(app, difficulty));
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(mode === 'speedrun' ? 30 : null);
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [pressedKeys, setPressedKeys] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const startTime = useRef(Date.now());
  const feedbackTimer = useRef(null);

  const currentQ = questions[qIndex % questions.length];
  const total = correct + wrong;

  // Timer for speedrun
  useEffect(() => {
    if (mode !== 'speedrun' || gameOver) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [mode, gameOver]);

  // Elapsed timer
  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [gameOver]);

  // End on timer
  useEffect(() => {
    if (timeLeft === 0 && !gameOver) endGame();
  }, [timeLeft]);

  const endGame = useCallback(() => {
    setGameOver(true);
    onEnd({
      correct, wrong, total: correct + wrong,
      streak: bestStreak,
      accuracy: total > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0,
      timeElapsed: Math.floor((Date.now() - startTime.current) / 1000),
    });
  }, [correct, wrong, bestStreak, total, onEnd]);

  // Key handler
  useEffect(() => {
    if (gameOver) return;

    const held = new Set();

    function handleDown(e) {
      e.preventDefault();
      held.add(e.key);
      setPressedKeys([...held]);

      // Check if all target keys are held
      const target = new Set(currentQ.keys.map(k => k.toLowerCase()));
      const current = new Set([...held].map(k => k.toLowerCase()));
      
      let allMatch = true;
      for (const t of target) {
        if (!current.has(t)) { allMatch = false; break; }
      }

      if (allMatch && held.size >= target.size) {
        // Correct!
        clearTimeout(feedbackTimer.current);
        setFeedback('correct');
        setCorrect(c => c + 1);
        setStreak(s => {
          const ns = s + 1;
          setBestStreak(bs => Math.max(bs, ns));
          return ns;
        });
        setShowHint(false);

        feedbackTimer.current = setTimeout(() => {
          setFeedback(null);
          setPressedKeys([]);
          held.clear();
          setQIndex(i => i + 1);
        }, 500);
      }
    }

    function handleUp(e) {
      // If keys were released without matching
      held.delete(e.key);
      setPressedKeys([...held]);

      if (held.size === 0 && !feedback) {
        // They released all keys without getting it right — check if they tried
        // Only count as wrong if they pressed at least one key
      }
    }

    // Wrong answer on partial release after pressing something
    let wrongTimer;
    function checkWrong() {
      if (held.size === 0 && pressedKeys.length > 0 && !feedback) {
        // They tried and failed
      }
    }

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      clearTimeout(feedbackTimer.current);
    };
  }, [currentQ, gameOver, feedback]);

  // Skip button (counts as wrong)
  const handleSkip = () => {
    if (feedback || gameOver) return;
    setFeedback('wrong');
    setWrong(w => w + 1);
    setStreak(0);
    setShowHint(true);

    if (mode === 'survival') {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(endGame, 600);
        return;
      }
    }

    feedbackTimer.current = setTimeout(() => {
      setFeedback(null);
      setPressedKeys([]);
      setShowHint(false);
      setQIndex(i => i + 1);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
    >
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20"
        style={{ background: 'rgba(13,13,13,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onQuit} className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">{appIcons[app]} {appNames[app]}</span>
          <span className="text-gray-600">•</span>
          <span className="text-sm font-mono" style={{ color: '#22c55e', fontFamily: 'JetBrains Mono' }}>
            ✓ {correct}
          </span>
          <span className="text-sm font-mono" style={{ color: '#ef4444', fontFamily: 'JetBrains Mono' }}>
            ✗ {wrong}
          </span>
          {streak >= 2 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="text-sm font-bold" style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
              🔥{streak}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {mode === 'speedrun' && (
            <span className="text-lg font-bold" style={{
              color: timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#f5f5f5',
              fontFamily: 'JetBrains Mono',
            }}>
              {timeLeft}s
            </span>
          )}
          {mode === 'survival' && (
            <span className="text-lg">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span>
          )}
          {mode === 'practice' && (
            <span className="text-sm text-gray-500" style={{ fontFamily: 'JetBrains Mono' }}>{elapsed}s</span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center mt-16">
        {/* Task display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center mb-8"
          >
            <p className="text-gray-500 text-sm mb-2">Press the shortcut for:</p>
            <h2 className="text-3xl font-bold text-white mb-3">{currentQ.task}</h2>
            
            {/* Expected shortcut (shown on wrong/hint) */}
            <AnimatePresence>
              {(showHint || feedback === 'wrong') && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-block px-4 py-2 rounded-lg mt-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <span className="text-sm text-gray-400 mr-2">Answer:</span>
                  <span className="font-bold" style={{ color: '#ef4444', fontFamily: 'JetBrains Mono' }}>
                    {currentQ.display}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Correct feedback */}
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-block px-4 py-2 rounded-lg mt-2"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
                >
                  <span className="font-bold" style={{ color: '#22c55e', fontFamily: 'JetBrains Mono' }}>
                    ✓ {currentQ.display}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Pressed keys display */}
        <div className="h-8 mb-4 flex items-center gap-2">
          {pressedKeys.map((k, i) => (
            <span key={i} className="px-3 py-1 rounded-md text-xs font-medium"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#818cf8',
                fontFamily: 'JetBrains Mono',
              }}>
              {k}
            </span>
          ))}
        </div>

        {/* Keyboard */}
        <Keyboard
          targetKeys={showHint || feedback ? currentQ.keys : []}
          pressedKeys={pressedKeys}
          feedback={feedback}
        />

        {/* Skip / End buttons */}
        <div className="flex gap-3 mt-8">
          <button onClick={handleSkip}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#666',
            }}>
            Skip (Show Answer)
          </button>
          {mode === 'practice' && (
            <button onClick={endGame}
              className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
              }}>
              End Session
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
