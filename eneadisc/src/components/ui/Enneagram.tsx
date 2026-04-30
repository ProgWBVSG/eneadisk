import React from "react";

const Enneagram: React.FC = () => {
  // Calculate the 9 points on a circle
  const cx = 250, cy = 250, r = 200;
  const points = Array.from({ length: 9 }, (_, i) => {
    const angle = (i * 40 - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  // Triangle: 9-3-6 (indices 0, 3, 6)
  const triangle = `${points[0].x},${points[0].y} ${points[3].x},${points[3].y} ${points[6].x},${points[6].y}`;
  
  // Hexad: 1-4-2-8-5-7 (indices 1,4,2,8,5,7)
  const hexad = `${points[1].x},${points[1].y} ${points[4].x},${points[4].y} ${points[2].x},${points[2].y} ${points[8].x},${points[8].y} ${points[5].x},${points[5].y} ${points[7].x},${points[7].y}`;

  return (
    <>
      <style>
        {`
          @keyframes enneagramRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes enneagramPulse {
            0%, 100% { filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.4)); }
            50% { filter: drop-shadow(0 0 35px rgba(99, 102, 241, 0.7)); }
          }
          @keyframes lineFlow {
            0% { stroke-dashoffset: 1200; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes pointPulse {
            0%, 100% { r: 5; opacity: 0.7; }
            50% { r: 8; opacity: 1; }
          }
        `}
      </style>
      <div className="flex items-center justify-center" style={{ width: '500px', height: '500px' }}>
        <div
          style={{
            animation: "enneagramRotate 60s linear infinite, enneagramPulse 4s ease-in-out infinite",
            width: '100%',
            height: '100%',
          }}
        >
          <svg viewBox="0 0 500 500" width="100%" height="100%" fill="none">
            {/* Outer glow circle */}
            <circle cx={cx} cy={cy} r={r + 20} stroke="rgba(99, 102, 241, 0.08)" strokeWidth="40" />
            
            {/* Main circle */}
            <circle cx={cx} cy={cy} r={r} stroke="rgba(99, 102, 241, 0.5)" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={r} stroke="rgba(147, 130, 255, 0.2)" strokeWidth="6" />
            
            {/* Inner dashed circle */}
            <circle cx={cx} cy={cy} r={r - 30} stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1" strokeDasharray="4 8" />

            {/* Triangle (9-3-6) */}
            <polygon 
              points={triangle} 
              stroke="rgba(99, 102, 241, 0.7)" 
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon 
              points={triangle} 
              stroke="rgba(147, 130, 255, 0.15)" 
              strokeWidth="6"
              strokeLinejoin="round"
            />

            {/* Hexad (1-4-2-8-5-7) */}
            <polygon 
              points={hexad} 
              stroke="rgba(168, 130, 255, 0.6)" 
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <polygon 
              points={hexad} 
              stroke="rgba(168, 130, 255, 0.1)" 
              strokeWidth="5"
              strokeLinejoin="round"
            />

            {/* Energy flow lines */}
            <circle cx={cx} cy={cy} r={r} 
              stroke="url(#energyGradient)" 
              strokeWidth="3" 
              strokeDasharray="30 570"
              style={{ animation: "lineFlow 8s linear infinite" }}
            />

            {/* Point nodes with numbers */}
            {points.map((p, i) => (
              <g key={i}>
                {/* Glow */}
                <circle cx={p.x} cy={p.y} r="12" fill="rgba(99, 102, 241, 0.15)" />
                {/* Point */}
                <circle 
                  cx={p.x} cy={p.y} r="5" 
                  fill="rgba(99, 102, 241, 0.9)"
                  style={{ animation: `pointPulse 3s ease-in-out infinite ${i * 0.33}s` }}
                />
                {/* Number */}
                <text 
                  x={p.x} y={p.y} 
                  textAnchor="middle" 
                  dominantBaseline="central"
                  fill="white" 
                  fontSize="10" 
                  fontWeight="bold"
                  fontFamily="'Rubik', sans-serif"
                  style={{ transform: `rotate(-${0}deg)`, transformOrigin: `${p.x}px ${p.y}px` }}
                >
                  {i === 0 ? 9 : i}
                </text>
              </g>
            ))}

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0)" />
                <stop offset="50%" stopColor="rgba(99, 102, 241, 0.8)" />
                <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </>
  );
};

export default Enneagram;
