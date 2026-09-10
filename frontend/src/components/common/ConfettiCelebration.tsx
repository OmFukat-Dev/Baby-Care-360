import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
}

export const ConfettiCelebration: React.FC = () => {
  const [active, setActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleCelebrate = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const msg = customEvent.detail?.message || 'Wonderful milestone recorded! 🌟';
      setToastMessage(msg);
      setActive(true);

      // Generate 45 celebratory confetti particles
      const colors = ['#0ea5e9', '#38bdf8', '#fe4f70', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      const newParticles: Particle[] = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 3 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 15,
      }));
      setParticles(newParticles);

      // Dismiss after 2.8 seconds
      const timer = setTimeout(() => {
        setActive(false);
      }, 2800);
      return () => clearTimeout(timer);
    };

    window.addEventListener('babycare-celebrate', handleCelebrate);
    return () => window.removeEventListener('babycare-celebrate', handleCelebrate);
  }, []);

  if (!active) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '4rem',
      }}
    >
      {/* Toast banner */}
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 20px 50px rgba(14, 165, 233, 0.25)',
          padding: '0.85rem 1.6rem',
          borderRadius: '999px',
          color: '#0f172a',
          fontWeight: 800,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          animation: 'fabMenuPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <span style={{ fontSize: '1.3rem' }}>🎉</span>
        <span>{toastMessage}</span>
      </div>

      {/* Confetti particles */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {particles.map((p) => (
          <rect
            key={p.id}
            x={p.x}
            y={p.y}
            width={p.size}
            height={p.size * 0.6}
            fill={p.color}
            rx={2}
            transform={`rotate(${p.rotation}, ${p.x}, ${p.y})`}
            style={{
              animation: `confettiFall 2.4s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default ConfettiCelebration;
