<script lang="ts">
	import { marked } from 'marked';
	let { text, class: className = '' } = $props();
</script>

<div class={`${className}`}>
	{@html marked.parseInline(text)}
</div>
