import { useRef, useEffect, useState } from 'react';
import { calculateCanvasScale } from '../utils/canvas';

function PitchCalibration({ imageSrc, imgDims, calibrationPoints, onUpdatePoint }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [canvasMousePos, setCanvasMousePos] = useState({ x: 0, y: 0 });

  // Calculate canvas dimensions to fit 75% of viewport
  useEffect(() => {
    if (!imgDims.w || !imgDims.h) return;

    const newScale = calculateCanvasScale(imgDims.w, imgDims.h);
    setScale(newScale);
  }, [imgDims]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const ctx = canvas.getContext('2d');
    const displayWidth = imgDims.w * scale;
    const displayHeight = imgDims.h * scale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Draw image
    ctx.drawImage(imageSrc, 0, 0, displayWidth, displayHeight);

    // Draw calibration overlay
    ctx.save();

    // Draw quadrilateral
    ctx.strokeStyle = '#fbbf24'; // Yellow/Gold
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    calibrationPoints.forEach((point, i) => {
      const x = point.x * scale;
      const y = point.y * scale;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw corner handles
    calibrationPoints.forEach((point, i) => {
      const x = point.x * scale;
      const y = point.y * scale;

      // Outer circle (white)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle (gold)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labels = ['TL', 'TR', 'BR', 'BL'];
      ctx.fillText(labels[i], x, y);
    });

    ctx.restore();
  }, [imageSrc, imgDims, calibrationPoints, scale]);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    return { x, y };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    // Check if clicking on a handle
    const handleRadius = 12 / scale;
    for (let i = 0; i < calibrationPoints.length; i++) {
      const point = calibrationPoints[i];
      const dist = Math.sqrt(
        Math.pow(coords.x - point.x, 2) + Math.pow(coords.y - point.y, 2)
      );
      if (dist <= handleRadius) {
        setDraggedIndex(i);
        break;
      }
    }
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    // Update magnifier position
    setCanvasMousePos(coords);
    setMagnifierPos({ x: e.clientX, y: e.clientY });

    // Update dragged point if dragging
    if (draggedIndex !== null) {
      // Clamp coordinates to image bounds
      const clampedX = Math.max(0, Math.min(imgDims.w, coords.x));
      const clampedY = Math.max(0, Math.min(imgDims.h, coords.y));

      onUpdatePoint(draggedIndex, { x: clampedX, y: clampedY });
    }
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
    setDraggedIndex(null);
  };

  const handleMouseUp = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <p className="text-slate-300 mb-2">
          Drag the corner handles to match the pitch boundaries
        </p>
        <p className="text-sm text-slate-400">
          TL = Top-Left, TR = Top-Right, BR = Bottom-Right, BL = Bottom-Left
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative bg-slate-900 rounded-lg shadow-2xl overflow-hidden"
        style={{ maxWidth: '100%' }}
      >
        <canvas
          ref={canvasRef}
          className="cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {/* Magnifier Loupe */}
        {showMagnifier && imageSrc && (
          <div
            className="fixed pointer-events-none z-50"
            style={{
              left: magnifierPos.x + 20,
              top: magnifierPos.y + 20,
            }}
          >
            <div className="bg-slate-800 border-4 border-yellow-500 rounded-lg shadow-2xl overflow-hidden">
              <canvas
                width={120}
                height={120}
                ref={(canvas) => {
                  if (!canvas) return;
                  const ctx = canvas.getContext('2d');
                  
                  // Draw magnified portion
                  const zoomLevel = 3;
                  const sourceSize = 40;
                  const sourceX = Math.max(0, Math.min(imgDims.w - sourceSize, canvasMousePos.x - sourceSize / 2));
                  const sourceY = Math.max(0, Math.min(imgDims.h - sourceSize, canvasMousePos.y - sourceSize / 2));
                  
                  ctx.drawImage(
                    imageSrc,
                    sourceX, sourceY, sourceSize, sourceSize,
                    0, 0, 120, 120
                  );
                  
                  // Draw crosshair in center
                  ctx.strokeStyle = '#fbbf24';
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(60, 50);
                  ctx.lineTo(60, 70);
                  ctx.moveTo(50, 60);
                  ctx.lineTo(70, 60);
                  ctx.stroke();
                  
                  // Draw center dot
                  ctx.fillStyle = '#fbbf24';
                  ctx.beginPath();
                  ctx.arc(60, 60, 3, 0, Math.PI * 2);
                  ctx.fill();

                  // Draw calibration points if they're in view
                  calibrationPoints.forEach((point, i) => {
                    const relX = point.x - sourceX;
                    const relY = point.y - sourceY;
                    
                    if (relX >= 0 && relX <= sourceSize && relY >= 0 && relY <= sourceSize) {
                      const magX = (relX / sourceSize) * 120;
                      const magY = (relY / sourceSize) * 120;
                      
                      // Draw handle
                      ctx.fillStyle = '#ffffff';
                      ctx.beginPath();
                      ctx.arc(magX, magY, 8, 0, Math.PI * 2);
                      ctx.fill();
                      
                      ctx.fillStyle = '#fbbf24';
                      ctx.beginPath();
                      ctx.arc(magX, magY, 5, 0, Math.PI * 2);
                      ctx.fill();
                      
                      // Label
                      ctx.fillStyle = '#000000';
                      ctx.font = 'bold 8px sans-serif';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      const labels = ['TL', 'TR', 'BR', 'BL'];
                      ctx.fillText(labels[i], magX, magY);
                    }
                  });
                }}
              />
              <div className="bg-slate-700 px-2 py-1 text-xs text-center text-slate-300">
                3x Zoom
              </div>
            </div>
          </div>
        )}
      </div>

      {draggedIndex !== null && (
        <div className="mt-4 text-sm text-slate-400">
          Dragging: {['Top-Left', 'Top-Right', 'Bottom-Right', 'Bottom-Left'][draggedIndex]} 
          {' '}({Math.round(calibrationPoints[draggedIndex].x)}, {Math.round(calibrationPoints[draggedIndex].y)})
        </div>
      )}
    </div>
  );
}

export default PitchCalibration;

