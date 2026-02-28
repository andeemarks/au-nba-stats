export interface TrackedPlayer {
  id: number;
  name: string;
  teamId: number;
  teamName: string;
  teamAbbr: string;
  conference: 'East' | 'West';
}

export interface GameStats {
  gameId: string;
  gameDate: string;
  matchup: string;
  opponent: string;
  result: 'W' | 'L';
  teamScore: number;
  opponentScore: number;
  starter: boolean;
  minutes: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  plusMinus: number;
  fgm: number;
  fga: number;
  fgPct: number;
  fg3m: number;
  fg3a: number;
  fg3Pct: number;
  ftm: number;
  fta: number;
  ftPct: number;
}

export interface AverageStats {
  gamesPlayed: number;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  plusMinus: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
}

export interface TeamRecord {
  wins: number;
  losses: number;
}

export interface PlayerData {
  player: TrackedPlayer;
  games: GameStats[];
  seasonAverages: AverageStats;
  last5Averages: AverageStats;
  teamRecord: TeamRecord;
}

export type ViewMode = 'lastGame' | 'seasonAvg' | 'last5';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface ScheduleGame {
  gameId: string;
  gameDate: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  status: 'completed' | 'live' | 'upcoming';
}
