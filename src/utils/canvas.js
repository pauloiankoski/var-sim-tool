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
  const x = point.x;
  const y = point.y;

  // Calibration points in original coordinates [TL, TR, BR, BL]
  const [tl, tr, br, bl] = calibrationPoints;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Find the parametric position (u, v) of the point within the quadrilateral
  // This gives us the "world space" position on the pitch (0-1 range)
  const uv = findQuadPosition(point, calibrationPoints);
  
  if (uv) {
    const { u, v } = uv;

    // 1. X-AXIS (Width - parallel to pitch width at constant depth v)
    // Draw line from left edge to right edge at the same depth (v)
    const leftPoint = bilinearInterpolate(tl, tr, br, bl, 0, v);
    const rightPoint = bilinearInterpolate(tl, tr, br, bl, 1, v);
    
    ctx.beginPath();
    ctx.moveTo(leftPoint.x * scale, leftPoint.y * scale);
    ctx.lineTo(rightPoint.x * scale, rightPoint.y * scale);
    ctx.stroke();

    // 2. Z-AXIS (Depth - parallel to pitch depth at constant width u)
    // Draw line from top edge to bottom edge at the same width (u)
    const topPoint = bilinearInterpolate(tl, tr, br, bl, u, 0);
    const bottomPoint = bilinearInterpolate(tl, tr, br, bl, u, 1);
    
    ctx.beginPath();
    ctx.moveTo(topPoint.x * scale, topPoint.y * scale);
    ctx.lineTo(bottomPoint.x * scale, bottomPoint.y * scale);
    ctx.stroke();

    // 3. Y-AXIS (Height - vertical line in image space)
    // This represents height above the pitch, so it's perpendicular to the image
    const yAxisLength = 100;
    ctx.beginPath();
    ctx.moveTo(x * scale, (y - yAxisLength / scale) * scale);
    ctx.lineTo(x * scale, (y + yAxisLength / scale) * scale);
    ctx.stroke();
  }

  // Draw center point
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x * scale, y * scale, 5, 0, Math.PI * 2);
  ctx.fill();

  // Draw outer circle
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x * scale, y * scale, 15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Bilinear interpolation within a quadrilateral
 * @param {{x: number, y: number}} tl - Top-left corner
 * @param {{x: number, y: number}} tr - Top-right corner
 * @param {{x: number, y: number}} br - Bottom-right corner
 * @param {{x: number, y: number}} bl - Bottom-left corner
 * @param {number} u - Horizontal parameter (0 = left, 1 = right)
 * @param {number} v - Vertical parameter (0 = top, 1 = bottom)
 * @returns {{x: number, y: number}} - Interpolated point
 */
function bilinearInterpolate(tl, tr, br, bl, u, v) {
  // Interpolate along top edge
  const top = {
    x: tl.x + u * (tr.x - tl.x),
    y: tl.y + u * (tr.y - tl.y)
  };
  
  // Interpolate along bottom edge
  const bottom = {
    x: bl.x + u * (br.x - bl.x),
    y: bl.y + u * (br.y - bl.y)
  };
  
  // Interpolate between top and bottom
  return {
    x: top.x + v * (bottom.x - top.x),
    y: top.y + v * (bottom.y - top.y)
  };
}

/**
 * Find the parametric position (u, v) of a point within a quadrilateral
 * Uses iterative method to find the best fit
 * @param {{x: number, y: number}} point - Point to locate
 * @param {Array<{x: number, y: number}>} quad - Quadrilateral corners [TL, TR, BR, BL]
 * @returns {{u: number, v: number}|null} - Parametric coordinates or null if not found
 */
function findQuadPosition(point, quad) {
  const [tl, tr, br, bl] = quad;
  
  // Use iterative Newton-Raphson method to find (u, v)
  let u = 0.5;
  let v = 0.5;
  
  for (let iter = 0; iter < 20; iter++) {
    // Calculate current position
    const current = bilinearInterpolate(tl, tr, br, bl, u, v);
    
    // Calculate error
    const dx = current.x - point.x;
    const dy = current.y - point.y;
    
    // If close enough, we're done
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
      return { u, v };
    }
    
    // Calculate partial derivatives (Jacobian)
    const epsilon = 0.001;
    
    const pu = bilinearInterpolate(tl, tr, br, bl, u + epsilon, v);
    const pv = bilinearInterpolate(tl, tr, br, bl, u, v + epsilon);
    
    const dudx = (pu.x - current.x) / epsilon;
    const dudy = (pu.y - current.y) / epsilon;
    const dvdx = (pv.x - current.x) / epsilon;
    const dvdy = (pv.y - current.y) / epsilon;
    
    // Invert the Jacobian
    const det = dudx * dvdy - dudy * dvdx;
    if (Math.abs(det) < 0.0001) break;
    
    const invDet = 1 / det;
    const du = invDet * (dvdy * (-dx) - dvdx * (-dy));
    const dv = invDet * (-dudy * (-dx) + dudx * (-dy));
    
    // Update u and v
    u += du;
    v += dv;
    
    // Clamp to valid range
    u = Math.max(0, Math.min(1, u));
    v = Math.max(0, Math.min(1, v));
  }
  
  return { u, v };
}

