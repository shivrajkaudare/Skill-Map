'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Particle,
  createFloatingParticles,
  updateParticles,
  drawParticle,
} from '@/lib/particleHelpers';

interface Props {
  theme: 'light' | 'dark';
}

export default function ParticleBackground({ theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Theme-based colors
    const colors =
      theme === 'dark'
        ? ['rgba(99, 102, 241, 0.3)', 'rgba(236, 72, 153, 0.2)']
        : ['rgba(99, 102, 241, 0.2)', 'rgba(236, 72, 153, 0.15)'];

    // Initialize particles
    particlesRef.current = createFloatingParticles(
      70,
      canvas.width,
      canvas.height,
      colors
    );

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update particles
      particlesRef.current = updateParticles(
        particlesRef.current,
        1,
        canvas.width,
        canvas.height
      );

      // Draw particles
      particlesRef.current.forEach((particle) => {
        drawParticle(ctx, particle);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
