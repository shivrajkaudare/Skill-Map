'use client';

import dynamic from 'next/dynamic';
import { useGraphState } from '@/hooks/useGraphState';
import DetailPanel from '@/components/DetailPanel';
import SummaryPanel from '@/components/SummaryPanel';
import AddPersonDialog from '@/components/AddPersonDialog';
import AddSkillDialog from '@/components/AddSkillDialog';
import AddConnectionDialog from '@/components/AddConnectionDialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Network } from 'lucide-react';

// Dynamically import graph to prevent SSR issues with React Flow
const SkillGraph = dynamic(() => import('@/components/SkillGraph'), { ssr: false });

export default function HomePage() {
  const {
    state, selectedNode, setSelectedNode,
    addPerson, editPerson, deletePerson,
    addSkill, editSkill, deleteSkill,
    addConnection, deleteConnection, editConnectionProficiency,
    updateNodePosition, resetToSeed,
  } = useGraphState();

  const selectedPersonId = selectedNode?.type === 'person' ? selectedNode.id : null;
  const selectedSkillId = selectedNode?.type === 'skill' ? selectedNode.id : null;

  return (
    <div className="app-shell">
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
          <AddPersonDialog onAdd={addPerson} />
          <AddSkillDialog onAdd={addSkill} />
          <AddConnectionDialog
            people={state.people}
            skills={state.skills}
            onAdd={addConnection}
          />

          <Button
            size="sm"
            variant="ghost"
            className="reset-btn"
            onClick={resetToSeed}
            title="Reset to seed data"
          >
            <RotateCcw size={14} />
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
            />
          ) : (
            <SummaryPanel state={state} />
          )}
        </aside>
      </div>
    </div>
  );
}
