<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';
	import { LocalStorage } from '$lib/storage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let spell = data.spell;

	const savedSpellsStorage = new LocalStorage<number[]>('savedSpells', []);

	const isSaved = $derived(savedSpellsStorage.current.includes(spell.id));

	const saveSpell = (id: number) => {
		if (!savedSpellsStorage.current.includes(id)) {
			savedSpellsStorage.current.push(id);
		}
	};

	const forgetSpell = (id: number) => {
		if (savedSpellsStorage.current.includes(id)) {
			savedSpellsStorage.current = savedSpellsStorage.current.filter(
				(saved: number) => saved !== id
			);
		}
	};
</script>

<main class="prose mr-auto ml-auto">
	<h2 class="text-center">{spell.title_ua}</h2>
	Spell is {isSaved ? '' : 'not'} saved.
	<div class="flex flex-col">
		<button class="btn w-max" onclick={() => saveSpell(spell.id)}>Save spell</button>
		<button class="btn w-max" onclick={() => forgetSpell(spell.id)}>Forget spell</button>
	</div>
	<h3 class="italic">{spell.classes}</h3>
	<div class="mr-auto ml-auto grid w-max grid-cols-[max-content_max-content] gap-x-4 gap-y-2">
		<div>Час створення</div>
		<div>{spell.casting_time}</div>

		<div>Відстань</div>
		<div>{spell.distance}</div>

		<div>Складові</div>
		<div>{spell.components}</div>

		<div>Тривалість</div>
		<div>{spell.duration}</div>
	</div>

	<Markdown text={spell.description} class="mt-2" />
</main>
