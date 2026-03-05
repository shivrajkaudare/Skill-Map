# Team Skill Matrix Graph

An interactive graph visualization that maps team members' skills, proficiency levels, and identifies skill gaps across your organization.

![Team Skill Matrix](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![React Flow](https://img.shields.io/badge/React%20Flow-12.10-purple)

## 🎯 Overview

This is a **frontend-only** application built for Assignment 2: Team Skill Matrix Graph. It visualizes who knows what skills, at what proficiency level, and helps identify skill gaps and overlaps in your team.

## ✨ Features

### Core Features
- **Interactive Graph Canvas**: Visualize people and skills as distinct node types with connections
- **Dual Node Types**:
  - 👤 Person nodes (blue) - Display team members with their roles
  - ⚡ Skill nodes (colored) - Display skills categorized by type (Frontend, Backend, DevOps, Design)
- **Proficiency Levels**: Color-coded connections showing expertise:
  - 🟡 Learning (Yellow)
  - 🔵 Familiar (Blue)
  - 🟢 Expert (Green)
- **Full CRUD Operations**:
  - Add/edit/delete people with names and optional roles
  - Add/edit/delete skills with names and optional categories
  - Add/delete connections between people and skills
  - Edit proficiency levels of existing connections
- **Interactive Detail Panels**:
  - Click a person to see all their skills and proficiency levels
  - Click a skill to see all team members who have it
- **LocalStorage Persistence**: All changes are automatically saved and restored on page refresh

### Stretch Goals Implemented
- ✅ **Highlighting**: When selecting a node, connected nodes are highlighted and others are dimmed
- ✅ **Color-coded Edges**: Proficiency levels are visually distinct with color coding
- ✅ **Summary Panel**: Shows insights like:
  - Most common skill across the team
  - Most skilled team member
  - Skill gaps (skills known by only one person)
  - Uncovered skills (skills nobody knows yet)
- ✅ **Draggable Nodes**: Reposition nodes and persist the custom layout
- ✅ **Node Animations**: Smooth entry and exit animations for nodes

### Bonus Features
- 📊 Statistics bar showing team size, skills tracked, and total connections
- 🎨 Visual legend for easy reference
- 🔄 Reset button to restore seed data
- 🗺️ MiniMap for easy navigation of large graphs
- 💾 Duplicate connection prevention
- 🎯 Empty state messages for better UX

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository or extract the project files:
```bash
cd skillsmap
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will load with pre-populated seed data on first visit. All subsequent changes are saved to localStorage.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.1.6](https://nextjs.org/) with TypeScript
- **Graph Library**: [React Flow 12.10](https://reactflow.dev/) (@xyflow/react)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) via [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks with custom `useGraphState` hook
- **Persistence**: Browser LocalStorage API

## 📁 Project Structure

```
skillsmap/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main application page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── SkillGraph.tsx     # Main graph component
│   │   ├── PersonNode.tsx     # Person node rendering
│   │   ├── SkillNode.tsx      # Skill node rendering
│   │   ├── DetailPanel.tsx    # Node detail sidebar
│   │   ├── SummaryPanel.tsx   # Team summary panel
│   │   ├── AddPersonDialog.tsx
│   │   ├── AddSkillDialog.tsx
│   │   ├── AddConnectionDialog.tsx
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── types.ts           # TypeScript type definitions
│   │   ├── seedData.ts        # Initial data from CSV
│   │   ├── storage.ts         # LocalStorage utilities
│   │   ├── graphHelpers.ts    # Graph layout & styling
│   │   └── utils.ts           # General utilities
│   └── hooks/
│       └── useGraphState.ts   # State management hook
├── package.json
├── tsconfig.json
└── README.md
```

## 📊 Seed Data

The application comes pre-populated with sample data:
- **5 Team Members**: Alice, Bob, Carol, Dan, Eva
- **10 Skills**: React, TypeScript, Node.js, PostgreSQL, Docker, Figma, CSS, GraphQL, CI/CD, Next.js
- **23 Connections**: Various skill-to-person mappings with proficiency levels

On first load, this seed data is displayed. After any modifications, your custom data is persisted to localStorage. Use the reset button (🔄) in the top-right to restore seed data.

## 🎮 Usage

### Adding Team Members
1. Click "Add Person" button in the top bar
2. Enter name (required) and role (optional)
3. Click "Add Person" to create

### Adding Skills
1. Click "Add Skill" button in the top bar
2. Enter skill name (required) and select category (optional)
3. Click "Add Skill" to create

### Creating Connections
1. Click "Add Connection" button in the top bar
2. Select a person from the dropdown
3. Select a skill from the dropdown
4. Choose proficiency level (learning, familiar, or expert)
5. Click "Add Connection" to create

### Editing Items
1. Click on any node in the graph
2. In the detail panel, click the "Edit" button
3. Modify the fields
4. Click "Save" to apply changes

### Editing Proficiency
1. Click on a person or skill node
2. In the detail panel, find the connection you want to edit
3. Click the pencil icon next to the proficiency badge
4. Select the new proficiency level
5. Changes are saved automatically

### Deleting Items
1. Click on any node in the graph
2. In the detail panel, click the "Delete" button
3. The node and all its connections will be removed

### Removing Connections
1. Click on a person or skill node
2. In the detail panel, click the ❌ button next to any connection
3. The connection is immediately removed

## 🎨 Color Scheme

- **Person Nodes**: Indigo (#6366f1)
- **Skill Categories**:
  - Frontend: Violet (#8B5CF6)
  - Backend: Pink (#EC4899)
  - DevOps: Orange (#F97316)
  - Design: Teal (#14B8A6)
  - Other: Gray (#6B7280)

## 🏗️ Build for Production

```bash
npm run build
npm run start
```

## 📝 Assignment Details

This project fulfills **Assignment 2: Team Skill Matrix Graph** requirements:
- ✅ All core features implemented
- ✅ 4/5 stretch goals completed
- ✅ TypeScript throughout
- ✅ LocalStorage persistence
- ✅ Professional UI/UX
- ✅ Clean code architecture

## 📄 License

This is a coding assignment project. All rights reserved.

## 👨‍💻 Author

Created as part of the Full Stack Developer - Frontend assignment.
