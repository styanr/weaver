<script lang="ts">
  import { marked } from 'marked';
  let { text, inline = false, class: className = '' } = $props();
  marked.setOptions({ breaks: true, gfm: true });
</script>

<div class={`inline ${className}`}>
  {#if inline}
    {@html marked.parseInline(text)}
  {:else}
    {@html marked.parse(text)}
  {/if}
</div>
