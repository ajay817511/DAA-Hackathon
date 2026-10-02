import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';

export default function GraphCanvas({
  nodes = [],
  roads = [],
  highlightPath = [],
  highlightEdges = [],
  currentNode = null,
  neighborNode = null,
  visitedNodes = [],
  onNodeClick = null,
  height = "480px"
}) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build vis-network nodes
    const visNodes = nodes.map((nodeName) => {
      let bgColor = '#3b82f6'; // default primary blue
      let borderColor = '#1d4ed8';
      let fontColor = '#ffffff';
      let borderWidth = 2;
      let size = 26;
      let shape = 'circle';

      const isStart = highlightPath.length > 0 && highlightPath[0] === nodeName;
      const isEnd = highlightPath.length > 1 && highlightPath[highlightPath.length - 1] === nodeName;
      const isInShortestPath = highlightPath.includes(nodeName);
      const isCurrent = currentNode === nodeName;
      const isNeighbor = neighborNode === nodeName;
      const isVisited = visitedNodes.includes(nodeName);

      if (isCurrent) {
        bgColor = '#f59e0b'; // Amber for active visiting node
        borderColor = '#b45309';
        borderWidth = 4;
        size = 32;
      } else if (isNeighbor) {
        bgColor = '#f97316'; // Orange for neighbor being evaluated
        borderColor = '#c2410c';
        borderWidth = 3;
        size = 29;
      } else if (isStart) {
        bgColor = '#10b981'; // Green for start
        borderColor = '#047857';
        borderWidth = 4;
        size = 32;
      } else if (isEnd) {
        bgColor = '#8b5cf6'; // Purple for destination
        borderColor = '#6d28d9';
        borderWidth = 4;
        size = 32;
      } else if (isInShortestPath) {
        bgColor = '#10b981'; // Emerald green for shortest path
        borderColor = '#047857';
        borderWidth = 3;
        size = 28;
      } else if (isVisited) {
        bgColor = '#93c5fd'; // Soft light blue for visited
        borderColor = '#3b82f6';
        fontColor = '#0f172a';
      }

      return {
        id: nodeName,
        label: nodeName,
        shape: shape,
        size: size,
        color: {
          background: bgColor,
          border: borderColor,
          highlight: {
            background: bgColor,
            border: '#0f172a'
          },
          hover: {
            background: bgColor,
            border: '#0f172a'
          }
        },
        font: {
          color: fontColor,
          size: 16,
          face: 'Outfit, sans-serif',
          bold: {
            color: fontColor,
            size: 16,
            face: 'Outfit, sans-serif'
          }
        },
        borderWidth: borderWidth,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.12)',
          size: 6,
          x: 2,
          y: 2
        }
      };
    });

    // Helper to check if edge is part of shortest path
    const isEdgeInPath = (u, v) => {
      if (!highlightPath || highlightPath.length < 2) return false;
      for (let i = 0; i < highlightPath.length - 1; i++) {
        const pU = highlightPath[i];
        const pV = highlightPath[i + 1];
        if ((pU === u && pV === v) || (pU === v && pV === u)) {
          return true;
        }
      }
      return false;
    };

    // Build vis-network edges
    const visEdges = roads.map((road) => {
      const u = road.start_node;
      const v = road.end_node;
      const timeMin = road.travel_time;
      const edgeId = road.id;

      const inPath = isEdgeInPath(u, v);
      const isStepActive = (currentNode === u && neighborNode === v) || (currentNode === v && neighborNode === u);

      let edgeColor = '#94a3b8';
      let edgeWidth = 2.5;
      let labelBg = '#f1f5f9';
      let labelFontColor = '#334155';

      if (inPath) {
        edgeColor = '#10b981';
        edgeWidth = 5;
        labelBg = '#ecfdf5';
        labelFontColor = '#047857';
      } else if (isStepActive) {
        edgeColor = '#f59e0b';
        edgeWidth = 4.5;
        labelBg = '#fef3c7';
        labelFontColor = '#b45309';
      }

      return {
        id: `edge-${edgeId}`,
        from: u,
        to: v,
        label: `${timeMin} min`,
        color: {
          color: edgeColor,
          highlight: '#2563eb',
          hover: '#2563eb'
        },
        width: edgeWidth,
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.1
        },
        font: {
          color: labelFontColor,
          size: 13,
          face: 'Plus Jakarta Sans, sans-serif',
          background: labelBg,
          strokeWidth: 0,
          align: 'horizontal'
        }
      };
    });

    const data = {
      nodes: visNodes,
      edges: visEdges
    };

    const options = {
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -70,
          centralGravity: 0.015,
          springLength: 130,
          springConstant: 0.08,
          damping: 0.85
        },
        stabilization: {
          iterations: 150,
          updateInterval: 25
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        dragNodes: true,
        dragView: true,
        zoomView: true
      },
      layout: {
        randomSeed: 42
      }
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    network.on('click', (params) => {
      if (params.nodes.length > 0 && onNodeClick) {
        onNodeClick(params.nodes[0]);
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, roads, highlightPath, highlightEdges, currentNode, neighborNode, visitedNodes]);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.25, animation: true });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 0.8, animation: true });
    }
  };

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: true });
    }
  };

  const handleStabilize = () => {
    if (networkRef.current) {
      networkRef.current.stabilize(100);
    }
  };

  return (
    <div className="graph-canvas-wrapper" style={{ height }}>
      <div ref={containerRef} className="graph-canvas-container" />

      {/* Toolbar */}
      <div className="canvas-toolbar">
        <button className="btn btn-secondary btn-icon-only" title="Zoom In" onClick={handleZoomIn}>
          <ZoomIn size={16} />
        </button>
        <button className="btn btn-secondary btn-icon-only" title="Zoom Out" onClick={handleZoomOut}>
          <ZoomOut size={16} />
        </button>
        <button className="btn btn-secondary btn-icon-only" title="Fit to Screen" onClick={handleFit}>
          <Maximize2 size={16} />
        </button>
        <button className="btn btn-secondary btn-icon-only" title="Re-stabilize Layout" onClick={handleStabilize}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Legend */}
      <div className="canvas-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }} />
          <span>Location</span>
        </div>
        {highlightPath.length > 0 && (
          <>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#10b981' }} />
              <span>Optimal Route</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#8b5cf6' }} />
              <span>Destination</span>
            </div>
          </>
        )}
        {currentNode && (
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }} />
            <span>Evaluating</span>
          </div>
        )}
      </div>
    </div>
  );
}
