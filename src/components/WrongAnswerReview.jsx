import { motion } from 'framer-motion';

export default function WrongAnswerReview({ missedQuestions }) {
  if (!missedQuestions || missedQuestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-6"
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span style={{ color: '#ef4444' }}>✗</span> Missed Shortcuts ({missedQuestions.length})
      </h3>
      <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {missedQuestions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <span className="text-sm text-gray-300">{q.task}</span>
            <span
              className="text-sm font-bold ml-3 shrink-0"
              style={{ color: '#818cf8', fontFamily: 'JetBrains Mono' }}
            >
              {q.display}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
