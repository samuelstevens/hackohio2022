<script>
  import '@tensorflow/tfjs-backend-webgl';
  import Camera from './lib/Camera.svelte';
  
  let video = null;
  let videoPose = null;
  let liveStream = null;
  let livePost = null;
  let gamePlaying = false;

  const playGame = () => {
    gamePlaying = true;
  }

  const stopGame = () => {
    gamePlaying = false;
  }
</script>

<main>
  <h1>Just Dance - TikTok Edition</h1>
  <div>
    <div id="video">
      
    </div>
    <Camera />
  </div>

</main>

<style>
</style>
