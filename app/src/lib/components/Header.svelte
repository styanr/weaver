<script lang="ts">
  let { title, subtitle, class: className = '' } = $props();
</script>

<div class={className}>
  <div class="mb-2 text-center text-4xl font-bold uppercase md:text-6xl">
    {title}
  </div>
  <div class="small-caps text-base-content/60 text-2xl italic">{subtitle}</div>
</div>
