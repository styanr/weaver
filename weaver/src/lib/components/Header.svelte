<script lang="ts">
	let { title, subtitle, class: className = '' } = $props();
</script>

<div class={className}>
	<div class="mb-2 text-6xl font-bold uppercase">{title}</div>
	<div class="small-caps text-2xl italic opacity-80">{subtitle}</div>
</div>
