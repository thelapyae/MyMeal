// Rough per-item macro estimates for each food emoji, in grams.
// These are approximate values for a typical single serving and are only meant
// to give a quick at-a-glance sense of the day's intake.
export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

const EMOJI_MACROS: Record<string, Macros> = {
  '🐔': { protein: 27, carbs: 0, fat: 14 },   // chicken
  '🐟': { protein: 22, carbs: 0, fat: 12 },   // fish
  '🐐': { protein: 23, carbs: 0, fat: 9 },    // goat / red meat
  '🐷': { protein: 25, carbs: 0, fat: 20 },   // pork
  '🐙': { protein: 25, carbs: 4, fat: 2 },    // octopus / seafood
  '🥚': { protein: 6, carbs: 1, fat: 5 },     // egg
  '🥛': { protein: 8, carbs: 12, fat: 8 },    // milk
  '🧀': { protein: 7, carbs: 1, fat: 9 },     // cheese
  '🍞': { protein: 3, carbs: 14, fat: 1 },    // bread
  '🥐': { protein: 5, carbs: 26, fat: 12 },   // croissant
  '🍝': { protein: 12, carbs: 43, fat: 6 },   // pasta
  '🍚': { protein: 4, carbs: 45, fat: 0 },    // rice
  '🥣': { protein: 6, carbs: 27, fat: 3 },    // cereal / bowl
  '☕': { protein: 0, carbs: 0, fat: 0 },     // coffee
  '🧃': { protein: 0, carbs: 24, fat: 0 },    // juice
  '🍎': { protein: 0, carbs: 25, fat: 0 },    // apple
  '🍌': { protein: 1, carbs: 27, fat: 0 },    // banana
  '🍇': { protein: 1, carbs: 27, fat: 0 },    // grapes
  '🥜': { protein: 7, carbs: 6, fat: 14 },    // peanuts
  '🍪': { protein: 2, carbs: 20, fat: 7 },    // cookie
  '🥦': { protein: 3, carbs: 6, fat: 0 },     // broccoli
  '🥑': { protein: 2, carbs: 9, fat: 15 },    // avocado
  '🍅': { protein: 1, carbs: 4, fat: 0 },     // tomato
  '🥕': { protein: 1, carbs: 6, fat: 0 },     // carrot
};

// Split a meal's emoji string into individual emoji (handles multi-codepoint).
function splitEmojis(str: string): string[] {
  return Array.from(str.match(/\p{Extended_Pictographic}/gu) ?? []);
}

export function macrosForEmojiString(emoji: string): Macros {
  return splitEmojis(emoji).reduce<Macros>(
    (acc, e) => {
      const m = EMOJI_MACROS[e];
      if (m) {
        acc.protein += m.protein;
        acc.carbs += m.carbs;
        acc.fat += m.fat;
      }
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );
}

export function sumMacros(emojiStrings: string[]): Macros {
  return emojiStrings.reduce<Macros>(
    (acc, s) => {
      const m = macrosForEmojiString(s);
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fat += m.fat;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );
}
