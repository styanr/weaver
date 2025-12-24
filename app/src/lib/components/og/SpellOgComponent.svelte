<script lang="ts">
  import type { Component, Spell } from '$lib/types';
  import logo from '$lib/assets/img/skull.svg?inline'

  interface Props {
    spell: Spell;
  }

  let { spell }: Props = $props();

  const componentsToUkrainian = (components: Set<Component>) => {
    const lookup = {
      somatic: 'соматична',
      verbal: 'вербальна',
      material: 'матеріальна',
    };
    return Array.from(components).map((c) => lookup[c]);
  };

  const descriptionSnippet = $derived(spell.description.length > 220 
    ? spell.description.substring(0, 220) + '...' 
    : spell.description);
</script>

<div id="ogcard" class="flex w-full h-full flex-col bg-[#fff7ed] p-12 text-[#291334]">
  <div class="absolute right-12 top-10 flex items-center opacity-80">
    <span class="text-xl font-bold tracking-wider">weaver</span>
  </div>

    <div class="h-full flex flex-col justify-between">
    <div class="flex flex-col">
      <h1 class={`${spell.title_ua.length > 15 ? 'text-6xl' : 'text-7xl'} font-bold uppercase my-0 py-0 mb-3`}>
        {spell.title_ua}
      </h1>
      <h2 class="text-5xl italic opacity-60 my-0 py-0 mb-2" style="font-family: 'Alegreya SC'">
          {spell.title}
        </h2>
    </div>

<div class="w-150 flex flex-col">
  <div class="flex justify-between py-3 border-b border-[#291334]/10 items-center">
    <div class="flex-4 text-left font-medium tracking-wide opacity-75 text-xl" style="font-family: 'Alegreya SC'">
      Час створення
    </div>
    <div class="flex-6 text-left text-xl">{spell.casting_time}</div>
  </div>
  
  <div class="flex justify-between py-3 border-b border-[#291334]/10 items-center">
    <div class="flex-4 text-left font-medium tracking-wide opacity-75 text-xl" style="font-family: 'Alegreya SC'">
      Відстань
    </div>
    <div class="flex-6 text-left text-xl">{spell.distance}</div>
  </div>
  
  <div class="flex justify-between py-3 border-b border-[#291334]/10 items-center">
    <div class="flex-4 text-left font-medium tracking-wide opacity-75 text-xl" style="font-family: 'Alegreya SC'">
      Складові
    </div>
    <div class="flex-6 text-left text-xl">{componentsToUkrainian(spell.components).join(', ')}</div>
  </div>
  
  <div class="flex justify-between py-3 border-b border-[#291334]/10 items-center">
    <div class="flex-4 text-left font-medium tracking-wide opacity-75 text-xl" style="font-family: 'Alegreya SC'">
      Тривалість
    </div>
    <div class="flex-6 text-left text-xl">{spell.duration}</div>
  </div>
</div>
  <div class="mb-1 flex flex-col italic opacity-80">
    <span class="text-4xl flex flex-row mb-3">
      <div class="mr-2 font-bold">{spell.level === 0 ? 'Замовляння' : `${spell.level} рівень`}</div>·<div class="ml-1 capitalize italic">{spell.classes.join(', ')}</div>
    </span>
    <span class="mt-1 text-2xl capitalize opacity-75 font-bold" style="font-family: 'Alegreya SC'">
    Школа {spell.school}
    </span>
  </div>
</div>

<!-- svelte-ignore a11y_missing_attribute -->
<img src={logo} class="absolute -right-70 -bottom-60 h-200 text-white"/>
</div>


<style>
#ogcard {
    font-family: 'EB Garamond';
}
</style>