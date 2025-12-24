import type { SpellSlim } from '$lib/types';
import type { PageServerLoad } from '../$types';

interface SearchResult {
  items: SpellSlim[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
  const fetchUrl = '/api/spells?' + url.searchParams.toString();
  const response = await fetch(fetchUrl);
  const data = (await response.json()) as SearchResult;

  return {
    searchResult: data,
  };
};
