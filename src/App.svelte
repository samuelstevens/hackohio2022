<script>
  import { onMount } from "svelte";
  import "@tensorflow/tfjs-backend-webgl";

  import CanvasTracker from "./lib/CanvasTracker.svelte";
  import Animator from "./lib/Animator.svelte";
  import Countdown from "./lib/Countdown.svelte";
  import scoring from "./lib/scoring";

  let animator = null;

  let video = null;
  let videoPose = null;
  let liveStream = null;
  let livePost = null;
  let frame = null;
  let score = "Waiting...";

  let gamePlaying = false;
  let countdown = null;

  // Start/stop
  const startGame = () => {
    countdown.start(() => {
      frame = requestAnimationFrame(renderFrame);
      gamePlaying = true;
    });
  };

  const stopGame = () => {
    if (frame) {
      cancelAnimationFrame(frame);
    }
    gamePlaying = false;
  };

  // Scoring
  const scoreInterval = 100;
  const scores = [];

  const getScore = (filePoses, webcamPoses) => {
    if (filePoses.length < 1 || webcamPoses.length < 1) {
      return 0;
    }
    
    // Between 0 and 0.3, and bigger is bad
    const armScore = Math.min(scoring.armAngleScore(filePoses[0], webcamPoses[0]), 0.3);
    return scoring.euclideanScore(filePoses[0], webcamPoses[0], 0.3) + armScore;
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
    scores.push(score);

    //Sets the value of pointScores to color points differently when they are inncorrect.
    for (var i = 0; i < webcamVideo.poses[0].keypoints.length; i++) {
      webcamVideo.pointScores[webcamVideo.poses[0].keypoints[i].name] =
        webcamVideo.poses[0].keypoints[i].pointsLost;
    }

    setTimeout(() => {
      frame = requestAnimationFrame(renderFrame);
    }, scoreInterval);
  };

  // Feedback
  const feedbackInterval = 1500;

  const sendFeedback = () => {
    if (!gamePlaying) {
      return;
    }

    if (!animator) {
      return;
    }

    // Measure average score in the feedback interval
    const count = feedbackInterval / scoreInterval;
    const relevantScores = scores.slice(-count);
    const meanScore = relevantScores.reduce((x, iter) => x + iter, 0) / count;

    console.log(relevantScores, meanScore, count);

    if (meanScore > 0.9) {
      animator.perfect();
    } else if (meanScore > 0.7) {
      animator.great();
    } else if (meanScore > 0.5) {
      animator.good();
    } else {
      animator.bad();
    }
  };

  const feedback = setInterval(sendFeedback, feedbackInterval);

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
  <Animator bind:this={animator} />
  <h1>Just Dance - TikTok Edition</h1>
  <Countdown bind:this={countdown} />
  {#if gamePlaying}
    <button on:click={stopGame}>Pause</button>
  {:else}
    <button on:click={startGame}>Play!</button>
  {/if}
  <!-- <h1>{score}</h1> -->
  <div class="grid">
    <div class="col">
      <CanvasTracker bind:this={fileVideo} mirror={false} />
      <div id="top-bar">
        <form on:change|preventDefault={uploadVideoFile}>
          <label for="videofile">Upload a video file:</label>
          <input
            type="file"
            id="videofile"
            name="video"
            accept="video/*"
            bind:this={inputElem}
          />
        </form>
      </div>
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
