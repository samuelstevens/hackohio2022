import calculateScore from './euclidean.js';
import { simpleCosine, scaledCosine } from './cosine.js';
import shoulderAndArmAngle from './armAngle.js';

export default { euclideanScore: calculateScore, simpleCosineScore: simpleCosine, scaledCosineScore: scaledCosine, armAngleScore: shoulderAndArmAngle };
