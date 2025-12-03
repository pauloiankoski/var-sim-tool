import { useRef, useEffect, useState } from 'react';

function PitchCalibration({ imageSrc, imgDims, calibrationPoints, onUpdatePoint }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Calculate canvas dimensions to fit container while maintaining aspect ratio
  useEffect(() => {
    if (!containerRef.current || !imgDims.w || !imgDims.h) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = Math.min(600, window.innerHeight * 0.6);

    const scaleX = containerWidth / imgDims.w;
    const scaleY = containerHeight / imgDims.h;
    const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up

    setScale(newScale);
    setOffset({
      x: (containerWidth - imgDims.w * newScale) / 2,
      y: (containerHeight - imgDims.h * newScale) / 2
    });
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
    if (draggedIndex === null) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    // Clamp coordinates to image bounds
    const clampedX = Math.max(0, Math.min(imgDims.w, coords.x));
    const clampedY = Math.max(0, Math.min(imgDims.h, coords.y));

    onUpdatePoint(draggedIndex, { x: clampedX, y: clampedY });
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
          className="cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
}

export default PitchCalibration;

