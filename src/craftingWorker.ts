import { Recipe, Element } from './types';

// The Hash Map for O(1) lookup
const recipeMap = new Map<string, Recipe>();

// Helper to create a consistent key from two ingredients
function getRecipeKey(ing1: string, ing2: string): string {
  return [ing1.toLowerCase(), ing2.toLowerCase()].sort().join('+');
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'INDEX_RECIPES') {
    const recipes: Recipe[] = payload;
    recipes.forEach(recipe => {
      const key = getRecipeKey(recipe.ingredients[0], recipe.ingredients[1]);
      recipeMap.set(key, recipe);
    });
    self.postMessage({ type: 'INDEX_COMPLETE', count: recipeMap.size });
  }

  if (type === 'FIND_RECIPE') {
    const { ing1, ing2 } = payload;
    const key = getRecipeKey(ing1, ing2);
    const result = recipeMap.get(key);
    self.postMessage({ type: 'RECIPE_RESULT', result, key: payload.key });
  }
};
