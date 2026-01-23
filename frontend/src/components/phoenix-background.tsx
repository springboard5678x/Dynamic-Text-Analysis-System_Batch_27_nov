'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

const BrainBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const mousePos = useRef({ x: 9999, y: 9999 });

  // A more detailed and realistic brain outline
  const brainOutline = useMemo(() => [
    { x: -140, y: -5 }, { x: -142, y: -15 }, { x: -145, y: -25 }, { x: -143, y: -35 },
    { x: -138, y: -45 }, { x: -135, y: -55 }, { x: -132, y: -60 }, { x: -128, y: -63 },
    { x: -125, y: -75 }, { x: -120, y: -80 }, { x: -122, y: -88 }, { x: -118, y: -95 },
    { x: -110, y: -102 }, { x: -100, y: -105 }, { x: -95, y: -112 }, { x: -85, y: -118 },
    { x: -70, y: -120 }, { x: -60, y: -124 }, { x: -50, y: -127 }, { x: -40, y: -128 },
    { x: -25, y: -131 }, { x: -10, y: -132 }, { x: 0, y: -130 }, { x: 10, y: -132 },
    { x: 25, y: -131 }, { x: 40, y: -128 }, { x: 50, y: -127 }, { x: 60, y: -124 },
    { x: 70, y: -120 }, { x: 85, y: -118 }, { x: 95, y: -112 }, { x: 100, y: -105 },
    { x: 110, y: -102 }, { x: 118, y: -95 }, { x: 122, y: -88 }, { x: 120, y: -80 },
    { x: 125, y: -70 }, { x: 130, y: -60 }, { x: 135, y: -50 }, { x: 140, y: -35 },
    { x: 142, y: -25 }, { x: 145, y: -15 }, { x: 145, y: 0 }, { x: 144, y: 10 },
    { x: 142, y: 20 }, { x: 138, y: 35 }, { x: 135, y: 45 }, { x: 130, y: 55 },
    { x: 125, y: 63 }, { x: 115, y: 70 }, { x: 108, y: 76 }, { x: 95, y: 80 },
    { x: 85, y: 84 }, { x: 70, y: 86 }, { x: 60, y: 85 }, { x: 50, y: 87 },
    { x: 40, y: 88 }, { x: 30, y: 86 }, { x: 20, y: 80 }, { x: 10, y: 79 },
    { x: 0, y: 78 }, { x: -10, y: 75 }, { x: -20, y: 78 }, { x: -30, y: 80 },
    { x: -40, y: 80 }, { x: -50, y: 79 }, { x: -60, y: 78 }, { x: -75, y: 75 },
    { x: -85, y: 72 }, { x: -95, y: 65}, { x: -105, y: 60 }, { x: -110, y: 55 },
    { x: -118, y: 50 }, { x: -125, y: 42 }, { x: -130, y: 30 }, { x: -135, y: 20 },
    { x: -138, y: 10 }, { x: -140, y: -5 }
  ], []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let synapses: Synapse[] = [];
    let animationState = 'disassembled'; // assembled, disassembled, assembling, disassembling
    let stateTicker = 0;

    const handleMouseMove = (e: MouseEvent) => {
        if(canvas) {
            const rect = canvas.getBoundingClientRect();
            mousePos.current.x = e.clientX - rect.left;
            mousePos.current.y = e.clientY - rect.top;
        }
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const isDark = resolvedTheme === 'dark';
    const colors = {
      line: isDark ? 'hsla(200, 80%, 60%, 0.3)' : 'hsla(210, 70%, 50%, 0.4)',
      particle: isDark ? 'hsl(210, 100%, 85%)' : 'hsl(220, 80%, 55%)',
      glow: isDark ? 'hsl(200, 100%, 70%)' : 'hsl(210, 70%, 50%)',
    };

    // Function to check if a point is inside the polygon
    function isPointInPolygon(point: {x: number, y: number}, vs: {x: number, y: number}[]) {
        const { x, y } = point;
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i].x, yi = vs[i].y;
            const xj = vs[j].x, yj = vs[j].y;
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    class Particle {
      x: number; y: number;
      originX: number; originY: number;
      targetX: number; targetY: number;
      vx: number; vy: number;
      life: number;
      
      constructor(x: number, y: number) {
        this.originX = x; this.originY = y;
        this.targetX = x; this.targetY = y;

        this.x = Math.random() * 400 - 200;
        this.y = Math.random() * 400 - 200;

        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.life = 1;
      }
      
      update(scale: number) {
          const mouseRadius = 80 * (scale / window.devicePixelRatio) ;
          const dx = this.x - (mousePos.current.x / window.devicePixelRatio - (canvas.width / (2 * window.devicePixelRatio)) );
          const dy = this.y - (mousePos.current.y / window.devicePixelRatio - (canvas.height / (2* window.devicePixelRatio)) );
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius) {
              const force = (mouseRadius - dist) / mouseRadius;
              this.x += (dx / dist) * force * 2;
              this.y += (dy / dist) * force * 2;
          } else {
              this.x += (this.targetX - this.x) * 0.05;
              this.y += (this.targetY - this.y) * 0.05;
          }
          
          // Gentle breathing effect
          const breath = Math.sin(Date.now() / 2000) * 0.02;
          this.x += (this.x - 0) * breath;
          this.y += (this.y - 0) * breath;
      }
      
      draw(center: {x:number, y:number}, scale: number) {
        if (!ctx) return;
        ctx.globalAlpha = this.life;
        ctx.fillStyle = colors.particle;
        ctx.beginPath();
        ctx.arc(center.x + this.x * scale, center.y + this.y * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    class Synapse {
        start: Particle;
        end: Particle;
        progress: number;
        speed: number;

        constructor(start: Particle, end: Particle) {
            this.start = start;
            this.end = end;
            this.progress = 0;
            this.speed = Math.random() * 0.025 + 0.01;
        }

        update() {
            this.progress += this.speed;
        }
        
        draw(center: {x:number, y:number}, scale: number) {
            if (!ctx) return;
            const x = this.start.x + (this.end.x - this.start.x) * this.progress;
            const y = this.start.y + (this.end.y - this.start.y) * this.progress;
            
            ctx.beginPath();
            ctx.arc(center.x + x * scale, center.y + y * scale, 1.8 * scale, 0, Math.PI * 2);
            
            const gradient = ctx.createRadialGradient(
                center.x + x * scale, center.y + y * scale, 0,
                center.x + x * scale, center.y + y * scale, 5 * scale
            );
            gradient.addColorStop(0, colors.glow);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;

            ctx.fill();
        }
    }


    const numParticles = 800;
    const connectionDist = 35;

    function initParticles() {
        particles = [];
        const bounds = brainOutline.reduce((acc, p) => ({
          minX: Math.min(acc.minX, p.x), maxX: Math.max(acc.maxX, p.x),
          minY: Math.min(acc.minY, p.y), maxY: Math.max(acc.maxY, p.y)
        }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

        while(particles.length < numParticles) {
          const x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
          const y = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
          if (isPointInPolygon({x,y}, brainOutline)) {
            particles.push(new Particle(x, y));
          }
        }
    }


    function animate() {
      if (!ctx) return;
      const scale = Math.min(canvas.width / 400, canvas.height / 400);
      const center = { x: canvas.width / 2, y: canvas.height / 2 + canvas.height * 0.1 };

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stateTicker++;

      // State machine for animation cycle
      if (animationState === 'disassembled' && stateTicker > 120) {
          animationState = 'assembling';
          initParticles();
          stateTicker = 0;
      } else if (animationState === 'assembling') {
          particles.forEach(p => {
              p.x += (p.targetX - p.x) * 0.07;
              p.y += (p.targetY - p.y) * 0.07;
          });
          if (stateTicker > 240) {
              animationState = 'assembled';
              stateTicker = 0;
          }
      } else if (animationState === 'assembled' && stateTicker > 400) {
          animationState = 'disassembling';
          stateTicker = 0;
      } else if (animationState === 'disassembling') {
          particles.forEach(p => {
              p.x += p.vx;
              p.y += p.vy;
              p.life -= 0.005;
          });
          if (particles.every(p => p.life <= 0)) {
              animationState = 'disassembled';
              stateTicker = 0;
          }
      }


      if(animationState !== 'disassembled') {
          particles.forEach(p => p.update(scale));
          
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const p1 = particles[i];
              const p2 = particles[j];
              const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
              
              if (dist < connectionDist) {
                ctx.globalAlpha = p1.life * p2.life;
                ctx.strokeStyle = colors.line;
                ctx.lineWidth = 0.5 * window.devicePixelRatio;
                ctx.beginPath();
                ctx.moveTo(center.x + p1.x * scale, center.y + p1.y * scale);
                ctx.lineTo(center.x + p2.x * scale, center.y + p2.y * scale);
                ctx.stroke();
                ctx.globalAlpha = 1;

                if (animationState === 'assembled' && Math.random() < 0.001 && synapses.length < 100) {
                     synapses.push(new Synapse(p1, p2));
                }
              }
            }
          }
          
          particles.forEach(p => p.draw(center, scale));
      
          for (let i = synapses.length - 1; i >= 0; i--) {
              const s = synapses[i];
              s.update();
              s.draw(center, scale);
              if (s.progress >= 1) {
                  synapses.splice(i, 1);
              }
          }
      }

      animationFrameId = window.requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [resolvedTheme, brainOutline]);

  return (
    <div className="absolute inset-0 -z-10 bg-transparent">
        <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} />
    </div>
  );
};

export default BrainBackground;
