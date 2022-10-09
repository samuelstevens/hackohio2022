<svelte:options accessors={true} />

<script>
  import { onMount } from "svelte";
  import * as poseDetection from "@tensorflow-models/pose-detection";

  // Constants
  const white = "#ffffff";
  const red = "#FF0000";
  const threshold = 0.4;
  const paddingY = 60;
  const paddingX = 10;

  // HTML elements
  // We need to export video even though it's not a prop
  // because we are accessing it from a parent context.
  export let video = null;
  let canvas = null;
  let ctx = null;

  // Pose estimation models
  let model = null;
  let detector = null;
  export let poses = [];

  //Used to determine when points are incorrect so that they can be drawn in a different color.
  export const pointScores = {};

  // For drawing
  export let mirror = true;
  let ratio = 1;
  let scaledWidth = 1;
  let offsetX = 0;

  let frame = null;

  const loadModel = async () => {
    model = poseDetection.SupportedModels.MoveNet;
    detector = await poseDetection.createDetector(model);
  };

  const setCanvas = async () => {
    if (!canvas) {
      throw new Error("Canvas does not exist!");
    }

    if (!video) {
      throw new Error("Video does not exist!");
    }

    const maxHeight = window.innerHeight - canvas.offsetTop - paddingY;

    canvas.width = window.innerWidth / 2 - paddingX;
    canvas.height = maxHeight;

    ratio = canvas.height / video.videoHeight;
    scaledWidth = ratio * video.videoWidth;
    offsetX = (canvas.width - scaledWidth) / 2;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  export const updatedVideo = async () => {
    if (!video) {
      return;
    }

    video.play();

    // If we have a valid video element, we can set up the canvas and pose tracking.
    await setCanvas();
    if (frame) {
      cancelAnimationFrame(frame);
    }
    animate();
  };

  onMount(async () => {
    try {
      await loadModel();
    } catch (error) {
      console.log(error);
    }
  });

  const animate = async () => {
    if (detector) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      poses = await detector.estimatePoses(video, { maxPoses: 1 });
      drawFrame(poses);
    }

    frame = requestAnimationFrame(animate);
  };

  const drawFrame = (poses) => {
    ctx.drawImage(video, offsetX, 0, scaledWidth, canvas.height);

    poses.forEach(drawPose);
  };

  /* region Pose Drawing */

  const drawPose = (pose) => {
    if (pose.keypoints) {
      drawKeypoints(pose.keypoints);
      drawSkeleton(pose.keypoints);
    }
  };

  const drawKeypoints = (keypoints) => {

    keypoints.forEach(drawKeypoint);
  };

  const drawKeypoint = (keypoint) => {

    //The values of color and radius when correct.
    var radius = 3;
    var color = white;

    //If the given point has a score attached to it, use the score to determine color.
    if(pointScores[keypoint.name] != null){
      if(pointScores[keypoint.name] > 0){
        //The values of color and radius when incorrect.
        color = red;
        radius += 5;
      }
    }

    ctx.lineWidth = 3;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    let score = 1;
    if (keypoint.score) {
      score = keypoint.score;
    }

    // TODO: make configurable

    if (score > threshold) {
      const circle = new Path2D();
      circle.arc(
        keypoint.x * ratio + offsetX,
        keypoint.y * ratio,
        radius,
        0,
        2 * Math.PI
      );
      ctx.fill(circle);
      ctx.stroke(circle);
    }
  };

  const drawSkeleton = (keypoints, color = white, lineWidth = 3) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    poseDetection.util.getAdjacentPairs(model).forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      // If score is null, just show the keypoint.
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;

      if (score1 >= threshold && score2 >= threshold) {
        ctx.beginPath();
        ctx.moveTo(kp1.x * ratio + offsetX, kp1.y * ratio);
        ctx.lineTo(kp2.x * ratio + offsetX, kp2.y * ratio);
        ctx.stroke();
      }
    });
  };
  /* endregion */
</script>

<div>
  {#if mirror}
    <canvas bind:this={canvas} style=" transform: scaleX(-1);"/>
  {:else}
    <canvas bind:this={canvas} />
  {/if}
  <video bind:this={video} />
</div>

<style>
  /*canvas {
    transform: scaleX(-1);
  }*/
  video {
    visibility: hidden;
    height: 0;
  }
</style>
