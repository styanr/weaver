<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import RibbonLink from '$lib/components/RibbonLink.svelte';
  import SpellItem from '$lib/components/SpellItem.svelte';
  import { ChevronDown } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { SpellSlim } from '$lib/types.js';
  import {
    clearUpStorage,
    isSaved,
    toggleSpell,
  } from '$lib/spellStorage.svelte.js';

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
      grouped[Number(level)].sort((a, b) =>
        a.title_ua.localeCompare(b.title_ua)
      );
    });

    return grouped;
  });

  $effect(() => {
    if (data.savedSpellsResult) {
      isLoading = true;
      lastError = null;

      const handleResult = (result: SavedSpellsResult) => {
        savedSpellsResult = result;
        clearUpStorage(result.items.map((i) => i.slug));
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

<svelte:head>
  <title>Ґримуар · Weaver</title>
</svelte:head>

<RibbonLink
  href="/spells"
  title="Зміст"
  position="right"
  class="absolute -top-0 right-5"
/>

<div class="list relative mt-10 w-full py-6 text-2xl md:mt-0">
  <Header
    title="Ґримуар"
    subtitle="Grimoire Arcanis"
    class="mb-8 flex w-full flex-col items-center justify-center"
  />

  {#if isLoading}
    <div
      class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
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
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
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
              <h2 class="text-2xl font-bold md:text-3xl">
                {getLevelTitle(level)}
              </h2>
              <span class="badge text-lg opacity-70 badge-neutral md:badge-xl"
                >{getSpellCountInLevel(level)}</span
              >
            </div>
            <div
              class="transition-transform duration-200"
              class:rotate-180={!isCollapsed}
            >
              <ChevronDown class="h-6 w-6" />
            </div>
          </button>

          {#if !isCollapsed}
            <div
              class="mt-4 space-y-5"
              transition:slide={{ duration: 300, easing: quintOut }}
            >
              {#each spells as spell, spellIndex}
                <SpellItem
                  {spell}
                  index={getSpellIndexInLevel(spell, level)}
                  isSaved={isSaved(spell.slug)}
                  onToggle={() => toggleSpell(spell.slug)}
                  class="animate-fade-in"
                  style="animation-delay: {spellIndex * 50}ms"
                />
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    {:else}
      <div class="flex flex-col items-center justify-center py-16">
        <svg
          class="mb-4 h-16 w-16 opacity-50"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M17 3H7C5.9 3 5 3.9 5 5V19L12 16L19 19V5C19 3.9 18.1 3 17 3M17 15L12 13L7 15V5H17V15Z"
          />
        </svg>
        <h3 class="mb-2 text-2xl font-bold">У Ґримуарі порожньо...</h3>
        <p class="text-center text-base-content-500">
          Потрібно вивчити більше заклинань
        </p>
        <a
          href="/spells"
          class="btn mt-4 inset-shadow-base-content hover:inset-shadow-sm/30"
        >
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
