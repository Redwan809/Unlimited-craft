import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface OptionsPanelProps {
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ onClose, onSelectOption }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-white/10 z-[100] p-6 shadow-2xl"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white">Options</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      <ul className="space-y-4">
        <li
          className="p-4 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 text-white flex justify-between items-center"
          onClick={() => onSelectOption('Artificial intelligence')}
        >
          <span>Artificial intelligence</span>
          <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-white rounded-full font-bold uppercase tracking-wider">Beta</span>
        </li>
      </ul>
    </motion.div>
  );
};
