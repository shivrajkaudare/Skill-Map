'use client';

import { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Link2 } from 'lucide-react';
import { PersonNode, SkillNode, Proficiency } from '@/lib/types';
import { PROFICIENCY_COLOR } from '@/lib/graphHelpers';

const PROFICIENCY_OPTIONS: Proficiency[] = ['learning', 'familiar', 'expert'];

interface Props {
    people: PersonNode[];
    skills: SkillNode[];
    onAdd: (personId: string, skillId: string, proficiency: Proficiency) => void;
    defaultPersonId?: string;
    defaultSkillId?: string;
}

export default function AddConnectionDialog({
    people, skills, onAdd, defaultPersonId, defaultSkillId,
}: Props) {
    const [open, setOpen] = useState(false);
    const [personId, setPersonId] = useState(defaultPersonId ?? '');
    const [skillId, setSkillId] = useState(defaultSkillId ?? '');
    const [proficiency, setProficiency] = useState<Proficiency>('familiar');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!personId || !skillId) return;
        onAdd(personId, skillId, proficiency);
        setPersonId(defaultPersonId ?? '');
        setSkillId(defaultSkillId ?? '');
        setProficiency('familiar');
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 add-btn">
                    <Link2 size={15} /> Add Connection
                </Button>
            </DialogTrigger>
            <DialogContent className="dialog-card">
                <DialogHeader>
                    <DialogTitle>Add Connection</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="dialog-form">
                    <div className="field">
                        <Label>Person *</Label>
                        <Select value={personId} onValueChange={setPersonId}>
                            <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                            <SelectContent>
                                {people.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="field">
                        <Label>Skill *</Label>
                        <Select value={skillId} onValueChange={setSkillId}>
                            <SelectTrigger><SelectValue placeholder="Select skill" /></SelectTrigger>
                            <SelectContent>
                                {skills.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="field">
                        <Label>Proficiency *</Label>
                        <Select value={proficiency} onValueChange={(v) => setProficiency(v as Proficiency)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                    </div>
                    <Button
                        type="submit"
                        className="submit-btn"
                        disabled={!personId || !skillId}
                    >
                        Add Connection
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
