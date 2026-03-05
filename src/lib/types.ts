// ─── Core Domain Types ───────────────────────────────────────────────────────

export type Proficiency = 'learning' | 'familiar' | 'expert';

export interface PersonNode {
  id: string;       // e.g. "p1"
  name: string;
  role?: string;
  x?: number;
  y?: number;
}

export interface SkillNode {
  id: string;       // e.g. "s1"
  name: string;
  category?: string; // e.g. "Frontend", "Backend", "DevOps", "Design"
  x?: number;
  y?: number;
}

export interface Connection {
  personId: string;
  skillId: string;
  proficiency: Proficiency;
}

// ─── Full Graph State (what we persist in localStorage) ───────────────────────

export interface GraphState {
  people: PersonNode[];
  skills: SkillNode[];
  connections: Connection[];
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type SelectedNode =
  | { type: 'person'; id: string }
  | { type: 'skill'; id: string }
  | null;
