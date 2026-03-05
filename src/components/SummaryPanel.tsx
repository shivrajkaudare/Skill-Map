'use client';

import { useMemo } from 'react';
import { GraphState } from '@/lib/types';
import { BarChart3 } from 'lucide-react';

interface Props { state: GraphState }

export default function SummaryPanel({ state }: Props) {
    const stats = useMemo(() => {
        const { people, skills, connections } = state;

        // Skill count per skill
        const skillCount: Record<string, number> = {};
        connections.forEach((c) => {
            skillCount[c.skillId] = (skillCount[c.skillId] ?? 0) + 1;
        });

        // Person count per person
        const personCount: Record<string, number> = {};
        connections.forEach((c) => {
            personCount[c.personId] = (personCount[c.personId] ?? 0) + 1;
        });

        // Most common skill
        const topSkillId = Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topSkill = skills.find((s) => s.id === topSkillId);
        const topSkillCnt = topSkillId ? skillCount[topSkillId] : 0;

        // Skill gaps = skills known by only one person
        const gapSkills = skills.filter((s) => (skillCount[s.id] ?? 0) === 1);

        // Skills no one knows
        const unknownSkills = skills.filter((s) => !skillCount[s.id]);

        // Most skilled person
        const topPersonId = Object.entries(personCount).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topPerson = people.find((p) => p.id === topPersonId);
        const topPersonCnt = topPersonId ? personCount[topPersonId] : 0;

        return { topSkill, topSkillCnt, gapSkills, unknownSkills, topPerson, topPersonCnt };
    }, [state]);

    return (
        <div className="summary-panel">
            <div className="summary-header">
                <BarChart3 size={16} />
                <span>Team Summary</span>
            </div>

            <div className="summary-stats">
                <div className="stat-row">
                    <span className="stat-label">👥 Team size</span>
                    <span className="stat-value">{state.people.length}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">⚡ Skills tracked</span>
                    <span className="stat-value">{state.skills.length}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">🔗 Connections</span>
                    <span className="stat-value">{state.connections.length}</span>
                </div>
            </div>

            {stats.topSkill && (
                <div className="summary-item">
                    <span className="sum-label">🏆 Most common skill</span>
                    <span className="sum-value">{stats.topSkill.name}
                        <span className="sum-count">{stats.topSkillCnt} people</span>
                    </span>
                </div>
            )}

            {stats.topPerson && (
                <div className="summary-item">
                    <span className="sum-label">🎯 Most skilled</span>
                    <span className="sum-value">{stats.topPerson.name}
                        <span className="sum-count">{stats.topPersonCnt} skills</span>
                    </span>
                </div>
            )}

            {stats.gapSkills.length > 0 && (
                <div className="summary-item">
                    <span className="sum-label">⚠️ Skill gaps (1 person)</span>
                    <div className="gap-list">
                        {stats.gapSkills.map((s) => (
                            <span key={s.id} className="gap-chip">{s.name}</span>
                        ))}
                    </div>
                </div>
            )}

            {stats.unknownSkills.length > 0 && (
                <div className="summary-item">
                    <span className="sum-label">❌ Uncovered skills</span>
                    <div className="gap-list">
                        {stats.unknownSkills.map((s) => (
                            <span key={s.id} className="gap-chip gap-chip-red">{s.name}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
