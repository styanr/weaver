<script lang="ts">
	import { page } from '$app/state';
	import debounce from 'lodash.debounce';
	import { onDestroy } from 'svelte';
	import type { PagedResponse } from '../api/spells/+server';
	import type { SpellSlim } from '$lib/types';
	import { LocalStorage } from '$lib/storage.svelte';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/Pagination.svelte';
	import Header from '$lib/components/Header.svelte';
	import SpellItem from '$lib/components/SpellItem.svelte';
	import RibbonLink from '$lib/components/RibbonLink.svelte';
	import Skull from '$lib/components/svg/Skull.svelte';
	import { parsePositiveIntegerParam } from '$lib/numbers';

	const classFilters = [
		'бард',
		'клірик',
		'друїд',
		'паладин',
		'рейнджер',
		'заклинач',
		'чаклун',
		'чарівник'
	];

	const levelFilters = Array.from({ length: 10 }, (_, i) => i);

	const query = $derived(page.url.searchParams.get('query'));
	const paramClass = $derived(page.url.searchParams.get('class'));
	const paramLevel = $derived(page.url.searchParams.get('level'));
	const paramPage = $derived(page.url.searchParams.get('page'));

	let inputValue = $state<string | null>(query);
	let debouncedQuery = $state(query ?? '');
	let selectedClass = $state<string | null>(paramClass);
	let selectedLevel = $state<number | null>(parsePositiveIntegerParam(paramLevel));
	let selectedPage = $state<number | null>(parsePositiveIntegerParam(paramPage));

	let isLoading = $state(false);
	let lastError = $state<string | null>(null);
	let searchResult = $state<PagedResponse<SpellSlim> | null>(null);

	const { data } = $props();

	$effect(() => {
		if (data.searchResult) {
			isLoading = true;
			lastError = null;

			const handleResult = (result: PagedResponse<SpellSlim>) => {
				searchResult = result;
				isLoading = false;
			};

			const handleError = (error: any) => {
				lastError = error.message || 'An error occurred';
				isLoading = false;
			};

			if (data.searchResult instanceof Promise) {
				data.searchResult.then(handleResult).catch(handleError);
			} else {
				handleResult(data.searchResult);
			}
		}
	});

	const savedSpellsStorage = new LocalStorage<number[]>('savedSpells', []);

	const isSaved = (id: number) => savedSpellsStorage.current.includes(id);

	const updateDebouncedQuery = debounce((newValue: string) => {
		debouncedQuery = newValue;
	}, 300);

	$effect(() => {
		updateDebouncedQuery(inputValue ?? '');
	});

	onDestroy(() => {
		updateDebouncedQuery.cancel();
	});

	$effect(() => {
		if (inputValue != query || selectedClass != paramClass || selectedLevel != paramLevel) {
			selectedPage = 1;
		}
	});

	$effect(() => {
		const url = new URL(page.url);
		const params = url.searchParams;

		debouncedQuery ? params.set('query', debouncedQuery) : params.delete('query');
		selectedClass ? params.set('class', selectedClass) : params.delete('class');
		selectedLevel !== null ? params.set('level', String(selectedLevel)) : params.delete('level');

		selectedPage && selectedPage > 1
			? params.set('page', String(selectedPage))
			: params.delete('page');

		if (page.url.href != url.href) {
			goto(url, { replaceState: true, keepFocus: true, noScroll: false });
		}
	});

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

<svelte:head>
	<title>Зміст · Weaver</title>
</svelte:head>

<RibbonLink href="/spells/saved" title="Ґримуар" position="right" class="absolute -top-0 right-5" />

<div class="list relative mt-10 w-full py-6 text-2xl md:mt-0">
	<Header
		title="Зміст"
		subtitle="Index Arcanum"
		class="mb-8 flex w-full flex-col items-center justify-center"
	/>
	<label class="input mb-5 w-full">
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
	<form class="filter mb-5 gap-y-2">
		<input
			class="btn btn-square text-base inset-shadow-base-content !transition-all hover:inset-shadow-sm/30"
			type="reset"
			value="×"
			onclick={() => (selectedClass = null)}
		/>

		{#each classFilters as c}
			<input
				class="btn text-base capitalize inset-shadow-base-content !transition-all hover:inset-shadow-sm/30"
				type="radio"
				name="class"
				aria-label={c}
				value={c}
				bind:group={selectedClass}
			/>
		{/each}
	</form>

	<form class="filter mb-6 gap-y-2">
		<input
			class="btn btn-square text-base inset-shadow-base-content !transition-all hover:inset-shadow-sm/30"
			type="reset"
			value="×"
			onclick={() => (selectedLevel = null)}
		/>

		{#each levelFilters as l}
			<input
				class="btn text-base inset-shadow-base-content !transition-all hover:inset-shadow-sm/30"
				type="radio"
				name="level"
				aria-label={l.toString()}
				value={l}
				bind:group={selectedLevel}
			/>
		{/each}
	</form>

	{#if isLoading}
		<div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
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
	{:else if searchResult}
		{#if searchResult.items.length > 0}
			{#each searchResult.items as spell, i}
				<SpellItem
					{spell}
					index={i + 1 + searchResult.pageSize * (searchResult.pageNumber - 1)}
					isSaved={isSaved(spell.id)}
					onToggle={() => toggleSpell(spell.id)}
				/>
			{/each}
			<Pagination
				pageSize={searchResult.pageSize}
				currentPage={searchResult.pageNumber}
				totalCount={searchResult.totalCount}
				class="mt-5"
				onChange={(newPage: number) => {
					selectedPage = newPage;
				}}
			/>
		{:else}
			<div class="flex flex-col items-center justify-center py-16">
				<Skull class="mb-5 aspect-square h-23 text-base-content/70" />
				<h3 class="mb-2 text-2xl font-bold">Згадок немає...</h3>
				<p class="text-center text-base-content-500">Можливо, варто створити власні чари?</p>
			</div>
		{/if}
	{:else}
		<div class="flex flex-col items-center justify-center py-16">
			<Skull class="mb-5 aspect-square h-23 text-base-content/70" />
			<h3 class="mb-2 text-2xl font-bold">Згадок немає...</h3>
			<p class="text-center text-base-content-500">Можливо, варто створити власні чари?</p>
		</div>
	{/if}
</div>
