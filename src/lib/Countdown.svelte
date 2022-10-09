<script>
  let totalSeconds = 3;
  let toGo = totalSeconds;
  let visible = false;
  let intervalId = null;

  export const start = (onEnd) => {
    toGo = totalSeconds;
    intervalId = setInterval(() => {
      if (toGo > 0) {
        toGo--;
        visible = true;
      } else {
        clearInterval(intervalId);
        onEnd();
      }
    }, 1000);
  };

  const grow = (node, { duration }) => {
    return {
      duration: duration,
      css: (t) => {
        const eased = t;

        return `
          transform: scale(${1 - eased});
        `;
      },
    };
  };
</script>

{#if visible}
<h1 in:grow="{{ duration: 800 }}" on:introend="{() => visible = false}">{toGo + 1}</h1>
{/if}

<style>
h1 {
  top: 100px;
  position: absolute;
  font-size: 256px;
  font-weight: bold;
  z-index: 1;
}
</style>
