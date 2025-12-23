
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCcw, Trophy, Timer, MousePointer2, CheckCircle2 } from 'lucide-react';
import Card from './components/Card';
import { CardData, GameDifficulty, DIFFICULTY_SETTINGS } from './types';
import { CARD_ICONS } from './constants';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>(GameDifficulty.HARD);
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [bestMoves, setBestMoves] = useState<number | null>(() => {
    const saved = localStorage.getItem('memory_best_moves');
    return saved ? parseInt(saved) : null;
  });
  const [showWinModal, setShowWinModal] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Initialize Game
  const initGame = useCallback((selectedDifficulty: GameDifficulty) => {
    const config = DIFFICULTY_SETTINGS[selectedDifficulty];
    const totalPairs = (config.rows * config.cols) / 2;
    
    // Pick unique icons
    const shuffledIcons = [...CARD_ICONS].sort(() => Math.random() - 0.5);
    const selectedIcons = shuffledIcons.slice(0, totalPairs);
    
    // Create pairs
    const gameCards: CardData[] = [];
    selectedIcons.forEach((icon, index) => {
      // Content is the index of the icon in CARD_ICONS for comparison
      const content = CARD_ICONS.indexOf(icon).toString();
      gameCards.push({ id: index * 2, content, isFlipped: false, isMatched: false });
      gameCards.push({ id: index * 2 + 1, content, isFlipped: false, isMatched: false });
    });

    // Shuffle
    setCards(gameCards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMoves(0);
    setTimer(0);
    setIsActive(false);
    setIsLocked(false);
    setShowWinModal(false);

    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  // Handle Difficulty Change
  const handleDifficultyChange = (newDiff: GameDifficulty) => {
    setDifficulty(newDiff);
    initGame(newDiff);
  };

  // Start Timer
  useEffect(() => {
    if (isActive && !showWinModal) {
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isActive, showWinModal]);

  // Initial Load
  useEffect(() => {
    initGame(difficulty);
  }, [initGame, difficulty]);

  // Win condition check
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setShowWinModal(true);
      if (!bestMoves || moves < bestMoves) {
        setBestMoves(moves);
        localStorage.setItem('memory_best_moves', moves.toString());
      }
    }
  }, [cards, moves, bestMoves]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    // Start timer on first flip
    if (!isActive) setIsActive(true);

    // Flip the card
    const updatedCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(updatedCards);
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);
      
      const firstCard = updatedCards.find(c => c.id === newFlipped[0]);
      const secondCard = updatedCards.find(c => c.id === newFlipped[1]);

      if (firstCard?.content === secondCard?.content) {
        // Match Found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, isMatched: true, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 600);
      } else {
        // No Match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const matchedCount = cards.filter(c => c.isMatched).length / 2;
  const totalPairs = cards.length / 2;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#050505] p-4 text-white">
      {/* Header / Status Bar */}
      <header className="w-full max-w-2xl mb-6 text-center">
        <h1 className="text-3xl font-bold mb-6 neon-font neon-text-pink tracking-widest uppercase">
          記憶翻牌挑戰賽
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-white border-opacity-10 bg-zinc-900 shadow-lg">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
              <MousePointer2 size={12} />
              <span>目前步數</span>
            </div>
            <span className="text-xl font-bold neon-font text-pink-400">{moves}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
              <CheckCircle2 size={12} />
              <span>配對進度</span>
            </div>
            <span className="text-xl font-bold neon-font text-blue-400">{matchedCount} / {totalPairs}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
              <Timer size={12} />
              <span>計時器</span>
            </div>
            <span className="text-xl font-bold neon-font text-yellow-400">{formatTime(timer)}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
              <Trophy size={12} />
              <span>歷史最佳</span>
            </div>
            <span className="text-xl font-bold neon-font text-cyan-400">{bestMoves || '--'}</span>
          </div>
        </div>
      </header>

      {/* Core Game Board */}
      <main className={`grid gap-2 w-full max-w-lg mb-8 mx-auto`} 
            style={{ 
              gridTemplateColumns: `repeat(${DIFFICULTY_SETTINGS[difficulty].cols}, minmax(0, 1fr))` 
            }}>
        {cards.map((card) => (
          <Card 
            key={card.id} 
            card={card} 
            onClick={handleCardClick}
            icon={CARD_ICONS[parseInt(card.content)]}
          />
        ))}
      </main>

      {/* Controls */}
      <footer className="w-full max-w-md space-y-4">
        <div className="flex gap-2 justify-center">
          {(Object.keys(DIFFICULTY_SETTINGS) as GameDifficulty[]).map((key) => (
            <button
              key={key}
              onClick={() => handleDifficultyChange(key)}
              className={`px-3 py-2 text-xs rounded-md border transition-all duration-300 ${
                difficulty === key 
                ? 'border-pink-500 bg-pink-500/20 text-pink-400' 
                : 'border-zinc-700 bg-transparent text-zinc-500 hover:border-zinc-500'
              }`}
            >
              {DIFFICULTY_SETTINGS[key].label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => initGame(difficulty)}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg bg-zinc-900 border border-pink-500 border-opacity-50 text-pink-500 font-bold uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all neon-font shadow-[0_0_15px_rgba(236,72,153,0.3)]"
        >
          <RefreshCcw size={20} />
          重新開始遊戲
        </button>
      </footer>

      {/* Win Modal */}
      {showWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border-2 border-pink-500 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_30px_rgba(236,72,153,0.5)]">
            <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500">
              <Trophy className="text-pink-500" size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-2 neon-font text-white">勝利！</h2>
            <p className="text-zinc-400 mb-6">你已完成所有配對，表現出色！</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/50 p-3 rounded-lg border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">總步數</p>
                <p className="text-xl font-bold text-pink-400 neon-font">{moves}</p>
              </div>
              <div className="bg-black/50 p-3 rounded-lg border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">總耗時</p>
                <p className="text-xl font-bold text-yellow-400 neon-font">{formatTime(timer)}</p>
              </div>
            </div>

            <button 
              onClick={() => initGame(difficulty)}
              className="w-full py-4 bg-pink-500 text-white font-bold rounded-lg uppercase tracking-widest hover:bg-pink-600 transition-colors shadow-lg"
            >
              再玩一次
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
