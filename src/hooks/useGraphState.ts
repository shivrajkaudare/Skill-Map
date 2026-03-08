'use client';

import { useState, useCallback, useEffect } from 'react';
import { GraphState, PersonNode, SkillNode, Connection, Proficiency, SelectedNode } from '@/lib/types';
import { loadGraphState, saveGraphState } from '@/lib/storage';
import { SEED_DATA } from '@/lib/seedData';

function generateId(prefix: string, existing: string[]): string {
    let n = existing.length + 1;
    while (existing.includes(`${prefix}${n}`)) n++;
    return `${prefix}${n}`;
}

export function useGraphState() {
    // Initialize with seed data to avoid hydration mismatch
    const [state, setState] = useState<GraphState>(SEED_DATA);
    const [selectedNode, setSelectedNode] = useState<SelectedNode>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage only on client after hydration
    useEffect(() => {
        const loadedState = loadGraphState();

        // Ensure all nodes have positions assigned
        const PADDING = 100;
        const SPACING = 120;
        const canvasWidth = 1200;
        const leftX = PADDING;
        const rightX = canvasWidth - PADDING;

        // Assign positions to people who don't have them
        let currentPersonY = PADDING;
        const peopleWithPositions = loadedState.people.map(person => {
            if (person.x !== undefined && person.y !== undefined) {
                // Keep track of max Y for positioned nodes
                if (person.y > currentPersonY - SPACING) {
                    currentPersonY = person.y + SPACING;
                }
                return person;
            }
            const positioned = { ...person, x: leftX, y: currentPersonY };
            currentPersonY += SPACING;
            return positioned;
        });

        // Assign positions to skills who don't have them
        let currentSkillY = PADDING;
        const skillsWithPositions = loadedState.skills.map(skill => {
            if (skill.x !== undefined && skill.y !== undefined) {
                // Keep track of max Y for positioned nodes
                if (skill.y > currentSkillY - SPACING) {
                    currentSkillY = skill.y + SPACING;
                }
                return skill;
            }
            const positioned = { ...skill, x: rightX, y: currentSkillY };
            currentSkillY += SPACING;
            return positioned;
        });

        const stateWithPositions = {
            ...loadedState,
            people: peopleWithPositions,
            skills: skillsWithPositions,
        };

        setState(stateWithPositions);
        saveGraphState(stateWithPositions);
        setIsHydrated(true);
    }, []);

    const update = useCallback((next: GraphState) => {
        setState(next);
        saveGraphState(next);
    }, []);

    // ── People ─────────────────────────────────────────────────────────────────
    const addPerson = useCallback((name: string, role?: string) => {
        const id = generateId('p', state.people.map((p) => p.id));

        // Calculate initial position for new person (left column)
        const PADDING = 100;
        const SPACING = 120;
        const leftX = PADDING;

        // Find the lowest Y position among existing people, or start at top
        const existingYPositions = state.people
            .map(p => p.y)
            .filter((y): y is number => y !== undefined);
        const newY = existingYPositions.length > 0
            ? Math.max(...existingYPositions) + SPACING
            : PADDING;

        const next: GraphState = {
            ...state,
            people: [...state.people, { id, name, role, x: leftX, y: newY }],
        };
        update(next);
    }, [state, update]);

    const editPerson = useCallback((id: string, name: string, role?: string) => {
        update({
            ...state,
            people: state.people.map((p) => (p.id === id ? { ...p, name, role } : p)),
        });
    }, [state, update]);

    const deletePerson = useCallback((id: string) => {
        update({
            ...state,
            people: state.people.filter((p) => p.id !== id),
            connections: state.connections.filter((c) => c.personId !== id),
        });
        setSelectedNode(null);
    }, [state, update]);

    // ── Skills ─────────────────────────────────────────────────────────────────
    const addSkill = useCallback((name: string, category?: string) => {
        const id = generateId('s', state.skills.map((s) => s.id));

        // Calculate initial position for new skill (right column)
        const PADDING = 100;
        const SPACING = 120;
        const canvasWidth = 1200;
        const rightX = canvasWidth - PADDING;

        // Find the lowest Y position among existing skills, or start at top
        const existingYPositions = state.skills
            .map(s => s.y)
            .filter((y): y is number => y !== undefined);
        const newY = existingYPositions.length > 0
            ? Math.max(...existingYPositions) + SPACING
            : PADDING;

        update({
            ...state,
            skills: [...state.skills, { id, name, category, x: rightX, y: newY }],
        });
    }, [state, update]);

    const editSkill = useCallback((id: string, name: string, category?: string) => {
        update({
            ...state,
            skills: state.skills.map((s) => (s.id === id ? { ...s, name, category } : s)),
        });
    }, [state, update]);

    const deleteSkill = useCallback((id: string) => {
        update({
            ...state,
            skills: state.skills.filter((s) => s.id !== id),
            connections: state.connections.filter((c) => c.skillId !== id),
        });
        setSelectedNode(null);
    }, [state, update]);

    // ── Connections ────────────────────────────────────────────────────────────
    const addConnection = useCallback((personId: string, skillId: string, proficiency: Proficiency) => {
        const exists = state.connections.some(
            (c) => c.personId === personId && c.skillId === skillId,
        );
        if (exists) return;
        update({
            ...state,
            connections: [...state.connections, { personId, skillId, proficiency }],
        });
    }, [state, update]);

    const deleteConnection = useCallback((personId: string, skillId: string) => {
        update({
            ...state,
            connections: state.connections.filter(
                (c) => !(c.personId === personId && c.skillId === skillId),
            ),
        });
    }, [state, update]);

    const editConnectionProficiency = useCallback((personId: string, skillId: string, proficiency: Proficiency) => {
        update({
            ...state,
            connections: state.connections.map((c) =>
                c.personId === personId && c.skillId === skillId
                    ? { ...c, proficiency }
                    : c
            ),
        });
    }, [state, update]);

    // ── Node position persistence ──────────────────────────────────────────────
    const updateNodePosition = useCallback((id: string, x: number, y: number) => {
        const isPerson = state.people.some((p) => p.id === id);
        if (isPerson) {
            update({ ...state, people: state.people.map((p) => (p.id === id ? { ...p, x, y } : p)) });
        } else {
            update({ ...state, skills: state.skills.map((s) => (s.id === id ? { ...s, x, y } : s)) });
        }
    }, [state, update]);

    // ── Reset ─────────────────────────────────────────────────────────────────
    const resetToSeed = useCallback(() => {
        import('@/lib/seedData').then(({ SEED_DATA }) => {
            update(SEED_DATA);
            setSelectedNode(null);
        });
    }, [update]);

    return {
        state,
        selectedNode,
        setSelectedNode,
        addPerson,
        editPerson,
        deletePerson,
        addSkill,
        editSkill,
        deleteSkill,
        addConnection,
        deleteConnection,
        editConnectionProficiency,
        updateNodePosition,
        resetToSeed,
    };
}
