<script lang="ts">
	import { page } from '$app/state';
	import debounce from 'lodash.debounce';
	import { onDestroy } from 'svelte';
	import type { SpellSlim } from '../api/spells/+server';
	import Markdown from '$lib/components/Markdown.svelte';
	import { Heart } from 'lucide-svelte';
	import { romanize } from '$lib/numbers';
	import { LocalStorage } from '$lib/storage.svelte';
	import { goto, replaceState } from '$app/navigation';

	interface SearchResult {
		items: SpellSlim[];
		totalCount: number;
		pageNumber: number;
		pageSize: number;
	}

	const classFilters = [
		'варвар',
		'бард',
		'клірик',
		'друїд',
		'боєць',
		'монах',
		'паладин',
		'рейнджер',
		'пройдисвіт',
		'заклинач',
		'чаклун',
		'чарівник'
	];

	const levelFilters = Array.from({ length: 9 }, (_, i) => i + 1);

	const query = $derived(page.url.searchParams.get('query'));
	let inputValue = $state(query ?? '');
	let selClass = $state<string | null>(null);
	let selLevel = $state<number | null>(null);

	let searchResults = $state<SearchResult | null>(null);
	let isLoading = $state(false);
	let lastError = $state<string | null>(null);

	const savedSpellsStorage = new LocalStorage<number[]>('savedSpells', []);

	const isSaved = (id: number) => savedSpellsStorage.current.includes(id);

	const search = async (params: Record<string, any>): Promise<SearchResult> => {
		const url = '/api/spells?' + new URLSearchParams(params as Record<string, string>).toString();
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const debouncedUpdate = debounce(
		async (query: string, classFilter: string | null, levelFilter: number | null) => {
			const url = new URL(window.location.href);
			url.searchParams.set('query', query);

			classFilter ? url.searchParams.set('class', classFilter) : url.searchParams.delete('class');

			levelFilter !== null
				? url.searchParams.set('level', String(levelFilter))
				: url.searchParams.delete('level');

			goto(url.toString(), {
				replaceState: true,
				noScroll: true,
				keepFocus: true
			});
			if (!query.trim()) {
				searchResults = null;
				isLoading = false;
				lastError = null;
				return;
			}

			const params: Record<string, string> = { query: query.trim() };
			if (classFilter) params.class = classFilter;
			if (levelFilter !== null) params.level = String(levelFilter);

			isLoading = true;
			lastError = null;
			try {
				const result = await search(params);
				searchResults = result;
			} catch (err: any) {
				lastError = err.message ?? String(err);
			} finally {
				isLoading = false;
			}
		},
		300
	);

	$effect(() => {
		debouncedUpdate(inputValue, selClass, selLevel);
	});

	onDestroy(() => debouncedUpdate.cancel());

	const toggleSpell = (id: number) => {
		if (!savedSpellsStorage.current.includes(id)) {
			savedSpellsStorage.current.push(id);
		} else {
			savedSpellsStorage.current = savedSpellsStorage.current.filter(
				(saved: number) => saved !== id
			);
		}
	};
</script>

<div class="list w-[70rem] font-garamond text-2xl">
	<div class="m-auto mb-2 text-6xl font-bold uppercase">Зміст</div>
	<div class="m-auto mb-10 text-xl font-bold uppercase italic opacity-80">Index Arcana</div>
	<label class="input mb-2 w-full">
		<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g
				stroke-linejoin="round"
				stroke-linecap="round"
				stroke-width="2.5"
				fill="none"
				stroke="currentColor"
			>
				<circle cx="11" cy="11" r="8"></circle>
				<path d="m21 21-4.3-4.3"></path>
			</g>
		</svg>
		<input type="search" placeholder="Пошук" class="font-sans" bind:value={inputValue} />
	</label>
	<form class="filter mb-2">
		<input class="btn btn-square" type="reset" value="×" onclick={() => (selClass = null)} />

		{#each classFilters as c}
			<input
				class="btn capitalize"
				type="radio"
				name="class"
				aria-label={c}
				value={c}
				bind:group={selClass}
			/>
		{/each}
	</form>

	<form class="filter mb-5">
		<input class="btn btn-square" type="reset" value="×" onclick={() => (selLevel = null)} />

		{#each levelFilters as l}
			<input
				class="btn"
				type="radio"
				name="level"
				aria-label={l.toString()}
				value={l}
				bind:group={selLevel}
			/>
		{/each}
	</form>
	{#if isLoading}
		<div class="pointer-events-none fixed inset-0 flex items-center justify-center bg-base-100/60">
			<svg class="h-12 w-12 animate-spin" viewBox="0 0 24 24">
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
					fill="none"
				/>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
			</svg>
		</div>
	{/if}
	{#if lastError}
		<span style="color: red;">Помилка: {lastError}</span>
	{:else if searchResults}
		{#if searchResults.items.length > 0}
			{#each searchResults.items as spell, i}
				<div
					class="list-row flex items-center gap-10 transition-all hover:scale-105 hover:shadow-2xl"
				>
					<a href={`/spells/${spell.id}`} class="flex flex-1 items-center gap-10 no-underline">
						<div class="flex flex-row items-center justify-center">
							<div class="w-12 text-3xl font-bold whitespace-nowrap">
								{romanize(i + 1)}
							</div>

							<div class="flex h-8 w-8 items-center justify-center">
								<svg viewBox="0 0 24 24" class="h-6 w-6 fill-current">
									<path
										d="M12 2C10 2 8 4 8 6C8 8 10 10 12 10C14 10 16 8 16 6C16 4 14 2 12 2M6 8C4 8 2 10 2 12C2 14 4 16 6 16C8 16 10 14 10 12C10 10 8 8 6 8M18 8C16 8 14 10 14 12C14 14 16 16 18 16C20 16 22 14 22 12C22 10 20 8 18 8M12 14C10 14 8 16 8 18C8 20 10 22 12 22C14 22 16 20 16 18C16 16 14 14 12 14"
									/>
								</svg>
							</div>
						</div>
						<div class="flex w-full flex-col">
							<h3
								class="mt-2 mb-3 text-3xl font-bold first-letter:float-left first-letter:mr-1 first-letter:text-5xl first-letter:leading-none first-letter:font-extrabold"
							>
								{spell.title_ua}
								<span class="small-caps ml-1 text-2xl text-base-content-500">"{spell.title}"</span>
							</h3>
							<div class="mb-4 flex flex-col gap-3">
								<div class="capitalize italic">
									{#each spell.classes as casterClass, i}
										{casterClass}
										{i < spell.classes.length - 1 ? ', ' : ''}
									{/each}
								</div>
								<div>
									<span class="font-bold">{spell.level} </span> рівень
								</div>
								{#if spell.materialDescription}
									<div>
										Матеріали: <Markdown text={spell.materialDescription} />
									</div>
								{/if}
							</div>
						</div>
					</a>
					<button
						class="group btn btn-circle btn-xl hover:inset-shadow-sm"
						onclick={() => toggleSpell(spell.id)}
					>
						<Heart
							class="transition-all group-hover:scale-125 group-active:scale-150"
							fill={isSaved(spell.id) ? 'current' : 'none'}
						/>
					</button>
				</div>
			{/each}
		{:else}
			<span>Нічого не знайдено</span>
		{/if}
	{:else if inputValue.trim() === ''}
		<span>Пошук не розпочато</span>
	{/if}
</div>
