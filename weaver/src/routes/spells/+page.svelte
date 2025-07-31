<script lang="ts">
	import { page } from '$app/state';
	import debounce from 'lodash.debounce';
	import { onDestroy } from 'svelte';
	import type { PagedResponse } from '../api/spells/+server';
	import type { SpellSlim } from '$lib/types';
	import Markdown from '$lib/components/Markdown.svelte';
	import SaveButton from '$lib/components/SaveButton.svelte';
	import { romanize } from '$lib/numbers';
	import { LocalStorage } from '$lib/storage.svelte';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/Pagination.svelte';
	import RibbonLink from '$lib/components/RibbonLink.svelte';
	import Header from '$lib/components/Header.svelte';

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

	const levelFilters = Array.from({ length: 10 }, (_, i) => i);

	const query = $derived(page.url.searchParams.get('query'));
	const paramClass = $derived(page.url.searchParams.get('class'));
	const paramLevel = $derived(page.url.searchParams.get('level'));
	const paramPage = $derived(page.url.searchParams.get('page'));

	let inputValue = $state<string | null>(query);
	let debouncedQuery = $state(query ?? '');
	let selectedClass = $state<string | null>(paramClass);
	let selectedLevel = $state<number | null>(paramLevel ? Number(paramLevel) : null);
	let selectedPage = $state<number | null>(paramPage ? Number(paramPage) : null);

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

<RibbonLink href="/spells/saved" title="Гримуар" position="right" class="absolute -top-0 right-5" />

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
				<div
					class="list-row mb-5 flex items-center gap-10 bg-base-100 px-12 transition-all hover:scale-105 hover:shadow-xl"
				>
					<a
						href={`/spells/${spell.id}`}
						class="flex flex-1 flex-col-reverse items-center gap-10 no-underline md:flex-row"
					>
						<div
							class="flex flex-col-reverse items-center justify-center gap-3 md:flex-row md:gap-0"
						>
							<div class="text-xl font-bold whitespace-nowrap md:w-30 md:text-3xl">
								{romanize(i + 1 + searchResult.pageSize * (searchResult.pageNumber - 1))}
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
							<div class="flex items-start justify-between">
								<h3
									class="mt-2 mb-3 text-3xl font-bold first-letter:mr-0.5 first-letter:inline-block first-letter:align-text-bottom first-letter:text-4xl/1 first-letter:leading-none first-letter:font-extrabold"
								>
									{spell.title_ua}
									<div
										class="small-caps mt-4 text-xl font-normal text-base-content-500 md:mt-0 md:ml-1 md:inline md:text-2xl"
									>
										"{spell.title}"
									</div>
								</h3>
								<SaveButton
									isSaved={isSaved(spell.id)}
									onToggle={() => toggleSpell(spell.id)}
									class="mt-2 md:hidden"
								/>
							</div>
							<div class="mb-4 flex flex-col gap-3">
								<div class="capitalize italic">
									{#each spell.classes as casterClass, i}
										{casterClass}{i < spell.classes.length - 1 ? ', ' : ''}
									{/each}
								</div>
								<div>
									<span class="font-bold">{spell.level}</span> рівень
								</div>
								{#if spell.materialDescription}
									<div>
										Матеріали: <Markdown text={spell.materialDescription} class="inline" />
									</div>
								{/if}
							</div>
						</div>
					</a>
					<SaveButton
						isSaved={isSaved(spell.id)}
						onToggle={() => toggleSpell(spell.id)}
						class="hidden md:block"
					/>
				</div>
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
		{/if}
	{/if}
</div>
