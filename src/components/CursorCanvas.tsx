import React, { useEffect, useRef } from 'react';

export const CursorCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
      radius: 120 // Interaction radius
    };

    // Particle definitions
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      decay: number;
      isTrail: boolean;
    }

    const particles: Particle[] = [];
    const maxBackgroundParticles = 6;

    // Initialize slow background floating particles
    for (let i = 0; i < maxBackgroundParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.2 + 0.08,
        decay: 0,
        isTrail: false
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      // Spawn trail particles at the mouse position
      for (let i = 0; i < 1; i++) {
        particles.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 1.0,
          vy: (Math.random() - 0.5) * 1.0,
          radius: Math.random() * 2.5 + 1.0,
          alpha: 0.35,
          decay: Math.random() * 0.02 + 0.015,
          isTrail: true
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      // Burst of particles expanding outwards (extremely minimal)
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.5 + 1.0,
          alpha: 0.4,
          decay: Math.random() * 0.04 + 0.03,
          isTrail: true
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Check active theme selector dynamically
      const isDark = document.documentElement.classList.contains('dark');
      
      // Update mix blend mode via direct Ref to avoid React re-renders
      if (canvas) {
        canvas.style.mixBlendMode = isDark ? 'screen' : 'multiply';
        canvas.style.opacity = isDark ? '0.35' : '0.2';
      }

      // 1. Draw glowing orb under cursor
      if (mouse.active) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius
        );
        
        if (isDark) {
          gradient.addColorStop(0, 'rgba(230, 226, 201, 0.22)'); // Sand/Cream glow center
          gradient.addColorStop(0.5, 'rgba(79, 132, 123, 0.12)'); // Sage Teal glow outer
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(148, 163, 184, 0.12)'); // Slate Grey center
          gradient.addColorStop(0.5, 'rgba(100, 116, 139, 0.04)'); // Slate Grey outer
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.isTrail) {
          // Update trail particle
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;

          // Remove faded trail particles
          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          // Draw trail particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          
          // Custom Sage/Navy/Cream colors for trails and click bursts
          if (isDark) {
            ctx.fillStyle = p.radius > 2.2 
              ? `rgba(230, 226, 201, ${p.alpha * 0.6})` // Softer Sand/Cream
              : `rgba(79, 132, 123, ${p.alpha * 0.6})`; // Softer Sage Teal
          } else {
            ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha * 0.45})`; // Soft Slate Grey
          }
          ctx.fill();
        } else {
          // Update background particle
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around screen edges
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Attract slightly towards mouse
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
              const force = (mouse.radius - dist) / mouse.radius;
              p.x += (dx / dist) * force * 0.5;
              p.y += (dy / dist) * force * 0.5;
            }
          }

          // Draw background particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          
          // Dynamic nodes styling
          ctx.fillStyle = isDark
            ? `rgba(230, 226, 201, ${p.alpha * 0.4})` // Softer Sand/Cream nodes
            : `rgba(148, 163, 184, ${p.alpha * 0.35})`; // Soft Slate Grey nodes
          ctx.fill();
        }
      }

      // Draw mesh connection lines between nearby background particles and to the mouse
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        if (p1.isTrail) {
          // Draw a very soft line from the trail bubble back to the mouse
          if (mouse.active) {
            const dx = mouse.x - p1.x;
            const dy = mouse.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              const alpha = (1.0 - dist / 80) * p1.alpha * 0.08;
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(p1.x, p1.y);
              ctx.strokeStyle = isDark
                ? `rgba(79, 132, 123, ${alpha})`
                : `rgba(148, 163, 184, ${alpha})`;
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
          continue; // Don't connect trail particles to background particles
        }

        // Line to mouse (for background particles)
        if (mouse.active) {
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const alpha = (1.0 - dist / mouse.radius) * 0.06;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p1.x, p1.y);
            
            ctx.strokeStyle = isDark
              ? `rgba(79, 132, 123, ${alpha})`
              : `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }

        // Lines to other background particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.isTrail) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (1.0 - dist / 100) * 0.05;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Connections between nodes
            ctx.strokeStyle = isDark
              ? `rgba(230, 226, 201, ${alpha * 0.3})` // Softer Sand/Cream lines
              : `rgba(148, 163, 184, ${alpha * 0.18})`; // Soft Slate Grey lines
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 blur-[2px]"
    />
  );
};
