'use client';

import type { Core } from 'cytoscape';

interface Props {
    cy: Core | null;
}

export default function CytoscapeControls({ cy }: Props) {
    const zoomIn = () => {
        if (!cy) return;
        const zoom = cy.zoom();
        const maxZoom = 2;
        const newZoom = Math.min(zoom * 1.2, maxZoom);
        cy.zoom({
            level: newZoom,
            renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
        });
    };

    const zoomOut = () => {
        if (!cy) return;
        const zoom = cy.zoom();
        const minZoom = 0.3;
        const newZoom = Math.max(zoom / 1.2, minZoom);
        cy.zoom({
            level: newZoom,
            renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
        });
    };

    const fitView = () => {
        if (!cy) return;
        cy.fit(undefined, 100); // 100px padding
    };

    const reset = () => {
        if (!cy) return;
        cy.zoom(1);
        cy.center();
    };

    return (
        <div className="cytoscape-controls">
            <button onClick={zoomIn} title="Zoom In" aria-label="Zoom In">
                +
            </button>
            <button onClick={zoomOut} title="Zoom Out" aria-label="Zoom Out">
                −
            </button>
            <button onClick={fitView} title="Fit View" aria-label="Fit View">
                ⊡
            </button>
            <button onClick={reset} title="Reset View" aria-label="Reset View">
                ⟲
            </button>
        </div>
    );
}
