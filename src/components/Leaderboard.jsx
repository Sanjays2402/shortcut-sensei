import { motion } from 'framer-motion';
import { useState } from 'react';
import { appNames, appIcons } from '../data/shortcuts';

const modes = ['practice', 'speedrun', 'survival'];
const difficulties = ['beginner', 'advanced', 'master'];
const modeLabels = { practice: 'Practice', speedrun: 'Speed Run', survival: 'Survival' };
const modeIcons = { practice: '📚', speedrun: '⚡', survival: '💀' };
const diffColors = { beginner: '#22c55e', advanced: '#f59e0b', master: '#ef4444' };

function getScores(app) {
  const results = [];
  for (const mode of modes) {
    for (const diff of difficulties) {
      const key = `sensei-best-${app}-${mode}-${diff}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          if (data && data.correct > 0) {
            results.push({ mode, difficulty: diff, ...data });
          }
        }
      } catch { /* skip */ }
    }
  }
  return results.sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy);
}

function clearScores(app) {
  for (const mode of modes) {
    for (const diff of difficulties) {
      localStorage.removeItem(`sensei-best-${app}-${mode}-${diff}`);
    }
  }
}

export default function Leaderboard({ onClose }) {
  const [app, setApp] = useState('vscode');
  const [scores, setScores] = useState(() => getScores('vscode'));

  const switchApp = (a) => {
    setApp(a);
    setScores(getScores(a));
  };

  const handleClear = () => {
    clearScores(app);
    setScores([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-2xl rounded-2xl p-6"
        style={{
          background: 'rgba(30,30,40,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🏆 Leaderboard</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#999' }}
          >
            Close
          </button>
        </div>

        {/* App filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.keys(appNames).map(a => (
            <button key={a} onClick={() => switchApp(a)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: app === a ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${app === a ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: app === a ? '#818cf8' : '#888',
              }}
            >
              {appIcons[a]} {appNames[a]}
            </button>
          ))}
        </div>

        {/* Scores table */}
        {scores.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎮</div>
            <p className="text-gray-500">No scores yet for {appIcons[app]} {appNames[app]}</p>
            <p className="text-gray-600 text-sm mt-1">Play some rounds and your best scores will appear here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header row */}
            <div className="grid grid-cols-6 gap-2 px-4 py-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <span>#</span>
              <span>Mode</span>
              <span>Difficulty</span>
              <span className="text-right">Score</span>
              <span className="text-right">Accuracy</span>
              <span className="text-right">Streak</span>
            </div>

            {scores.map((s, i) => (
              <motion.div
                key={`${s.mode}-${s.difficulty}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-6 gap-2 items-center px-4 py-3 rounded-xl"
                style={{
                  background: i === 0
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <span className="text-sm font-bold" style={{
                  color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#555',
                  fontFamily: 'JetBrains Mono',
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </span>
                <span className="text-sm text-gray-300">
                  {modeIcons[s.mode]} {modeLabels[s.mode]}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full inline-block w-fit"
                  style={{
                    background: `${diffColors[s.difficulty]}15`,
                    color: diffColors[s.difficulty],
                    border: `1px solid ${diffColors[s.difficulty]}33`,
                  }}>
                  {s.difficulty}
                </span>
                <span className="text-right text-sm font-bold" style={{ color: '#f5f5f5', fontFamily: 'JetBrains Mono' }}>
                  {s.correct}
                </span>
                <span className="text-right text-sm font-medium" style={{
                  color: s.accuracy >= 80 ? '#22c55e' : s.accuracy >= 50 ? '#f59e0b' : '#ef4444',
                  fontFamily: 'JetBrains Mono',
                }}>
                  {s.accuracy}%
                </span>
                <span className="text-right text-sm" style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
                  {s.streak || 0}🔥
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Clear scores */}
        {scores.length > 0 && (
          <div className="mt-6 text-center">
            <button onClick={handleClear}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444' }}>
              Clear {appNames[app]} Scores
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
