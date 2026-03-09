import { GraphState, PersonNode, SkillNode, Connection } from './types';

// ─── Seed People ──────────────────────────────────────────────────────────────
const SEED_PEOPLE: PersonNode[] = [
    { id: 'p1', name: 'Rohit', role: 'Frontend Engineer' },
    { id: 'p2', name: 'Nikeeta', role: 'Full-Stack Engineer' },
    { id: 'p3', name: 'Abhishek', role: 'Backend Engineer' },
    { id: 'p4', name: 'Ruhi', role: 'Designer' },
    { id: 'p5', name: 'Eva', role: 'DevOps Engineer' },
];

// ─── Seed Skills ──────────────────────────────────────────────────────────────
const SEED_SKILLS: SkillNode[] = [
    { id: 's1', name: 'React', category: 'Frontend' },
    { id: 's2', name: 'TypeScript', category: 'Frontend' },
    { id: 's3', name: 'Node.js', category: 'Backend' },
    { id: 's4', name: 'PostgreSQL', category: 'Backend' },
    { id: 's5', name: 'Docker', category: 'DevOps' },
    { id: 's6', name: 'Figma', category: 'Design' },
    { id: 's7', name: 'CSS', category: 'Frontend' },
    { id: 's8', name: 'GraphQL', category: 'Backend' },
    { id: 's9', name: 'CI/CD', category: 'DevOps' },
    { id: 's10', name: 'Next.js', category: 'Frontend' },
];

// ─── Seed Connections ─────────────────────────────────────────────────────────
const SEED_CONNECTIONS: Connection[] = [
    // Alice – Frontend Engineer
    { personId: 'p1', skillId: 's1', proficiency: 'expert' },
    { personId: 'p1', skillId: 's2', proficiency: 'expert' },
    { personId: 'p1', skillId: 's10', proficiency: 'familiar' },
    { personId: 'p1', skillId: 's7', proficiency: 'familiar' },
    { personId: 'p1', skillId: 's6', proficiency: 'learning' },

    // Bob – Full-Stack Engineer
    { personId: 'p2', skillId: 's1', proficiency: 'familiar' },
    { personId: 'p2', skillId: 's3', proficiency: 'expert' },
    { personId: 'p2', skillId: 's2', proficiency: 'familiar' },
    { personId: 'p2', skillId: 's4', proficiency: 'learning' },
    { personId: 'p2', skillId: 's10', proficiency: 'expert' },

    // Carol – Backend Engineer
    { personId: 'p3', skillId: 's3', proficiency: 'expert' },
    { personId: 'p3', skillId: 's4', proficiency: 'expert' },
    { personId: 'p3', skillId: 's8', proficiency: 'expert' },
    { personId: 'p3', skillId: 's5', proficiency: 'familiar' },
    { personId: 'p3', skillId: 's2', proficiency: 'learning' },

    // Dan – Designer
    { personId: 'p4', skillId: 's6', proficiency: 'expert' },
    { personId: 'p4', skillId: 's7', proficiency: 'familiar' },
    { personId: 'p4', skillId: 's1', proficiency: 'learning' },

    // Eva – DevOps Engineer
    { personId: 'p5', skillId: 's5', proficiency: 'expert' },
    { personId: 'p5', skillId: 's9', proficiency: 'expert' },
    { personId: 'p5', skillId: 's3', proficiency: 'familiar' },
    { personId: 'p5', skillId: 's4', proficiency: 'familiar' },
];

export const SEED_DATA: GraphState = {
    people: SEED_PEOPLE,
    skills: SEED_SKILLS,
    connections: SEED_CONNECTIONS,
};
