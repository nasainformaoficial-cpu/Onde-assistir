export interface MajorProvider {
  id: number;
  name: string;
  shortName: string;
  color: string;
  borderColor: string;
  logoPath?: string;
}

// Major streaming services operating in Brazil with their TMDB Watch Provider IDs
export const MAJOR_BRAZILIAN_PROVIDERS: MajorProvider[] = [
  {
    id: 8,
    name: 'Netflix',
    shortName: 'Netflix',
    color: 'from-red-600 to-rose-700',
    borderColor: 'border-red-600/50',
    logoPath: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
  },
  {
    id: 119,
    name: 'Amazon Prime Video',
    shortName: 'Prime Video',
    color: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-500/50',
    logoPath: '/pvsfZx1vl079mxkflgHl2pW57yH.jpg',
  },
  {
    id: 337,
    name: 'Disney Plus',
    shortName: 'Disney+',
    color: 'from-blue-600 to-indigo-800',
    borderColor: 'border-blue-500/50',
    logoPath: '/7rwgQIaxGQAdt54YvtUQSD69o9s.jpg',
  },
  {
    id: 1899,
    name: 'Max',
    shortName: 'Max',
    color: 'from-blue-700 to-purple-800',
    borderColor: 'border-purple-500/50',
    logoPath: '/fksCUZ9QDWZMUwL2LgfhDl00Bhd.jpg',
  },
  {
    id: 307,
    name: 'Globoplay',
    shortName: 'Globoplay',
    color: 'from-rose-500 to-red-600',
    borderColor: 'border-rose-500/50',
    logoPath: '/mB6t9n69jL8f8oXg0z78Qo15jB6.jpg',
  },
  {
    id: 350,
    name: 'Apple TV Plus',
    shortName: 'Apple TV+',
    color: 'from-zinc-600 to-zinc-900',
    borderColor: 'border-zinc-400/50',
    logoPath: '/2E03q95bU230i4v1k8aG7xQ199p.jpg',
  },
  {
    id: 531,
    name: 'Paramount Plus',
    shortName: 'Paramount+',
    color: 'from-blue-500 to-blue-700',
    borderColor: 'border-blue-400/50',
    logoPath: '/xbhHLa3AaVe4kJxTRBhvdKiqZz3.jpg',
  },
  {
    id: 227,
    name: 'Telecine',
    shortName: 'Telecine',
    color: 'from-red-700 to-orange-700',
    borderColor: 'border-orange-500/50',
    logoPath: '/92W6Lgq0n9Tf2u4wK1hF9c0xX3g.jpg',
  },
  {
    id: 167,
    name: 'Claro tv+',
    shortName: 'Claro tv+',
    color: 'from-red-600 to-red-800',
    borderColor: 'border-red-500/50',
  },
  {
    id: 300,
    name: 'Pluto TV',
    shortName: 'Pluto TV (Grátis)',
    color: 'from-yellow-500 to-amber-600',
    borderColor: 'border-amber-400/50',
  },
  {
    id: 11,
    name: 'MUBI',
    shortName: 'MUBI',
    color: 'from-sky-700 to-slate-900',
    borderColor: 'border-sky-500/50',
  },
];

export const TMDB_GENRES = [
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentário' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Família' },
  { id: 14, name: 'Fantasia' },
  { id: 36, name: 'História' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Mistério' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ficção Científica' },
  { id: 53, name: 'Suspense' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Faroeste' },
];
