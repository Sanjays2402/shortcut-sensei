import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import './index.css';
import MenuScreen from './components/MenuScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [config, setConfig] = useState({ app: 'vscode', mode: 'practice', difficulty: 'beginner' });
  const [results, setResults] = useState(null);

  const startGame = useCallback((cfg) => {
    setConfig(cfg);
    setScreen('game');
  }, []);

  const endGame = useCallback((res) => {
    setResults(res);
    setScreen('result');
  }, []);

  const goHome = useCallback(() => setScreen('menu'), []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0d0d0d' }}>
      {/* Gradient mesh blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', top: '-10%', left: '-10%' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)', bottom: '-5%', right: '-5%' }} />
      </div>

      <AnimatePresence mode="wait">
        {screen === 'menu' && <MenuScreen key="menu" onStart={startGame} />}
        {screen === 'game' && <GameScreen key="game" config={config} onEnd={endGame} onQuit={goHome} />}
        {screen === 'result' && <ResultScreen key="result" results={results} config={config} onReplay={() => setScreen('game')} onHome={goHome} />}
      </AnimatePresence>
    </div>
  );
}
