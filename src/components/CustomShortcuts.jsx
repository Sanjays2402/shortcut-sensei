import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getCustomShortcuts, saveCustomShortcuts } from '../utils/storage';

const KEY_OPTIONS = [
  'Meta', 'Control', 'Alt', 'Shift',
  'a','b','c','d','e','f','g','h','i','j','k','l','m',
  'n','o','p','q','r','s','t','u','v','w','x','y','z',
  '0','1','2','3','4','5','6','7','8','9',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
  'Space','Enter','Backspace','Tab','Escape',
  'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
  '[',']','\\','/','.',',',';','\'','`','-','=',
];

const DISPLAY_MAP = {
  Meta: '⌘', Alt: '⌥', Control: '⌃', Shift: '⇧', Backspace: '⌫', Tab: '⇥',
  Enter: '↵', Space: '␣', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
  Escape: 'Esc',
};

function keysToDisplay(keys) {
  return keys.map(k => DISPLAY_MAP[k] || k.toUpperCase()).join('');
}

export default function CustomShortcuts({ onClose }) {
  const [shortcuts, setShortcuts] = useState(() => getCustomShortcuts());
  const [editing, setEditing] = useState(null); // index or 'new'
  const [form, setForm] = useState({ task: '', keys: [], difficulty: 'beginner' });

  const addNew = () => {
    setForm({ task: '', keys: [], difficulty: 'beginner' });
    setEditing('new');
  };

  const editItem = (i) => {
    setForm({ ...shortcuts[i] });
    setEditing(i);
  };

  const submitForm = () => {
    if (!form.task.trim() || form.keys.length === 0) return;
    const entry = {
      task: form.task.trim(),
      keys: form.keys,
      display: keysToDisplay(form.keys),
      difficulty: form.difficulty,
    };
    let updated;
    if (editing === 'new') {
      updated = [...shortcuts, entry];
    } else {
      updated = shortcuts.map((s, i) => i === editing ? entry : s);
    }
    setShortcuts(updated);
    saveCustomShortcuts(updated);
    setEditing(null);
  };

  const deleteItem = (i) => {
    const updated = shortcuts.filter((_, idx) => idx !== i);
    setShortcuts(updated);
    saveCustomShortcuts(updated);
  };

  const toggleKey = (key) => {
    setForm(f => ({
      ...f,
      keys: f.keys.includes(key) ? f.keys.filter(k => k !== key) : [...f.keys, key],
    }));
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
        className="w-full max-w-2xl rounded-2xl p-6"
        style={{
          background: 'rgba(30,30,40,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">📝 Custom Shortcuts</h2>
          <div className="flex gap-2">
            <button onClick={addNew}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '1px solid rgba(245,158,11,0.3)' }}>
              + Add New
            </button>
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#999' }}>
              Close
            </button>
          </div>
        </div>

        {/* Editing form */}
        <AnimatePresence>
          {editing !== null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div className="mb-3">
                  <label className="text-xs text-gray-400 mb-1 block">Shortcut Name</label>
                  <input
                    value={form.task}
                    onChange={e => setForm(f => ({ ...f, task: e.target.value }))}
                    placeholder="e.g. Open Terminal"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="text-xs text-gray-400 mb-1 block">Keys (click to toggle)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto">
                    {KEY_OPTIONS.map(k => (
                      <button key={k} onClick={() => toggleKey(k)}
                        className="px-2 py-1 rounded text-xs font-medium transition-all"
                        style={{
                          background: form.keys.includes(k) ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${form.keys.includes(k) ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: form.keys.includes(k) ? '#818cf8' : '#888',
                          fontFamily: 'JetBrains Mono',
                        }}>
                        {DISPLAY_MAP[k] || k}
                      </button>
                    ))}
                  </div>
                  {form.keys.length > 0 && (
                    <div className="mt-2 text-sm" style={{ fontFamily: 'JetBrains Mono', color: '#818cf8' }}>
                      Preview: {keysToDisplay(form.keys)}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="text-xs text-gray-400 mb-1 block">Difficulty</label>
                  <div className="flex gap-2">
                    {['beginner', 'advanced', 'master'].map(d => (
                      <button key={d} onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: form.difficulty === d ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${form.difficulty === d ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: form.difficulty === d ? '#818cf8' : '#888',
                        }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={submitForm}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: '1px solid rgba(129,140,248,0.3)' }}>
                    {editing === 'new' ? 'Add' : 'Update'}
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#999' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {shortcuts.length === 0 && (
            <p className="text-center text-gray-500 py-8">No custom shortcuts yet. Click &quot;Add New&quot; to create one!</p>
          )}
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span className="text-sm text-gray-300">{s.task}</span>
                <span className="ml-3 text-sm font-bold" style={{ color: '#818cf8', fontFamily: 'JetBrains Mono' }}>{s.display}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editItem(i)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Edit</button>
                <button onClick={() => deleteItem(i)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {shortcuts.length > 0 && (
          <p className="text-xs text-gray-600 mt-4 text-center">
            {shortcuts.length} custom shortcut{shortcuts.length !== 1 ? 's' : ''} — available as &quot;Custom&quot; in the app selector
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
