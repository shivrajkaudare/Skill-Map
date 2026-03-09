'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';

import CytoscapeControls from './CytoscapeControls';
import CytoscapeNavigator from './CytoscapeNavigator';
import ParticleBackground from './ParticleBackground';
import EdgeParticles from './EdgeParticles';
import LayoutSwitcher from './LayoutSwitcher';
import DustAnimation from './DustAnimation';
import SparkleAnimation from './SparkleAnimation';
import { GraphState, SelectedNode } from '@/lib/types';
import {
    buildCytoscapeElements,
    getCytoscapeStylesheet,
    getHighlightedElements,
    CATEGORY_COLOR,
} from '@/lib/cytoscapeHelpers';
import { registerLayouts, applyLayout, LayoutType } from '@/lib/layoutManager';

interface Props {
    state: GraphState;
    selectedNode: SelectedNode;
    onSelectNode: (node: SelectedNode) => void;
    onUpdateNodePosition: (id: string, x: number, y: number) => void;
    theme: 'light' | 'dark';
}

interface DustEffect {
    id: string;
    x: number;
    y: number;
    color: string;
}

interface SparkleEffect {
    id: string;
    x: number;
    y: number;
    color: string;
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
    const [dustEffects, setDustEffects] = useState<DustEffect[]>([]);
    const [sparkleEffects, setSparkleEffects] = useState<SparkleEffect[]>([]);
    const deletingNodesRef = useRef<Set<string>>(new Set());
    const previousNodeIdsRef = useRef<Set<string>>(new Set());

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

    // Load elements from state initially or when state conceptually changes (like additions/removions)
    // We avoid doing this on every minor update to prevent layout resets.
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        const cyElements = buildCytoscapeElements(state);

        const newNodes = cyElements.filter(e => e.group === 'nodes');
        const newEdges = cyElements.filter(e => e.group === 'edges');

        cy.batch(() => {
            // Add or update nodes
            newNodes.forEach((nodeStr) => {
                if (!nodeStr.data.id) return;
                const nodeId = nodeStr.data.id as string;
                const existing = cy.getElementById(nodeId);

                if (existing.length > 0) {
                    existing.data(nodeStr.data);
                } else {
                    // New node - add it
                    const newNode = cy.add(nodeStr);

                    // Check if this is truly a new node (not initial load)
                    if (previousNodeIdsRef.current.size > 0 && !previousNodeIdsRef.current.has(nodeId)) {
                        // Get node position and color
                        const renderedPos = newNode.renderedPosition();
                        const nodeType = newNode.data('type') as 'person' | 'skill';

                        let color = '#6366f1'; // Default person color
                        if (nodeType === 'skill') {
                            const category = newNode.data('category') || 'Other';
                            color = CATEGORY_COLOR[category];
                        }

                        // Trigger sparkle effect
                        setSparkleEffects(prev => [...prev, {
                            id: nodeId,
                            x: renderedPos.x,
                            y: renderedPos.y,
                            color,
                        }]);

                        // Start node with scale animation
                        newNode.style({
                            opacity: 0,
                            width: 0,
                            height: 0,
                        });

                        // Animate to full size
                        setTimeout(() => {
                            newNode.animate({
                                style: {
                                    opacity: 1,
                                    width: nodeType === 'person' ? 100 : 160,
                                    height: nodeType === 'person' ? 100 : 56,
                                },
                                duration: 400,
                                easing: 'ease-out-cubic',
                            });
                        }, 50);
                    }
                }
            });

            // Add or update edges
            newEdges.forEach((edgeStr) => {
                if (!edgeStr.data.id) return;
                const existing = cy.getElementById(edgeStr.data.id as string);
                if (existing.length > 0) {
                    existing.data(edgeStr.data);
                } else {
                    cy.add(edgeStr);
                }
            });

            // Remove elements that no longer exist in state (with animation)
            const newNodeIds = new Set(newNodes.map(n => n.data.id));
            const newEdgeIds = new Set(newEdges.map(e => e.data.id));

            cy.nodes().forEach(n => {
                if (!newNodeIds.has(n.id()) && !deletingNodesRef.current.has(n.id())) {
                    // Mark as deleting to prevent multiple animations
                    deletingNodesRef.current.add(n.id());

                    // Get node position in screen coordinates
                    const renderedPos = n.renderedPosition();
                    const nodeType = n.data('type') as 'person' | 'skill';

                    // Determine color based on node type
                    let color = '#6366f1'; // Default person color
                    if (nodeType === 'skill') {
                        const category = n.data('category') || 'Other';
                        color = CATEGORY_COLOR[category];
                    }

                    // Animate node shrinking
                    n.animate({
                        style: {
                            width: 0,
                            height: 0,
                            opacity: 0,
                        },
                        duration: 300,
                        easing: 'ease-in',
                        complete: () => {
                            // Trigger dust effect
                            setDustEffects(prev => [...prev, {
                                id: n.id(),
                                x: renderedPos.x,
                                y: renderedPos.y,
                                color,
                            }]);

                            // Remove the node after a short delay
                            setTimeout(() => {
                                cy.remove(n);
                                deletingNodesRef.current.delete(n.id());
                            }, 100);
                        }
                    });
                }
            });

            cy.edges().forEach(e => {
                if (!newEdgeIds.has(e.id())) {
                    // Fade out edges quickly
                    e.animate({
                        style: { opacity: 0 },
                        duration: 200,
                        complete: () => cy.remove(e)
                    });
                }
            });
        });

        // Update previous node IDs for next render
        const currentNodeIds = new Set(newNodes.map(n => n.data.id as string));
        previousNodeIdsRef.current = currentNodeIds;

        // Fit viewport on first load
        if (!hasInitialFit.current && cyElements.length > 0) {
            setTimeout(() => {
                if (cyRef.current) {
                    cyRef.current.fit(undefined, 100);
                    hasInitialFit.current = true;
                }
            }, 100);
        }
    }, [state]);

    // Apply classes based on selection independently
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        const { nodeIds, edgeIds } = getHighlightedElements(state, selectedNode);

        cy.batch(() => {
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
    }, [selectedNode, state]);

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

            {/* Dust animations */}
            {dustEffects.map((effect) => (
                <DustAnimation
                    key={effect.id}
                    x={effect.x}
                    y={effect.y}
                    color={effect.color}
                    onComplete={() => {
                        setDustEffects(prev => prev.filter(e => e.id !== effect.id));
                    }}
                />
            ))}

            {/* Sparkle animations */}
            {sparkleEffects.map((effect) => (
                <SparkleAnimation
                    key={effect.id}
                    x={effect.x}
                    y={effect.y}
                    color={effect.color}
                    onComplete={() => {
                        setSparkleEffects(prev => prev.filter(e => e.id !== effect.id));
                    }}
                />
            ))}
        </div>
    );
}
