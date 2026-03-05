'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { SkillNode as SkillNodeType } from '@/lib/types';
import { CATEGORY_COLOR } from '@/lib/graphHelpers';

type SkillNodeData = { skill: SkillNodeType; dimmed?: boolean };

const CATEGORY_ICON: Record<string, string> = {
    Frontend: '🎨',
    Backend: '⚙️',
    DevOps: '🚀',
    Design: '✏️',
    Other: '💡',
};

function SkillNodeComponent({ data, selected }: NodeProps) {
    const { skill, dimmed } = data as SkillNodeData;
    const color = CATEGORY_COLOR[skill.category ?? 'Other'] ?? CATEGORY_COLOR.Other;
    const icon = CATEGORY_ICON[skill.category ?? 'Other'] ?? '💡';

    return (
        <div
            className="skill-node"
            data-selected={selected}
            data-dimmed={dimmed}
            style={{ borderColor: color }}
            title={skill.category}
        >
            <Handle type="source" position={Position.Right} className="react-flow__handle" />
            <Handle type="target" position={Position.Left} className="react-flow__handle" />

            <span className="skill-icon">{icon}</span>
            <div className="skill-info">
                <span className="skill-name">{skill.name}</span>
                {skill.category && (
                    <span className="skill-category" style={{ color }}>
                        {skill.category}
                    </span>
                )}
            </div>
        </div>
    );
}

export default memo(SkillNodeComponent);
