import { Node, Edge } from '@xyflow/react';
import { GraphState, Proficiency } from './types';

// ─── Proficiency colours (edge + badge) ──────────────────────────────────────
export const PROFICIENCY_COLOR: Record<Proficiency, string> = {
    learning: '#EAB308', // yellow-500
    familiar: '#3B82F6', // blue-500
    expert: '#22C55E', // green-500
};

export const PROFICIENCY_BG: Record<Proficiency, string> = {
    learning: '#FEF9C3',
    familiar: '#DBEAFE',
    expert: '#DCFCE7',
};

// ─── Category colours for skill nodes ────────────────────────────────────────
export const CATEGORY_COLOR: Record<string, string> = {
    Frontend: '#8B5CF6', // violet
    Backend: '#EC4899', // pink
    DevOps: '#F97316', // orange
    Design: '#14B8A6', // teal
    Other: '#6B7280', // gray
};

// ─── Layout helpers ───────────────────────────────────────────────────────────

/** Very simple two-ring layout: people in an outer circle, skills in an inner circle */
function circlePositions(count: number, radius: number, cx: number, cy: number) {
    return Array.from({ length: count }, (_, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });
}

// ─── Main converter ───────────────────────────────────────────────────────────

export function buildReactFlowElements(state: GraphState): { nodes: Node[]; edges: Edge[] } {
    const { people, skills, connections } = state;

    const CX = 600, CY = 400;
    const personPositions = circlePositions(people.length, 340, CX, CY);
    const skillPositions = circlePositions(skills.length, 160, CX, CY);

    // ── Nodes ──────────────────────────────────────────────────────────────────
    const personNodes: Node[] = people.map((p, i) => ({
        id: p.id,
        type: 'person',
        position: p.x !== undefined ? { x: p.x, y: p.y! } : personPositions[i],
        data: { person: p },
        draggable: true,
        style: {
            animationDelay: `${i * 0.05}s`, // Stagger animation by 50ms per node
        },
    }));

    const skillNodes: Node[] = skills.map((s, i) => ({
        id: s.id,
        type: 'skill',
        position: s.x !== undefined ? { x: s.x, y: s.y! } : skillPositions[i],
        data: { skill: s },
        draggable: true,
        style: {
            animationDelay: `${(people.length + i) * 0.05}s`, // Continue stagger after person nodes
        },
    }));

    // ── Edges ──────────────────────────────────────────────────────────────────
    const edges: Edge[] = connections.map((c) => ({
        id: `${c.personId}-${c.skillId}`,
        source: c.personId,
        target: c.skillId,
        label: c.proficiency,
        type: 'smoothstep',
        style: {
            stroke: PROFICIENCY_COLOR[c.proficiency],
            strokeWidth: 2,
        },
        labelStyle: {
            fill: PROFICIENCY_COLOR[c.proficiency],
            fontWeight: 600,
            fontSize: 11,
        },
        labelBgStyle: {
            fill: PROFICIENCY_BG[c.proficiency],
            fillOpacity: 0.9,
            rx: 4,
        },
        data: { proficiency: c.proficiency },
    }));

    return { nodes: [...personNodes, ...skillNodes], edges };
}
