<script lang="ts">
	let { title, subtitle, class: className = '' } = $props();
</script>

<div class={className}>
	<div class="mb-2 text-4xl font-bold uppercase md:text-6xl">{title}</div>
	<div class="small-caps text-2xl text-base-content/60 italic">{subtitle}</div>
</div>
