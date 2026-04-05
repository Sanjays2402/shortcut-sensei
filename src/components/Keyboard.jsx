import { motion, AnimatePresence } from 'framer-motion';

const KEYBOARD_ROWS = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
  ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['CapsLock','a','s','d','f','g','h','j','k','l',';','\'','Enter'],
  ['Shift','z','x','c','v','b','n','m',',','.','/','Shift'],
  ['Control','Alt','Meta','Space','Meta','Alt','ArrowLeft','ArrowUp','ArrowDown','ArrowRight'],
];

const KEY_WIDTHS = {
  Backspace: 'w-[88px]', Tab: 'w-[72px]', CapsLock: 'w-[80px]', Enter: 'w-[80px]',
  'Shift': 'w-[96px]', Control: 'w-[64px]', Alt: 'w-[56px]', Meta: 'w-[64px]', Space: 'w-[240px]',
};

const KEY_LABELS = {
  Meta: '⌘', Alt: '⌥', Control: '⌃', Shift: '⇧', Backspace: '⌫', Tab: '⇥',
  CapsLock: '⇪', Enter: '↵', Space: 'Space',
  ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
};

function normalizeKey(k) {
  return k.toLowerCase();
}

export default function Keyboard({ targetKeys = [], pressedKeys = [], feedback }) {
  const targetSet = new Set(targetKeys.map(normalizeKey));
  const pressedSet = new Set(pressedKeys.map(normalizeKey));

  function getKeyStyle(key) {
    const nk = normalizeKey(key);
    const isTarget = targetSet.has(nk);
    const isPressed = pressedSet.has(nk);

    let bg = '#1a1a1a';
    let border = 'rgba(255,255,255,0.06)';
    let shadow = '4px 4px 8px rgba(0,0,0,0.4), -2px -2px 6px rgba(255,255,255,0.03)';
    let color = '#888';
    let glow = 'none';

    if (feedback === 'correct' && isTarget) {
      bg = 'rgba(34,197,94,0.15)';
      border = 'rgba(34,197,94,0.5)';
      color = '#22c55e';
      glow = '0 0 15px rgba(34,197,94,0.3)';
      shadow = '0 2px 4px rgba(0,0,0,0.3)';
    } else if (feedback === 'wrong' && isTarget) {
      bg = 'rgba(239,68,68,0.15)';
      border = 'rgba(239,68,68,0.5)';
      color = '#ef4444';
      glow = '0 0 15px rgba(239,68,68,0.3)';
      shadow = '0 2px 4px rgba(0,0,0,0.3)';
    } else if (isTarget && !feedback) {
      bg = 'rgba(99,102,241,0.1)';
      border = 'rgba(99,102,241,0.4)';
      color = '#818cf8';
      glow = '0 0 12px rgba(99,102,241,0.2)';
    } else if (isPressed) {
      bg = 'rgba(99,102,241,0.2)';
      border = 'rgba(99,102,241,0.3)';
      color = '#c4b5fd';
      shadow = '0 1px 2px rgba(0,0,0,0.3)';
    }

    return { background: bg, border: `1px solid ${border}`, boxShadow: `${shadow}, ${glow}`, color };
  }

  return (
    <div className="flex flex-col items-center gap-1.5 mt-6 select-none">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1.5">
          {row.map((key, ki) => {
            const style = getKeyStyle(key);
            const w = KEY_WIDTHS[key] || 'w-[44px]';
            const label = KEY_LABELS[key] || key.toUpperCase();
            return (
              <motion.div
                key={`${ri}-${ki}`}
                animate={
                  feedback === 'correct' && targetSet.has(normalizeKey(key))
                    ? { scale: [1, 1.1, 1] }
                    : feedback === 'wrong' && targetSet.has(normalizeKey(key))
                    ? { x: [0, -3, 3, -3, 3, 0] }
                    : {}
                }
                transition={{ duration: 0.3 }}
                className={`${w} h-[40px] rounded-lg flex items-center justify-center text-xs font-medium`}
                style={{
                  ...style,
                  fontFamily: 'JetBrains Mono',
                  fontSize: key === 'Space' ? '11px' : '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
