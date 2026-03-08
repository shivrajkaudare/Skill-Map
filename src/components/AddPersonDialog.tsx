'use client';

import { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';

interface Props {
    onAdd: (name: string, role?: string) => void;
    existingPeople: Array<{ name: string; role?: string }>;
}

export default function AddPersonDialog({ onAdd, existingPeople }: Props) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        // Check for duplicate person (same name AND same role, case-insensitive)
        const trimmedName = name.trim();
        const trimmedRole = role.trim() || undefined;

        const isDuplicate = existingPeople.some(
            person =>
                person.name.toLowerCase() === trimmedName.toLowerCase() &&
                (person.role?.toLowerCase() || undefined) === (trimmedRole?.toLowerCase() || undefined)
        );

        if (isDuplicate) {
            setError('A person with this name and role already exists');
            return;
        }

        onAdd(name.trim(), role.trim() || undefined);
        setName('');
        setRole('');
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
                    <UserPlus size={15} /> Add Person
                </Button>
            </DialogTrigger>
            <DialogContent className="dialog-card">
                <DialogHeader>
                    <DialogTitle>Add New Person</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="dialog-form">
                    <div className="field">
                        <Label htmlFor="person-name">Name *</Label>
                        <Input
                            id="person-name"
                            placeholder="e.g. Frank"
                            value={name}
                            onChange={handleNameChange}
                            autoFocus
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    <div className="field">
                        <Label htmlFor="person-role">Role (optional)</Label>
                        <Input
                            id="person-role"
                            placeholder="e.g. Frontend Engineer"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="submit-btn" disabled={!name.trim()}>
                        Add Person
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
