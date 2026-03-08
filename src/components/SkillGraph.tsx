'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';

import CytoscapeControls from './CytoscapeControls';
import CytoscapeNavigator from './CytoscapeNavigator';
import ParticleBackground from './ParticleBackground';
import EdgeParticles from './EdgeParticles';
import LayoutSwitcher from './LayoutSwitcher';
import { GraphState, SelectedNode } from '@/lib/types';
import {
    buildCytoscapeElements,
    getCytoscapeStylesheet,
    getHighlightedElements,
} from '@/lib/cytoscapeHelpers';
import { registerLayouts, applyLayout, LayoutType } from '@/lib/layoutManager';

interface Props {
    state: GraphState;
    selectedNode: SelectedNode;
    onSelectNode: (node: SelectedNode) => void;
    onUpdateNodePosition: (id: string, x: number, y: number) => void;
    theme: 'light' | 'dark';
}

export default function SkillGraph({
    state,
    selectedNode,
    onSelectNode,
    onUpdateNodePosition,
    theme,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<Core | null>(null);
    const [currentLayout, setCurrentLayout] = useState<LayoutType>('preset');
    const hasInitialFit = useRef(false);

    // Memoize stylesheet for performance based on theme
    const stylesheet = useMemo(() => getCytoscapeStylesheet(theme), [theme]);

    // Initialize Cytoscape instance
    useEffect(() => {
        if (!containerRef.current || cyRef.current) return;

        // Register layout extensions
        registerLayouts(cytoscape);

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

        // Edge Animation Loop
        let offset = 0;
        let animationFrameId: number;
        const animateEdges = () => {
            if (cyRef.current) {
                offset -= 0.5; // Animation speed
                cyRef.current.edges().style('line-dash-offset', offset);
            }
            animationFrameId = requestAnimationFrame(animateEdges);
        };
        animateEdges();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(fitTimeout);
            if (cyRef.current) {
                cyRef.current.destroy();
                cyRef.current = null;
            }
        };
    }, []);

    // Apply theme updates
    useEffect(() => {
        if (cyRef.current) {
            cyRef.current.style(stylesheet);
        }
    }, [stylesheet]);

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

        // Fit viewport on first load
        if (!hasInitialFit.current && cyElements.length > 0) {
            setTimeout(() => {
                if (cyRef.current) {
                    cyRef.current.fit(undefined, 100);
                    hasInitialFit.current = true;
                }
            }, 100);
        }
    }, [state, selectedNode]);

    // Handle layout changes
    const handleLayoutChange = (layout: LayoutType) => {
        setCurrentLayout(layout);
        if (cyRef.current) {
            applyLayout(cyRef.current, layout);
        }
    };

    return (
        <div className="graph-wrapper w-full h-full relative">
            {/* Background grid */}
            <div className="cytoscape-background-grid" />

            {/* Floating particles background */}
            <ParticleBackground theme={theme} />

            {/* Cytoscape canvas */}
            <div
                ref={containerRef}
                className="cytoscape-container"
                style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
            />

            {/* Edge flow particles */}
            <EdgeParticles cy={cyRef.current} theme={theme} />

            {/* Controls */}
            <CytoscapeControls cy={cyRef.current} />

            {/* Layout Switcher */}
            <LayoutSwitcher currentLayout={currentLayout} onLayoutChange={handleLayoutChange} />

            {/* Navigator/Minimap */}
            <CytoscapeNavigator cy={cyRef.current} />
        </div>
    );
}
