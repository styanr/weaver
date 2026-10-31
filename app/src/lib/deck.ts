import { deserializeArray } from './searchParams';

export const deckSearchParams = {
  name: 'name',
  spells: 'spells',
  alwaysPrepared: 'always',
};

export interface Deck {
  name: string;
  spells: string[];
  alwaysPrepared: string[];
}

export const parseDeck = (params: URLSearchParams): Deck => {
  const spells = deserializeArray(params.get(deckSearchParams.spells)).filter(
    (slug) => slug !== ''
  );

  return {
    name: params.get(deckSearchParams.name) ?? '',
    spells,
    alwaysPrepared: deserializeArray(
      params.get(deckSearchParams.alwaysPrepared)
    ).filter((slug) => spells.includes(slug)),
  };
};
