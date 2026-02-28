import type { TrackedPlayer } from '../types/nba';

export const SEASON = '2025-26';

// NBA.com team IDs
const TEAM = {
  ATL: { id: 1610612737, name: 'Atlanta Hawks', abbr: 'ATL', conference: 'East' },
  CHI: { id: 1610612741, name: 'Chicago Bulls', abbr: 'CHI', conference: 'East' },
  CHA: { id: 1610612766, name: 'Charlotte Hornets', abbr: 'CHA', conference: 'East' },
  CLE: { id: 1610612739, name: 'Cleveland Cavaliers', abbr: 'CLE', conference: 'East' },
  MIN: { id: 1610612750, name: 'Minnesota Timberwolves', abbr: 'MIN', conference: 'West' },
  POR: { id: 1610612757, name: 'Portland Trail Blazers', abbr: 'POR', conference: 'West' },
} as const;

const player = (
  id: number,
  name: string,
  team: (typeof TEAM)[keyof typeof TEAM],
): TrackedPlayer => ({
  id,
  name,
  teamId: team.id,
  teamName: team.name,
  teamAbbr: team.abbr,
  conference: team.conference as 'East' | 'West',
});

// Player IDs are NBA.com person IDs (visible in the URL on nba.com/player/{id}).
export const TRACKED_PLAYERS: TrackedPlayer[] = [
  player(1630700, 'Dyson Daniels', TEAM.ATL),
  player(1629111, 'Jock Landale', TEAM.ATL),
  player(204060, 'Joe Ingles', TEAM.MIN),
  player(1630581, 'Josh Giddey', TEAM.CHI),
  player(1630182, 'Josh Green', TEAM.CHA),
  player(1642950, 'Lachlan Olbrich', TEAM.CHI),
  player(1642878, 'Tyrese Proctor', TEAM.CLE),
  player(1629680, 'Matisse Thybulle', TEAM.POR),
];
