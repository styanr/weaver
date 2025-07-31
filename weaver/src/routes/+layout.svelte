<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div
	class="relative m-auto flex max-w-4xl flex-col items-center p-5 font-garamond text-xl md:text-2xl"
>
	{@render children()}
</div>
