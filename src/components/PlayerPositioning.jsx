import { useRef, useEffect, useState } from 'react';

function PlayerPositioning({ imageSrc, imgDims, calibrationPoints, position, onPositionChange, label, color }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [canvasMousePos, setCanvasMousePos] = useState({ x: 0, y: 0 });

  // Calculate scale
  useEffect(() => {
    if (!containerRef.current || !imgDims.w || !imgDims.h) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = Math.min(600, window.innerHeight * 0.6);

    const scaleX = containerWidth / imgDims.w;
    const scaleY = containerHeight / imgDims.h;
    const newScale = Math.min(scaleX, scaleY, 1);

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

    // Draw calibration overlay (faded)
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
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
    ctx.restore();

    // Draw position marker if set
    if (position) {
      const x = position.x * scale;
      const y = position.y * scale;

      // Crosshair
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 20, y);
      ctx.lineTo(x + 20, y);
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x, y + 20);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Outer circle
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [imageSrc, imgDims, calibrationPoints, position, scale, color]);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    return { x, y };
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    setCanvasMousePos(coords);
    setMagnifierPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleClick = (e) => {
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    // Clamp coordinates to image bounds
    const clampedX = Math.max(0, Math.min(imgDims.w, coords.x));
    const clampedY = Math.max(0, Math.min(imgDims.h, coords.y));

    onPositionChange({ x: clampedX, y: clampedY });
  };

  // Keyboard controls for precision adjustment
  useEffect(() => {
    if (!position) return;

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        let newX = position.x;
        let newY = position.y;

        switch (e.key) {
          case 'ArrowUp':
            newY = Math.max(0, position.y - 1);
            break;
          case 'ArrowDown':
            newY = Math.min(imgDims.h, position.y + 1);
            break;
          case 'ArrowLeft':
            newX = Math.max(0, position.x - 1);
            break;
          case 'ArrowRight':
            newX = Math.min(imgDims.w, position.x + 1);
            break;
        }

        onPositionChange({ x: newX, y: newY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, imgDims, onPositionChange]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <p className="text-slate-300 mb-2">
          Click to place the {label.toLowerCase()} position
        </p>
        <p className="text-sm text-slate-400">
          Use arrow keys for pixel-perfect adjustments
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
          onClick={handleClick}
          onMouseMove={handleMouseMove}
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
            <div className="bg-slate-800 border-4 border-slate-600 rounded-lg shadow-2xl overflow-hidden">
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
                  ctx.strokeStyle = color;
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(60, 50);
                  ctx.lineTo(60, 70);
                  ctx.moveTo(50, 60);
                  ctx.lineTo(70, 60);
                  ctx.stroke();
                  
                  // Draw center dot
                  ctx.fillStyle = color;
                  ctx.beginPath();
                  ctx.arc(60, 60, 3, 0, Math.PI * 2);
                  ctx.fill();
                }}
              />
              <div className="bg-slate-700 px-2 py-1 text-xs text-center text-slate-300">
                3x Zoom
              </div>
            </div>
          </div>
        )}
      </div>

      {position && (
        <div className="mt-4 text-sm text-slate-400">
          Position: ({Math.round(position.x)}, {Math.round(position.y)})
        </div>
      )}
    </div>
  );
}

export default PlayerPositioning;

