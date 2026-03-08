'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PROFICIENCY_COLOR } from '@/lib/cytoscapeHelpers';

interface Props {
  data: { proficiency: string; count: number }[];
  theme: 'light' | 'dark';
}

export default function ProficiencyBreakdownChart({ data, theme }: Props) {
  const textColor = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="proficiency"
          tick={{ fill: textColor, fontSize: 12 }}
          tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
        <YAxis tick={{ fill: textColor, fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            color: textColor,
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                PROFICIENCY_COLOR[entry.proficiency as keyof typeof PROFICIENCY_COLOR] || '#6B7280'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
