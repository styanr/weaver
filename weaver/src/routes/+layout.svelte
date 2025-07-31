<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="relative m-auto flex w-[70rem] flex-col items-center p-5 font-garamond">
	{@render children()}
</div>
