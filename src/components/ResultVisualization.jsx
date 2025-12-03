import { useRef, useEffect, useState } from 'react';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import {
  calculateHomography,
  screenToWorld,
  worldToScreen,
  isOffside
} from '../utils/math';

function ResultVisualization({
  imageSrc,
  imgDims,
  calibrationPoints,
  defenderPos,
  attackerPos,
  attackDirection
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

  // Calculate offside and draw visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc || !defenderPos || !attackerPos) return;

    try {
      // Calculate homography matrix
      const H = calculateHomography(calibrationPoints);

      // Transform positions to world space
      const defenderWorld = screenToWorld(H, defenderPos);
      const attackerWorld = screenToWorld(H, attackerPos);

      // Check offside
      const offsideResult = isOffside(attackerWorld.x, defenderWorld.x, attackDirection);

      setResult({
        isOffside: offsideResult,
        defenderWorld,
        attackerWorld
      });
      setError(null);

      // Draw visualization
      const ctx = canvas.getContext('2d');
      const displayWidth = imgDims.w * scale;
      const displayHeight = imgDims.h * scale;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // Draw image
      ctx.drawImage(imageSrc, 0, 0, displayWidth, displayHeight);

      // Draw calibration overlay (very faded)
      ctx.save();
      ctx.globalAlpha = 0.1;
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

      // Draw offside lines
      // Defender line (Blue)
      const defenderTop = worldToScreen(H, { x: defenderWorld.x, y: 0 });
      const defenderBottom = worldToScreen(H, { x: defenderWorld.x, y: 1 });
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(defenderTop.x * scale, defenderTop.y * scale);
      ctx.lineTo(defenderBottom.x * scale, defenderBottom.y * scale);
      ctx.stroke();

      // Attacker line (Red)
      const attackerTop = worldToScreen(H, { x: attackerWorld.x, y: 0 });
      const attackerBottom = worldToScreen(H, { x: attackerWorld.x, y: 1 });
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(attackerTop.x * scale, attackerTop.y * scale);
      ctx.lineTo(attackerBottom.x * scale, attackerBottom.y * scale);
      ctx.stroke();

      // Draw position markers
      // Defender
      const defX = defenderPos.x * scale;
      const defY = defenderPos.y * scale;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(defX, defY, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(defX, defY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Attacker
      const attX = attackerPos.x * scale;
      const attY = attackerPos.y * scale;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(attX, attY, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(attX, attY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Add labels
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      
      // Defender label
      ctx.strokeText('DEFENDER', defX - 40, defY - 25);
      ctx.fillText('DEFENDER', defX - 40, defY - 25);
      
      // Attacker label
      ctx.strokeText('ATTACKER', attX - 40, attY - 25);
      ctx.fillText('ATTACKER', attX - 40, attY - 25);

    } catch (err) {
      console.error('Error calculating offside:', err);
      setError(err.message);
      setResult(null);
    }
  }, [imageSrc, imgDims, calibrationPoints, defenderPos, attackerPos, attackDirection, scale]);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a link and trigger download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `var-analysis-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          <p className="font-semibold">Error calculating offside:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className={`mb-6 p-6 rounded-lg shadow-lg ${
          result.isOffside
            ? 'bg-red-900/50 border-2 border-red-500'
            : 'bg-green-900/50 border-2 border-green-500'
        }`}>
          <div className="flex items-center justify-center space-x-3">
            {result.isOffside ? (
              <>
                <XCircle size={32} className="text-red-400" />
                <div>
                  <h3 className="text-2xl font-bold text-red-200">OFFSIDE</h3>
                  <p className="text-sm text-red-300">The attacker is in an offside position</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle size={32} className="text-green-400" />
                <div>
                  <h3 className="text-2xl font-bold text-green-200">ONSIDE</h3>
                  <p className="text-sm text-green-300">The attacker is not offside</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-600 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400">Defender Position (World X):</p>
                <p className="font-mono text-blue-300">{result.defenderWorld.x.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-slate-400">Attacker Position (World X):</p>
                <p className="font-mono text-red-300">{result.attackerWorld.x.toFixed(4)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative bg-slate-900 rounded-lg shadow-2xl overflow-hidden mb-6"
        style={{ maxWidth: '100%' }}
      >
        <canvas ref={canvasRef} />
      </div>

      <button
        onClick={handleExport}
        className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
      >
        <Download size={20} />
        <span>Export Analysis</span>
      </button>

      <div className="mt-6 text-center text-sm text-slate-400">
        <p className="mb-2">Legend:</p>
        <div className="flex gap-4 justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Defender Line</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Attacker Line</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultVisualization;

