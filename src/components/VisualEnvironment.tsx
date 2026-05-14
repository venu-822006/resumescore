import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function VisualEnvironment({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Preloader timeout
    const timer = setTimeout(() => setLoading(false), 2000);
    
    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (['A', 'BUTTON', 'INPUT', 'TEXTAREA'].includes(target.tagName) || target.closest('.hover-target')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    // Particles logic
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles: any[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 162, 39, ${p.a})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201, 162, 39, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    const animFrame = requestAnimationFrame(draw);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000] bg-bg-primary flex flex-col items-center justify-center gap-10"
          >
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center"
             >
               <h1 className="text-5xl font-serif-italic text-gold mb-2">Neural Link</h1>
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-muted">Initializing Core Systems</p>
             </motion.div>
             <div className="w-48 h-[1px] bg-white/10 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
                 className="h-full bg-gold"
               />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />
      
      {/* Custom Cursor */}
      <motion.div
        animate={{ 
          x: mousePos.x, 
          y: mousePos.y,
          scale: isHovering ? 2 : 1
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.5 }}
        className="fixed w-3 h-3 bg-gold rounded-full pointer-events-none z-[9999] mix-blend-difference"
      />
      <motion.div
        animate={{ 
          x: mousePos.x, 
          y: mousePos.y,
          scale: isHovering ? 1.5 : 1
        }}
        transition={{ type: "spring", damping: 25, stiffness: 150, mass: 1 }}
        className="fixed w-10 h-10 border border-gold/30 rounded-full pointer-events-none z-[9998]"
      />

      <div className="relative z-10">
        {children}
      </div>
    </>
  );
}
