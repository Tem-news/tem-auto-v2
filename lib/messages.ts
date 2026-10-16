export const MESSAGE_CATEGORIES = {
  suggestions: 'Ieteikumi',
  advertising: 'Reklāma un sadarbība',
  legal: 'Juridiski jautājumi',
  reports: 'Drošība un krāpniecība',
} as const
export type MessageCategory = keyof typeof MESSAGE_CATEGORIES
export type PlatformMessage = {
  id: string; category: MessageCategory; body: string; email: string | null;
  listing_url: string | null; language: string; country: string | null;
  created_at: string; read_at: string | null; status: 'new' | 'processing' | 'done';
}
