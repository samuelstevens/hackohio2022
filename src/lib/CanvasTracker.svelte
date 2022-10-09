<svelte:options accessors={true} />

<script>
  import { onMount } from "svelte";
  import * as poseDetection from "@tensorflow-models/pose-detection";

  // Constants
  const white = "#ffffff";
  const threshold = 0.4;

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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

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
      poses = await detector.estimatePoses(video, { maxPoses: 1 });
      drawFrame(poses);
    }

    frame = requestAnimationFrame(animate);
  };

  const drawFrame = (poses) => {
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    poses.forEach(drawPose);
  };

  /* region Pose Drawing */

  const drawPose = (pose) => {
    if (pose.keypoints) {
      drawKeypoints(pose.keypoints);
      drawSkeleton(pose.keypoints);
    }
  };

  const drawKeypoints = (keypoints, color = white, lineWidth = 3) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    keypoints.forEach(drawKeypoint);
  };

  const drawKeypoint = (keypoint) => {
    let score = 1;
    if (keypoint.score) {
      score = keypoint.score;
    }

    // TODO: make configurable
    const radius = 3;

    if (score > threshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, radius, 0, 2 * Math.PI);
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
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });
  };
  /* endregion */
</script>

<div>
  <canvas bind:this={canvas} />
  <video bind:this={video} />
</div>

<style>
  canvas {
    transform: scaleX(-1);
  }
  video {
    visibility: hidden;
    height: 0;
  }
</style>
