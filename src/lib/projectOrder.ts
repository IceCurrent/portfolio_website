/** GitHub pinned order — keep listing and prev/next navigation aligned with content_pack §C2 */
export const PROJECT_SLUG_ORDER = [
  'volterra-heston-model',
  'local-volatility-model',
  'pairs-trading',
  'algorithmic-backtesting-engine',
  'long-short-equities',
] as const;

export function sortProjectsByPinnedOrder<T extends { slug: string }>(entries: T[]): T[] {
  const rank = (slug: string) => {
    const i = PROJECT_SLUG_ORDER.indexOf(slug as (typeof PROJECT_SLUG_ORDER)[number]);
    return i === -1 ? PROJECT_SLUG_ORDER.length : i;
  };
  return [...entries].sort((a, b) => rank(a.slug) - rank(b.slug));
}
