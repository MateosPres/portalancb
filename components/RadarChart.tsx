
import React from 'react';

interface RadarChartProps {
    stats: {
        ataque: number;
        defesa: number;
        velocidade: number;
        forca: number;
        visao: number;
    };
    size?: number;
    className?: string; // Allow overriding text colors
}

export const RadarChart: React.FC<RadarChartProps> = ({ stats, size = 200, className }) => {
    // Config
    const center = size / 2;
    const radius = (size / 2) - 35; // Padding for labels
    const maxVal = 100;
    
    // 5 Axes (Pentagon) - Starting from top (270 degrees in SVG math, or -PI/2)
    // Angles: -90, -18, 54, 126, 198 (Degrees)
    const axes = [
        { label: 'ATAQUE', key: 'ataque', angle: -90 },
        { label: 'VISÃO', key: 'visao', angle: -18 },
        { label: 'VELOCIDADE', key: 'velocidade', angle: 54 },
        { label: 'FORÇA', key: 'forca', angle: 126 },
        { label: 'DEFESA', key: 'defesa', angle: 198 },
    ];

    // Helper to calculate coordinates
    const getCoords = (value: number, angleDeg: number) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        const normalized = value / maxVal;
        const x = center + (radius * normalized * Math.cos(angleRad));
        const y = center + (radius * normalized * Math.sin(angleRad));
        return `${x},${y}`;
    };

    // Build the data path
    const dataPoints = axes.map((axis) => {
        // @ts-ignore
        const val = stats[axis.key] || 0;
        // Clamp between 20 (base visual) and 100
        const visualVal = Math.max(20, Math.min(val, 100));
        return getCoords(visualVal, axis.angle);
    }).join(' ');

    // Background Grids (25%, 50%, 75%, 100%)
    const grids = [0.25, 0.5, 0.75, 1.0].map(level => {
        const points = axes.map((axis) => getCoords(level * 100, axis.angle)).join(' ');
        return <polygon key={level} points={points} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />;
    });

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className={className || "text-gray-400 dark:text-gray-600"}>
                {/* Background Grid */}
                {grids}
                
                {/* Axes Lines */}
                {axes.map((axis, i) => {
                    const endCoords = getCoords(100, axis.angle);
                    return (
                        <line 
                            key={i}
                            x1={center} y1={center}
                            x2={endCoords.split(',')[0]}
                            y2={endCoords.split(',')[1]}
                            stroke="currentColor" strokeOpacity="0.2" strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                <polygon 
                    points={dataPoints} 
                    fill="rgba(249, 115, 22, 0.5)" // ancb-orange with opacity
                    stroke="#F27405" 
                    strokeWidth="2"
                    className="animate-fadeIn"
                />

                {/* Labels */}
                {axes.map((axis, i) => {
                    // Push labels out a bit further than the chart
                    const labelRadius = radius + 20; 
                    const angleRad = (axis.angle * Math.PI) / 180;
                    const x = center + (labelRadius * Math.cos(angleRad));
                    const y = center + (labelRadius * Math.sin(angleRad));
                    
                    return (
                        <text 
                            key={i} 
                            x={x} 
                            y={y + 4} // Slight vertical adjustment 
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            className="text-[9px] font-bold fill-current uppercase tracking-wider"
                        >
                            {axis.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};
