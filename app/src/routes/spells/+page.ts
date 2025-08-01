import { browser } from '$app/environment';
import type { SpellSlim } from '../api/spells/+server';
import type { PageLoad } from './$types';

interface SearchResult {
	items: SpellSlim[];
	totalCount: number;
	pageNumber: number;
	pageSize: number;
}

export const load: PageLoad = async ({ fetch, url }) => {
	const searchSpells = (url: string): Promise<SearchResult> => {
		return new Promise((resolve, reject) => {
			fetch(url)
				.then((res) => {
					resolve(res.json());
				})
				.catch((err) => {
					reject(err);
				});
		});
	};
	const fetchUrl = '/api/spells?' + url.searchParams.toString();
	const promise = searchSpells(fetchUrl);
	return {
		searchResult: browser ? promise : await promise
	};
};
