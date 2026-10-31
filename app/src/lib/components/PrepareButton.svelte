<script lang="ts">
  import { Star } from 'lucide-svelte';

  type Props = {
    isPrepared: boolean;
    disabled?: boolean;
    onToggle?: () => void;
  };

  let { isPrepared, disabled = false, onToggle }: Props = $props();
</script>

<button
  class="group btn btn-circle btn-xl inset-shadow-base-content hover:inset-shadow-sm/30 active:scale-95"
  title={disabled ? 'Завжди підготовлені' : 'Підготувати чари'}
  aria-label={disabled ? 'Завжди підготовлені' : 'Підготувати чари'}
  aria-pressed={isPrepared}
  {disabled}
  onclick={onToggle}
>
  <div
    class="flex items-center justify-center text-base-content transition-all group-hover:scale-110 group-active:scale-125"
  >
    <Star
      class="inline"
      fill={isPrepared ? 'currentColor' : 'none'}
      stroke-width={isPrepared ? 0 : 1.5}
    />
  </div>
</button>
