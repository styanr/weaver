<script lang="ts">
  const {
    pageSize,
    currentPage,
    totalCount,
    onChange,
    class: className = '',
  } = $props();
  let previousPage = $derived(currentPage - 1);
  let nextPage = $derived(currentPage + 1);

  let hasPrevious = $derived(previousPage > 0);
  let hasNext = $derived(currentPage < Math.ceil(totalCount / pageSize));
</script>

<div class={`${className} grid grid-cols-3`}>
  {#if hasPrevious}
    <div class="col-start-1">
      <button
        class="btn w-fit text-xl btn-soft"
        onclick={() => onChange(previousPage)}
      >
        {previousPage}
      </button>
    </div>
  {/if}
  <div class="col-start-2 text-center">
    {currentPage}
  </div>
  {#if hasNext}
    <div class="col-start-3 flex flex-row justify-end">
      <button
        class="btn w-fit text-xl btn-soft"
        onclick={() => onChange(nextPage)}
      >
        {nextPage}
      </button>
    </div>
  {/if}
</div>
