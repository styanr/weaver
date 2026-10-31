import type { Deck } from './deck';
import { LocalStorage } from './storage.svelte';

const savedSpellsStorage = new LocalStorage<string[]>('savedSpells', []);
const preparedSpellsStorage = new LocalStorage<string[]>('preparedSpells', []);
const alwaysPreparedStorage = new LocalStorage<string[]>(
  'alwaysPreparedSpells',
  []
);
const preparedLimitStorage = new LocalStorage<number | null>(
  'preparedLimit',
  null
);

export const isSaved = (slug: string) =>
  savedSpellsStorage.current.includes(slug);

export const isPrepared = (slug: string) =>
  preparedSpellsStorage.current.includes(slug);

export const isAlwaysPrepared = (slug: string) =>
  alwaysPreparedStorage.current.includes(slug);

const withoutSlug = (slugs: string[], slug: string) =>
  slugs.filter((storageSlug) => storageSlug !== slug);

export const toggleSpell = (slug: string) => {
  if (!savedSpellsStorage.current.includes(slug)) {
    savedSpellsStorage.current.push(slug);
  } else {
    savedSpellsStorage.current = withoutSlug(
      [...savedSpellsStorage.current],
      slug
    );
    preparedSpellsStorage.current = withoutSlug(
      [...preparedSpellsStorage.current],
      slug
    );
    alwaysPreparedStorage.current = withoutSlug(
      [...alwaysPreparedStorage.current],
      slug
    );
  }
};

export const togglePrepared = (slug: string) => {
  if (isPrepared(slug)) {
    preparedSpellsStorage.current = withoutSlug(
      [...preparedSpellsStorage.current],
      slug
    );
  } else {
    preparedSpellsStorage.current.push(slug);
  }
};

export const getPreparedLimit = () => preparedLimitStorage.current;

export const setPreparedLimit = (limit: number | null) => {
  preparedLimitStorage.current = limit;
};

export const addDeck = ({ spells, alwaysPrepared }: Deck) => {
  savedSpellsStorage.current = [
    ...new Set([...savedSpellsStorage.current, ...spells]),
  ];
  alwaysPreparedStorage.current = [
    ...new Set([...alwaysPreparedStorage.current, ...alwaysPrepared]),
  ];
};

export const replaceWithDeck = ({ spells, alwaysPrepared }: Deck) => {
  savedSpellsStorage.current = [...spells];
  alwaysPreparedStorage.current = [...alwaysPrepared];
  preparedSpellsStorage.current = [];
};

export const clearUpStorage = (slugs: string[]) => {
  const isKnown = (storageSlug: string) => slugs.includes(storageSlug);

  savedSpellsStorage.current = savedSpellsStorage.current.filter(isKnown);
  preparedSpellsStorage.current = preparedSpellsStorage.current.filter(isKnown);
  alwaysPreparedStorage.current = alwaysPreparedStorage.current.filter(isKnown);
};
