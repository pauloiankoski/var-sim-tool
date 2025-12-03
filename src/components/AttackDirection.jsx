import { useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function AttackDirection({ imageSrc, imgDims, calibrationPoints, attackDirection, onDirectionChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = Math.min(600, window.innerHeight * 0.6);

    const scaleX = containerWidth / imgDims.w;
    const scaleY = containerHeight / imgDims.h;
    const scale = Math.min(scaleX, scaleY, 1);

    const displayWidth = imgDims.w * scale;
    const displayHeight = imgDims.h * scale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const ctx = canvas.getContext('2d');

    // Draw image
    ctx.drawImage(imageSrc, 0, 0, displayWidth, displayHeight);

    // Draw calibration overlay (faded)
    ctx.save();
    ctx.globalAlpha = 0.3;
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
    ctx.restore();
  }, [imageSrc, imgDims, calibrationPoints]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <p className="text-slate-300 mb-4">
          Which direction is the attacking team playing?
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative bg-slate-900 rounded-lg shadow-2xl overflow-hidden mb-6"
        style={{ maxWidth: '100%' }}
      >
        <canvas ref={canvasRef} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onDirectionChange('left')}
          className={`flex items-center space-x-3 px-8 py-4 rounded-lg font-semibold transition-all ${
            attackDirection === 'left'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <ArrowLeft size={24} />
          <span>Attacking Left</span>
        </button>

        <button
          onClick={() => onDirectionChange('right')}
          className={`flex items-center space-x-3 px-8 py-4 rounded-lg font-semibold transition-all ${
            attackDirection === 'right'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <span>Attacking Right</span>
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}

export default AttackDirection;

