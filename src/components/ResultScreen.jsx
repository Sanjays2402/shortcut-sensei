import { motion } from 'framer-motion';
import { appNames, appIcons } from '../data/shortcuts';
import WrongAnswerReview from './WrongAnswerReview';

export default function ResultScreen({ results, config, onReplay, onHome }) {
  const { correct, wrong, total, streak, accuracy, timeElapsed, missed = [] } = results;

  // Save best score
  const key = `sensei-best-${config.app}-${config.mode}-${config.difficulty}`;
  const prev = JSON.parse(localStorage.getItem(key) || '{"correct":0}');
  if (correct > prev.correct) {
    localStorage.setItem(key, JSON.stringify({ correct, accuracy, streak, time: timeElapsed }));
  }
  const best = correct > prev.correct ? results : prev;

  const grade = accuracy >= 90 ? 'S' : accuracy >= 75 ? 'A' : accuracy >= 60 ? 'B' : accuracy >= 40 ? 'C' : 'D';
  const gradeColor = { S: '#6366f1', A: '#22c55e', B: '#f59e0b', C: '#f97316', D: '#ef4444' }[grade];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-lg p-8 rounded-2xl"
        style={{
          background: 'rgba(30,30,40,0.6)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl font-black mb-2" style={{ color: gradeColor, fontFamily: 'JetBrains Mono' }}>
            {grade}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {accuracy >= 75 ? 'Great job!' : accuracy >= 50 ? 'Not bad!' : 'Keep practicing!'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {appIcons[config.app] || '📝'} {appNames[config.app] || 'Custom'} • {config.difficulty}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: 'Correct', value: correct, color: '#22c55e' },
            { label: 'Wrong', value: wrong, color: '#ef4444' },
            { label: 'Accuracy', value: `${accuracy}%`, color: '#6366f1' },
            { label: 'Best Streak', value: `${streak}🔥`, color: '#f59e0b' },
            { label: 'Total', value: total, color: '#888' },
            { label: 'Time', value: `${timeElapsed}s`, color: '#888' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'JetBrains Mono' }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Personal best */}
        {best.correct === correct && correct > 0 && (
          <div className="text-center mb-6 text-sm" style={{ color: '#f59e0b' }}>
            🏆 New Personal Best!
          </div>
        )}

        {/* Wrong answer review */}
        {missed.length > 0 && <WrongAnswerReview missedQuestions={missed} />}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onReplay}
            className="flex-1 py-3 rounded-xl font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              border: '1px solid rgba(129,140,248,0.3)',
            }}>
            Play Again
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onHome}
            className="flex-1 py-3 rounded-xl font-semibold"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#999',
            }}>
            Home
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
