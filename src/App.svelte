<script>
  import { onMount } from "svelte";
  import "@tensorflow/tfjs-backend-webgl";

  import CanvasTracker from "./lib/CanvasTracker.svelte";
  import Animator from "./lib/Animator.svelte";
  import Countdown from "./lib/Countdown.svelte";
  import scoring from "./lib/scoring";

  const productionUrl = "";

  let animator = null;

  let video = null;
  let videoPose = null;
  let liveStream = null;
  let livePost = null;
  let frame = null;
  let score = "Waiting...";

  let instructions = true;

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

    // Reset dots to white on pause
    for (var i = 0; i < webcamVideo.poses[0].keypoints.length; i++) {
      webcamVideo.pointScores[webcamVideo.poses[0].keypoints[i].name] = 0;
    }
  };

  // Scoring
  const scoreInterval = 100;
  const scores = [];

  const getScore = (filePoses, webcamPoses) => {
    if (filePoses.length < 1 || webcamPoses.length < 1) {
      return 0;
    }

    // Between 0 and 0.3, and bigger is bad
    const armScore = scoring.armAngleScore(filePoses[0], webcamPoses[0]);
    const euclideanScore = scoring.euclideanScore(
      filePoses[0],
      webcamPoses[0],
      0.3
    );
    console.log(armScore, euclideanScore);
    return euclideanScore;
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

  const percentile = (data, percent) => {
    data.sort();
    const i = Math.round(data.length * 0.9);
    return data[i];
  };

  const sendFeedback = () => {
    if (!gamePlaying) {
      return;
    }

    if (!animator) {
      return;
    }

    // Measure average score in the feedback interval
    const count = feedbackInterval / scoreInterval;
    const relevantScores = scores.slice(-count / 3);
    const bestScore = Math.max(...relevantScores);
    const meanScore =
      relevantScores.reduce((x, iter) => x + iter, 0) / (count / 3);

    // const finalScore = percentile(relevantScores, 90);
    const finalScore = meanScore;

    console.log(relevantScores, finalScore, bestScore, meanScore, count);

    if (finalScore > 0.8) {
      animator.perfect();
    } else if (finalScore > 0.6) {
      animator.great();
    } else if (finalScore > 0.4) {
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
  let selectElem = null;

  const uploadVideoFile = async (event) => {
    if (!fileVideo) {
      throw new Error("Webcam does not exist!");
    }

    stopGame();

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

  const chooseVideoFile = async (event) => {
    if (!fileVideo) {
      throw new Error("Webcam does not exist!");
    }

    if (!event || !event.target || !event.target.value) {
      return;
    }

    const url = `${productionUrl}/${event.target.value}.mp4`;

    console.log(url);

    stopGame();

    fileVideo.video.src = url;

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
  <div>
    {#if instructions}
      <button
        on:click={() => {
          instructions = false;
        }}>Hide Instructions</button
      >
    {:else}
      <button
        on:click={() => {
          instructions = true;
        }}>Show Instructions</button
      >
    {/if}
    {#if gamePlaying}
      <button on:click={stopGame}>Pause</button>
    {:else}
      <button on:click={startGame}>Play!</button>
    {/if}
  </div>
  {#if instructions}
    Try to match your dance moves to the video!
    <ol>
      <li>
        Choose a video, either from your computer or from the example list
      </li>
      <li>Press Play to start the game!</li>
      <li>
        If something doesn't work, refresh the page and try again. It's a
        hackathon project!
      </li>
    </ol>
  {/if}
  <!-- <h1>{score}</h1> -->
  <div class="grid">
    <div class="col">
      <CanvasTracker bind:this={fileVideo} />
      <div id="top-bar">
        <form>
          <p>
            <label for="examples">Choose an example:</label>
            <select id="examples" on:change|preventDefault={chooseVideoFile}>
              <option value="">Choose a video</option>
              <option value="savage-love">Savage Love</option>
              <option value="savage-love-grandma">Savage Love (Grandma)</option>
              <option value="shower">Shower - Becky G</option>
              <option value="say-so">Say So (Zootopia)</option>
            </select>
          </p>
          <p>
            <label for="videofile">Upload a video file:</label>
            <input
              type="file"
              id="videofile"
              name="video"
              accept="video/*"
              bind:this={inputElem}
              on:change|preventDefault={uploadVideoFile}
            />
          </p>
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
