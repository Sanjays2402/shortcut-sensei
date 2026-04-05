import { motion } from 'framer-motion';
import { useState } from 'react';
import { appIcons, appNames } from '../data/shortcuts';

const modes = [
  { id: 'practice', label: 'Practice', desc: 'No timer, learn at your pace', icon: '📚' },
  { id: 'speedrun', label: 'Speed Run', desc: '30 seconds, max correct answers', icon: '⚡' },
  { id: 'survival', label: 'Survival', desc: '3 lives, one wrong = lose a life', icon: '💀' },
];

const difficulties = [
  { id: 'beginner', label: 'Beginner', color: '#22c55e' },
  { id: 'advanced', label: 'Advanced', color: '#f59e0b' },
  { id: 'master', label: 'Master', color: '#ef4444' },
];

const apps = Object.keys(appNames);

export default function MenuScreen({ onStart }) {
  const [app, setApp] = useState('vscode');
  const [mode, setMode] = useState('practice');
  const [difficulty, setDifficulty] = useState('beginner');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8"
    >
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2" style={{ fontFamily: 'Inter' }}>
          <span style={{ color: '#6366f1' }}>⌨️</span> Shortcut Sensei
        </h1>
        <p className="text-gray-500 text-lg">Master keyboard shortcuts through practice</p>
      </div>

      {/* App selector */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">Choose App</h3>
        <div className="flex gap-3">
          {apps.map(a => (
            <button key={a} onClick={() => setApp(a)}
              className="px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                background: app === a ? 'rgba(99,102,241,0.2)' : 'rgba(30,30,40,0.5)',
                border: `1px solid ${app === a ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: app === a ? '#818cf8' : '#999',
                backdropFilter: 'blur(12px)',
                boxShadow: app === a ? '0 0 20px rgba(99,102,241,0.15)' : 'none',
              }}
            >
              {appIcons[a]} {appNames[a]}
            </button>
          ))}
        </div>
      </div>

      {/* Mode selector */}
      <div className="mb-8 w-full max-w-xl">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">Game Mode</h3>
        <div className="grid grid-cols-3 gap-3">
          {modes.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: mode === m.id ? 'rgba(99,102,241,0.15)' : 'rgba(30,30,40,0.5)',
                border: `1px solid ${mode === m.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                backdropFilter: 'blur(12px)',
                boxShadow: mode === m.id ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
              }}
            >
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="font-semibold text-sm" style={{ color: mode === m.id ? '#f5f5f5' : '#ccc' }}>{m.label}</div>
              <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-10">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">Difficulty</h3>
        <div className="flex gap-3">
          {difficulties.map(d => (
            <button key={d.id} onClick={() => setDifficulty(d.id)}
              className="px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200"
              style={{
                background: difficulty === d.id ? `${d.color}22` : 'rgba(30,30,40,0.5)',
                border: `1px solid ${difficulty === d.id ? `${d.color}66` : 'rgba(255,255,255,0.08)'}`,
                color: difficulty === d.id ? d.color : '#888',
                backdropFilter: 'blur(12px)',
                boxShadow: difficulty === d.id ? `0 0 15px ${d.color}22` : 'none',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <motion.button
        whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onStart({ app, mode, difficulty })}
        className="px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          border: '1px solid rgba(129,140,248,0.3)',
          boxShadow: '0 0 20px rgba(99,102,241,0.2)',
        }}
      >
        Start Training →
      </motion.button>

      {/* Best scores hint */}
      <p className="text-gray-600 text-xs mt-6">Your best scores are saved locally</p>
    </motion.div>
  );
}
