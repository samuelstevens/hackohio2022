<script>
  import { onMount } from "svelte";
  import "@tensorflow/tfjs-backend-webgl";

  import CanvasTracker from "./lib/CanvasTracker.svelte";
  // import Animation from "./lib/Animation.svelte";
  import scoring from "./lib/scoring";

  let animator = null;

  let video = null;
  let videoPose = null;
  let liveStream = null;
  let livePost = null;
  let gamePlaying = false;
  let frame = null;
  let score = "Waiting...";

  const startGame = () => {
    frame = requestAnimationFrame(renderFrame);
    gamePlaying = true;
  };

  const stopGame = () => {
    if (frame) {
      cancelAnimationFrame(frame);
    }
    gamePlaying = false;
  };

  const getScore = (filePoses, webcamPoses) => {
    if (filePoses.length < 1 || webcamPoses.length < 1) {
      return 0;
    }

    return scoring.euclideanScore(filePoses[0], webcamPoses[0], 0.3);
    // return scoring.armAngleScore(filePoses[0], webcamPoses[0], 0.5, 0.3);
  };

  const renderFrame = () => {
    if (!webcamVideo.poses) {
      throw new Error("No webcam");
    }

    if (!fileVideo.poses) {
      throw new Error("No file");
    }

    if (!gamePlaying) {
      return;
    }

    const webcamPoses = webcamVideo.poses;
    const filePoses = fileVideo.poses;

    score = getScore(filePoses, webcamPoses);

    setTimeout(() => {
      frame = requestAnimationFrame(renderFrame);
    }, 10);
  };

  let webcamVideo = null;
  const initWebcam = async () => {
    if (!webcamVideo) {
      throw new Error("Webcam does not exist!");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });
    webcamVideo.video.srcObject = stream;
    await new Promise((resolve) => {
      webcamVideo.video.onloadedmetadata = () => {
        resolve();
      };
    });

    await webcamVideo.updatedVideo();
  };

  let fileVideo = null;
  let inputElem = null;

  const uploadVideoFile = async (event) => {
    if (!fileVideo) {
      throw new Error("Webcam does not exist!");
    }

    fileVideo.video.src = URL.createObjectURL(inputElem.files[0]);

    // Wait for video to be loaded.
    fileVideo.video.load();
    await new Promise((resolve) => {
      fileVideo.video.onloadeddata = () => {
        resolve(video);
      };
    });

    fileVideo.video.loop = true;

    await fileVideo.updatedVideo();
  };

  // Lifecycle Methods
  onMount(async () => {
    try {
      await initWebcam();
    } catch (error) {
      console.log(error);
    }
  });
</script>

<main>
  <h1>Just Dance - TikTok Edition</h1>
  {#if gamePlaying}
    <button on:click={stopGame}>Pause</button>
  {:else}
    <button on:click={startGame}>Play!</button>
  {/if}
  <h2>{score}</h2>
  <!-- <Animation bind:this={animator} /> -->
  <!-- <button on:click={animator.fire}>Fire</button> -->
  <div class="grid">
    <div class="col">
      <div id="top-bar">
        <form on:submit|preventDefault={uploadVideoFile}>
          <label for="videofile">Upload a video file:</label>
          <input
            type="file"
            id="videofile"
            name="video"
            accept="video/*"
            bind:this={inputElem}
          />
          <button id="submit">Play</button>
        </form>
      </div>
      <CanvasTracker bind:this={fileVideo} />
    </div>
    <div class="col">
      <CanvasTracker bind:this={webcamVideo} />
    </div>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
