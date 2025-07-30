<script lang="ts">
	import { marked } from 'marked';
	let { text } = $props();
</script>

{@html marked.parseInline(text)}
