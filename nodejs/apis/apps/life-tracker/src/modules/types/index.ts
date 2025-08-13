// Tipos baseados na documentação fornecida

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface GameBoard {
  rows: number;
  cols: number;
  milestones: {
    tile: number;
    label: string;
  }[];
}

export interface ScoringRule {
  action: string;
  points: number;
  desc: string;
}

export interface Game {
  board: GameBoard;
  scoring_rules: ScoringRule[];
  weekly_goal_points: number;
}

export interface UserProgress {
  userId: string;
  total_points: number;
  weekly_points: number;
  current_position: number;
  level: number;
  experience: number;
  achievements: string[];
  completed_milestones: string[];
  last_activity: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PointsData {
  points: number;
  action: string;
  userId: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  total_points: number;
  level: number;
  rank: number;
  username?: string;
} 