<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Ribbon from '$lib/components/Ribbon.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import { Bookmark, ChevronDown } from 'lucide-svelte';
	import { romanize } from '$lib/numbers';
	import { LocalStorage } from '$lib/storage.svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { SpellSlim } from '$lib/types.js';

	interface SavedSpellsResult {
		items: SpellSlim[];
		totalCount: number;
	}

	interface SpellsByLevel {
		[level: number]: SpellSlim[];
	}

	const { data } = $props();

	let isLoading = $state(false);
	let lastError = $state<string | null>(null);
	let savedSpellsResult = $state<SavedSpellsResult | null>(null);
	let collapsedSections = $state<Set<number>>(new Set());

	const spellsByLevel = $derived.by(() => {
		if (!savedSpellsResult?.items) return {};

		const grouped: SpellsByLevel = {};
		savedSpellsResult.items.forEach((spell) => {
			if (!grouped[spell.level]) {
				grouped[spell.level] = [];
			}
			grouped[spell.level].push(spell);
		});

		Object.keys(grouped).forEach((level) => {
			grouped[Number(level)].sort((a, b) => a.title_ua.localeCompare(b.title_ua));
		});

		return grouped;
	});

	$effect(() => {
		if (data.savedSpellsResult) {
			isLoading = true;
			lastError = null;

			const handleResult = (result: SavedSpellsResult) => {
				savedSpellsResult = result;
				isLoading = false;
			};

			const handleError = (error: any) => {
				lastError = error.message || 'An error occurred';
				isLoading = false;
			};

			if (data.savedSpellsResult instanceof Promise) {
				data.savedSpellsResult.then(handleResult).catch(handleError);
			} else {
				handleResult(data.savedSpellsResult);
			}
		}
	});

	const savedSpellsStorage = new LocalStorage<number[]>('savedSpells', []);

	const isSaved = (id: number) => savedSpellsStorage.current.includes(id);

	const toggleSpell = (id: number) => {
		if (!savedSpellsStorage.current.includes(id)) {
			savedSpellsStorage.current.push(id);
		} else {
			savedSpellsStorage.current = savedSpellsStorage.current.filter(
				(saved: number) => saved !== id
			);
		}
	};

	const toggleSection = (level: number) => {
		if (collapsedSections.has(level)) {
			collapsedSections.delete(level);
		} else {
			collapsedSections.add(level);
		}
		collapsedSections = new Set(collapsedSections);
	};

	const getLevelTitle = (level: number) => {
		if (level === 0) return 'Замовляння';
		if (level === 1) return '1-й рівень';
		if (level === 2) return '2-й рівень';
		if (level === 3) return '3-й рівень';
		return `${level}-й рівень`;
	};

	const getSpellCountInLevel = (level: number) => {
		return spellsByLevel[level]?.length || 0;
	};

	const getSpellIndexInLevel = (spell: SpellSlim, level: number) => {
		return spellsByLevel[level]?.findIndex((s) => s.id === spell.id) + 1 || 1;
	};
</script>

<a
	href="/spells"
	class="group absolute top-0 right-5 z-50 flex flex-row items-center justify-start gap-x-6"
>
	<div class="small-caps text-2xl italic opacity-0 transition-all group-hover:opacity-60">
		Зміст
	</div>
	<Ribbon class="" />
</a>

<div class="list relative w-full text-2xl">
	<Header
		title="Гримуар"
		subtitle="Grimoire Arcanis"
		class="mb-8 flex w-full flex-col items-center justify-center"
	/>

	{#if isLoading}
		<div
			class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-base-100/60"
		>
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
	{:else if savedSpellsResult}
		{#if savedSpellsResult.items.length > 0}
			{#each Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b)) as levelStr}
				{@const level = Number(levelStr)}
				{@const spells = spellsByLevel[level]}
				{@const isCollapsed = collapsedSections.has(level)}

				<div class="mb-6">
					<button
						class="flex w-full items-center justify-between rounded-3xl border-2 border-base-content/5 bg-base-200 p-4 px-6 inset-shadow-base-content transition-all duration-200 hover:inset-shadow-sm/30"
						onclick={() => toggleSection(level)}
					>
						<div class="flex items-center gap-3">
							<h2 class="text-3xl font-bold">{getLevelTitle(level)}</h2>
							<span class="text-xl opacity-70">({getSpellCountInLevel(level)})</span>
						</div>
						<div class="transition-transform duration-200" class:rotate-180={!isCollapsed}>
							<ChevronDown class="h-6 w-6" />
						</div>
					</button>

					{#if !isCollapsed}
						<div class="mt-4 space-y-5" transition:slide={{ duration: 300, easing: quintOut }}>
							{#each spells as spell, spellIndex}
								<div
									class="list-row flex items-center gap-10 bg-base-100 px-12 transition-all hover:scale-105 hover:shadow-xl"
									style="animation-delay: {spellIndex * 50}ms"
									class:animate-fade-in={!isCollapsed}
								>
									<a
										href={`/spells/${spell.id}`}
										class="flex flex-1 items-center gap-10 no-underline"
									>
										<div class="flex flex-row items-center justify-center">
											<div class="w-30 text-3xl font-bold whitespace-nowrap">
												{romanize(getSpellIndexInLevel(spell, level))}
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
												<span class="small-caps ml-1 text-2xl font-normal text-base-content-500"
													>"{spell.title}"</span
												>
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
														Матеріали: <Markdown text={spell.materialDescription} class="inline" />
													</div>
												{/if}
											</div>
										</div>
									</a>
									<button
										class="group btn btn-circle inset-shadow-base-content btn-xl hover:inset-shadow-sm/30 active:scale-95"
										onclick={() => toggleSpell(spell.id)}
									>
										<Bookmark
											class="text-base-content transition-all group-hover:scale-110 group-active:scale-125"
											fill={isSaved(spell.id) ? 'current' : 'none'}
										/>
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		{:else}
			<div class="flex flex-col items-center justify-center py-16">
				<svg class="mb-4 h-16 w-16 opacity-50" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M17 3H7C5.9 3 5 3.9 5 5V19L12 16L19 19V5C19 3.9 18.1 3 17 3M17 15L12 13L7 15V5H17V15Z"
					/>
				</svg>
				<h3 class="mb-2 text-2xl font-bold">У Гримуарі порожньо...</h3>
				<p class="text-center text-base-content-500">Потрібно вивчити більше заклинань</p>
				<a href="/spells" class="btn mt-4 inset-shadow-base-content hover:inset-shadow-sm/30">
					Переглянути каталог
				</a>
			</div>
		{/if}
	{/if}
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.3s ease-out forwards;
	}

	.list-row {
		opacity: 0;
		animation: fade-in 0.3s ease-out forwards;
	}
</style>
