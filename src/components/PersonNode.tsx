'use client';

import { memo } from 'react';
import { PersonNode as PersonNodeType } from '@/lib/types';

type PersonNodeData = { person: PersonNodeType; dimmed?: boolean; selected?: boolean };

interface Props {
    data: PersonNodeData;
}

function PersonNodeComponent({ data }: Props) {
    const { person, dimmed, selected } = data;
    return (
        <div
            className="person-node"
            data-selected={selected}
            data-dimmed={dimmed}
            title={person.role}
        >
            <div className="person-avatar">
                {person.name.charAt(0).toUpperCase()}
            </div>
            <div className="person-info">
                <span className="person-name">{person.name}</span>
                {person.role && <span className="person-role">{person.role}</span>}
            </div>
        </div>
    );
}

export default memo(PersonNodeComponent);
