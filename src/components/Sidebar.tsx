import React from 'react';
import { Element } from '../types';
import { Search, X, Database, ClipboardList } from 'lucide-react';
import { getStatusInfo, openRecipeViewer } from '../status';
import { openRecipeTracker } from '../tracker';
import { CONFIG_MODE } from '../active';

interface SidebarProps {
  discoveredElements: Element[];
  onAddElement: (element: Element) => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ discoveredElements, onAddElement }) => {
  const [search, setSearch] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  const filtered = discoveredElements.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const { count, statusColor, warning } = getStatusInfo();
  const hideTrackerAndDb = CONFIG_MODE === 'T';

  return (
    <div className="w-full md:w-80 h-full bg-zinc-900 border-t md:border-t-0 md:border-l border-white/5 flex flex-col shadow-2xl">
      <div className="p-4 md:p-6 border-b border-white/5 flex items-center gap-3">
        {isSearching ? (
          <div className="relative flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                autoFocus
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <button 
              onClick={() => {
                setIsSearching(false);
                setSearch('');
              }}
              className="p-2 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              Toolkit ({discoveredElements.length})
            </span>
            <div className="flex items-center gap-1">
              {!hideTrackerAndDb && (
                <>
                  <button 
                    onClick={openRecipeTracker}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-800 border border-white/5 rounded-lg hover:bg-zinc-700 transition-all text-zinc-400 hover:text-white"
                    title="Recipe Tracker"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-tighter">Tracker</span>
                  </button>
                  <button 
                    onClick={openRecipeViewer}
                    className={`flex items-center gap-1.5 px-2 py-1.5 bg-zinc-800 border border-white/5 rounded-lg hover:bg-zinc-700 transition-all group relative`}
                    title={warning || "View all recipes"}
                  >
                    <Database className={`w-3.5 h-3.5 ${statusColor}`} />
                    <span className={`text-[10px] font-mono font-bold ${statusColor}`}>
                      {count}
                    </span>
                  </button>
                </>
              )}
              <button 
                onClick={() => setIsSearching(true)}
                className="p-2 bg-zinc-800 border border-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {!isSearching ? (
          <div className="grid grid-cols-3 md:grid-cols-2 gap-2 content-start">
            {filtered.map((element) => (
              <button
                key={element.id}
                onClick={() => onAddElement(element)}
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 px-2 py-3 md:py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-lg transition-all text-center md:text-left group relative z-10 active:scale-95"
              >
                <span className="text-2xl md:text-lg group-hover:scale-110 transition-transform pointer-events-none">{element.emoji}</span>
                <span className="text-[10px] md:text-sm text-zinc-300 font-medium truncate w-full pointer-events-none">{element.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.length > 0 ? (
              filtered.map((element) => (
                <button
                  key={element.id}
                  onClick={() => {
                    onAddElement(element);
                    setIsSearching(false);
                    setSearch('');
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-lg transition-all text-left group relative z-10 active:scale-95"
                >
                  <span className="text-xl pointer-events-none">{element.emoji}</span>
                  <span className="text-sm text-zinc-300 font-medium pointer-events-none">{element.name}</span>
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-500 text-xs uppercase tracking-widest font-mono">
                No items found
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="hidden md:block p-4 text-[10px] uppercase tracking-widest text-zinc-500 border-t border-white/5 text-center font-mono">
        {discoveredElements.length} items discovered
      </div>
    </div>
  );
};
