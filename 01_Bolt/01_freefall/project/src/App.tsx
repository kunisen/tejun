import React, { useRef, useEffect } from 'react';
import { usePhysics } from './hooks/usePhysics';
import { PhysicsControls } from './components/PhysicsControls';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ball, config, setConfig, resetBall } = usePhysics(CANVAS_WIDTH, CANVAS_HEIGHT);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#3B82F6';
    ctx.fill();
    ctx.closePath();

    // Draw wind indicators if wind is present
    if (config.windSpeed !== 0) {
      const numArrows = Math.abs(Math.round(config.windSpeed));
      const arrowSpacing = 40;
      const arrowLength = 20;
      const arrowY = 30;
      
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < numArrows; i++) {
        const x = config.windSpeed > 0 ? 50 + i * arrowSpacing : CANVAS_WIDTH - 50 - i * arrowSpacing;
        
        ctx.beginPath();
        if (config.windSpeed > 0) {
          ctx.moveTo(x - arrowLength, arrowY);
          ctx.lineTo(x, arrowY);
          ctx.lineTo(x - 5, arrowY - 5);
          ctx.moveTo(x, arrowY);
          ctx.lineTo(x - 5, arrowY + 5);
        } else {
          ctx.moveTo(x + arrowLength, arrowY);
          ctx.lineTo(x, arrowY);
          ctx.lineTo(x + 5, arrowY - 5);
          ctx.moveTo(x, arrowY);
          ctx.lineTo(x + 5, arrowY + 5);
        }
        ctx.stroke();
      }
    }
  }, [ball, config.windSpeed]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Physics Ball Simulation</h1>
        
        <div className="flex gap-8">
          <div className="flex-1">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="bg-white rounded-lg shadow-md"
            />
          </div>
          
          <div className="w-80">
            <PhysicsControls
              config={config}
              onConfigChange={setConfig}
              onReset={resetBall}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;