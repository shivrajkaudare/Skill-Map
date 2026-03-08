'use client';

import { memo } from 'react';
import { SkillNode as SkillNodeType } from '@/lib/types';
import { CATEGORY_COLOR } from '@/lib/cytoscapeHelpers';

type SkillNodeData = { skill: SkillNodeType; dimmed?: boolean; selected?: boolean };

interface Props {
    data: SkillNodeData;
}

const CATEGORY_ICON: Record<string, string> = {
    Frontend: '🎨',
    Backend: '⚙️',
    DevOps: '🚀',
    Design: '✏️',
    Other: '💡',
};

function SkillNodeComponent({ data }: Props) {
    const { skill, dimmed, selected } = data;
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
