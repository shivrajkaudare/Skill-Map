'use client';

import { useEffect, useRef } from 'react';
import type { Core } from 'cytoscape';
import {
  Particle,
  createEdgeParticle,
  sampleBezierCurve,
  drawParticle,
} from '@/lib/particleHelpers';
import { PROFICIENCY_COLOR } from '@/lib/cytoscapeHelpers';

interface Props {
  cy: Core | null;
  theme: 'light' | 'dark';
}

interface EdgeParticleData extends Particle {
  edgeId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export default function EdgeParticles({ cy, theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<EdgeParticleData[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cy) return;

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

    // Spawn edge particles for highlighted edges
    const spawnEdgeParticles = () => {
      const highlightedEdges = cy.edges('.highlighted');

      highlightedEdges.forEach((edge) => {
        const source = edge.source();
        const target = edge.target();
        const sourcePos = source.position();
        const targetPos = target.position();
        const proficiency = edge.data('proficiency') || 'familiar';
        const color = PROFICIENCY_COLOR[proficiency as keyof typeof PROFICIENCY_COLOR];

        // Check if we already have particles for this edge
        const existingCount = particlesRef.current.filter(
          (p) => p.edgeId === edge.id()
        ).length;

        // Spawn 2-3 particles per edge
        if (existingCount < 3) {
          const particle = createEdgeParticle(
            sourcePos.x,
            sourcePos.y,
            targetPos.x,
            targetPos.y,
            color
          );

          particlesRef.current.push({
            ...particle,
            edgeId: edge.id(),
            sourceX: sourcePos.x,
            sourceY: sourcePos.y,
            targetX: targetPos.x,
            targetY: targetPos.y,
          });
        }
      });
    };

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;

      // Clear canvas with semi-transparent overlay for trail effect
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new particles
      if (Math.random() < 0.05) {
        // 5% chance per frame
        spawnEdgeParticles();
      }

      // Get current pan and zoom
      const pan = cy.pan();
      const zoom = cy.zoom();

      // Update and draw particles
      particlesRef.current = particlesRef.current
        .map((particle) => {
          // Update lifetime
          const newLifetime = particle.lifetime + 1;
          const progress = newLifetime / particle.maxLifetime;

          // Calculate position along bezier curve
          const { x, y } = sampleBezierCurve(
            progress,
            particle.sourceX,
            particle.sourceY,
            particle.targetX,
            particle.targetY
          );

          // Apply zoom and pan transformation
          const screenX = x * zoom + pan.x;
          const screenY = y * zoom + pan.y;

          // Fade out near end of lifetime
          let opacity = particle.opacity;
          if (progress > 0.7) {
            opacity = particle.opacity * (1 - (progress - 0.7) / 0.3);
          }

          return {
            ...particle,
            x: screenX,
            y: screenY,
            lifetime: newLifetime,
            opacity,
          };
        })
        .filter((p) => p.lifetime < p.maxLifetime); // Remove dead particles

      // Draw particles
      particlesRef.current.forEach((particle) => {
        drawParticle(ctx, particle);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Clear particles when viewport changes (for performance)
    const handleViewportChange = () => {
      // Keep particles, just update positions in next frame
    };

    cy.on('viewport', handleViewportChange);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      cy.off('viewport', handleViewportChange);
    };
  }, [cy, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="edge-particles-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
}
