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
        setState(loadedState);
        setIsHydrated(true);
    }, []);

    const update = useCallback((next: GraphState) => {
        setState(next);
        saveGraphState(next);
    }, []);

    // ── People ─────────────────────────────────────────────────────────────────
    const addPerson = useCallback((name: string, role?: string) => {
        const id = generateId('p', state.people.map((p) => p.id));
        const next: GraphState = {
            ...state,
            people: [...state.people, { id, name, role }],
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
        update({
            ...state,
            skills: [...state.skills, { id, name, category }],
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
