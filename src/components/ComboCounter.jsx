import { motion, AnimatePresence } from 'framer-motion';

const comboTexts = [
  '', '', 'DOUBLE!', 'TRIPLE!', 'QUAD!', 'PENTA!', 'MEGA!',
  'ULTRA!', 'MONSTER!', 'GODLIKE!', 'UNSTOPPABLE!',
];

export default function ComboCounter({ streak }) {
  if (streak < 2) return null;

  const text = comboTexts[Math.min(streak, comboTexts.length - 1)] || `${streak}x COMBO!`;
  const scale = Math.min(1 + (streak - 2) * 0.15, 2.5);
  const glow = Math.min(streak * 3, 30);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={streak}
          initial={{ scale: 0, rotate: -10, opacity: 0 }}
          animate={{
            scale: [0, scale * 1.3, scale],
            rotate: [-10, 5, 0],
            opacity: [0, 1, 1],
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
          className="text-center"
        >
          <div
            className="font-black tracking-tighter whitespace-nowrap"
            style={{
              fontFamily: 'Inter',
              fontSize: `${Math.min(2 + streak * 0.3, 5)}rem`,
              color: '#f59e0b',
              textShadow: `0 0 ${glow}px rgba(245,158,11,0.6), 0 0 ${glow * 2}px rgba(245,158,11,0.3)`,
              WebkitTextStroke: streak >= 5 ? '1px rgba(255,255,255,0.2)' : 'none',
            }}
          >
            {text}
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="h-0.5 mx-auto mt-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
              maxWidth: '200px',
            }}
          />
          <div
            className="text-sm font-bold mt-1"
            style={{ color: 'rgba(245,158,11,0.7)', fontFamily: 'JetBrains Mono' }}
          >
            🔥 {streak} streak
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
