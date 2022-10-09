<script>
  import Feedback from "./animate/Feedback.svelte";
  import perfectSplash from "./animate/perfect-splash.png";
  import greatSplash from "./animate/great-splash.png";
  import goodSplash from "./animate/good-splash.png";
  import badSplash from "./animate/ok-splash.png";

  const duration = 500;
  let _perfect = false;
  let _great = false;
  let _good = false;
  let _bad = false;

  export const perfect = () => {
    _perfect = true;
    setTimeout(() => (_perfect = false), duration);
  };

  export const great = () => {
    _great = true;
    setTimeout(() => (_great = false), duration);
  };

  export const good = () => {
    _good = true;
    setTimeout(() => (_good = false), duration);
  };

  export const bad = () => {
    _bad = true;
    setTimeout(() => (_bad = false), duration);
  };
</script>

<Feedback visible={_perfect} splash={perfectSplash} />
<Feedback visible={_great} splash={greatSplash} />
<Feedback visible={_good} splash={goodSplash} />
<Feedback visible={_bad} splash={badSplash} />
