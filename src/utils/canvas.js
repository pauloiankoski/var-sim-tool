/**
 * Canvas utility functions
 */

/**
 * Calculate optimal canvas scale to fit 75% of viewport
 * @param {number} imgWidth - Original image width
 * @param {number} imgHeight - Original image height
 * @returns {number} - Scale factor
 */
export function calculateCanvasScale(imgWidth, imgHeight) {
  if (!imgWidth || !imgHeight) return 1;

  // Use 75% of viewport dimensions
  const maxWidth = window.innerWidth * 0.75;
  const maxHeight = window.innerHeight * 0.75;

  const scaleX = maxWidth / imgWidth;
  const scaleY = maxHeight / imgHeight;
  
  // Use the smaller scale to ensure it fits, but don't scale up beyond original size
  return Math.min(scaleX, scaleY, 1);
}

/**
 * Draw perspective-aware 3-axis lines at a point
 * Used for marking player positions with proper depth perception
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {{x: number, y: number}} point - Point in screen coordinates
 * @param {Array<{x: number, y: number}>} calibrationPoints - Pitch calibration points [TL, TR, BR, BL]
 * @param {number} scale - Canvas scale factor
 * @param {string} color - Line color
 */
export function drawPerspectiveAxes(ctx, point, calibrationPoints, scale, color) {
  const x = point.x * scale;
  const y = point.y * scale;

  // Scale calibration points
  const scaledCalib = calibrationPoints.map(p => ({
    x: p.x * scale,
    y: p.y * scale
  }));

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Calculate perspective lines based on pitch geometry
  // X-axis: Horizontal line parallel to pitch width (left-right)
  // Y-axis: Vertical line (up-down in image space)
  // Z-axis: Line following pitch depth perspective (toward goal)

  // 1. X-AXIS (Horizontal - parallel to pitch width)
  // Interpolate between left and right edges at the current Y position
  const leftEdge = interpolateEdge(scaledCalib[0], scaledCalib[3], y); // TL to BL
  const rightEdge = interpolateEdge(scaledCalib[1], scaledCalib[2], y); // TR to BR
  
  if (leftEdge && rightEdge) {
    ctx.beginPath();
    ctx.moveTo(leftEdge.x, y);
    ctx.lineTo(rightEdge.x, y);
    ctx.stroke();
  }

  // 2. Y-AXIS (Vertical line in image space - straight up/down)
  const yAxisLength = 100;
  ctx.beginPath();
  ctx.moveTo(x, y - yAxisLength);
  ctx.lineTo(x, y + yAxisLength);
  ctx.stroke();

  // 3. Z-AXIS (Depth - following pitch perspective toward goal)
  // Interpolate between top and bottom edges at the current X position
  const topEdge = interpolateEdge(scaledCalib[0], scaledCalib[1], x, true); // TL to TR
  const bottomEdge = interpolateEdge(scaledCalib[3], scaledCalib[2], x, true); // BL to BR
  
  if (topEdge && bottomEdge) {
    ctx.beginPath();
    ctx.moveTo(x, topEdge.y);
    ctx.lineTo(x, bottomEdge.y);
    ctx.stroke();
  }

  // Draw center point
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Draw outer circle
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Interpolate a point on an edge at a given coordinate
 * @param {{x: number, y: number}} p1 - Start point
 * @param {{x: number, y: number}} p2 - End point
 * @param {number} coord - Coordinate value (y for vertical edges, x for horizontal edges)
 * @param {boolean} isHorizontal - Whether interpolating along horizontal edge
 * @returns {{x: number, y: number}|null} - Interpolated point
 */
function interpolateEdge(p1, p2, coord, isHorizontal = false) {
  if (isHorizontal) {
    // Interpolate along horizontal edge (varying Y based on X)
    if (p1.x === p2.x) return null; // Vertical line, can't interpolate
    const t = (coord - p1.x) / (p2.x - p1.x);
    if (t < 0 || t > 1) return null; // Outside edge bounds
    return {
      x: coord,
      y: p1.y + t * (p2.y - p1.y)
    };
  } else {
    // Interpolate along vertical edge (varying X based on Y)
    if (p1.y === p2.y) return null; // Horizontal line, can't interpolate
    const t = (coord - p1.y) / (p2.y - p1.y);
    if (t < 0 || t > 1) return null; // Outside edge bounds
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: coord
    };
  }
}

