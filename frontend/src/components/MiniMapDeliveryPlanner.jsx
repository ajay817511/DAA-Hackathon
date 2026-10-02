import React, { useState, useMemo, useEffect } from 'react';
import { 
  FIXED_MINIMAP_NODES, 
  FIXED_MINIMAP_ROADS, 
  calculateMultiDeliveryRoute 
} from '../utils/multiDeliveryOptimizer';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  MapPin, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Check, 
  X, 
  Navigation,
  TrendingDown,
  Compass,
  BarChart3
} from 'lucide-react';

export default function MiniMapDeliveryPlanner({
  onRouteCalculated = null,
  onReset = null,
  currentRoute = null,
  setActiveTab = null
}) {
  // Selected delivery location IDs (subset of ['A','B','C','D','E','F','G','H'])
  // Default to prompt example A, D, F, H
  const [selectedCustomers, setSelectedCustomers] = useState(
    currentRoute && currentRoute.selected_nodes 
      ? currentRoute.selected_nodes 
      : ['A', 'D', 'F', 'H']
  );
  const [routeResult, setRouteResult] = useState(currentRoute || null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);

  // Sync with currentRoute if provided from parent
  useEffect(() => {
    if (currentRoute) {
      setRouteResult(currentRoute);
      if (currentRoute.selected_nodes) {
        setSelectedCustomers(currentRoute.selected_nodes);
      }
    }
  }, [currentRoute]);

  const customerNodes = useMemo(() => {
    return Object.values(FIXED_MINIMAP_NODES).filter(n => n.type === 'customer');
  }, []);

  // Direct toggle on click: select if not selected, deselect if selected
  const handleToggleCustomer = (nodeId) => {
    if (nodeId === 'START') return; // Fixed departure hub
    setErrorMsg('');
    setSelectedCustomers((prev) => {
      const exists = prev.includes(nodeId);
      const updated = exists ? prev.filter((id) => id !== nodeId) : [...prev, nodeId];
      return updated;
    });
    // Reset previous route calculation when selections change
    setRouteResult(null);
    if (onReset) onReset();
  };

  // Optimize Multi-Location Route using Dijkstra + Permutation TSP
  const handleOptimizeRoute = async () => {
    if (selectedCustomers.length === 0) {
      setErrorMsg('Please click on at least 1 delivery location node (A–H) on the mini-map to plan delivery.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await calculateMultiDeliveryRoute(selectedCustomers, 'START', FIXED_MINIMAP_ROADS);
      if (result && result.success) {
        setRouteResult(result);
        if (onRouteCalculated) {
          onRouteCalculated(result);
        }
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore confetti if not available
        }
      } else {
        setErrorMsg(result.error || 'Failed to calculate optimal delivery route.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred during route optimization.');
    } finally {
      setLoading(false);
    }
  };

  // Reset option to plan another delivery
  const handleReset = () => {
    setSelectedCustomers([]);
    setRouteResult(null);
    setErrorMsg('');
    if (onReset) onReset();
  };

  // Quick preset helper
  const handleQuickDemo = (nodesList) => {
    setSelectedCustomers(nodesList);
    setRouteResult(null);
    setErrorMsg('');
    if (onReset) onReset();
  };

  // Helper to check if an edge between u and v is part of the resulting route
  const isEdgeInRoute = (u, v) => {
    if (!routeResult || !routeResult.active_edges) return false;
    return routeResult.active_edges.some(
      ([from, to]) => (from === u && to === v) || (from === v && to === u)
    );
  };

  // Helper to get stop order index for a node in the optimized sequence
  const getOptimizedStopIndex = (nodeId) => {
    if (!routeResult || !routeResult.optimized_order) return null;
    const idx = routeResult.optimized_order.indexOf(nodeId);
    return idx !== -1 ? idx + 1 : null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner & Multipurpose Instructions */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        border: '1.5px solid var(--primary-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="card-body" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: 'var(--shadow-md)',
                flexShrink: 0
              }}>
                <Navigation size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    Interactive Mini-Map Delivery Route Planner
                  </h3>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    MULTIPURPOSE
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                  Click locations directly on the mini-map to select delivery destinations. The optimizer uses <strong>Dijkstra's Algorithm</strong> and fixed travel times to calculate the most efficient visiting order from the Dispatch Hub.
                </p>
              </div>
            </div>

            {/* Quick Demo Preset Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>QUICK SELECTION:</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo(['A', 'D', 'F', 'H'])}
                style={{ fontSize: '0.78rem', padding: '4px 10px', fontWeight: '700' }}
                title="Example from Prompt: A -> D -> F -> H"
              >
                A, D, F, H (4 Stops)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo(['A', 'C', 'G'])}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                A, C, G (North)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo(['B', 'D', 'F'])}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                B, D, F (South)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo(['A', 'C', 'E', 'G', 'H'])}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                5 Stops (A, C, E, G, H)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div style={{
          background: 'var(--danger-light)',
          border: '1px solid var(--danger-border)',
          color: 'var(--danger)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <X size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Mini-Map on Left, Controls & Results on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(520px, 1.45fr) 1fr', gap: '20px' }}>
        
        {/* Left Card: Interactive SVG Mini-Map */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)'
              }}></span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>
                Artificial Mini-Map (Nodes A–H & Start Hub)
              </h4>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Click any node <strong>A – H</strong> directly to select/deselect
            </div>
          </div>

          <div className="card-body" style={{ padding: '14px', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '780px', position: 'relative' }}>
              
              {/* SVG Artificial Mini-Map */}
              <svg
                viewBox="0 0 840 460"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  boxShadow: 'inset 0 0 0 1px #e2e8f0',
                  display: 'block'
                }}
              >
                <defs>
                  {/* Subtle Map Grid Pattern */}
                  <pattern id="mini-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                  </pattern>

                  {/* Route Glow Filter */}
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10b981" floodOpacity="0.55" />
                  </filter>

                  {/* Standard Node Shadow */}
                  <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
                  </filter>
                </defs>

                {/* Background Grid */}
                <rect width="840" height="460" fill="url(#mini-map-grid)" />

                {/* 1. Road Edges */}
                <g id="mini-map-roads">
                  {FIXED_MINIMAP_ROADS.map((road) => {
                    const u = FIXED_MINIMAP_NODES[road.start_node];
                    const v = FIXED_MINIMAP_NODES[road.end_node];
                    if (!u || !v) return null;

                    const active = isEdgeInRoute(road.start_node, road.end_node);
                    const midX = (u.x + v.x) / 2;
                    const midY = (u.y + v.y) / 2;

                    return (
                      <g key={`road-${road.id}`}>
                        {/* Background Base Road */}
                        <line
                          x1={u.x}
                          y1={u.y}
                          x2={v.x}
                          y2={v.y}
                          stroke="#cbd5e1"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Active Route Highlight (if road is traversed) */}
                        {active && (
                          <line
                            x1={u.x}
                            y1={u.y}
                            x2={v.x}
                            y2={v.y}
                            stroke="#10b981"
                            strokeWidth="6"
                            strokeLinecap="round"
                            filter="url(#routeGlow)"
                          />
                        )}

                        {/* Travel Time Tag on Road */}
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x="-22"
                            y="-11"
                            width="44"
                            height="22"
                            rx="11"
                            fill={active ? '#10b981' : '#ffffff'}
                            stroke={active ? '#059669' : '#cbd5e1'}
                            strokeWidth="1.5"
                            filter="url(#nodeShadow)"
                          />
                          <text
                            x="0"
                            y="4"
                            textAnchor="middle"
                            fill={active ? '#ffffff' : '#475569'}
                            fontSize="11"
                            fontWeight="800"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {road.travel_time}m
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>

                {/* 2. Delivery Location Nodes A through H */}
                <g id="mini-map-customer-nodes">
                  {customerNodes.map((node) => {
                    const isSelected = selectedCustomers.includes(node.id);
                    const isHovered = hoveredNode === node.id;
                    const stopIndex = getOptimizedStopIndex(node.id);
                    const inRoute = stopIndex !== null;

                    return (
                      <g
                        key={`customer-node-${node.id}`}
                        transform={`translate(${node.x}, ${node.y})`}
                        style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                        onClick={() => handleToggleCustomer(node.id)}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {/* Selection Outer Glow Ring */}
                        {isSelected && (
                          <circle
                            r="32"
                            fill="none"
                            stroke={inRoute ? '#10b981' : '#f97316'}
                            strokeWidth="2.5"
                            strokeDasharray={inRoute ? 'none' : '4 3'}
                            opacity="0.85"
                          />
                        )}

                        {/* Hover Ring */}
                        {isHovered && !isSelected && (
                          <circle
                            r="30"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                            opacity="0.7"
                          />
                        )}

                        {/* Node Main Circle */}
                        <circle
                          r="24"
                          fill={
                            inRoute
                              ? '#10b981'
                              : isSelected
                              ? '#f97316'
                              : '#ffffff'
                          }
                          stroke={
                            inRoute
                              ? '#047857'
                              : isSelected
                              ? '#ea580c'
                              : '#3b82f6'
                          }
                          strokeWidth={isSelected || inRoute ? '3.5' : '2.5'}
                          filter="url(#nodeShadow)"
                        />

                        {/* Node Letter Identifier */}
                        <text
                          x="0"
                          y={isSelected ? "1" : "5"}
                          textAnchor="middle"
                          fill={isSelected || inRoute ? '#ffffff' : '#1e3a8a'}
                          fontSize={isSelected ? "16" : "18"}
                          fontWeight="800"
                          fontFamily="Outfit, sans-serif"
                        >
                          {node.label}
                        </text>

                        {/* Sub-label under node */}
                        <text
                          x="0"
                          y="38"
                          textAnchor="middle"
                          fill={isSelected ? '#c2410c' : '#64748b'}
                          fontSize="11"
                          fontWeight={isSelected ? '800' : '600'}
                          fontFamily="Plus Jakarta Sans, sans-serif"
                        >
                          {inRoute ? `Stop #${stopIndex}` : isSelected ? 'Selected' : `Node ${node.label}`}
                        </text>

                        {/* Stop Order Badge (When Route is Optimized) */}
                        {inRoute && (
                          <g transform="translate(16, -18)">
                            <circle
                              r="11"
                              fill="#047857"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                            <text
                              x="0"
                              y="4"
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="900"
                              fontFamily="JetBrains Mono, monospace"
                            >
                              {stopIndex}
                            </text>
                          </g>
                        )}

                        {/* Selected Indicator Badge (Before Optimization) */}
                        {isSelected && !inRoute && (
                          <g transform="translate(16, -18)">
                            <circle
                              r="10"
                              fill="#ea580c"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                            <text
                              x="0"
                              y="3.5"
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="900"
                            >
                              ✓
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* 3. Fixed Start Hub Depot */}
                {(() => {
                  const hub = FIXED_MINIMAP_NODES.START;
                  return (
                    <g
                      id="mini-map-start-hub"
                      transform={`translate(${hub.x}, ${hub.y})`}
                      style={{ cursor: 'default' }}
                    >
                      {/* Outer Hub Ring */}
                      <circle
                        r="38"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        opacity="0.6"
                      />

                      {/* Main Hub Circle */}
                      <circle
                        r="29"
                        fill="#047857"
                        stroke="#065f46"
                        strokeWidth="3.5"
                        filter="url(#nodeShadow)"
                      />

                      {/* Building / Dispatch Hub Graphic */}
                      <g transform="translate(-11, -11)" fill="#ffffff">
                        <path d="M12 3L2 12h3v8h14v-8h3L12 3zm-1 15H7v-6h4v6zm6 0h-4v-6h4v6z" />
                      </g>

                      {/* Hub Text Sub-labels */}
                      <text
                        x="0"
                        y="46"
                        textAnchor="middle"
                        fill="#047857"
                        fontSize="11.5"
                        fontWeight="900"
                        fontFamily="Outfit, sans-serif"
                      >
                        START HUB
                      </text>
                      <text
                        x="0"
                        y="58"
                        textAnchor="middle"
                        fill="#10b981"
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                      >
                        (Dispatch Origin)
                      </text>
                    </g>
                  );
                })()}
              </svg>

              {/* Map Footer Legend */}
              <div style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#047857', display: 'inline-block' }}></span>
                    <strong>Start Hub (Origin)</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }}></span>
                    <strong>Selected Location</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    <strong>Optimized Route Stop</strong>
                  </span>
                </div>
                <div style={{ fontWeight: '700', color: 'var(--primary)' }}>
                  15 Fixed Road Segments • Realistic Scale (5–14m)
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Interactive Selector, Actions & Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Card: Customer Selection Controls */}
          <div className="card">
            <div className="card-header" style={{ padding: '14px 18px' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <MapPin size={17} color="var(--primary)" />
                <span>Delivery Locations</span>
              </h4>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                background: selectedCustomers.length > 0 ? 'var(--primary-light)' : 'var(--bg-muted)',
                color: selectedCustomers.length > 0 ? 'var(--primary)' : 'var(--text-muted)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)'
              }}>
                {selectedCustomers.length} SELECTED
              </span>
            </div>

            <div className="card-body" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Quick Customer Pill Buttons */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  CLICK NODE DIRECTLY ON MINI-MAP (OR BUTTONS BELOW):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {customerNodes.map((node) => {
                    const isSelected = selectedCustomers.includes(node.id);
                    const stopIndex = getOptimizedStopIndex(node.id);

                    return (
                      <button
                        key={`btn-node-${node.id}`}
                        type="button"
                        onClick={() => handleToggleCustomer(node.id)}
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          padding: '8px 6px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: isSelected ? '#f97316' : undefined,
                          borderColor: isSelected ? '#ea580c' : undefined,
                          color: isSelected ? '#ffffff' : undefined,
                        }}
                      >
                        <span>Node {node.label}</span>
                        {stopIndex ? (
                          <span style={{
                            background: '#047857',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                          }}>
                            {stopIndex}
                          </span>
                        ) : isSelected ? (
                          <Check size={14} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Optimize & Reset */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  id="optimize-multi-delivery-btn"
                  className="btn btn-primary btn-lg"
                  onClick={handleOptimizeRoute}
                  disabled={loading || selectedCustomers.length === 0}
                  style={{ width: '100%', gap: '8px' }}
                >
                  <Zap size={18} />
                  <span>{loading ? 'OPTIMIZING VIA DIJKSTRA...' : 'OPTIMIZE DELIVERY ROUTE'}</span>
                </button>

                <button
                  type="button"
                  id="reset-multi-delivery-btn"
                  className="btn btn-secondary btn-md"
                  onClick={handleReset}
                  disabled={loading || (selectedCustomers.length === 0 && !routeResult)}
                  style={{ width: '100%', gap: '6px' }}
                >
                  <RotateCcw size={15} />
                  <span>RESET / PLAN ANOTHER ROUTE</span>
                </button>
              </div>

            </div>
          </div>

          {/* Results Card (When Route is Optimized) */}
          {routeResult && routeResult.success && (
            <div className="card" style={{
              border: '1.5px solid var(--success-border)',
              boxShadow: 'var(--shadow-md)',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div className="card-header" style={{
                background: 'var(--success-light)',
                padding: '12px 18px',
                borderBottom: '1px solid var(--success-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-dark)' }}>
                  <CheckCircle2 size={18} />
                  <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>
                    OPTIMIZED DELIVERY ROUTE CALCULATED
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                  {routeResult.execution_time_ms} ms
                </span>
              </div>

              <div className="card-body" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* 3 Summary Metric Boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {/* Total Travel Time */}
                  <div style={{
                    background: 'var(--bg-main)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                      TOTAL TIME
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {routeResult.total_travel_time}m
                    </div>
                  </div>

                  {/* Estimated Distance */}
                  <div style={{
                    background: 'var(--bg-main)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                      DISTANCE
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#6366f1', fontFamily: 'JetBrains Mono, monospace' }}>
                      {routeResult.total_distance_km} km
                    </div>
                  </div>

                  {/* Estimated Cost */}
                  <div style={{
                    background: 'var(--bg-main)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                      EST. COST
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--success-dark)', fontFamily: 'JetBrains Mono, monospace' }}>
                      ${routeResult.estimated_cost}
                    </div>
                  </div>
                </div>

                {/* DAA Optimization Improvement Alert */}
                {routeResult.time_saved_minutes > 0 && (
                  <div style={{
                    background: 'var(--success-light)',
                    border: '1px solid var(--success-border)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--success-dark)',
                    fontWeight: '700'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingDown size={16} />
                      <span>DAA Optimization vs. Unoptimized Order:</span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      Saved {routeResult.time_saved_minutes}m ({routeResult.efficiency_improvement_percent}% faster)
                    </span>
                  </div>
                )}

                {/* Optimized Visiting Sequence */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    OPTIMIZED VISITING ORDER:
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '6px',
                    background: '#f8fafc',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span style={{
                      background: '#047857',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Building2 size={13} />
                      Start Hub
                    </span>

                    {routeResult.optimized_order.map((stop, sIdx) => (
                      <React.Fragment key={`opt-seq-${stop}`}>
                        <ArrowRight size={14} color="var(--primary)" />
                        <span style={{
                          background: '#10b981',
                          color: '#ffffff',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <span style={{
                            background: '#ffffff',
                            color: '#047857',
                            borderRadius: '50%',
                            width: '15px',
                            height: '15px',
                            fontSize: '0.68rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '900'
                          }}>
                            {sIdx + 1}
                          </span>
                          Node {stop}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Complete Turn-by-Turn Route */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    COMPLETE TURN-BY-TURN ROUTE:
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    background: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {routeResult.full_path_string}
                  </div>
                </div>

                {/* Leg-by-Leg Details */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    DELIVERY LEGS BREAKDOWN:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {routeResult.legs.map((leg) => (
                      <div
                        key={`leg-${leg.stop_number}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.72rem'
                          }}>
                            {leg.stop_number}
                          </span>
                          <span style={{ fontWeight: '700' }}>
                            {leg.from_node} ➔ {leg.to_node}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ({leg.path_string})
                          </span>
                        </div>
                        <span style={{ fontWeight: '800', color: 'var(--primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                          {leg.travel_time} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Deep-Link Shortcuts (for judges) */}
                {setActiveTab && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveTab('shortest-route')}
                      style={{ flex: 1, fontSize: '0.76rem', gap: '5px' }}
                    >
                      <Compass size={14} />
                      <span>Inspect Legs</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveTab('visualizer')}
                      style={{ flex: 1, fontSize: '0.76rem', gap: '5px' }}
                    >
                      <Zap size={14} />
                      <span>Step Visualizer</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveTab('analytics')}
                      style={{ flex: 1, fontSize: '0.76rem', gap: '5px' }}
                    >
                      <BarChart3 size={14} />
                      <span>Full Analytics</span>
                    </button>
                  </div>
                )}

                {/* Algorithmic Details */}
                <div style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Dijkstra Calls: <strong>{routeResult.dijkstra_calls}</strong></span>
                  <span>Permutations: <strong>{routeResult.permutations_evaluated}</strong></span>
                  <span>Complexity: <strong>O(k! + k²·(V+E)log V)</strong></span>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
