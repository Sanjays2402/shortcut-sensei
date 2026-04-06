import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { appNames, appIcons } from '../data/shortcuts';
import { getDailyQuestions, getDailyScore, saveDailyScore } from '../utils/storage';
import { playCorrect, playWrong, playCombo } from '../utils/sound';
import { getSoundEnabled } from '../utils/storage';
import { shortcuts } from '../data/shortcuts';
import Keyboard from './Keyboard';
import ComboCounter from './ComboCounter';

export default function DailyChallenge({ onBack }) {
  const [questions] = useState(() => getDailyQuestions(shortcuts));
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [pressedKeys, setPressedKeys] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const [missed, setMissed] = useState([]);
  const [existingScore] = useState(() => getDailyScore());
  const feedbackTimer = useRef(null);
  const soundOn = getSoundEnabled();

  const currentQ = questions[qIndex];
  const isFinished = done || qIndex >= 10;

  const finishChallenge = useCallback(() => {
    const total = correct + wrong;
    const score = {
      correct,
      wrong,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      streak: bestStreak,
      missed,
    };
    saveDailyScore(score);
    setDone(true);
  }, [correct, wrong, bestStreak, missed]);

  // Track done state for use in timer callbacks
  const doneRef = useRef(false);
  useEffect(() => { doneRef.current = done; }, [done]);
  const finishRef = useRef(finishChallenge);
  useEffect(() => { finishRef.current = finishChallenge; }, [finishChallenge]);

  // We call finishChallenge from the advancing callbacks instead of an effect

  // Key handler
  useEffect(() => {
    if (isFinished || !currentQ) return;

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
          setQIndex(i => {
            const next = i + 1;
            if (next >= 10 && !doneRef.current) {
              setTimeout(() => finishRef.current(), 0);
            }
            return next;
          });
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
  }, [currentQ, isFinished, feedback, soundOn]);

  const handleSkip = () => {
    if (feedback || isFinished) return;
    setFeedback('wrong');
    setWrong(w => w + 1);
    if (soundOn) playWrong();
    setStreak(0);
    setShowHint(true);
    setMissed(m => [...m, currentQ]);

    feedbackTimer.current = setTimeout(() => {
      setFeedback(null);
      setPressedKeys([]);
      setShowHint(false);
      setQIndex(i => {
        const next = i + 1;
        if (next >= 10 && !doneRef.current) {
          setTimeout(() => finishRef.current(), 0);
        }
        return next;
      });
    }, 1500);
  };

  const shareText = () => {
    const ds = getDailyScore();
    if (!ds) return;
    const emoji = Array.from({ length: 10 }, (_, i) => {
      if (i < ds.correct) return '🟩';
      return '🟥';
    }).join('');
    const text = `⌨️ Shortcut Sensei Daily\n${emoji}\nScore: ${ds.correct}/10 | Streak: ${ds.streak}🔥`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  // Show existing score
  if (existingScore && !done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
      >
        <div
          className="w-full max-w-md p-8 rounded-2xl text-center"
          style={{
            background: 'rgba(30,30,40,0.6)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Today&apos;s Challenge Complete! ✅</h2>
          <p className="text-gray-500 mb-6">You already did today&apos;s daily challenge.</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold" style={{ color: '#22c55e', fontFamily: 'JetBrains Mono' }}>{existingScore.correct}/10</div>
              <div className="text-xs text-gray-500 mt-1">Score</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold" style={{ color: '#6366f1', fontFamily: 'JetBrains Mono' }}>{existingScore.accuracy}%</div>
              <div className="text-xs text-gray-500 mt-1">Accuracy</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold" style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>{existingScore.streak}🔥</div>
              <div className="text-xs text-gray-500 mt-1">Streak</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={shareText}
              className="flex-1 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '1px solid rgba(245,158,11,0.3)' }}>
              📋 Share Score
            </button>
            <button onClick={onBack}
              className="flex-1 py-3 rounded-xl font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#999' }}>
              Back
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Done screen
  if (isFinished) {
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 min-h-screen flex items-center justify-center px-4"
      >
        <div className="w-full max-w-md p-8 rounded-2xl" style={{
          background: 'rgba(30,30,40,0.6)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold text-white">Daily Challenge Complete!</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold" style={{ color: '#22c55e', fontFamily: 'JetBrains Mono' }}>{correct}/10</div>
              <div className="text-xs text-gray-500 mt-1">Score</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold" style={{ color: '#6366f1', fontFamily: 'JetBrains Mono' }}>{accuracy}%</div>
              <div className="text-xs text-gray-500 mt-1">Accuracy</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold" style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>{bestStreak}🔥</div>
              <div className="text-xs text-gray-500 mt-1">Streak</div>
            </div>
          </div>

          {missed.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Missed</h3>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {missed.map((q, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <span className="text-xs text-gray-400">{q.task}</span>
                    <span className="text-xs font-bold" style={{ color: '#818cf8', fontFamily: 'JetBrains Mono' }}>{q.display}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={shareText}
              className="flex-1 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '1px solid rgba(245,158,11,0.3)' }}>
              📋 Share Score
            </button>
            <button onClick={onBack}
              className="flex-1 py-3 rounded-xl font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#999' }}>
              Home
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Active game
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
    >
      <ComboCounter streak={streak} />

      {/* Progress dots */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20"
        style={{ background: 'rgba(13,13,13,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">← Back</button>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="w-3 h-3 rounded-full transition-all duration-300" style={{
              background: i < qIndex
                ? (missed.some(m => m.task === questions[i]?.task) ? '#ef4444' : '#22c55e')
                : i === qIndex ? '#6366f1' : 'rgba(255,255,255,0.1)',
              boxShadow: i === qIndex ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
            }} />
          ))}
        </div>
        <span className="text-sm text-gray-500" style={{ fontFamily: 'JetBrains Mono' }}>{qIndex + 1}/10</span>
      </div>

      {/* Question */}
      <div className="flex flex-col items-center mt-16">
        <AnimatePresence mode="wait">
          <motion.div key={qIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-gray-500 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {appIcons[currentQ.app] || '📝'} {appNames[currentQ.app] || currentQ.app}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">Press the shortcut for:</p>
            <h2 className="text-3xl font-bold text-white mb-3">{currentQ.task}</h2>

            <AnimatePresence>
              {(showHint || feedback === 'wrong') && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="inline-block px-4 py-2 rounded-lg mt-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <span className="text-sm text-gray-400 mr-2">Answer:</span>
                  <span className="font-bold" style={{ color: '#ef4444', fontFamily: 'JetBrains Mono' }}>{currentQ.display}</span>
                </motion.div>
              )}
              {feedback === 'correct' && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="inline-block px-4 py-2 rounded-lg mt-2" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <span className="font-bold" style={{ color: '#22c55e', fontFamily: 'JetBrains Mono' }}>✓ {currentQ.display}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <div className="h-8 mb-4 flex items-center gap-2">
          {pressedKeys.map((k, i) => (
            <span key={i} className="px-3 py-1 rounded-md text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontFamily: 'JetBrains Mono' }}>
              {k}
            </span>
          ))}
        </div>

        <Keyboard targetKeys={showHint || feedback ? currentQ.keys : []} pressedKeys={pressedKeys} feedback={feedback} />

        <button onClick={handleSkip}
          className="mt-8 px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#666' }}>
          Skip (Show Answer)
        </button>
      </div>
    </motion.div>
  );
}
