//How precise data needs to be to be used.
const CONFIDENCE_THRESHOLD = 0.3;

//Determines how much the score will decrease with errors. Lower numbers make harsher scoring.
const SCORE_HARSHNESS = 10;

//How much more/less each point will count twoards the final score.
const WEIGHT = [
  0.5, 0.5, 0.5, 0.5, 0.5, 1.5, 1.5, 2, 2, 1.5, 1.5, 1, 1, 1, 1, 1, 1,
];

//Returns the distance given between two points. (Applies the distance formula).
function _distanceBetweenPoints(point1, point2) {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
}

//Will adjust all points in data so that the torso has a height equal to 1
function _normalize(data) {
  //Extracting the points from the data structure.
  var positions = data[0].keypoints;

  //Finding the scale factor.
  var scale =
    1 /
    ((positions[11].y + positions[12].y) / 2 -
      (positions[5].y + positions[6].y) / 2);

  //Scaling the model by the previously found scale factor.
  for (var point of positions) {
    point.x *= scale;
    point.y *= scale;
  }

  //Reconstructing and returning the data.
  data[0].keypoints = positions;

  return data;
}

//Will adjust all points so that (0, 0) is located at the center of the torso.
function _centerTorso(data) {
  //Extracting the points from the data structure.
  var points = data[0].keypoints;

  //Finds the position of the center of the torso.
  var deltaX = (points[5].x + points[6].x + points[11].x + points[12].x) / 4;
  var deltaY = (points[5].y + points[6].y + points[11].y + points[12].y) / 4;

  //Translates all points by the position of the center of the torso.
  for (var point of points) {
    point.x -= deltaX;
    point.y -= deltaY;
  }

  //Reconstructing and returning the data.
  data[0].keypoints = points;
  return data;
}

//Calculates a score between 0(worst) and 1(best) based on how close the points are.
//If two points are within the 'closeEnoughThreshold' then no points will be lost.
//If a points accuracy score is under the ignorePointThreshold it will be ignored in calculations.
function calculateScore(
  data1,
  data2,
  closeEnoughThreshold,
  ignorePointThreshold
) {
  //The score that will be returned.
  var finalScore = 1;

  //Centering the models.
  data1 = _centerTorso(data1);
  data2 = _centerTorso(data2);

  //Scaling the models.
  data1 = _normalize(data1);
  data2 = _normalize(data2);

  //Extracting the points from the data structure.
  var positions1 = data1[0].keypoints;
  var positions2 = data2[0].keypoints;

  //Comparing the proximitey of every point.
  for (var i = 0; i < positions1.length; i++) {
    //If both points are above the accuracy score threshold.
    if (
      Math.min(positions1[i].score, positions2[i].score) > ignorePointThreshold
    ) {
      var distance = _distanceBetweenPoints(positions1[i], positions2[i]);

      //And the distance is outside the closeEnough threshold.
      if (distance > closeEnoughThreshold) {
        console.log(WEIGHT[i]);
        //Score is deducted based on how far away the points are.
        finalScore -= (distance * WEIGHT[i]) / SCORE_HARSHNESS;
      }
    }
  }

  //Getting a value of [0, 1] for final score and returning it.
  finalScore = Math.max(0, finalScore);
  return finalScore;
}
