'use client';

import { useEffect, useRef, useState } from 'react';
import type { Core } from 'cytoscape';

interface Props {
    cy: Core | null;
}

export default function CytoscapeNavigator({ cy }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [, setViewport] = useState({ zoom: 1, pan: { x: 0, y: 0 } });

    useEffect(() => {
        if (!cy || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderMinimap = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Set dark background
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Get graph bounds
            const extent = cy.elements().boundingBox();
            if (!extent || extent.w === 0 || extent.h === 0) return;

            // Calculate scale to fit graph in minimap
            const padding = 10;
            const availableWidth = canvas.width - 2 * padding;
            const availableHeight = canvas.height - 2 * padding;
            const scaleX = availableWidth / extent.w;
            const scaleY = availableHeight / extent.h;
            const scale = Math.min(scaleX, scaleY);

            const offsetX = padding + (availableWidth - extent.w * scale) / 2 - extent.x1 * scale;
            const offsetY = padding + (availableHeight - extent.h * scale) / 2 - extent.y1 * scale;

            // Draw nodes
            cy.nodes().forEach((node) => {
                const pos = node.position();
                const x = pos.x * scale + offsetX;
                const y = pos.y * scale + offsetY;
                const type = node.data('type');

                ctx.fillStyle = type === 'person' ? '#6366f1' : '#a855f7';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            });

            // Draw edges
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
            ctx.lineWidth = 1;
            cy.edges().forEach((edge) => {
                const sourcePos = edge.source().position();
                const targetPos = edge.target().position();
                const x1 = sourcePos.x * scale + offsetX;
                const y1 = sourcePos.y * scale + offsetY;
                const x2 = targetPos.x * scale + offsetX;
                const y2 = targetPos.y * scale + offsetY;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });

            // Draw viewport rectangle
            const pan = cy.pan();
            const zoom = cy.zoom();
            const viewportWidth = cy.width() / zoom;
            const viewportHeight = cy.height() / zoom;
            const viewportX = -pan.x / zoom;
            const viewportY = -pan.y / zoom;

            const rectX = viewportX * scale + offsetX;
            const rectY = viewportY * scale + offsetY;
            const rectW = viewportWidth * scale;
            const rectH = viewportHeight * scale;

            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2;
            ctx.strokeRect(rectX, rectY, rectW, rectH);
        };

        const handleViewportChange = () => {
            const pan = cy.pan();
            const zoom = cy.zoom();
            setViewport({ zoom, pan });
            renderMinimap();
        };

        // Initial render
        renderMinimap();

        // Listen to viewport changes
        cy.on('viewport', handleViewportChange);
        cy.on('add remove', renderMinimap);

        return () => {
            cy.off('viewport', handleViewportChange);
            cy.off('add remove', renderMinimap);
        };
    }, [cy]);

    return (
        <div className="cytoscape-navigator">
            <canvas ref={canvasRef} width={200} height={150} />
        </div>
    );
}
