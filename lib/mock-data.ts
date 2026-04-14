export interface RarityTier {
  tier: string;
  size: number;
  remaining: number;
  price: number;
}

export interface Moment {
  id: string;
  player: string;
  team: string;
  opponent: string;
  playType: string;
  statLine: string;
  context: string;
  historicalNote: string;
  price: number;
  editionSize: number;
  editionsClaimed: number;
  rarityTiers: RarityTier[];
  saleEndsAt: number;
  saleStartedAt: number;
  videoUrl: string;
  thumbnailGradient: string;
  teamColors: { primary: string; secondary: string };
}

// Sale ends far in the future so drops are always live during prototype demos
// Bam: 14 min, Jokic: 9 min, SGA: 18 min — realistic mid-drop feel
const SALE_MINUTES: Record<string, number> = { bam: 14, jokic: 9, sga: 18 };

export function getSaleEndsAt(momentId: string): number {
  return Date.now() + (SALE_MINUTES[momentId] ?? 12) * 60 * 1000;
}

export const MOMENTS: Moment[] = [
  {
    id: "bam",
    player: "Bam Adebayo",
    team: "MIA",
    opponent: "BOS",
    playType: "Monster Dunk",
    statLine: "30 PTS / 8 REB / 4 AST",
    context: "5th 30-pt game \u2022 Franchise record",
    historicalNote:
      "Adebayo erupted for 30 points on 12-of-17 shooting, punctuated by a thunderous one-handed slam over two defenders that silenced TD Garden. It was his fifth 30-point game of the playoffs, breaking a franchise record previously held by Dwyane Wade.",
    price: 5,
    editionSize: 5000,
    editionsClaimed: 3847,
    rarityTiers: [
      { tier: "Open", size: 5000, remaining: 1153, price: 5 },
      { tier: "Rare", size: 99, remaining: 34, price: 25 },
      { tier: "Legendary", size: 25, remaining: 9, price: 99 },
      { tier: "Ultimate", size: 5, remaining: 2, price: 499 },
    ],
    saleEndsAt: 0, // Use getSaleEndsAt(id) client-side
    saleStartedAt: Date.now() - 15 * 60 * 1000,
    videoUrl: "/videos/bam-dunk.mp4",
    thumbnailGradient: "linear-gradient(135deg, #98002E 0%, #F9A01B 100%)",
    teamColors: { primary: "#98002E", secondary: "#F9A01B" },
  },
  {
    id: "jokic",
    player: "Nikola Joki\u0107",
    team: "DEN",
    opponent: "LAL",
    playType: "Triple-Double Machine",
    statLine: "35 PTS / 15 REB / 12 AST",
    context: "4th straight triple-double \u2022 Playoff history",
    historicalNote:
      "Joki\u0107 recorded his fourth consecutive playoff triple-double, joining Wilt Chamberlain and Oscar Robertson as the only players to achieve the feat. His 35-point, 15-rebound, 12-assist masterclass dismantled the Lakers\u2019 defense with surgical precision, including a no-look pass that set up the dagger three with 47 seconds remaining.",
    price: 5,
    editionSize: 5000,
    editionsClaimed: 2891,
    rarityTiers: [
      { tier: "Open", size: 5000, remaining: 2109, price: 5 },
      { tier: "Rare", size: 99, remaining: 51, price: 25 },
      { tier: "Legendary", size: 25, remaining: 14, price: 99 },
      { tier: "Ultimate", size: 5, remaining: 3, price: 499 },
    ],
    saleEndsAt: 0, // Use getSaleEndsAt(id) client-side
    saleStartedAt: Date.now() - 15 * 60 * 1000,
    videoUrl: "/videos/jokic-triple.mp4",
    thumbnailGradient: "linear-gradient(135deg, #0E2240 0%, #FEC524 100%)",
    teamColors: { primary: "#0E2240", secondary: "#FEC524" },
  },
  {
    id: "sga",
    player: "Shai Gilgeous-Alexander",
    team: "OKC",
    opponent: "PHX",
    playType: "40-Piece",
    statLine: "42 PTS / 6 REB / 5 AST",
    context: "Career playoff high \u2022 OKC franchise record",
    historicalNote:
      "SGA poured in a career playoff-high 42 points on ruthless efficiency, going 15-of-22 from the field. His mid-range game was virtually unstoppable\u2014he scored 18 points from the elbow area alone, the most by any player in a single playoff game this season. The performance surpassed Russell Westbrook\u2019s previous OKC franchise playoff record.",
    price: 5,
    editionSize: 5000,
    editionsClaimed: 1744,
    rarityTiers: [
      { tier: "Open", size: 5000, remaining: 3256, price: 5 },
      { tier: "Rare", size: 99, remaining: 72, price: 25 },
      { tier: "Legendary", size: 25, remaining: 19, price: 99 },
      { tier: "Ultimate", size: 5, remaining: 4, price: 499 },
    ],
    saleEndsAt: 0, // Use getSaleEndsAt(id) client-side
    saleStartedAt: Date.now() - 15 * 60 * 1000,
    videoUrl: "/videos/sga-40piece.mp4",
    thumbnailGradient: "linear-gradient(135deg, #007AC1 0%, #EF6100 100%)",
    teamColors: { primary: "#007AC1", secondary: "#EF6100" },
  },
];

export function getMoment(id: string): Moment | undefined {
  return MOMENTS.find((m) => m.id === id);
}

export function getMomentOrThrow(id: string): Moment {
  const m = getMoment(id);
  if (!m) throw new Error(`Unknown moment: ${id}`);
  return m;
}
