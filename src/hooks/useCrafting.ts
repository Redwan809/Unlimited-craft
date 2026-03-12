import { useState, useEffect, useCallback } from 'react';
import { Element, Recipe, BoardItem } from '../types';
import { saveDiscovery, loadDiscovery } from '../db';

const INITIAL_ELEMENTS: Element[] = [
  { id: 'water', name: 'Water', emoji: '💧', tier: 0 },
  { id: 'fire', name: 'Fire', emoji: '🔥', tier: 0 },
  { id: 'earth', name: 'Earth', emoji: '🌍', tier: 0 },
  { id: 'air', name: 'Air', emoji: '💨', tier: 0 },
];

export function useCrafting() {
  const [discoveredElements, setDiscoveredElements] = useState<Element[]>(INITIAL_ELEMENTS);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeMap, setRecipeMap] = useState<Map<string, Recipe>>(new Map());
  const [styleModule, setStyleModule] = useState<any>({});
  const [currentTier, setCurrentTier] = useState(1);

  // Load initial discovery from IndexedDB
  useEffect(() => {
    loadDiscovery().then(saved => {
      if (saved && saved.length > 0) {
        setDiscoveredElements(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  // Helper to create a consistent key from two ingredients
  const getRecipeKey = (ing1: string, ing2: string) => {
    return [ing1.toLowerCase(), ing2.toLowerCase()].sort().join('+');
  };

  useEffect(() => {
    const loadTier = async (tier: number) => {
      try {
        const recipeModule = await import(`../recipes/recipes${tier}.ts`);
        const styleMod = await import(`../styles/elements${tier}.module.css`);
        
        const newRecipes: Recipe[] = recipeModule.recipes;
        
        setRecipes(prev => {
          const filtered = newRecipes.filter(
            (nr: Recipe) => !prev.some(pr => pr.result.id === nr.result.id)
          );
          return [...prev, ...filtered];
        });

        // Update the Hash Map for O(1) lookup
        setRecipeMap(prev => {
          const newMap = new Map(prev);
          newRecipes.forEach(recipe => {
            const key = getRecipeKey(recipe.ingredients[0], recipe.ingredients[1]);
            newMap.set(key, recipe);
          });
          return newMap;
        });
        
        setStyleModule(prev => ({
          ...prev,
          ...styleMod.default
        }));
      } catch (e) {
        if (tier === 1) console.error("Failed to load initial recipes/styles", e);
      }
    };

    loadTier(1);
    if (currentTier > 1) {
      for (let i = 2; i <= currentTier; i++) {
        loadTier(i);
      }
    }
  }, [currentTier]);

  const findRecipe = useCallback((ing1: string, ing2: string) => {
    const key = getRecipeKey(ing1, ing2);
    return recipeMap.get(key);
  }, [recipeMap]);

  // Save to IndexedDB whenever discovery changes
  useEffect(() => {
    if (isLoaded) {
      saveDiscovery(discoveredElements);
    }
  }, [discoveredElements, isLoaded]);

  const addElementToBoard = useCallback((element: Element, x: number, y: number) => {
    const newItem: BoardItem = {
      ...element,
      instanceId: Math.random().toString(36).substr(2, 9),
      x,
      y,
    };
    setBoardItems(prev => [...prev, newItem]);
  }, []);

  const clearBoard = useCallback(() => setBoardItems([]), []);

  return {
    discoveredElements,
    setDiscoveredElements,
    boardItems,
    setBoardItems,
    recipes,
    recipeMap,
    findRecipe,
    styleModule,
    currentTier,
    setCurrentTier,
    addElementToBoard,
    clearBoard,
    isLoaded
  };
}
