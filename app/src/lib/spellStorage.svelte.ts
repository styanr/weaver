import { LocalStorage } from './storage.svelte';

const savedSpellsStorage = new LocalStorage<string[]>('savedSpells', []);

export const isSaved = (slug: string) => savedSpellsStorage.current.includes(slug);

export const toggleSpell = (slug: string) => {
	if (!savedSpellsStorage.current.includes(slug)) {
		savedSpellsStorage.current.push(slug);
	} else {
		savedSpellsStorage.current = savedSpellsStorage.current.filter(
			(saved: string) => saved !== slug
		);
	}
};

export const clearUpStorage = (slugs: string[]) => {
	savedSpellsStorage.current = savedSpellsStorage.current.filter((storageSlug: string) =>
		slugs.some((slug) => slug === storageSlug)
	);
};
