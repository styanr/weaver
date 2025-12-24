<script lang="ts">
  import { navigating, page } from '$app/state';
  import debounce from 'lodash.debounce';
  import { onDestroy } from 'svelte';
  import type { PagedResponse } from '../api/spells/+server';
  import type { SpellSlim } from '$lib/types';
  import { goto } from '$app/navigation';
  import Pagination from '$lib/components/Pagination.svelte';
  import Header from '$lib/components/Header.svelte';
  import SpellItem from '$lib/components/SpellItem.svelte';
  import RibbonLink from '$lib/components/RibbonLink.svelte';
  import Skull from '$lib/components/svg/Skull.svelte';
  import { parsePositiveIntegerParam } from '$lib/numbers';
  import { isSaved, toggleSpell } from '$lib/spellStorage.svelte';
  import { deserializeArray, serializeArray } from '$lib/searchParams';
  import { searchParams } from './common';
  import type { PageProps } from './$types';

  const classFilters = [
    'бард',
    'клірик',
    'друїд',
    'паладин',
    'рейнджер',
    'заклинач',
    'чаклун',
    'чарівник',
  ];

  const levelFilters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const levelFilterLabels = levelFilters.map((f) =>
    f === 0 ? 'Замовляння' : f.toString()
  );

  const query = page.url.searchParams.get(searchParams.query);
  const classesParam = page.url.searchParams.get(searchParams.classes);
  const levelsParam = page.url.searchParams.get(searchParams.levels);
  const pageParam = page.url.searchParams.get(searchParams.page);

  const classes = deserializeArray(classesParam);
  const levels = deserializeArray(levelsParam)
    .map(parsePositiveIntegerParam)
    .filter((n) => n != null);

  let inputValue = $state<string | null>(query);
  let debouncedQuery = $state(query ?? '');
  let selectedClasses = $state<string[]>(classes);
  let selectedLevels = $state<number[] | null>(levels);
  let selectedPage = $state<number | null>(
    parsePositiveIntegerParam(pageParam)
  );

  const { data }: PageProps = $props();
  let searchResult = $derived<PagedResponse<SpellSlim> | null>(
    data.searchResult instanceof Promise ? null : data.searchResult
  );

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
    if (
      inputValue != query ||
      selectedClasses != deserializeArray(classesParam) ||
      selectedLevels != levelsParam
    ) {
      selectedPage = 1;
    }
  });

  $effect(() => {
    const url = new URL(page.url);
    const params = url.searchParams;

    debouncedQuery
      ? params.set(searchParams.query, debouncedQuery)
      : params.delete(searchParams.query);
    selectedClasses && selectedClasses.length !== 0
      ? params.set(searchParams.classes, serializeArray(selectedClasses))
      : params.delete(searchParams.classes);
    selectedLevels && selectedLevels.length !== 0
      ? params.set(searchParams.levels, serializeArray(selectedLevels))
      : params.delete(searchParams.levels);

    selectedPage && selectedPage > 1
      ? params.set(searchParams.page, String(selectedPage))
      : params.delete(searchParams.page);

    if (page.url.href != url.href) {
      goto(url, { replaceState: true, keepFocus: true, noScroll: false });
    }
  });
</script>

<svelte:head>
  <title>Зміст · Weaver</title>
</svelte:head>

<RibbonLink
  href="/spells/saved"
  title="Ґримуар"
  position="right"
  class="absolute -top-0 right-5"
/>
<div class="list relative mt-10 w-full py-6 text-2xl md:mt-0">
  <Header
    title="Зміст"
    subtitle="Index Arcanum"
    class="mb-8 flex w-full flex-col items-center justify-center"
  />
  <label class="input mb-5 w-full">
    <svg
      class="h-[1em] opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
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
    <input
      type="search"
      placeholder="Пошук"
      class="font-sans"
      bind:value={inputValue}
    />
  </label>
  <form class="mb-5 flex flex-wrap gap-1">
    {#each classFilters as c}
      <input
        class="btn inset-shadow-base-content hover:inset-shadow-sm/30 checked:text-base-content checked:bg-base-300 checked:border-base-content/50 outline-base-content checked:shadow-base-content text-base capitalize shadow-none !transition-all"
        type="checkbox"
        name="class"
        aria-label={c}
        value={c}
        bind:group={selectedClasses}
      />
    {/each}

    <input
      class="btn btn-square inset-shadow-base-content hover:inset-shadow-sm/30 text-base !transition-all"
      type="reset"
      value="×"
      onclick={() => (selectedClasses = [])}
    />
  </form>

  <form class="mb-6 flex flex-wrap gap-1">
    {#each levelFilters as l}
      <input
        class="btn inset-shadow-base-content hover:inset-shadow-sm/30 checked:text-base-content checked:bg-base-300 checked:border-base-content/50 outline-base-content checked:shadow-base-content text-base capitalize shadow-none !transition-all"
        type="checkbox"
        name="level"
        aria-label={levelFilterLabels[l]}
        value={l}
        bind:group={selectedLevels}
      />
    {/each}

    <input
      class="btn btn-square inset-shadow-base-content hover:inset-shadow-sm/30 text-base !transition-all"
      type="reset"
      value="×"
      onclick={() => (selectedLevels = [])}
    />
  </form>

  {#if searchResult && searchResult.items.length > 0}
    {#each searchResult.items as spell, i}
      <SpellItem
        {spell}
        index={i + 1 + searchResult.pageSize * (searchResult.pageNumber - 1)}
        isSaved={isSaved(spell.slug)}
        onToggle={() => toggleSpell(spell.slug)}
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
      <Skull class="h-23 text-base-content/70 mb-5 aspect-square" />
      <h3 class="mb-2 text-2xl font-bold">Згадок немає...</h3>
      <p class="text-base-content-500 text-center">
        Можливо, варто створити власні чари?
      </p>
    </div>
  {/if}
</div>
