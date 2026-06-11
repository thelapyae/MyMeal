export interface Meal {
  id: string;
  name: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  emoji: string;
  notes?: string;
}

export type ViewMode = 'month' | 'week' | 'year';

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const;

export const FOOD_EMOJIS = [
  '🍗', '🥩', '🍖', '🐟', '🐠', '🍣', '🥓', '🍔',
  '🥚', '🥛', '🧀', '🥗', '🥦', '🍅', '🥑', '🍞',
  '🥐', '🍝', '🍜', '🍲', '🥣', '☕', '🧃', '🍎',
  '🍌', '🍇', '🥝', '🥕', '🧁', '🍪', '🥜', '🌰'
];
