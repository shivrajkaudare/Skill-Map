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

/** Bipartite layout: people on left column, skills on right column */
function bipartiteLayout(
    peopleCount: number,
    skillsCount: number,
    canvasWidth = 1200,
    canvasHeight = 800
) {
    const PADDING = 100;
    const leftX = PADDING;
    const rightX = canvasWidth - PADDING;

    // Calculate vertical spacing
    const personSpacing = Math.min(120, (canvasHeight - 2 * PADDING) / Math.max(peopleCount - 1, 1));
    const skillSpacing = Math.min(120, (canvasHeight - 2 * PADDING) / Math.max(skillsCount - 1, 1));

    // Center the nodes vertically
    const peopleStartY = (canvasHeight - (peopleCount - 1) * personSpacing) / 2;
    const skillsStartY = (canvasHeight - (skillsCount - 1) * skillSpacing) / 2;

    const personPositions = Array.from({ length: peopleCount }, (_, i) => ({
        x: leftX,
        y: peopleStartY + i * personSpacing,
    }));

    const skillPositions = Array.from({ length: skillsCount }, (_, i) => ({
        x: rightX,
        y: skillsStartY + i * skillSpacing,
    }));

    return { personPositions, skillPositions };
}

// ─── Main converter ───────────────────────────────────────────────────────────

export function buildReactFlowElements(state: GraphState): { nodes: Node[]; edges: Edge[] } {
    const { people, skills, connections } = state;

    const { personPositions, skillPositions } = bipartiteLayout(people.length, skills.length);

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
        type: 'default', // Use bezier curves for cleaner connections
        animated: false,
        style: {
            stroke: PROFICIENCY_COLOR[c.proficiency],
            strokeWidth: 2.5,
            strokeOpacity: 0.6,
        },
        data: {
            proficiency: c.proficiency,
            label: c.proficiency, // Store label in data instead of showing always
        },
    }));

    return { nodes: [...personNodes, ...skillNodes], edges };
}
