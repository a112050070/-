
export interface CardData {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export enum GameDifficulty {
  EASY = 'EASY',     // 4x2
  NORMAL = 'NORMAL', // 4x4
  HARD = 'HARD'      // 6x6
}

export interface DifficultyConfig {
  rows: number;
  cols: number;
  label: string;
}

export const DIFFICULTY_SETTINGS: Record<GameDifficulty, DifficultyConfig> = {
  [GameDifficulty.EASY]: { rows: 2, cols: 4, label: '簡易 (4x2)' },
  [GameDifficulty.NORMAL]: { rows: 4, cols: 4, label: '普通 (4x4)' },
  [GameDifficulty.HARD]: { rows: 6, cols: 6, label: '困難 (6x6)' },
};
