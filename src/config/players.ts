import type { TrackedPlayer } from '../types/nba';

export const SEASON = '2025-26';

// NBA.com team IDs
const TEAM = {
  LAL: { id: 1610612747, name: 'Los Angeles Lakers', abbr: 'LAL', conference: 'West' },
  BOS: { id: 1610612738, name: 'Boston Celtics', abbr: 'BOS', conference: 'East' },
  GSW: { id: 1610612744, name: 'Golden State Warriors', abbr: 'GSW', conference: 'West' },
  DEN: { id: 1610612743, name: 'Denver Nuggets', abbr: 'DEN', conference: 'West' },
  MIL: { id: 1610612749, name: 'Milwaukee Bucks', abbr: 'MIL', conference: 'East' },
  PHX: { id: 1610612756, name: 'Phoenix Suns', abbr: 'PHX', conference: 'West' },
  MIA: { id: 1610612748, name: 'Miami Heat', abbr: 'MIA', conference: 'East' },
  PHI: { id: 1610612755, name: 'Philadelphia 76ers', abbr: 'PHI', conference: 'East' },
  DAL: { id: 1610612742, name: 'Dallas Mavericks', abbr: 'DAL', conference: 'West' },
  NYK: { id: 1610612752, name: 'New York Knicks', abbr: 'NYK', conference: 'East' },
  OKC: { id: 1610612760, name: 'Oklahoma City Thunder', abbr: 'OKC', conference: 'West' },
  MIN: { id: 1610612750, name: 'Minnesota Timberwolves', abbr: 'MIN', conference: 'West' },
  CLE: { id: 1610612739, name: 'Cleveland Cavaliers', abbr: 'CLE', conference: 'East' },
  SAC: { id: 1610612758, name: 'Sacramento Kings', abbr: 'SAC', conference: 'West' },
  MEM: { id: 1610612763, name: 'Memphis Grizzlies', abbr: 'MEM', conference: 'West' },
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

// Player IDs are NBA.com person IDs. To find an ID, visit a player's page on
// stats.nba.com — the numeric ID appears in the URL.
export const TRACKED_PLAYERS: TrackedPlayer[] = [
  player(2544, 'LeBron James', TEAM.LAL),
  player(1629029, 'Luka Doncic', TEAM.LAL),
  player(203999, 'Nikola Jokic', TEAM.DEN),
  player(1628384, 'Jayson Tatum', TEAM.BOS),
  player(1630169, 'Ja Morant', TEAM.MEM),
  player(203954, 'Joel Embiid', TEAM.PHI),
  player(1628389, 'Bam Adebayo', TEAM.MIA),
  player(203507, 'Giannis Antetokounmpo', TEAM.MIL),
  player(1628983, 'Shai Gilgeous-Alexander', TEAM.OKC),
  player(1628378, 'Donovan Mitchell', TEAM.CLE),
  player(1630162, 'Anthony Edwards', TEAM.MIN),
  player(1626157, 'Karl-Anthony Towns', TEAM.NYK),
  player(201939, 'Stephen Curry', TEAM.GSW),
  player(1628368, "De'Aaron Fox", TEAM.SAC),
  player(1626164, 'Devin Booker', TEAM.PHX),
];
