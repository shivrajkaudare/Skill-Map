'use client';

import { Layout } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LayoutType } from '@/lib/layoutManager';

interface Props {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

const LAYOUTS: { value: LayoutType; label: string }[] = [
  { value: 'preset', label: 'Bipartite' },
  { value: 'hierarchical', label: 'Hierarchical' },
  { value: 'force-directed', label: 'Force-Directed' },
  { value: 'radial', label: 'Radial' },
  { value: 'circular', label: 'Circular' },
];

export default function LayoutSwitcher({ currentLayout, onLayoutChange }: Props) {
  return (
    <div className="layout-switcher">
      <Layout size={14} className="layout-icon" />
      <Select value={currentLayout} onValueChange={(v) => onLayoutChange(v as LayoutType)}>
        <SelectTrigger className="layout-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LAYOUTS.map((layout) => (
            <SelectItem key={layout.value} value={layout.value}>
              {layout.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
