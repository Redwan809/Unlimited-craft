export interface Element {
  id: string;
  name: string;
  emoji: string;
  tier: number;
}

export interface Recipe {
  ingredients: [string, string]; // Names of the two elements
  result: Element;
}

export interface BoardItem extends Element {
  instanceId: string;
  x: number;
  y: number;
}
