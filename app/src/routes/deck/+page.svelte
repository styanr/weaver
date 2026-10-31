<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import RibbonLink from '$lib/components/RibbonLink.svelte';
  import { addDeck, replaceWithDeck } from '$lib/spellStorage.svelte.js';
  import type { SpellSlim } from '$lib/types';

  const { data } = $props();

  let saved = $state(false);
  let confirmingReplace = $state(false);

  const title = $derived(data.deck.name || 'Колода чарів');

  // Only spells the database knows about, so a stale link can't save broken slugs.
  const deck = $derived.by(() => {
    const known = new Set(data.spells.map((spell: SpellSlim) => spell.slug));
    return {
      ...data.deck,
      spells: data.deck.spells.filter((slug) => known.has(slug)),
      alwaysPrepared: data.deck.alwaysPrepared.filter((slug) =>
        known.has(slug)
      ),
    };
  });

  const levels = $derived(
    [...new Set(data.spells.map((spell: SpellSlim) => spell.level))].sort(
      (a, b) => a - b
    )
  );

  const spellsOfLevel = (level: number) =>
    data.spells
      .filter((spell: SpellSlim) => spell.level === level)
      .sort((a: SpellSlim, b: SpellSlim) =>
        a.title_ua.localeCompare(b.title_ua)
      );

  const onAdd = () => {
    addDeck(deck);
    saved = true;
  };

  const onReplace = () => {
    if (!confirmingReplace) {
      confirmingReplace = true;
      return;
    }
    replaceWithDeck(deck);
    confirmingReplace = false;
    saved = true;
  };
</script>

<svelte:head>
  <title>{title} · Weaver</title>
  <meta property="og:title" content="{title} · Weaver" />
</svelte:head>

<RibbonLink
  href="/spells/saved"
  title="Ґримуар"
  position="right"
  class="absolute -top-0 right-5"
/>

<div class="relative mt-10 w-full py-6 md:mt-0">
  <Header
    {title}
    subtitle="Колода чарів"
    class="mb-8 flex w-full flex-col items-center justify-center"
  />

  {#if data.spells.length === 0}
    <p class="text-center">Ця колода порожня.</p>
  {:else}
    {#each levels as level}
      <section class="mb-6">
        <h2 class="mb-2 text-2xl font-bold md:text-3xl">
          {level === 0 ? 'Замовляння' : `${level}-й рівень`}
        </h2>
        <ul class="list-inside list-disc">
          {#each spellsOfLevel(level) as spell}
            <li>
              <a class="link" href={`/spells/${spell.slug}`}>{spell.title_ua}</a
              >
              {#if data.deck.alwaysPrepared.includes(spell.slug)}
                <span class="text-lg italic">(завжди підготовлені)</span>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/each}

    {#if saved}
      <p class="mb-4 text-center" role="status">Колоду збережено.</p>
      <div class="flex justify-center">
        <a
          href="/spells/saved"
          class="btn inset-shadow-base-content hover:inset-shadow-sm/30"
        >
          Відкрити Ґримуар
        </a>
      </div>
    {:else}
      <div class="flex flex-wrap justify-center gap-4">
        <button
          class="btn btn-xl inset-shadow-base-content hover:inset-shadow-sm/30"
          onclick={onAdd}
        >
          Додати до Ґримуара
        </button>
        <button
          class="btn btn-xl inset-shadow-base-content hover:inset-shadow-sm/30"
          onclick={onReplace}
        >
          {confirmingReplace ? 'Точно замінити все?' : 'Замінити Ґримуар'}
        </button>
      </div>
    {/if}
  {/if}
</div>
