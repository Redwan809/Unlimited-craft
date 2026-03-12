import React, { useRef } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { Element } from '../types';

interface DraggableItemProps {
  element: Element;
  instanceId: string;
  x: number;
  y: number;
  onDragEnd: (instanceId: string, x: number, y: number) => void;
  onDrag: (instanceId: string, x: number, y: number) => void;
  styleModule?: any;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  element,
  instanceId,
  x,
  y,
  onDragEnd,
  onDrag,
  styleModule
}) => {
  const styleClass = styleModule?.[`element_${element.id}`] || '';
  const itemRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={itemRef}
      drag
      dragMomentum={false}
      animate={{ x, y, scale: 1, opacity: 1 }}
      transition={{ 
        x: { type: 'spring', damping: 25, stiffness: 200, mass: 0.5 },
        y: { type: 'spring', damping: 25, stiffness: 200, mass: 0.5 },
        scale: { duration: 0.2 },
        opacity: { duration: 0.2 }
      }}
      style={{ 
        zIndex: 40, // Above sidebar (30), below header (50)
        left: 0, 
        top: 0,
        position: 'absolute'
      }}
      initial={{ scale: 0.8, opacity: 0, x, y }}
      onDrag={(e, info) => {
        const board = (e.target as HTMLElement).closest('.board-container');
        if (board) {
          const rect = board.getBoundingClientRect();
          const relativeX = info.point.x - rect.left;
          const relativeY = info.point.y - rect.top;
          onDrag(instanceId, relativeX, relativeY);
        }
      }}
      onDragEnd={(e, info) => {
        const board = (e.target as HTMLElement).closest('.board-container');
        if (board && itemRef.current) {
          const boardRect = board.getBoundingClientRect();
          const itemRect = itemRef.current.getBoundingClientRect();
          
          // Calculate precise position of the item relative to the board
          const finalX = itemRect.left - boardRect.left;
          const finalY = itemRect.top - boardRect.top;
          
          onDragEnd(instanceId, finalX, finalY);
        }
      }}
      className={`cursor-grab active:cursor-grabbing select-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-white/10 flex items-center gap-2 text-white font-medium shadow-lg transition-colors ${styleClass} bg-zinc-800 text-sm md:text-base`}
    >
      <span className="text-lg md:text-xl">{element.emoji}</span>
      <span className="whitespace-nowrap">{element.name}</span>
    </motion.div>
  );
};
