function _distanceBetweenPoints(point1, point2) {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
}

//Returns the difference in length between lines from data sets 1 and 2
function lengthOfLines(data1, data2) {
  var positions1 = data1[0].keypoints;
  var positions2 = data2[0].keypoints;

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

  return leftArmDifference + rightArmDifference + shoulderDifference;
}
