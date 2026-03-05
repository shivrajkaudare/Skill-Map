'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Background, Controls, MiniMap,
    NodeChange, EdgeChange,
    applyNodeChanges, applyEdgeChanges,
    useNodesState, useEdgesState,
    Node, Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PersonNodeComp from './PersonNode';
import SkillNodeComp from './SkillNode';
import { GraphState, SelectedNode } from '@/lib/types';
import { buildReactFlowElements } from '@/lib/graphHelpers';

const NODE_TYPES = {
    person: PersonNodeComp,
    skill: SkillNodeComp,
};

interface Props {
    state: GraphState;
    selectedNode: SelectedNode;
    onSelectNode: (node: SelectedNode) => void;
    onUpdateNodePosition: (id: string, x: number, y: number) => void;
}

export default function SkillGraph({
    state, selectedNode, onSelectNode, onUpdateNodePosition,
}: Props) {
    const { nodes: initNodes, edges: initEdges } = useMemo(
        () => buildReactFlowElements(state),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

    // Sync nodes/edges whenever state changes
    useEffect(() => {
        const { nodes: nextNodes, edges: nextEdges } = buildReactFlowElements(state);

        // Apply highlight/dim for selected node
        const highlightedIds = new Set<string>();
        if (selectedNode) {
            highlightedIds.add(selectedNode.id);
            state.connections.forEach((c) => {
                if (selectedNode.type === 'person' && c.personId === selectedNode.id)
                    highlightedIds.add(c.skillId);
                if (selectedNode.type === 'skill' && c.skillId === selectedNode.id)
                    highlightedIds.add(c.personId);
            });
        }

        const finalNodes = nextNodes.map((n) => ({
            ...n,
            data: {
                ...n.data,
                dimmed: selectedNode ? !highlightedIds.has(n.id) : false,
            },
            className: selectedNode
                ? highlightedIds.has(n.id) ? 'node-highlighted' : 'node-dimmed'
                : '',
        }));

        setNodes(finalNodes);
        setEdges(nextEdges);
    }, [state, selectedNode, setNodes, setEdges]);

    // Persist drag positions
    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            changes.forEach((change) => {
                if (change.type === 'position' && change.dragging === false && change.position) {
                    onUpdateNodePosition(change.id, change.position.x, change.position.y);
                }
            });
            setNodes((nds) => applyNodeChanges(changes, nds) as Node[]);
        },
        [setNodes, onUpdateNodePosition],
    );

    const handleEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((eds) => applyEdgeChanges(changes, eds) as Edge[]);
        },
        [setEdges],
    );

    // Node click → open detail panel
    const handleNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            const type = node.type === 'person' ? 'person' : 'skill';
            if (selectedNode?.id === node.id) {
                onSelectNode(null); // toggle off
            } else {
                onSelectNode({ type, id: node.id });
            }
        },
        [selectedNode, onSelectNode],
    );

    // Click on blank canvas → deselect
    const handlePaneClick = useCallback(() => {
        onSelectNode(null);
    }, [onSelectNode]);

    return (
        <div className="graph-wrapper w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={NODE_TYPES}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                minZoom={0.3}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#334155" gap={24} size={1} />
                <Controls className="rf-controls" />
                <MiniMap
                    nodeColor={(n) => (n.type === 'person' ? '#6366f1' : '#a855f7')}
                    maskColor="rgba(15, 23, 42, 0.6)"
                    className="rf-minimap"
                />
            </ReactFlow>
        </div>
    );
}
