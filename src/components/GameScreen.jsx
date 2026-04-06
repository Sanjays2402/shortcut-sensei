import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { shortcuts, appNames, appIcons } from '../data/shortcuts';
import { getCustomShortcuts, recordCorrect, recordWrong, getSoundEnabled, setSoundEnabled } from '../utils/storage';
import { playCorrect, playWrong, playCombo } from '../utils/sound';
import Keyboard from './Keyboard';
import ComboCounter from './ComboCounter';

function getQuestions(app, difficulty) {
  const pool = app === 'custom'
    ? getCustomShortcuts()
    : (shortcuts[app] || []).filter(s =>
        difficulty === 'beginner' ? s.difficulty === 'beginner' :
        difficulty === 'advanced' ? ['beginner', 'advanced'].includes(s.difficulty) :
        true
      );
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
  const [feedback, setFeedback] = useState(null);
  const [pressedKeys, setPressedKeys] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [missed, setMissed] = useState([]);
  const startTime = useRef(null);
  const feedbackTimer = useRef(null);
  const [soundOn, setSoundOn] = useState(getSoundEnabled);

  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev;
      setSoundEnabled(next);
      return next;
    });
  }, []);

  // Initialize startTime on mount
  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const currentQ = questions[qIndex % questions.length];

  const endGame = useCallback(() => {
    setGameOver(true);
    const now = Date.now();
    const c = correct;
    const w = wrong;
    onEnd({
      correct: c, wrong: w, total: c + w,
      streak: bestStreak,
      accuracy: (c + w) > 0 ? Math.round((c / (c + w)) * 100) : 0,
      timeElapsed: Math.floor((now - (startTime.current || now)) / 1000),
      missed,
    });
  }, [correct, wrong, bestStreak, onEnd, missed]);

  // Timer for speedrun — end game when timer reaches 0
  useEffect(() => {
    if (mode !== 'speedrun' || gameOver) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          // Schedule endGame outside of setState
          setTimeout(() => endGame(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [mode, gameOver, endGame]);

  // Elapsed timer
  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => {
      if (startTime.current) {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [gameOver]);

  // Key handler
  useEffect(() => {
    if (gameOver) return;

    const held = new Set();

    function handleDown(e) {
      e.preventDefault();
      held.add(e.key);
      setPressedKeys([...held]);

      const target = new Set(currentQ.keys.map(k => k.toLowerCase()));
      const current = new Set([...held].map(k => k.toLowerCase()));

      let allMatch = true;
      for (const t of target) {
        if (!current.has(t)) { allMatch = false; break; }
      }

      if (allMatch && held.size >= target.size) {
        clearTimeout(feedbackTimer.current);
        setFeedback('correct');
        setCorrect(c => c + 1);
        recordCorrect(app, currentQ.task);
        if (soundOn) playCorrect();
        setStreak(s => {
          const ns = s + 1;
          setBestStreak(bs => Math.max(bs, ns));
          if (ns >= 3 && soundOn) playCombo(ns);
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
      held.delete(e.key);
      setPressedKeys([...held]);
    }

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      clearTimeout(feedbackTimer.current);
    };
  }, [currentQ, gameOver, feedback, app, soundOn]);

  const handleSkip = () => {
    if (feedback || gameOver) return;
    setFeedback('wrong');
    setWrong(w => w + 1);
    recordWrong(app, currentQ.task);
    if (soundOn) playWrong();
    setStreak(0);
    setShowHint(true);
    setMissed(m => [...m, currentQ]);

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

  if (questions.length === 0) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No shortcuts available for this selection.</p>
          <button onClick={onQuit} className="px-6 py-3 rounded-xl font-medium text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#999' }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
      {/* Combo counter */}
      <ComboCounter streak={streak} />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20"
        style={{ background: 'rgba(13,13,13,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onQuit} className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">{appIcons[app] || '📝'} {appNames[app] || 'Custom'}</span>
          <span className="text-gray-600">•</span>
          <span className="text-sm font-mono" style={{ color: '#22c55e', fontFamily: 'JetBrains Mono' }}>
            ✓ {correct}
          </span>
          <span className="text-sm font-mono" style={{ color: '#ef4444', fontFamily: 'JetBrains Mono' }}>
            ✗ {wrong}
          </span>
          {streak >= 2 && (
            <span className="text-sm font-bold" style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
              🔥{streak}
            </span>
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
          <button onClick={toggleSound} className="text-sm transition-colors" style={{ color: soundOn ? '#818cf8' : '#555' }} title={soundOn ? 'Mute' : 'Unmute'}>
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center mt-16">
        <AnimatePresence mode="wait">
          <div key={qIndex} className="text-center mb-8">
            <p className="text-gray-500 text-sm mb-2">Press the shortcut for:</p>
            <h2 className="text-3xl font-bold text-white mb-3">{currentQ.task}</h2>

            <AnimatePresence>
              {(showHint || feedback === 'wrong') && (
                <div className="inline-block px-4 py-2 rounded-lg mt-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <span className="text-sm text-gray-400 mr-2">Answer:</span>
                  <span className="font-bold" style={{ color: '#ef4444', fontFamily: 'JetBrains Mono' }}>{currentQ.display}</span>
                </div>
              )}
              {feedback === 'correct' && (
                <div className="inline-block px-4 py-2 rounded-lg mt-2"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <span className="font-bold" style={{ color: '#22c55e', fontFamily: 'JetBrains Mono' }}>✓ {currentQ.display}</span>
                </div>
              )}
            </AnimatePresence>
          </div>
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
    </div>
  );
}
