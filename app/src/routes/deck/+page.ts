import { parseDeck } from '$lib/deck';
import type { SpellSlim } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  const deck = parseDeck(url.searchParams);

  if (deck.spells.length === 0) {
    return { deck, spells: [] as SpellSlim[] };
  }

  const res = await fetch(`/api/spells/saved?slugs=${deck.spells.join(',')}`);
  const spells: SpellSlim[] = res.ok ? await res.json() : [];

  return { deck, spells };
};
