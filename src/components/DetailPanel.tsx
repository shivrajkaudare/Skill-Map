'use client';

import { useState } from 'react';
import { GraphState, PersonNode, SkillNode, Proficiency } from '@/lib/types';
import { PROFICIENCY_COLOR, CATEGORY_COLOR } from '@/lib/graphHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Pencil, Trash2, Check, XCircle } from 'lucide-react';
import SkillRadarChart from './charts/SkillRadarChart';

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Design', 'Other'];
const PROFICIENCY_OPTIONS: Proficiency[] = ['learning', 'familiar', 'expert'];

// ── Proficiency pill (Editable) ──────────────────────────────────────────────
interface ProfBadgeProps {
    level: Proficiency;
    personId: string;
    skillId: string;
    onEdit?: (personId: string, skillId: string, proficiency: Proficiency) => void;
}

function ProfBadge({ level, personId, skillId, onEdit }: ProfBadgeProps) {
    const [editingProf, setEditingProf] = useState(false);

    if (!onEdit || !editingProf) {
        return (
            <div className="flex items-center gap-1">
                <span
                    className="prof-badge"
                    style={{
                        background: PROFICIENCY_COLOR[level] + '22',
                        color: PROFICIENCY_COLOR[level],
                        border: `1px solid ${PROFICIENCY_COLOR[level]}55`,
                    }}
                >
                    {level}
                </span>
                {onEdit && (
                    <button
                        className="prof-edit-btn"
                        onClick={() => setEditingProf(true)}
                        title="Edit proficiency"
                    >
                        <Pencil size={12} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <Select
            value={level}
            onValueChange={(newProf) => {
                onEdit(personId, skillId, newProf as Proficiency);
                setEditingProf(false);
            }}
        >
            <SelectTrigger className="h-6 text-xs w-24">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {PROFICIENCY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                        <span style={{ color: PROFICIENCY_COLOR[p], fontWeight: 600 }}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    state: GraphState;
    selectedPersonId: string | null;
    selectedSkillId: string | null;
    onClose: () => void;
    onEditPerson: (id: string, name: string, role?: string) => void;
    onDeletePerson: (id: string) => void;
    onEditSkill: (id: string, name: string, category?: string) => void;
    onDeleteSkill: (id: string) => void;
    onDeleteConnection: (personId: string, skillId: string) => void;
    onEditConnectionProficiency: (personId: string, skillId: string, proficiency: Proficiency) => void;
    theme: 'light' | 'dark';
}

export default function DetailPanel({
    state, selectedPersonId, selectedSkillId,
    onClose, onEditPerson, onDeletePerson,
    onEditSkill, onDeleteSkill, onDeleteConnection,
    onEditConnectionProficiency,
    theme,
}: Props) {
    const [editing, setEditing] = useState(false);
    const [nameVal, setNameVal] = useState('');
    const [roleVal, setRoleVal] = useState('');
    const [catVal, setCatVal] = useState('');

    const person = selectedPersonId
        ? state.people.find((p) => p.id === selectedPersonId) ?? null
        : null;
    const skill = selectedSkillId
        ? state.skills.find((s) => s.id === selectedSkillId) ?? null
        : null;

    if (!person && !skill) return null;

    // ── Person panel ──────────────────────────────────────────────────────────
    if (person) {
        const connections = state.connections
            .filter((c) => c.personId === person.id)
            .map((c) => ({
                skill: state.skills.find((s) => s.id === c.skillId)!,
                proficiency: c.proficiency,
            }))
            .filter((c) => c.skill);

        function startEdit() {
            setNameVal(person!.name);
            setRoleVal(person!.role ?? '');
            setEditing(true);
        }

        function saveEdit() {
            onEditPerson(person!.id, nameVal.trim(), roleVal.trim() || undefined);
            setEditing(false);
        }

        return (
            <div className="detail-panel">
                {/* Header */}
                <div className="panel-header">
                    <div className="panel-avatar person-color">
                        {person.name.charAt(0)}
                    </div>
                    <div className="panel-title-block">
                        {editing ? (
                            <>
                                <Input value={nameVal} onChange={(e) => setNameVal(e.target.value)} className="edit-input" />
                                <Input value={roleVal} onChange={(e) => setRoleVal(e.target.value)} placeholder="Role" className="edit-input mt-1" />
                            </>
                        ) : (
                            <>
                                <h2 className="panel-title">{person.name}</h2>
                                {person.role && <p className="panel-subtitle">{person.role}</p>}
                            </>
                        )}
                    </div>
                    <button className="panel-close" onClick={onClose}><X size={16} /></button>
                </div>

                <Separator className="my-3" />

                {/* Skills list */}
                <p className="section-label">Skills ({connections.length})</p>
                <div className="connections-list">
                    {connections.length === 0 && (
                        <p className="empty-msg">No skills assigned yet.</p>
                    )}
                    {connections.map(({ skill: sk, proficiency }) => (
                        <div key={sk.id} className="connection-row">
                            <span
                                className="conn-dot"
                                style={{ background: CATEGORY_COLOR[sk.category ?? 'Other'] }}
                            />
                            <span className="conn-name">{sk.name}</span>
                            <ProfBadge
                                level={proficiency}
                                personId={person.id}
                                skillId={sk.id}
                                onEdit={onEditConnectionProficiency}
                            />
                            <button
                                className="del-conn-btn"
                                onClick={() => onDeleteConnection(person.id, sk.id)}
                                title="Remove skill"
                            >
                                <XCircle size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Personal Skill Radar Chart */}
                {connections.length > 0 && (
                    <div className="chart-section">
                        <h3 className="chart-title">🎯 Skill Profile</h3>
                        <SkillRadarChart
                            skills={connections.map((c) => ({
                                skill: c.skill.name,
                                proficiency:
                                    c.proficiency === 'expert' ? 3 : c.proficiency === 'familiar' ? 2 : 1,
                            }))}
                            theme={theme}
                        />
                    </div>
                )}

                <Separator className="my-3" />

                {/* Actions */}
                <div className="panel-actions">
                    {editing ? (
                        <>
                            <Button size="sm" className="action-btn-save" onClick={saveEdit}>
                                <Check size={14} /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button size="sm" variant="outline" className="action-btn" onClick={startEdit}>
                                <Pencil size={14} /> Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="action-btn"
                                onClick={() => onDeletePerson(person.id)}
                            >
                                <Trash2 size={14} /> Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ── Skill panel ───────────────────────────────────────────────────────────
    if (skill) {
        const connections = state.connections
            .filter((c) => c.skillId === skill.id)
            .map((c) => ({
                person: state.people.find((p) => p.id === c.personId)!,
                proficiency: c.proficiency,
            }))
            .filter((c) => c.person);

        const catColor = CATEGORY_COLOR[skill.category ?? 'Other'];

        function startEdit() {
            setNameVal(skill!.name);
            setCatVal(skill!.category ?? '');
            setEditing(true);
        }

        function saveEdit() {
            onEditSkill(skill!.id, nameVal.trim(), catVal || undefined);
            setEditing(false);
        }

        return (
            <div className="detail-panel">
                {/* Header */}
                <div className="panel-header">
                    <div className="panel-avatar" style={{ background: catColor + '22', color: catColor, border: `2px solid ${catColor}` }}>
                        {skill.name.charAt(0)}
                    </div>
                    <div className="panel-title-block">
                        {editing ? (
                            <>
                                <Input value={nameVal} onChange={(e) => setNameVal(e.target.value)} className="edit-input" />
                                <Select value={catVal} onValueChange={setCatVal}>
                                    <SelectTrigger className="edit-input mt-1 h-8">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        ) : (
                            <>
                                <h2 className="panel-title">{skill.name}</h2>
                                {skill.category && (
                                    <Badge className="panel-cat-badge" style={{ background: catColor + '22', color: catColor, border: `1px solid ${catColor}55` }}>
                                        {skill.category}
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                    <button className="panel-close" onClick={onClose}><X size={16} /></button>
                </div>

                <Separator className="my-3" />

                {/* People list */}
                <p className="section-label">Team Members ({connections.length})</p>
                <div className="connections-list">
                    {connections.length === 0 && (
                        <p className="empty-msg">Nobody has this skill yet.</p>
                    )}
                    {connections.map(({ person: pe, proficiency }) => (
                        <div key={pe.id} className="connection-row">
                            <span className="conn-dot person-dot" />
                            <span className="conn-name">{pe.name}</span>
                            {pe.role && <span className="conn-role">{pe.role}</span>}
                            <ProfBadge
                                level={proficiency}
                                personId={pe.id}
                                skillId={skill.id}
                                onEdit={onEditConnectionProficiency}
                            />
                            <button
                                className="del-conn-btn"
                                onClick={() => onDeleteConnection(pe.id, skill.id)}
                                title="Remove"
                            >
                                <XCircle size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <Separator className="my-3" />

                {/* Actions */}
                <div className="panel-actions">
                    {editing ? (
                        <>
                            <Button size="sm" className="action-btn-save" onClick={saveEdit}>
                                <Check size={14} /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button size="sm" variant="outline" className="action-btn" onClick={startEdit}>
                                <Pencil size={14} /> Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="action-btn"
                                onClick={() => onDeleteSkill(skill.id)}
                            >
                                <Trash2 size={14} /> Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
