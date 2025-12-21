<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Markdown from '$lib/components/Markdown.svelte';
  import type { PageProps } from './$types';
  import type { Component } from '$lib/types';
  import RibbonLink from '$lib/components/RibbonLink.svelte';
  import SaveButton from '$lib/components/SaveButton.svelte';
  import { isSaved, toggleSpell } from '$lib/spellStorage.svelte';
  let { data }: PageProps = $props();
  let spell = data.spell;

  const componentsToUkrainian = (components: Set<Component>) => {
    const lookup = {
      somatic: 'соматична',
      verbal: 'вербальна',
      material: 'матеріальна',
    };

    return components
      .values()
      .map((c) => lookup[c])
      .toArray();
  };
</script>

<svelte:head>
  <title>{spell.title_ua} · Weaver</title>
</svelte:head>

<RibbonLink
  href="/spells"
  title="Зміст"
  position="left"
  class="absolute -top-0 left-5"
/>

<RibbonLink
  href="/spells/saved"
  title="Ґримуар"
  position="right"
  class="absolute -top-0 right-5"
/>

<SaveButton
  isSaved={isSaved(spell.slug)}
  onToggle={() => toggleSpell(spell.slug)}
  class="border-base-content/20 shadow-xl/30 shadow-base-content fixed bottom-0 right-5 mb-6 p-7 md:hidden"
/>
<div class="pb-15 mx-auto mt-10 py-6 md:pb-0">
  <div class="flex w-full justify-center">
    <div
      class="relative mb-8 flex w-fit flex-col justify-center gap-10 md:flex-row"
    >
      <Header
        title={`${spell.title_ua}`}
        subtitle={spell.title}
        class="flex w-fit flex-col items-center justify-center"
      />
      <SaveButton
        isSaved={isSaved(spell.slug)}
        onToggle={() => toggleSpell(spell.slug)}
        class="absolute -right-20 -top-0 hidden md:block"
      />
    </div>
  </div>
  <div class="text-base-content/75 mb-6 text-center italic">
    <span class="font-bold">
      {spell.level === 0 ? 'Замовляння' : `${spell.level} рівень`} ·
    </span>
    <span class="capitalize">
      {#each spell.classes as casterClass, i}
        {casterClass}{i < spell.classes.length - 1 ? ', ' : ''}
      {/each}
    </span>
  </div>

  <div class="mb-8 flex items-center justify-center">
    <div class="bg-base-content/20 h-px flex-1"></div>
    <div class="text-base-content/40 mx-4 select-none">⁂</div>
    <div class="bg-base-content/20 h-px flex-1"></div>
  </div>

  <table class="m-auto mb-8 w-[80%] border-collapse">
    <tbody>
      <tr class="border-base-content/10 border-b">
        <th
          class="small-caps py-3 pr-8 text-left font-medium tracking-wide opacity-75"
          >Школа</th
        >
        <td class="py-3 text-left">{spell.school}</td>
      </tr>
      <tr class="border-base-content/10 border-b">
        <th
          class="small-caps py-3 pr-8 text-left font-medium tracking-wide opacity-75"
          >Час створення</th
        >
        <td class="py-3 text-left">{spell.casting_time}</td>
      </tr>
      <tr class="border-base-content/10 border-b">
        <th
          class="small-caps py-3 pr-8 text-left font-medium tracking-wide opacity-75"
          >Відстань</th
        >
        <td class="py-3 text-left">{spell.distance}</td>
      </tr>
      <tr class="border-base-content/10 border-b">
        <th
          class="small-caps py-3 pr-8 text-left font-medium tracking-wide opacity-75"
          >Складові</th
        >
        <td class="py-3 text-left"
          >{componentsToUkrainian(spell.components).join(', ')}</td
        >
      </tr>
      <tr>
        <th
          class="small-caps py-3 pr-8 text-left font-medium tracking-wide opacity-75"
          >Тривалість</th
        >
        <td class="py-3 text-left">{spell.duration}</td>
      </tr>
    </tbody>
  </table>

  {#if spell.materialDescription}
    <div class="mb-4 mt-8 flex items-center justify-center">
      <div class="bg-base-content/15 h-px flex-1"></div>
      <div
        class="small-caps text-base-content/50 mx-4 text-base tracking-widest"
      >
        Матеріали
      </div>
      <div class="bg-base-content/15 h-px flex-1"></div>
    </div>
    <div class="mb-6 text-center">
      <Markdown
        text={spell.materialDescription}
        class="text-base-content/80 inline italic"
      />
    </div>
  {/if}

  <div class="leading-relaxed">
    <Markdown
      text={spell.description}
      class="prose max-w-none text-justify !text-2xl"
    />
  </div>
</div>
