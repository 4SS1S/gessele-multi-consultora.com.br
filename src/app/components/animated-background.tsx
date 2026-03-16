"use client";

const BOKEH_PARTICLES = [
  { size: 180, x: 10, y: 15, duration: 18, delay: 0, color: "rgba(168, 51, 185, 0.18)" },
  { size: 120, x: 75, y: 10, duration: 22, delay: 2, color: "rgba(232, 69, 144, 0.14)" },
  { size: 90, x: 50, y: 60, duration: 16, delay: 4, color: "rgba(217, 54, 157, 0.16)" },
  { size: 200, x: 85, y: 70, duration: 20, delay: 1, color: "rgba(139, 92, 246, 0.14)" },
  { size: 70, x: 20, y: 80, duration: 14, delay: 3, color: "rgba(232, 69, 144, 0.15)" },
  { size: 140, x: 60, y: 30, duration: 24, delay: 5, color: "rgba(168, 51, 185, 0.12)" },
  { size: 60, x: 35, y: 90, duration: 15, delay: 2, color: "rgba(217, 54, 157, 0.14)" },
  { size: 100, x: 90, y: 40, duration: 19, delay: 6, color: "rgba(139, 92, 246, 0.16)" },
];

export function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      {/* Flowing gradient layer */}
      <div className="gradient-flow" />

      {/* Bokeh particles */}
      {BOKEH_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="bokeh-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
