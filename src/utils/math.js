/**
 * Math utilities for homography transformation
 * Used to map screen coordinates to world coordinates and vice versa
 */

/**
 * Solve a system of linear equations Ax = b using Gaussian elimination
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Right-hand side vector
 * @returns {number[]} - Solution vector x
 */
export function solveLinearSystem(A, b) {
  const n = A.length;
  
  // Create augmented matrix [A|b]
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-10) {
      throw new Error('Singular matrix - cannot solve system');
    }
    
    // Eliminate column
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }
  
  return x;
}

/**
 * Calculate the 3x3 homography matrix from 4 point correspondences
 * Maps from screen space (src) to normalized world space (dst)
 * @param {Array<{x: number, y: number}>} srcPoints - 4 source points [TL, TR, BR, BL]
 * @param {Array<{x: number, y: number}>} dstPoints - 4 destination points (default: unit square)
 * @returns {number[][]} - 3x3 homography matrix
 */
export function calculateHomography(srcPoints, dstPoints = null) {
  // Default destination is unit square [0,0], [1,0], [1,1], [0,1]
  if (!dstPoints) {
    dstPoints = [
      { x: 0, y: 0 }, // Top-left
      { x: 1, y: 0 }, // Top-right
      { x: 1, y: 1 }, // Bottom-right
      { x: 0, y: 1 }  // Bottom-left
    ];
  }
  
  // Build the system of equations
  // For each point correspondence, we get 2 equations
  const A = [];
  const b = [];
  
  for (let i = 0; i < 4; i++) {
    const src = srcPoints[i];
    const dst = dstPoints[i];
    
    // First equation (x coordinate)
    A.push([
      src.x, src.y, 1, 0, 0, 0, -dst.x * src.x, -dst.x * src.y
    ]);
    b.push(dst.x);
    
    // Second equation (y coordinate)
    A.push([
      0, 0, 0, src.x, src.y, 1, -dst.y * src.x, -dst.y * src.y
    ]);
    b.push(dst.y);
  }
  
  // Solve for the 8 unknowns
  const h = solveLinearSystem(A, b);
  
  // Construct the 3x3 matrix (h9 = 1)
  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], 1]
  ];
}

/**
 * Invert a 3x3 matrix
 * @param {number[][]} m - 3x3 matrix
 * @returns {number[][]} - Inverted 3x3 matrix
 */
export function matrixInvert(m) {
  const det = 
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  
  if (Math.abs(det) < 1e-10) {
    throw new Error('Matrix is not invertible (determinant is zero)');
  }
  
  const invDet = 1 / det;
  
  return [
    [
      invDet * (m[1][1] * m[2][2] - m[1][2] * m[2][1]),
      invDet * (m[0][2] * m[2][1] - m[0][1] * m[2][2]),
      invDet * (m[0][1] * m[1][2] - m[0][2] * m[1][1])
    ],
    [
      invDet * (m[1][2] * m[2][0] - m[1][0] * m[2][2]),
      invDet * (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
      invDet * (m[0][2] * m[1][0] - m[0][0] * m[1][2])
    ],
    [
      invDet * (m[1][0] * m[2][1] - m[1][1] * m[2][0]),
      invDet * (m[0][1] * m[2][0] - m[0][0] * m[2][1]),
      invDet * (m[0][0] * m[1][1] - m[0][1] * m[1][0])
    ]
  ];
}

/**
 * Transform a point using a homography matrix
 * @param {number[][]} H - 3x3 homography matrix
 * @param {{x: number, y: number}} point - Point to transform
 * @returns {{x: number, y: number}} - Transformed point
 */
export function transformPoint(H, point) {
  const x = H[0][0] * point.x + H[0][1] * point.y + H[0][2];
  const y = H[1][0] * point.x + H[1][1] * point.y + H[1][2];
  const w = H[2][0] * point.x + H[2][1] * point.y + H[2][2];
  
  return {
    x: x / w,
    y: y / w
  };
}

/**
 * Transform a point from screen space to world space
 * @param {number[][]} H - Homography matrix (screen to world)
 * @param {{x: number, y: number}} screenPoint - Point in screen coordinates
 * @returns {{x: number, y: number}} - Point in world coordinates
 */
export function screenToWorld(H, screenPoint) {
  return transformPoint(H, screenPoint);
}

/**
 * Transform a point from world space to screen space
 * @param {number[][]} H - Homography matrix (screen to world)
 * @param {{x: number, y: number}} worldPoint - Point in world coordinates
 * @returns {{x: number, y: number}} - Point in screen coordinates
 */
export function worldToScreen(H, worldPoint) {
  const HInv = matrixInvert(H);
  return transformPoint(HInv, worldPoint);
}

/**
 * Check if an attacker is offside
 * @param {number} attackerX - Attacker's X position in world space
 * @param {number} defenderX - Defender's X position in world space
 * @param {'left'|'right'} attackDirection - Direction of attack
 * @returns {boolean} - True if offside
 */
export function isOffside(attackerX, defenderX, attackDirection) {
  if (attackDirection === 'right') {
    // Attacking right: offside if attacker is further right than defender
    return attackerX > defenderX;
  } else {
    // Attacking left: offside if attacker is further left than defender
    return attackerX < defenderX;
  }
}

