<script lang="ts">
  import type { SpellSlim } from '$lib/types';
  import Markdown from './Markdown.svelte';
  import SaveButton from './SaveButton.svelte';
  import { romanize } from '$lib/numbers';

  interface Props {
    spell: SpellSlim;
    index: number;
    isSaved: boolean;
    onToggle: () => void;
    class?: string;
    style?: string;
  }

  let {
    spell,
    index,
    isSaved,
    onToggle,
    class: className = '',
    style = '',
  }: Props = $props();
</script>

<div
  class="list-row md:pr-12-12 relative mb-5 flex items-start bg-base-100 pl-10 transition-all hover:scale-105 hover:shadow-xl md:items-center md:gap-10 {className}"
  {style}
>
  <a
    href={`/spells/${spell.slug}`}
    class="flex flex-1 flex-col-reverse items-center gap-2 no-underline md:flex-row md:gap-10"
  >
    <div
      class="flex flex-col-reverse items-center justify-center gap-3 md:flex-row md:gap-0"
    >
      <div class="text-xl font-bold whitespace-nowrap md:w-30 md:text-3xl">
        {romanize(index)}
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
          class="mt-2 mb-3 pr-13 text-3xl font-bold first-letter:mr-0.5 first-letter:inline-block first-letter:align-text-bottom first-letter:text-4xl/1 first-letter:leading-none first-letter:font-extrabold"
        >
          {spell.title_ua}
          <div
            class="small-caps mt-4 text-xl font-normal text-base-content-500 md:mt-0 md:ml-1 md:inline md:text-2xl"
          >
            "{spell.title}"
          </div>
        </h3>
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
            Матеріали: <Markdown text={spell.materialDescription} inline />
          </div>
        {/if}
      </div>
    </div>
  </a>
  <div class="absolute top-4 right-4 md:relative md:top-auto md:right-auto">
    <SaveButton {isSaved} {onToggle} />
  </div>
</div>
