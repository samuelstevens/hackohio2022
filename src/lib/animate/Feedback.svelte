<script>
  import { fade } from "svelte/transition";
  import { backOut } from "svelte/easing";

  export let splash;
  export let visible = false;
  export let duration = 100;

  const pop = (node, { duration, x, y }) => {
    return {
      duration: duration,
      css: (t) => {
        const eased = backOut(t);

        return `
          transform: scale(${eased}) translate(${(eased - 1) * x}px, ${
          (eased - 1) * y
        }px);
        `;
      },
    };
  };
</script>

{#if visible}
  <div
    in:pop={{ duration: duration, x: 300, y: 0 }}
    out:pop={{ duration: 100, x: 300, y: 0 }}
  >
    <img src={splash} />
  </div>
{/if}

<style>
  div {
    position: absolute;
    z-index: 1;
    width: 40%;
  }

  img {
    width: 100%;
  }
</style>
