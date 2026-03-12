import React from 'react';
import { Menu } from 'lucide-react';

interface MoreMenuProps {
  onOpenPanel: () => void;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({ onOpenPanel }) => {
  return (
    <button
      onClick={onOpenPanel}
      className="p-3 md:p-4 bg-zinc-900/80 backdrop-blur border border-white/10 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white shadow-lg"
      title="More Options"
    >
      <Menu className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );
};
