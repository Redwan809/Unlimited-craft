import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, ArrowLeft } from 'lucide-react';
import { getAllRecipes } from './status';
import { Recipe } from './types';

interface AISelectionProps {
  onClose: () => void;
}

export const AISelection: React.FC<AISelectionProps> = ({ onClose }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [recipeTree, setRecipeTree] = useState<any | null>(null);

  const allRecipes = useMemo(() => getAllRecipes(), []);
  const allItems = useMemo(() => {
    const items = new Set<string>();
    allRecipes.forEach(r => {
      items.add(r.result.name);
      r.ingredients.forEach(i => items.add(i));
    });
    return Array.from(items).sort();
  }, [allRecipes]);

  const getRecipeTree = (itemName: string): any => {
    const recipe = allRecipes.find(r => r.result.name === itemName);
    if (!recipe) return { name: itemName, base: true };
    
    return {
      name: itemName,
      ingredients: recipe.ingredients.map(ing => getRecipeTree(ing))
    };
  };

  const handleDone = () => {
    if (selectedItem) {
      setRecipeTree(getRecipeTree(selectedItem));
    }
  };

  const renderTree = (node: any, depth = 0) => {
    if (node.base) {
      return (
        <div className="text-zinc-500 font-mono text-xs border-l border-zinc-800 pl-3 py-1 mt-1" style={{ marginLeft: depth * 12 }}>
          Base: {node.name}
        </div>
      );
    }
    return (
      <div className="border-l border-zinc-700 pl-3 py-2 mt-2" style={{ marginLeft: depth * 12 }}>
        <div className="font-bold text-emerald-400 text-sm mb-1 truncate">{node.name}</div>
        <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Requires:</div>
        <div className="space-y-1">
          {node.ingredients.map((ing: any, i: number) => (
            <React.Fragment key={i}>{renderTree(ing, depth + 1)}</React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-zinc-950 p-6 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Artificial Intelligence</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-8 h-8" />
          </button>
        </div>

        {!recipeTree ? (
          <>
            <p className="text-zinc-400 mb-6">Select an item to see its crafting recipe:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              {allItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-lg text-left ${selectedItem === item ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              onClick={handleDone}
              disabled={!selectedItem}
              className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full font-bold disabled:opacity-50 shadow-lg"
            >
              Done
            </button>
          </>
        ) : (
          <div className="text-zinc-300">
            <button onClick={() => setRecipeTree(null)} className="flex items-center text-blue-400 mb-6">
              <ArrowLeft className="mr-2" /> Back to selection
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">Recipe for {selectedItem}</h3>
            <ul className="list-none space-y-2">
              {renderTree(recipeTree)}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};
