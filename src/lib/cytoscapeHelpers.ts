import type { ElementDefinition } from 'cytoscape';
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
        const pos = p.x !== undefined ? { x: p.x, y: p.y! } : personPositions[i];
        elements.push({
            group: 'nodes',
            data: {
                id: p.id,
                type: 'person',
                label: p.name,
                person: p,
                x: pos.x,
                y: pos.y,
            },
            position: pos,
        });
    });

    skills.forEach((s, i) => {
        const pos = s.x !== undefined ? { x: s.x, y: s.y! } : skillPositions[i];
        elements.push({
            group: 'nodes',
            data: {
                id: s.id,
                type: 'skill',
                label: s.name,
                skill: s,
                category: s.category || 'Other',
                x: pos.x,
                y: pos.y,
            },
            position: pos,
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

export const getCytoscapeStylesheet = (theme: 'light' | 'dark'): any[] => {
    const isDark = theme === 'dark';

    // Theme Variables
    const bgColor = isDark ? ['#334155', '#1e293b'] : ['#f8fafc', '#ffffff'];
    const borderColor = isDark ? '#475569' : '#cbd5e1';
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const textOutline = isDark ? '#0f172a' : '#ffffff';
    const underlayBase = isDark ? '#475569' : '#94a3b8';

    // Pulse/Glow effects
    const highlightWidth = isDark ? 4 : 4;
    const highlightBg = isDark ? '#334155' : '#f1f5f9';

    const personBgDark = ['#818cf8', '#6366f1', '#4f46e5'];
    const personBgLight = ['#818cf8', '#6366f1', '#4f46e5']; // Kept vibrant 
    const personBorder = isDark ? '#a5b4fc' : '#818cf8';

    // Skill Category Bases
    const catColors = {
        Frontend: isDark ? '#a78bfa' : '#8b5cf6',
        Backend: isDark ? '#f472b6' : '#ec4899',
        DevOps: isDark ? '#fb923c' : '#f97316',
        Design: isDark ? '#2dd4bf' : '#14b8a6',
        Other: isDark ? '#9ca3af' : '#6b7280',
    };

    return [
        // Base node styles - Premium card design
        {
            selector: 'node',
            style: {
                'width': 160,
                'height': 56,
                'shape': 'round-rectangle',
                // Gradient background
                'background-fill': 'linear-gradient',
                'background-gradient-direction': 'to-bottom',
                'background-gradient-stop-colors': bgColor.join(' '),
                'background-gradient-stop-positions': '0% 100%',
                'background-opacity': 0.85,
                'border-width': 2.5,
                'border-color': borderColor,
                'border-style': 'solid',
                'label': 'data(label)',
                'font-size': '14px',
                'font-family': 'system-ui, -apple-system, sans-serif',
                'font-weight': '700',
                'color': textColor,
                'text-valign': 'center',
                'text-halign': 'center',
                'cursor': 'pointer',
                'text-outline-color': textOutline,
                'text-outline-width': 2, // slightly thicker for contrast
                // Smooth transitions
                'transition-property': 'border-width, border-color, background-color, width, height, shadow-blur',
                'transition-duration': '0.3s',
                'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
                // Premium shadow
                'shadow-blur': 12,
                'shadow-color': isDark ? '#000000' : '#cbd5e1',
                'shadow-opacity': isDark ? 0.4 : 0.6,
                'shadow-offset-x': 0,
                'shadow-offset-y': 3,
                // Subtle glow
                'underlay-color': underlayBase,
                'underlay-padding': 5,
                'underlay-opacity': 0.2,
                'underlay-shape': 'round-rectangle',
            },
        },
        // Person nodes - Premium circular design
        {
            selector: 'node[type="person"]',
            style: {
                'shape': 'ellipse',
                'width': 100,
                'height': 100,
                // Gradient-like effect using background
                'background-fill': 'radial-gradient',
                'background-gradient-stop-colors': (isDark ? personBgDark : personBgLight).join(' '),
                'background-gradient-stop-positions': '0% 50% 100%',
                'background-opacity': 0.9,
                'border-width': 3,
                'border-color': personBorder,
                'border-style': 'solid',
                'color': '#ffffff',
                'font-size': '15px',
                'font-weight': '700',
                'text-valign': 'center',
                'text-halign': 'center',
                'text-outline-color': '#4f46e5',
                'text-outline-width': 1.5,
                // Premium glow
                'underlay-color': '#818cf8',
                'underlay-padding': 8,
                'underlay-opacity': 0.4,
                'underlay-shape': 'ellipse',
                // Shadow effect
                'shadow-blur': 15,
                'shadow-color': '#6366f1',
                'shadow-opacity': 0.6,
                'shadow-offset-x': 0,
                'shadow-offset-y': 4,
            },
        },
        // Skill nodes with category-based colors and glows
        {
            selector: 'node[type="skill"][category="Frontend"]',
            style: {
                'border-color': catColors.Frontend,
                'border-width': 3,
                'shadow-color': catColors.Frontend,
                'shadow-blur': 15,
                'shadow-opacity': 0.5,
                'underlay-color': catColors.Frontend,
                'underlay-opacity': 0.25,
            },
        },
        {
            selector: 'node[type="skill"][category="Backend"]',
            style: {
                'border-color': catColors.Backend,
                'border-width': 3,
                'shadow-color': catColors.Backend,
                'shadow-blur': 15,
                'shadow-opacity': 0.5,
                'underlay-color': catColors.Backend,
                'underlay-opacity': 0.25,
            },
        },
        {
            selector: 'node[type="skill"][category="DevOps"]',
            style: {
                'border-color': catColors.DevOps,
                'border-width': 3,
                'shadow-color': catColors.DevOps,
                'shadow-blur': 15,
                'shadow-opacity': 0.5,
                'underlay-color': catColors.DevOps,
                'underlay-opacity': 0.25,
            },
        },
        {
            selector: 'node[type="skill"][category="Design"]',
            style: {
                'border-color': catColors.Design,
                'border-width': 3,
                'shadow-color': catColors.Design,
                'shadow-blur': 15,
                'shadow-opacity': 0.5,
                'underlay-color': catColors.Design,
                'underlay-opacity': 0.25,
            },
        },
        {
            selector: 'node[type="skill"][category="Other"]',
            style: {
                'border-color': catColors.Other,
                'border-width': 3,
                'shadow-color': catColors.Other,
                'shadow-blur': 12,
                'shadow-opacity': 0.4,
            },
        },
        // Highlighted nodes - Enhanced glow effect
        {
            selector: 'node.highlighted',
            style: {
                'z-index': 1000,
                'border-width': highlightWidth,
                'width': 175,
                'height': 62,
                'transition-duration': '0.3s',
                'shadow-blur': 25,
                'shadow-opacity': 0.8,
                'underlay-padding': 15,
                'underlay-opacity': 0.5,
            },
        },
        // Person highlighted - Premium pulse effect
        {
            selector: 'node[type="person"].highlighted',
            style: {
                'width': 115,
                'height': 115,
                'border-width': 4,
                'border-color': '#c7d2fe',
                'shadow-blur': 30,
                'shadow-color': '#818cf8',
                'shadow-opacity': 0.9,
                'underlay-color': '#818cf8',
                'underlay-padding': 18,
                'underlay-opacity': 0.6,
            },
        },
        // Dimmed nodes
        {
            selector: 'node.dimmed',
            style: {
                'opacity': 0.25,
            },
        },
        // Hover effect for nodes - Interactive scaling
        {
            selector: 'node:active',
            style: {
                'overlay-opacity': 0,
                'border-width': 4,
                'shadow-blur': 20,
                'shadow-opacity': 0.7,
            },
        },
        // Base edge styles
        {
            selector: 'edge',
            style: {
                'width': 2.5,
                'line-color': isDark ? '#475569' : '#cbd5e1',
                'target-arrow-shape': 'none',
                'curve-style': 'bezier',
                'opacity': 0.5,
                'line-style': 'dashed',
                'line-dash-pattern': [8, 8],
                'line-dash-offset': 0,
                'transition-property': 'width, opacity, line-color',
                'transition-duration': '0.3s',
                'transition-timing-function': 'ease-out',
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
                'width': 4,
                'opacity': 1,
                'z-index': 999,
                'line-style': 'solid', // optional: switch to solid, or keep dashed and glow
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
};
