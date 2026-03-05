'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PersonNode as PersonNodeType } from '@/lib/types';

type PersonNodeData = { person: PersonNodeType; dimmed?: boolean };

function PersonNodeComponent({ data, selected }: NodeProps) {
    const { person, dimmed } = data as PersonNodeData;
    return (
        <div
            className="person-node"
            data-selected={selected}
            data-dimmed={dimmed}
            title={person.role}
        >
            <Handle type="source" position={Position.Right} className="react-flow__handle" />
            <Handle type="target" position={Position.Left} className="react-flow__handle" />

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
