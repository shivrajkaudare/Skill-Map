'use client';

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    decay: number;
    color: string;
}

interface Props {
    x: number;
    y: number;
    color: string;
    onComplete: () => void;
    particleCount?: number;
}

export default function DustAnimation({ x, y, color, onComplete, particleCount = 30 }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to full viewport
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create particles
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = 2 + Math.random() * 4;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.015,
                color,
            });
        }

        let animationFrameId: number;
        let startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let aliveParticles = 0;

            // Update and draw particles
            particles.forEach((particle) => {
                if (particle.alpha <= 0) return;

                aliveParticles++;

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Apply gravity
                particle.vy += 0.15;

                // Apply air resistance
                particle.vx *= 0.98;
                particle.vy *= 0.98;

                // Fade out
                particle.alpha -= particle.decay;

                // Draw particle
                ctx.save();
                ctx.globalAlpha = Math.max(0, particle.alpha);
                ctx.fillStyle = particle.color;
                ctx.shadowBlur = 4;
                ctx.shadowColor = particle.color;

                // Draw as a circle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });

            // Continue animation or complete
            if (aliveParticles > 0 && elapsed < 2000) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                onComplete();
            }
        };

        animate();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [x, y, color, onComplete, particleCount]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
}
