//How precise data needs to be to be used.
const CONFIDENCE_THRESHOLD = 0.4;

//Temporary data for a body.
var bodyData = [
    {
        score: 0.8,
        keypoints: [
            {y: 79.37763447358087, x: 282.42109968893686, score: 0.4897552728652954, name: 'nose'},
            {y: 74.8012841293788,  x: 286.37913054372376, score: 0.554169774055481, name: 'left_eye'},
            {y: 76.67783884734514, x: 276.31823991465717, score: 0.5381338596343994, name: 'right_eye'},
            {y: 82.71008071796648, x: 291.7507290740249, score: 0.5319395661354065, name: 'left_ear'},
            {y: 84.3875831440308,  x: 268.0027845523339, score: 0.6024881601333618, name: 'right_ear'},
            {y: 111.0706194015126, x: 301.7022607177872, score: 0.6993788480758667, name: 'left_shoulder'},
            {y: 107.5334994955785, x: 261.9614188271163, score: 0.6527363657951355, name: 'right_shoulder'},
            {y: 64.94704526075834, x: 275.2876402084451, score: 0.4353308081626892, name: 'left_elbow'},
            {y: 61.76235353322281, x: 266.3217864207071, score: 0.7228572368621826, name: 'right_elbow'},
            {y: 19.58639504386151, x: 276.9242045910399, score: 0.3493035137653351, name: 'left_wrist'},
            {y: 20.065897561861004, x: 263.3782069880797, score: 0.6414788365364075, name: 'right_wrist'},
            {y: 195.99362098361414, x: 288.6542487138115, score: 0.7138060927391052, name: 'left_hip'},
            {y: 194.41350095400992, x: 260.92728210346485, score: 0.7555018663406372, name: 'right_hip'},
            {y: 255.1457567522157,  x: 322.1315454435462, score: 0.652517557144165, name: 'left_knee'},
            {y: 280.31746278675297, x: 267.39789809133975, score: 0.5394347310066223, name: 'right_knee'},
            {y: 333.13854557470864, x: 303.6694117372567, score: 0.5617702007293701, name: 'left_ankle'},
            {y: 343.38029553823685, x: 275.8554959505204, score: 0.44105827808380127, name: 'right_ankle'}                            
        ]
    }
];

//Returns the distance given between two points. (Applies the distance formula). 
//Parameters are arrays of size 2.
function _distanceBetweenPoints(point1, point2){
    return Math.sqrt(Math.pow(point2.x-point1.x, 2) + Math.pow(point2.y-point1.y, 2));
}

//Will adjust all points so that (0, 0) is located at the center of the torso.
function centerTorso(data){
    //Extracting the points from the data structure.
    var points = data[0].keypoints;

    //Finds the position of the center of the torso.
    var deltaX = (points[5].x + points[6].x + points[11].x + points[12].x)/4;
    var deltaY = (points[5].y + points[6].y + points[11].y + points[12].y)/4;

    //Translates all points by the position of the center of the torso.
    for (var point of points){
        point.x -= deltaX;
        point.y -= deltaY;
    }

    return points;
}

//Calculates a score between 0(worst) and 1(best) based on how close the points are.
//If two points are within the 'closeEnoughThreshold' then no points will be lost.
//If a points accuracy score is under the ignorePointThreshold it will be ignored in calculations.
function calculateScore(data1, data2, closeEnoughThreshold, ignorePointThreshold){
    //The score that will be returned.
    var finalScore = 1;

    //Extracting the points from the data structure.
    var positions1 = data1[0].keypoints;
    var positions2 = data2[0].keypoints;

    //Comparing the proximitey of every point.
    for(var i=0; i<positions1.length; i++){

        //If both points are above the accuracy score threshold.
        if(Math.min(positions1[i].score, positions2[i].score) > ignorePointThreshold){
            var distance = _distanceBetweenPoints(positions1[i], positions2[i]);

            //And the distance is outside the closeEnough threshold.
            if(distance > closeEnoughThreshold){
                //Score is deducted based on how far away the points are.
                console.log(positions1[i].name + ": lost points!");
            }
        }
    }

    return finalScore;
}

console.log(centerTorso(bodyData));