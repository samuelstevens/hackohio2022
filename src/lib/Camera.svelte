<script>
  import { onMount } from 'svelte';
  import * as poseDetection from '@tensorflow-models/pose-detection';

  const white = "#ffffff";
  
  let video = null;
  let canvas = null;
  let ctx = null;
  let model = null;
  let detector = null;

  const bindVideo = async () => {
    if (!video) {
      throw new Error('video does not exist!');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve();
      };
    });

    video.play();
    
  }

  const bindCanvas = async () => {
    if (!canvas) {
      throw new Error('Canvas does not exist!');
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx = canvas.getContext('2d');
  }

  const loadModel = async () => {
    model = poseDetection.SupportedModels.MoveNet;
    detector = await poseDetection.createDetector(model);
  }

  const animate = async () => {
    const poses = await detector.estimatePoses(video);

    drawFrame(poses);
    
    // TODO: add a stop using cancelAnimationFrame
    requestAnimationFrame(animate)
  }

  const drawFrame = (poses) => {
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    poses.forEach(drawPose);
  }

  const drawPose = (pose) => {
    if (pose.keypoints) { 
      drawKeypoints(pose.keypoints);
      // drawSkeleton(pose.keypoints);
    }
  }

  const drawKeypoints = (keypoints, color = white, lineWidth = 3) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    keypoints.forEach(drawKeypoint)
  }

  const drawKeypoint = (keypoint) => {
    let score = 1;
    if (keypoint.score) {
      score = keypoint.score;
    }
    
    // TODO: make configurable
    const threshold = 0.4;
    const radius = 3;

    if (score > threshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, radius, 0, 2 * Math.PI);
      ctx.fill(circle);
      ctx.stroke(circle);
    }
  }



  onMount(async () => {
    try {
      await bindVideo();
      await bindCanvas();
      await loadModel();
      animate();
    } catch (error) {
      console.log(error);
    }
  });

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
}
</style>
