import type { Core } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';

// Register layout extensions with Cytoscape
export function registerLayouts(cytoscape: any) {
  cytoscape.use(dagre);
  cytoscape.use(coseBilkent);
}

export type LayoutType = 'preset' | 'hierarchical' | 'force-directed' | 'radial' | 'circular';

/**
 * Apply a layout algorithm to the Cytoscape graph
 */
export function applyLayout(cy: Core, layout: LayoutType) {
  let layoutConfig: any;

  switch (layout) {
    case 'hierarchical':
      layoutConfig = {
        name: 'dagre',
        rankDir: 'LR', // Left to right
        nodeSep: 80,
        rankSep: 120,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out',
      };
      break;

    case 'force-directed':
      layoutConfig = {
        name: 'cose-bilkent',
        idealEdgeLength: 150,
        nodeRepulsion: 8000,
        gravity: 0.25,
        numIter: 2500,
        animate: true,
        animationDuration: 1000,
        animationEasing: 'ease-out',
      };
      break;

    case 'radial':
      layoutConfig = {
        name: 'concentric',
        concentric: (node: any) => (node.data('type') === 'person' ? 2 : 1),
        levelWidth: () => 1,
        minNodeSpacing: 80,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out',
      };
      break;

    case 'circular':
      layoutConfig = {
        name: 'circle',
        radius: 300,
        spacing: 40,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out',
      };
      break;

    case 'preset':
    default:
      // Restore positions from node data with animation
      layoutConfig = {
        name: 'preset',
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out',
        positions: (node: any) => {
          const data = node.data();
          return { x: data.x, y: data.y };
        },
      };
      break;
  }

  const layoutInstance = cy.layout(layoutConfig);
  layoutInstance.run();
}
