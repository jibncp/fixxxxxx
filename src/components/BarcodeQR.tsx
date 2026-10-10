import React from 'react';

// Pure SVG Code-128 style deterministic barcode generator
export const BarcodeSVG: React.FC<{
  value: string;
  height?: number;
  width?: number;
  showText?: boolean;
  className?: string;
}> = ({ value, height = 48, width = 180, showText = true, className = '' }) => {
  const cleanValue = (value || 'TF-0000').toUpperCase();

  // Generate deterministic bar pattern from characters
  const bars: number[] = [2, 1, 1, 2]; // Start guard
  for (let i = 0; i < cleanValue.length; i++) {
    const code = cleanValue.charCodeAt(i);
    bars.push(((code >> 0) & 2) + 1);
    bars.push(((code >> 2) & 1) + 1);
    bars.push(((code >> 3) & 2) + 1);
    bars.push(((code >> 5) & 1) + 1);
  }
  bars.push(2, 1, 2, 1, 2); // Stop guard

  const totalUnits = bars.reduce((a, b) => a + b, 0);
  let currentX = 0;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2 rounded-lg border border-slate-200 ${className}`}>
      <svg
        viewBox={`0 0 ${totalUnits} ${height}`}
        width={width}
        height={height}
        className="w-full max-w-full overflow-visible"
        preserveAspectRatio="none"
      >
        {bars.map((barWidth, index) => {
          const isBlack = index % 2 === 0;
          const x = currentX;
          currentX += barWidth;
          if (!isBlack) return null;
          return (
            <rect
              key={index}
              x={x}
              y={0}
              width={barWidth}
              height={height}
              fill="#0F172A"
            />
          );
        })}
      </svg>
      {showText && (
        <span className="mt-1 font-mono text-[11px] font-semibold tracking-widest text-slate-900">
          {cleanValue}
        </span>
      )}
    </div>
  );
};

// Pure SVG Deterministic QR Matrix generator with Finder Patterns for tracking URLs
export const QRCodeSVG: React.FC<{
  value: string;
  size?: number;
  className?: string;
}> = ({ value, size = 128, className = '' }) => {
  const gridSize = 21;
  const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[r0 + r][c0 + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, gridSize - 7);
  drawFinder(gridSize - 7, 0);

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Deterministic hash fill from value string
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft || r === 6 || c === 6) {
        continue;
      }
      const seed = (r * 31 + c * 17 + hash + value.charCodeAt((r + c) % Math.max(1, value.length))) & 0xff;
      matrix[r][c] = seed % 2 === 0 || seed % 5 === 0;
    }
  }

  return (
    <div className={`inline-flex items-center justify-center bg-white p-2.5 rounded-xl border border-slate-200 ${className}`}>
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        width={size}
        height={size}
        shapeRendering="crispEdges"
      >
        {matrix.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            cell ? (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx}
                y={rIdx}
                width={1}
                height={1}
                fill="#0F172A"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
