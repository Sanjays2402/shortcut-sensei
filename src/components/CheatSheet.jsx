import { motion } from 'framer-motion';
import { shortcuts, appNames, appIcons } from '../data/shortcuts';
import { getCustomShortcuts } from '../utils/storage';

export default function CheatSheet({ app, onClose }) {
  const builtIn = shortcuts[app] || [];
  const custom = app === 'custom' ? getCustomShortcuts() : [];
  const all = app === 'custom' ? custom : builtIn;

  const grouped = { beginner: [], advanced: [], master: [] };
  all.forEach(s => {
    const d = s.difficulty || 'beginner';
    if (grouped[d]) grouped[d].push(s);
    else grouped.beginner.push(s);
  });

  const diffColors = { beginner: '#22c55e', advanced: '#f59e0b', master: '#ef4444' };

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
        className="w-full max-w-3xl rounded-2xl p-6"
        style={{
          background: 'rgba(30,30,40,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {app === 'custom' ? '📝 Custom' : `${appIcons[app] || ''} ${appNames[app] || app}`} Cheat Sheet
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#818cf8',
              }}
            >
              🖨 Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#999',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Shortcuts grid by difficulty */}
        {Object.entries(grouped).map(([diff, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={diff} className="mb-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: diffColors[diff] }}
              >
                {diff} ({items.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="text-sm text-gray-300">{s.task}</span>
                    <span
                      className="text-sm font-bold ml-3 shrink-0"
                      style={{ color: '#818cf8', fontFamily: 'JetBrains Mono' }}
                    >
                      {s.display}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {all.length === 0 && (
          <p className="text-gray-500 text-center py-8">No shortcuts to display.</p>
        )}
      </motion.div>
    </motion.div>
  );
}
