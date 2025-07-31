<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="relative flex flex-col items-center p-5">
	{@render children()}
</div>
