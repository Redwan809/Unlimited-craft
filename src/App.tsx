import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Element, BoardItem } from './types';
import { Sidebar } from './components/Sidebar';
import { DraggableItem } from './components/DraggableItem';
import { RotateCcw, Info } from 'lucide-react';
import { feedbackMessages, FeedbackState } from './feedback';
import { useCrafting } from './hooks/useCrafting';
import { MoreMenu } from './components/more';
import { OptionsPanel } from './components/OptionsPanel';
import { AISelection } from './ai';
import { Into } from './components/into';

export default function App() {
    const {
    discoveredElements,
    setDiscoveredElements,
    boardItems,
    setBoardItems,
    findRecipe,
    styleModule,
    currentTier,
    setCurrentTier,
    addElementToBoard,
    clearBoard,
    isLoaded
  } = useCrafting();

  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' | null }>({ message: '', type: null });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAISelectionOpen, setIsAISelectionOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showFeedback = useCallback((message: string, type: 'success' | 'error', duration = 2000) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedback({ message, type });
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback({ message: '', type: null });
    }, duration);
  }, []);

  const handleAddElement = useCallback((element: Element) => {
    let x, y;
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      // Spawn in the center of the visible board area
      x = rect.width / 2 - 50 + (Math.random() * 40 - 20);
      y = rect.height / 2 - 25 + (Math.random() * 40 - 20);
    } else {
      // Fallback coordinates
      x = window.innerWidth / 4;
      y = window.innerHeight / 4;
    }
    addElementToBoard(element, x, y);
  }, [addElementToBoard]);

  const handleDrag = useCallback((instanceId: string, x: number, y: number) => {
    const draggedItem = boardItems.find(item => item.instanceId === instanceId);
    if (!draggedItem) return;

    let foundTarget = false;
    for (const item of boardItems) {
      if (item.instanceId === instanceId) continue;

      const dx = item.x - x;
      const dy = item.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 80) {
        foundTarget = true;
        const recipe = findRecipe(draggedItem.name, item.name);

        if (recipe) {
          setFeedback({
            message: `${feedbackMessages.CAN_MERGE}${recipe.result.name}`,
            type: 'success'
          });
        }
        // Removed "Cannot merge" during drag to be less intrusive
        break;
      }
    }

    if (!foundTarget) {
      setFeedback({ message: '', type: null });
    }
  }, [boardItems, findRecipe]);

  const handleDragEnd = useCallback((instanceId: string, x: number, y: number) => {
    setBoardItems(prev => {
      const updated = prev.map(item => 
        item.instanceId === instanceId ? { ...item, x, y } : item
      );
      
      const draggedItem = updated.find(item => item.instanceId === instanceId);
      if (!draggedItem) return updated;

      let combined = false;
      const finalItems: BoardItem[] = [];

      for (const item of updated) {
        if (item.instanceId === instanceId) continue;

        const dx = item.x - x;
        const dy = item.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 80 && !combined) {
          const recipe = findRecipe(draggedItem.name, item.name);

          if (recipe) {
            combined = true;
            const result = recipe.result;
            const newItem: BoardItem = {
              ...result,
              instanceId: Math.random().toString(36).substr(2, 9),
              x: (item.x + x) / 2,
              y: (item.y + y) / 2,
            };
            finalItems.push(newItem);

            showFeedback(`New: ${result.name}!`, 'success', 3000);

            setDiscoveredElements(discovery => {
              if (!discovery.find(d => d.id === result.id)) {
                const newDiscovery = [...discovery, result];
                if (result.tier >= currentTier) {
                  setCurrentTier(result.tier);
                }
                return newDiscovery;
              }
              return discovery;
            });
          } else {
            showFeedback('Cannot merge', 'error', 1500);
            finalItems.push(item);
          }
        } else {
          finalItems.push(item);
        }
      }

      if (combined) return finalItems;
      return updated;
    });
  }, [findRecipe, currentTier, setDiscoveredElements, setCurrentTier, showFeedback]);

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Loading Alchemy...</p>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return <Into onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-[100dvw] bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      {/* Main Crafting Area */}
      <div 
        ref={boardRef}
        className="flex-1 relative overflow-hidden bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:40px_40px] board-container"
      >
        {/* Header - Fixed and non-blocking */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50 pointer-events-none select-none flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tighter italic serif text-white/90 drop-shadow-md">
            Unfinite Craft
          </h1>
          <div className="pointer-events-auto">
            <MoreMenu onOpenPanel={() => setIsPanelOpen(true)} />
          </div>
        </div>

        {/* Board Controls */}
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-20 flex gap-2">
          <button 
            onClick={clearBoard}
            className="p-3 md:p-4 bg-zinc-900/80 backdrop-blur border border-white/10 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white shadow-lg"
            title="Clear Board"
          >
            <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Real-time Drag Feedback (Top Right) */}
        {feedback.type && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 pointer-events-none">
            <motion.div 
              key={feedback.message}
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              className={`px-4 py-2 rounded-lg border backdrop-blur-md shadow-2xl flex items-center gap-3 min-w-[220px]
                ${feedback.type === 'success' 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}`}
            >
              <div className={`p-1.5 rounded-md ${feedback.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                <Info className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">Crafting Status</span>
                <span className="text-sm font-medium">{feedback.message}</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Crafting Items */}
        {boardItems.map((item) => (
          <DraggableItem
            key={item.instanceId}
            element={item}
            instanceId={item.instanceId}
            x={item.x}
            y={item.y}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            styleModule={styleModule}
          />
        ))}

        {boardItems.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-10 text-center z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-sm md:text-lg font-mono uppercase tracking-[0.2em] text-white/40">
                Select elements to begin crafting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar / Toolkit - Always Open */}
      <div className="h-[40vh] md:h-full md:w-80 border-t md:border-t-0 md:border-l border-white/5 relative z-30 bg-zinc-900">
        <Sidebar 
          discoveredElements={discoveredElements} 
          onAddElement={handleAddElement} 
        />
      </div>

      <AnimatePresence>
        {isPanelOpen && (
          <OptionsPanel 
            onClose={() => setIsPanelOpen(false)} 
            onSelectOption={(opt) => {
              if (opt === 'Artificial intelligence') {
                setIsAISelectionOpen(true);
                setIsPanelOpen(false);
              }
            }}
          />
        )}
        {isAISelectionOpen && (
          <AISelection onClose={() => setIsAISelectionOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
