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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Design', 'Other'];

interface Props {
    onAdd: (name: string, category?: string) => void;
    existingSkills: string[];
}

export default function AddSkillDialog({ onAdd, existingSkills }: Props) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setError('Skill name is required');
            return;
        }

        // Check for duplicate skill (case-insensitive)
        const isDuplicate = existingSkills.some(
            skill => skill.toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicate) {
            setError('This skill already exists');
            return;
        }

        onAdd(name.trim(), category || undefined);
        setName('');
        setCategory('');
        setError('');
        setOpen(false);
    }

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setName(e.target.value);
        if (error) setError(''); // Clear error when user starts typing
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 add-btn">
                    <Zap size={15} /> Add Skill
                </Button>
            </DialogTrigger>
            <DialogContent className="dialog-card">
                <DialogHeader>
                    <DialogTitle>Add New Skill</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="dialog-form">
                    <div className="field">
                        <Label htmlFor="skill-name">Skill Name *</Label>
                        <Input
                            id="skill-name"
                            placeholder="e.g. Redis"
                            value={name}
                            onChange={handleNameChange}
                            autoFocus
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    <div className="field">
                        <Label htmlFor="skill-category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="skill-category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="submit-btn" disabled={!name.trim()}>
                        Add Skill
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
