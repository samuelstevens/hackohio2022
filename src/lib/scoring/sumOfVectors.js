//Returns the difference between the sum of arm vectors from 1 and 2
function sumOfArmVectors(data1, data2) {

  var positions1 = data1[0].keypoints;
  var positions2 = data2[0].keypoints;

  //The vector between the shoulder and the elbow on the left side
  var vectorLeft1 = {y: positions1[9].y - positions1[5].y, x: positions1[9].x - positions1[5].x};
  //The vector between the shoulder and the elbow on the left side
  var vectorLeft2 = {y: positions2[9].y - positions2[5].y, x: positions2[9].x - positions2[5].x};

  //The vector between the shoulder and the elbow on the right side
  var vectorRight1 = {y: positions1[10].y - positions1[6].y, x: positions1[10].x - positions1[6].x};
  //The vector between the shoulder and the elbow on the right side
  var vectorRight2 = {y: positions2[10].y - positions2[6].y, x: positions2[10].x - positions2[6].x};

  return Math.abs(vectorLeft2.x - vectorLeft1.x) + Math.abs(vectorLeft2.y - vectorLeft1.y) + Math.abs(vectorRight2.x - vectorRight1.x) + Math.abs(vectorRight2.y - vectorRight1.y);
}
