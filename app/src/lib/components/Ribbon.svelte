<script lang="ts">
  let { class: className = '' } = $props();
</script>

<div class={`group text-base-content   ${className}`}>
  <div
    class={`h-2 w-[40px]  bg-current transition-all group-hover:h-10 group-active:h-10`}
  ></div>
  <div class="relative h-fit">
    <div
      aria-hidden="true"
      class="absolute -translate-y-2 opacity-60 transition-all group-hover:translate-0 group-active:translate-0"
    >
      <svg
        width={40}
        viewBox="419 153 22 30"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <g
          id="Page-1"
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <g id="Icon-Set-Filled" fill="currentColor">
            <path
              d="M437,153 L423,153 C420.791,153 419,154.791 419,157 L419,179 C419,181.209 420.791,183 423,183 L430,176 L437,183 C439.209,183 441,181.209 441,179 L441,157 C441,154.791 439.209,153 437,153"
              id="bookmark"
            >
            </path>
          </g>
        </g>
      </svg>
    </div>
    <div class="-translate-y-2">
      <svg
        width={40}
        viewBox="419 153 22 30"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        class="group-active::drop-shadow-2xl transition-all group-hover:drop-shadow-2xl"
      >
        <g
          id="Page-1"
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <g id="Icon-Set-Filled" fill="currentColor">
            <path
              d="M437,153 L423,153 C420.791,153 419,154.791 419,157 L419,179 C419,181.209 420.791,183 423,183 L430,176 L437,183 C439.209,183 441,181.209 441,179 L441,157 C441,154.791 439.209,153 437,153"
              id="bookmark"
            >
            </path>
          </g>
        </g>
      </svg>
    </div>
  </div>
</div>
