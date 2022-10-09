const poseToVec = (pose) => {
  return pose.keypoints.map((keypoint) => [keypoint.x, keypoint.y]).flat();
};

const dot = (A, B) => {
  return A.map((a, i) => a * B[i]).reduce((sum, x) => sum + x, 0);
};

const norm = (A) => {
  return Math.sqrt(A.map((a) => a * a).reduce((sum, x) => sum + x, 0));
};

const simpleCosine = (refPose, pose) => {
  const refVec = poseToVec(refPose);
  const vec = poseToVec(pose);

  return dot(refVec, vec) / norm(refVec) / norm(vec);
};

const scaledCosine = (refPose, pose) => {
  const cosine = simpleCosine(refPose, pose);
  const min = 0.85;
  const max = 1.0;

  return (cosine - min) * (max / (max - min));
};

export { simpleCosine, scaledCosine };
