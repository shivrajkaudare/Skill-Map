'use client';

import dynamic from 'next/dynamic';
import { useGraphState } from '@/hooks/useGraphState';
import DetailPanel from '@/components/DetailPanel';
import SummaryPanel from '@/components/SummaryPanel';
import AddPersonDialog from '@/components/AddPersonDialog';
import AddSkillDialog from '@/components/AddSkillDialog';
import AddConnectionDialog from '@/components/AddConnectionDialog';
import { Button } from '@/components/ui/button';
import { Network, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

// Dynamically import graph to prevent SSR issues with React Flow
const SkillGraph = dynamic(() => import('@/components/SkillGraph'), { ssr: false });

export default function HomePage() {
  const {
    state, selectedNode, setSelectedNode,
    addPerson, editPerson, deletePerson,
    addSkill, editSkill, deleteSkill,
    addConnection, deleteConnection, editConnectionProficiency,
    updateNodePosition,
  } = useGraphState();

  const selectedPersonId = selectedNode?.type === 'person' ? selectedNode.id : null;
  const selectedSkillId = selectedNode?.type === 'skill' ? selectedNode.id : null;

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load initial theme from localStorage safely
  useEffect(() => {
    const savedTheme = localStorage.getItem('skillsmap-theme');
    const computedTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    setTheme(computedTheme);
    if (computedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('skillsmap-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  return (
    <div className={`app-shell theme-${theme} ${theme === 'dark' ? 'dark' : ''}`} data-theme={theme}>
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className="top-bar">
        <div className="top-bar-left">
          <Network size={22} className="logo-icon" />
          <div>
            <h1 className="app-title">Team Skill Matrix</h1>
            <p className="app-sub">
              {state.people.length} people · {state.skills.length} skills · {state.connections.length} connections
            </p>
          </div>
        </div>

        <div className="top-bar-right">
          {/* Legend */}
          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#6366f1' }} /> Person
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#a855f7' }} /> Skill
            </span>
            <span className="legend-item">
              <span className="legend-line" style={{ background: '#EAB308' }} /> Learning
            </span>
            <span className="legend-item">
              <span className="legend-line" style={{ background: '#3B82F6' }} /> Familiar
            </span>
            <span className="legend-item">
              <span className="legend-line" style={{ background: '#22C55E' }} /> Expert
            </span>
          </div>

          {/* CRUD buttons */}
          <AddPersonDialog
            onAdd={addPerson}
            existingPeople={state.people.map(p => ({ name: p.name, role: p.role }))}
          />
          <AddSkillDialog
            onAdd={addSkill}
            existingSkills={state.skills.map(s => s.name)}
          />
          <AddConnectionDialog
            people={state.people}
            skills={state.skills}
            onAdd={addConnection}
          />

          <Button
            size="sm"
            variant="ghost"
            className="theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </header>

      {/* ── Main Body ───────────────────────────────────────────── */}
      <div className="main-body">
        {/* Graph */}
        <div className="graph-area">
          <SkillGraph
            state={state}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onUpdateNodePosition={updateNodePosition}
            theme={theme}
          />
        </div>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          {(selectedPersonId || selectedSkillId) ? (
            <DetailPanel
              state={state}
              selectedPersonId={selectedPersonId}
              selectedSkillId={selectedSkillId}
              onClose={() => setSelectedNode(null)}
              onEditPerson={editPerson}
              onDeletePerson={deletePerson}
              onEditSkill={editSkill}
              onDeleteSkill={deleteSkill}
              onDeleteConnection={deleteConnection}
              onEditConnectionProficiency={editConnectionProficiency}
              theme={theme}
            />
          ) : (
            <SummaryPanel state={state} theme={theme} />
          )}
        </aside>
      </div>
    </div>
  );
}
