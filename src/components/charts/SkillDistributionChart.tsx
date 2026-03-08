'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CATEGORY_COLOR } from '@/lib/cytoscapeHelpers';

interface Props {
  data: { category: string; count: number }[];
  theme: 'light' | 'dark';
}

export default function SkillDistributionChart({ data, theme }: Props) {
  const textColor = theme === 'dark' ? '#f1f5f9' : '#0f172a';

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={60}
          label={(entry: any) => `${entry.category}: ${entry.count}`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CATEGORY_COLOR[entry.category as keyof typeof CATEGORY_COLOR] || '#6B7280'}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            color: textColor,
          }}
        />
        <Legend wrapperStyle={{ color: textColor, fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
