import { useState, useEffect, useCallback } from 'react';
import { Element, Recipe, BoardItem } from '../types';
import { saveProgress, loadProgress } from '../db';

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

  // Load initial progress from IndexedDB
  useEffect(() => {
    loadProgress().then(progress => {
      if (progress.discoveredElements && progress.discoveredElements.length > 0) {
        setDiscoveredElements(progress.discoveredElements);
      }
      if (progress.boardItems) {
        setBoardItems(progress.boardItems);
      }
      if (progress.currentTier) {
        setCurrentTier(progress.currentTier);
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

  // Save to IndexedDB whenever progress changes
  useEffect(() => {
    if (isLoaded) {
      saveProgress(discoveredElements, boardItems, currentTier);
    }
  }, [discoveredElements, boardItems, currentTier, isLoaded]);

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
