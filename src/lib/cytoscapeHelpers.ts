import type { ElementDefinition, Stylesheet } from 'cytoscape';
import { GraphState, SelectedNode, Proficiency } from './types';

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

export function buildCytoscapeElements(state: GraphState): ElementDefinition[] {
    const { people, skills, connections } = state;

    const { personPositions, skillPositions } = bipartiteLayout(people.length, skills.length);

    const elements: ElementDefinition[] = [];

    // ── Nodes ──────────────────────────────────────────────────────────────────
    people.forEach((p, i) => {
        elements.push({
            group: 'nodes',
            data: {
                id: p.id,
                type: 'person',
                label: p.name,
                person: p,
            },
            position: p.x !== undefined ? { x: p.x, y: p.y! } : personPositions[i],
        });
    });

    skills.forEach((s, i) => {
        elements.push({
            group: 'nodes',
            data: {
                id: s.id,
                type: 'skill',
                label: s.name,
                skill: s,
                category: s.category || 'Other',
            },
            position: s.x !== undefined ? { x: s.x, y: s.y! } : skillPositions[i],
        });
    });

    // ── Edges ──────────────────────────────────────────────────────────────────
    connections.forEach((c) => {
        elements.push({
            group: 'edges',
            data: {
                id: `${c.personId}-${c.skillId}`,
                source: c.personId,
                target: c.skillId,
                proficiency: c.proficiency,
            },
        });
    });

    return elements;
}

// ─── Highlight/Dim Helper ─────────────────────────────────────────────────────

export function getHighlightedElements(
    state: GraphState,
    selectedNode: SelectedNode | null
): { nodeIds: Set<string>, edgeIds: Set<string> } {
    const nodeIds = new Set<string>();
    const edgeIds = new Set<string>();

    if (!selectedNode) return { nodeIds, edgeIds };

    nodeIds.add(selectedNode.id);

    state.connections.forEach((c) => {
        if (selectedNode.type === 'person' && c.personId === selectedNode.id) {
            nodeIds.add(c.skillId);
            edgeIds.add(`${c.personId}-${c.skillId}`);
        }
        if (selectedNode.type === 'skill' && c.skillId === selectedNode.id) {
            nodeIds.add(c.personId);
            edgeIds.add(`${c.personId}-${c.skillId}`);
        }
    });

    return { nodeIds, edgeIds };
}

// ─── Cytoscape Stylesheet ──────────────────────────────────────────────────────

export const cytoscapeStylesheet: Stylesheet[] = [
    // Base node styles
    {
        selector: 'node',
        style: {
            'width': 140,
            'height': 44,
            'shape': 'roundrectangle',
            'background-color': '#ffffff',
            'border-width': 2,
            'border-color': '#e2e8f0',
            'label': 'data(label)',
            'font-size': '13px',
            'font-weight': '600',
            'color': '#0f172a',
            'text-valign': 'center',
            'text-halign': 'center',
            'cursor': 'pointer',
            'transition-property': 'border-width, border-color, background-color',
            'transition-duration': '0.2s',
        },
    },
    // Person nodes
    {
        selector: 'node[type="person"]',
        style: {
            'background-color': '#6366f1',
            'border-color': '#e2e8f0',
            'color': '#ffffff',
        },
    },
    // Skill nodes with category-based border colors
    {
        selector: 'node[type="skill"][category="Frontend"]',
        style: {
            'border-color': '#8B5CF6',
        },
    },
    {
        selector: 'node[type="skill"][category="Backend"]',
        style: {
            'border-color': '#EC4899',
        },
    },
    {
        selector: 'node[type="skill"][category="DevOps"]',
        style: {
            'border-color': '#F97316',
        },
    },
    {
        selector: 'node[type="skill"][category="Design"]',
        style: {
            'border-color': '#14B8A6',
        },
    },
    {
        selector: 'node[type="skill"][category="Other"]',
        style: {
            'border-color': '#6B7280',
        },
    },
    // Highlighted nodes
    {
        selector: 'node.highlighted',
        style: {
            'z-index': 1000,
            'border-width': 3,
        },
    },
    // Dimmed nodes
    {
        selector: 'node.dimmed',
        style: {
            'opacity': 0.25,
        },
    },
    // Hover effect for nodes
    {
        selector: 'node:active',
        style: {
            'overlay-opacity': 0.1,
        },
    },
    // Base edge styles
    {
        selector: 'edge',
        style: {
            'width': 2.5,
            'line-color': '#94a3b8',
            'target-arrow-shape': 'none',
            'curve-style': 'bezier',
            'opacity': 0.6,
            'transition-property': 'width, opacity',
            'transition-duration': '0.2s',
        },
    },
    // Edge colors by proficiency
    {
        selector: 'edge[proficiency="learning"]',
        style: {
            'line-color': PROFICIENCY_COLOR.learning,
        },
    },
    {
        selector: 'edge[proficiency="familiar"]',
        style: {
            'line-color': PROFICIENCY_COLOR.familiar,
        },
    },
    {
        selector: 'edge[proficiency="expert"]',
        style: {
            'line-color': PROFICIENCY_COLOR.expert,
        },
    },
    // Highlighted edges
    {
        selector: 'edge.highlighted',
        style: {
            'width': 3.5,
            'opacity': 1,
            'z-index': 999,
        },
    },
    // Dimmed edges
    {
        selector: 'edge.dimmed',
        style: {
            'opacity': 0.15,
        },
    },
    // Edge hover effect
    {
        selector: 'edge:active',
        style: {
            'width': 3.5,
            'opacity': 1,
        },
    },
];
