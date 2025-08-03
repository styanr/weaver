import { browser } from '$app/environment';
import type { SpellSlim } from '$lib/types';
import type { PageLoad } from './$types';

interface SavedSpellsResult {
  items: SpellSlim[];
  totalCount: number;
}

export const load: PageLoad = async ({ fetch }) => {
  const loadSavedSpells = (): Promise<SavedSpellsResult> => {
    return new Promise((resolve, reject) => {
      if (!browser) {
        resolve({ items: [], totalCount: 0 });
        return;
      }

      try {
        const savedSpellSlugs = JSON.parse(
          localStorage.getItem('savedSpells') || '[]'
        ) as string[];

        if (savedSpellSlugs.length === 0) {
          resolve({ items: [], totalCount: 0 });
          return;
        }

        const slugsParam = savedSpellSlugs.join(',');
        const fetchUrl = `/api/spells/saved?slugs=${slugsParam}`;

        fetch(fetchUrl)
          .then((res) => res.json())
          .then((data) => {
            resolve({
              items: data,
              totalCount: data.length,
            });
          })
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  };

  const promise = loadSavedSpells();
  return {
    savedSpellsResult: promise,
  };
};
