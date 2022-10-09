import calculateScore from './euclidean.js';
import { simpleCosine, scaledCosine } from './cosine.js';

export default { euclideanScore: calculateScore, simpleCosineScore: simpleCosine, scaledCosineScore: scaledCosine };
