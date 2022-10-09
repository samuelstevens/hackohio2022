//Returns the distance given between two points. (Applies the distance formula).
//Parameters are arrays of size 2.
function _distanceBetweenPoints(point1, point2) {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
}

//Will adjust all points in data so that the torso is equal to length 1
function _normalize(data) {
  //Extracting the points from the data structure.
  var positions = data.keypoints;

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
  data.keypoints = positions;

  return data;
}

//Will adjust all points so that (0, 0) is located at the center of the torso.
function _centerTorso(data) {
  //Extracting the points from the data structure.
  var points = data.keypoints;

  //Finds the position of the center of the torso.
  var deltaX = (points[5].x + points[6].x + points[11].x + points[12].x) / 4;
  var deltaY = (points[5].y + points[6].y + points[11].y + points[12].y) / 4;

  //Translates all points by the position of the center of the torso.
  for (var point of points) {
    point.x -= deltaX;
    point.y -= deltaY;
  }

  data.keypoints = points;

  return data;
}

//Returns the difference between arm angle 1 and 2
export default function shoulderAndArmAngle(data1, data2) {
  //Centering the models.
  data1 = _centerTorso(data1);
  data2 = _centerTorso(data2);

  //Scaling the models.
  data1 = _normalize(data1);
  data2 = _normalize(data2);
  var positions1 = data1.keypoints;
  var positions2 = data2.keypoints;

  //The vector between the shoulder and the elbow on the left side
  var vectorALeft1 = {
    y: positions1[7].y - positions1[5].y,
    x: positions1[7].x - positions1[5].x,
  };
  //The vector between the elbow and the hand on the left side
  var vectorBLeft1 = {
    y: positions1[9].y - positions1[7].y,
    x: positions1[9].x - positions1[7].x,
  };

  //The vector between the shoulder and the elbow on the left side
  var vectorALeft2 = {
    y: positions2[7].y - positions2[5].y,
    x: positions2[7].x - positions2[5].x,
  };
  //The vector between the elbow and the hand on the left side
  var vectorBLeft2 = {
    y: positions2[9].y - positions2[7].y,
    x: positions2[9].x - positions2[7].x,
  };

  //The vector between the shoulder and the elbow on the right side
  var vectorARight1 = {
    y: positions1[8].y - positions1[6].y,
    x: positions1[8].x - positions1[6].x,
  };
  //The vector between the elbow and the hand on the right side
  var vectorBRight1 = {
    y: positions1[10].y - positions1[8].y,
    x: positions1[10].x - positions1[8].x,
  };

  //The vector between the shoulder and the elbow on the right side
  var vectorARight2 = {
    y: positions2[8].y - positions2[6].y,
    x: positions2[8].x - positions2[6].x,
  };
  //The vector between the elbow and the hand on the right side
  var vectorBRight2 = {
    y: positions2[10].y - positions2[8].y,
    x: positions2[10].x - positions2[8].x,
  };

  //The angle at the elbow on the left side
  var leftAngle1;
  if (
    vectorALeft1.x * vectorBLeft1.x + vectorALeft1.y * vectorBLeft1.y >
    Math.PI
  ) {
    leftAngle1 = Math.acos(
      Math.PI -
        (vectorALeft1.x * vectorBLeft1.x + vectorALeft1.y * vectorBLeft1.y) /
          (_distanceBetweenPoints(positions1[7], positions1[5]) *
            _distanceBetweenPoints(positions1[9], positions1[7]))
    );
  } else {
    var leftAngle1 = Math.acos(
      (vectorALeft1.x * vectorBLeft1.x + vectorALeft1.y * vectorBLeft1.y) /
        (_distanceBetweenPoints(positions1[7], positions1[5]) *
          _distanceBetweenPoints(positions1[9], positions1[7]))
    );
  }
  //The angle at the elbow on the left side
  var leftAngle2;
  if (
    vectorALeft2.x * vectorBLeft2.x + vectorALeft2.y * vectorBLeft2.y >
    Math.PI
  ) {
    leftAngle2 = Math.acos(
      Math.PI -
        (vectorALeft2.x * vectorBLeft2.x + vectorALeft2.y * vectorBLeft2.y) /
          (_distanceBetweenPoints(positions2[7], positions2[5]) *
            _distanceBetweenPoints(positions2[9], positions2[7]))
    );
  } else {
    leftAngle2 = Math.acos(
      (vectorALeft2.x * vectorBLeft2.x + vectorALeft2.y * vectorBLeft2.y) /
        (_distanceBetweenPoints(positions2[7], positions2[5]) *
          _distanceBetweenPoints(positions2[9], positions2[7]))
    );
  }
  //The angle at the elbow on the right side
  var rightAngle1;
  if (
    vectorARight1.x * vectorBRight1.x + vectorARight1.y * vectorBRight1.y >
    Math.PI
  ) {
    rightAngle1 = Math.acos(
      Math.PI -
        (vectorARight1.x * vectorBRight1.x +
          vectorARight1.y * vectorBRight1.y) /
          (_distanceBetweenPoints(positions1[7], positions1[5]) *
            _distanceBetweenPoints(positions1[9], positions1[7]))
    );
  } else {
    rightAngle1 = Math.acos(
      (vectorARight1.x * vectorBRight1.x + vectorARight1.y * vectorBRight1.y) /
        (_distanceBetweenPoints(positions1[7], positions1[5]) *
          _distanceBetweenPoints(positions1[9], positions1[7]))
    );
  }
  //The angle at the elbow on the right side
  var rightAngle2;
  if (
    vectorARight2.x * vectorBRight2.x + vectorARight2.y * vectorBRight2.y >
    Math.PI
  ) {
    rightAngle2 = Math.acos(
      Math.PI -
        (vectorARight2.x * vectorBRight2.x +
          vectorARight2.y * vectorBRight2.y) /
          (_distanceBetweenPoints(positions2[7], positions2[5]) *
            _distanceBetweenPoints(positions2[9], positions2[7]))
    );
  } else {
    rightAngle2 = Math.acos(
      (vectorARight2.x * vectorBRight2.x + vectorARight2.y * vectorBRight2.y) /
        (_distanceBetweenPoints(positions2[7], positions2[5]) *
          _distanceBetweenPoints(positions2[9], positions2[7]))
    );
  }

  var leftArmDifference = Math.abs(
    _distanceBetweenPoints(positions1[9], positions1[7]) +
      _distanceBetweenPoints(positions1[7], positions1[5]) -
      (_distanceBetweenPoints(positions2[9], positions2[7]) +
        _distanceBetweenPoints(positions2[7], positions2[5]))
  );
  var rightArmDifference = Math.abs(
    _distanceBetweenPoints(positions1[10], positions1[8]) +
      _distanceBetweenPoints(positions1[8], positions1[6]) -
      (_distanceBetweenPoints(positions2[10], positions2[8]) +
        _distanceBetweenPoints(positions2[8], positions2[6]))
  );
  var shoulderDifference = Math.abs(
    _distanceBetweenPoints(positions1[5], positions1[6]) -
      _distanceBetweenPoints(positions2[5], positions2[6])
  );

  //The vector between the shoulder and the elbow on the left side
  var vectorLeft1 = {
    y: positions1[9].y - positions1[5].y,
    x: positions1[9].x - positions1[5].x,
  };
  //The vector between the shoulder and the elbow on the left side
  var vectorLeft2 = {
    y: positions2[9].y - positions2[5].y,
    x: positions2[9].x - positions2[5].x,
  };

  //The vector between the shoulder and the elbow on the right side
  var vectorRight1 = {
    y: positions1[10].y - positions1[6].y,
    x: positions1[10].x - positions1[6].x,
  };
  //The vector between the shoulder and the elbow on the right side
  var vectorRight2 = {
    y: positions2[10].y - positions2[6].y,
    x: positions2[10].x - positions2[6].x,
  };

  var res = 0;
  if (
    !Number.isNaN(leftArmDifference + rightArmDifference + shoulderDifference)
  ) {
    res += leftArmDifference + rightArmDifference + shoulderDifference;
  }
  if (
    !Number.isNaN(
      Math.abs(vectorLeft2.x - vectorLeft1.x) +
        Math.abs(vectorLeft2.y - vectorLeft1.y) +
        Math.abs(vectorRight2.x - vectorRight1.x) +
        Math.abs(vectorRight2.y - vectorRight1.y)
    )
  ) {
    res +=
      Math.abs(vectorLeft2.x - vectorLeft1.x) +
      Math.abs(vectorLeft2.y - vectorLeft1.y) +
      Math.abs(vectorRight2.x - vectorRight1.x) +
      Math.abs(vectorRight2.y - vectorRight1.y);
  }
  //if (!Number.isNaN(Math.abs(leftAngle2 - leftAngle1) + Math.abs(rightAngle2 - rightAngle1))) {
  //var res = (Math.abs(leftAngle2 - leftAngle1) + Math.abs(rightAngle2 - rightAngle1));
  //}
  //  if (res < 0.3) {
  //  return 0;
  //}
  //else {
  return res / 10;
  //}
}
