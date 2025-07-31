<script lang="ts">
	import Ribbon from './Ribbon.svelte';

	type Props = {
		href: string;
		title: string;
		position?: 'left' | 'right';
		class?: string;
	};

	let { href, title, position = 'left', class: className = '' }: Props = $props();
</script>

<a
	{href}
	class="group z-50 flex flex-row items-center justify-start gap-x-6 transition-all {className}"
>
	{#if position === 'left'}
		<Ribbon class="" />
		<div
			class="small-caps text-2xl italic opacity-70 transition-all duration-300 group-hover:opacity-70 md:opacity-0"
		>
			{title}
		</div>
	{:else}
		<div
			class="small-caps text-2xl italic opacity-70 transition-all duration-300 group-hover:opacity-70 md:opacity-0"
		>
			{title}
		</div>
		<Ribbon class="" />
	{/if}
</a>
