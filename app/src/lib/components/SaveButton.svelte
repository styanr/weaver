<script lang="ts">
  import { Bookmark } from 'lucide-svelte';

  type Props = {
    isSaved: boolean;
    onToggle: () => void;
    class?: string;
    text?: string;
  };

  let {
    isSaved,
    onToggle,
    class: className = '',
    text = undefined,
  }: Props = $props();
</script>

<button
  class="group btn {text === undefined
    ? 'btn-circle'
    : 'w-fit'} inset-shadow-base-content btn-xl hover:inset-shadow-sm/30 active:scale-95 {className}"
  onclick={onToggle}
>
  <div
    class="flex items-center justify-center gap-2 text-base-content transition-all group-hover:scale-110 group-active:scale-125"
  >
    <Bookmark
      class="inline"
      fill={isSaved ? 'currentColor' : 'none'}
      stroke-width={isSaved ? 0 : 1.5}
    />
    {text}
  </div>
</button>
