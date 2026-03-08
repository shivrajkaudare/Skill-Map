'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface Props {
  skills: { skill: string; proficiency: number }[];
  theme: 'light' | 'dark';
}

export default function SkillRadarChart({ skills, theme }: Props) {
  const textColor = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const radarColor = theme === 'dark' ? '#818cf8' : '#6366f1';
  const gridColor = theme === 'dark' ? '#475569' : '#cbd5e1';

  // Limit to top 8 skills for readability
  const displaySkills = skills.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={displaySkills}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: textColor, fontSize: 11 }}
          tickFormatter={(value) => (value.length > 12 ? value.substring(0, 10) + '...' : value)}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 3]}
          tick={{ fill: textColor, fontSize: 10 }}
          tickCount={4}
        />
        <Radar
          name="Proficiency"
          dataKey="proficiency"
          stroke={radarColor}
          fill={radarColor}
          fillOpacity={0.5}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            color: textColor,
          }}
          formatter={(value: any) => {
            const labels = ['', 'Learning', 'Familiar', 'Expert'];
            return labels[Number(value)] || value;
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
