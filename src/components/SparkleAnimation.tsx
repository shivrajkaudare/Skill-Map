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
    twinkle: number;
    twinkleSpeed: number;
}

interface Props {
    x: number;
    y: number;
    color: string;
    onComplete: () => void;
    particleCount?: number;
}

export default function SparkleAnimation({ x, y, color, onComplete, particleCount = 25 }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to full viewport
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create particles - they start from center and burst outward
        const particles: Particle[] = [];

        // Create burst particles
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
            const speed = 3 + Math.random() * 5;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - Math.random() * 2, // Slight upward bias
                size: 2 + Math.random() * 5,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.02,
                color,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.1 + Math.random() * 0.2,
            });
        }

        // Add some sparkle particles that move upward
        for (let i = 0; i < 10; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
            const speed = 4 + Math.random() * 6;
            particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y,
                vx: Math.cos(angle) * speed * 0.3,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.015,
                color: '#ffffff',
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.15 + Math.random() * 0.25,
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

                // Apply slight gravity (less than dust)
                particle.vy += 0.08;

                // Apply air resistance
                particle.vx *= 0.97;
                particle.vy *= 0.97;

                // Update twinkle
                particle.twinkle += particle.twinkleSpeed;

                // Fade out
                particle.alpha -= particle.decay;

                // Twinkle effect - size pulses
                const twinkleFactor = Math.sin(particle.twinkle) * 0.3 + 0.7;
                const currentSize = particle.size * twinkleFactor;

                // Draw particle with glow
                ctx.save();
                ctx.globalAlpha = Math.max(0, particle.alpha);

                // Outer glow
                ctx.shadowBlur = 8 + twinkleFactor * 4;
                ctx.shadowColor = particle.color;
                ctx.fillStyle = particle.color;

                // Draw as a star-like shape
                if (particle.size > 3) {
                    // Draw a plus/cross shape for larger particles
                    ctx.beginPath();
                    const crossSize = currentSize * 1.5;
                    ctx.moveTo(particle.x - crossSize, particle.y);
                    ctx.lineTo(particle.x + crossSize, particle.y);
                    ctx.moveTo(particle.x, particle.y - crossSize);
                    ctx.lineTo(particle.x, particle.y + crossSize);
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = particle.color;
                    ctx.stroke();
                }

                // Draw center circle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });

            // Continue animation or complete
            if (aliveParticles > 0 && elapsed < 1500) {
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
