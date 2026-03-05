import { GraphState } from './types';
import { SEED_DATA } from './seedData';

const STORAGE_KEY = 'skillsmap_graph_state';

export function loadGraphState(): GraphState {
    if (typeof window === 'undefined') return SEED_DATA;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return SEED_DATA;
        return JSON.parse(raw) as GraphState;
    } catch {
        return SEED_DATA;
    }
}

export function saveGraphState(state: GraphState): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // storage quota exceeded — silently ignore
    }
}

export function clearGraphState(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
