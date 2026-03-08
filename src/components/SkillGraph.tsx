'use client';

import { useEffect, useMemo, useRef } from 'react';
import cytoscape, { Core } from 'cytoscape';

import CytoscapeControls from './CytoscapeControls';
import CytoscapeNavigator from './CytoscapeNavigator';
import { GraphState, SelectedNode } from '@/lib/types';
import {
    buildCytoscapeElements,
    cytoscapeStylesheet,
    getHighlightedElements,
} from '@/lib/cytoscapeHelpers';

interface Props {
    state: GraphState;
    selectedNode: SelectedNode;
    onSelectNode: (node: SelectedNode) => void;
    onUpdateNodePosition: (id: string, x: number, y: number) => void;
}

export default function SkillGraph({
    state,
    selectedNode,
    onSelectNode,
    onUpdateNodePosition,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<Core | null>(null);

    // Memoize stylesheet for performance
    const stylesheet = useMemo(() => cytoscapeStylesheet, []);

    // Initialize Cytoscape instance
    useEffect(() => {
        if (!containerRef.current || cyRef.current) return;

        const cy = cytoscape({
            container: containerRef.current,
            elements: [],
            style: stylesheet,
            layout: { name: 'preset' },
            minZoom: 0.3,
            maxZoom: 2,
            wheelSensitivity: 0.2,
        });

        cyRef.current = cy;

        // Node click → toggle selection
        cy.on('tap', 'node', (evt) => {
            const node = evt.target;
            const type = node.data('type') as 'person' | 'skill';
            const id = node.data('id') as string;

            if (selectedNode?.id === id) {
                onSelectNode(null); // Deselect
            } else {
                onSelectNode({ type, id });
            }
        });

        // Canvas click → deselect
        cy.on('tap', (evt) => {
            if (evt.target === cy) {
                onSelectNode(null);
            }
        });

        // Drag end → save position
        cy.on('free', 'node', (evt) => {
            const node = evt.target;
            const pos = node.position();
            const id = node.data('id') as string;
            onUpdateNodePosition(id, pos.x, pos.y);
        });

        // Initial fit view with padding
        const fitTimeout = setTimeout(() => {
            if (cyRef.current) {
                cyRef.current.fit(undefined, 100);
            }
        }, 100);

        // Cleanup
        return () => {
            clearTimeout(fitTimeout);
            cy.destroy();
            cyRef.current = null;
        };
    }, []);

    // Update elements when state or selection changes
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        const cyElements = buildCytoscapeElements(state);
        const { nodeIds, edgeIds } = getHighlightedElements(state, selectedNode);

        cy.batch(() => {
            // Remove all elements
            cy.elements().remove();

            // Add new elements
            cy.add(cyElements);

            // Apply classes based on selection
            cy.elements().forEach((ele) => {
                const id = ele.id();
                const isHighlighted = selectedNode && (nodeIds.has(id) || edgeIds.has(id));
                const isDimmed = selectedNode && !isHighlighted;

                ele.removeClass('highlighted dimmed');
                if (isHighlighted) {
                    ele.addClass('highlighted');
                } else if (isDimmed) {
                    ele.addClass('dimmed');
                }
            });
        });
    }, [state, selectedNode]);

    return (
        <div className="graph-wrapper w-full h-full relative">
            {/* Background grid */}
            <div className="cytoscape-background-grid" />

            {/* Cytoscape canvas */}
            <div
                ref={containerRef}
                className="cytoscape-container"
                style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
            />

            {/* Controls */}
            <CytoscapeControls cy={cyRef.current} />

            {/* Navigator/Minimap */}
            <CytoscapeNavigator cy={cyRef.current} />
        </div>
    );
}
