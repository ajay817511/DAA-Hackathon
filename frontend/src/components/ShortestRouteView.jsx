import React, { useState, useEffect } from 'react';
import GraphCanvas from './GraphCanvas';
import confetti from 'canvas-confetti';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Activity,
  Milestone
} from 'lucide-react';

export default function ShortestRouteView({
  nodes = [],
  roads = [],
  onCalculateRoute,
  routeResult = null,
  loading = false,
  startNode,
  setStartNode,
  endNode,
  setEndNode,
  currentBuiltRoute = null,
  setActiveTab = null
}) {
  const [errorMsg, setErrorMsg] = useState('');

  // Auto trigger celebratory confetti when route is found
  useEffect(() => {
    if (routeResult && routeResult.found && routeResult.path.length > 1) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if confetti fails
      }
    }
  }, [routeResult]);

  const handleFindRoute = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!startNode || !endNode) {
      setErrorMsg('Please select both a Starting Location and an Ending Location.');
      return;
    }

    if (startNode === endNode) {
      setErrorMsg('Starting Location and Destination cannot be the same.');
      return;
    }

    onCalculateRoute(startNode, endNode);
  };

  const handleSwapNodes = () => {
    const temp = startNode;
    setStartNode(endNode);
    setEndNode(temp);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Linked Built Route Quick Inspector */}
      {currentBuiltRoute && currentBuiltRoute.success && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          border: '1.5px solid var(--primary-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div className="card-header" style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)'
              }}></span>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Active Multi-Stop Delivery Mission from Built Route
              </h4>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>
              {currentBuiltRoute.total_travel_time} mins • {currentBuiltRoute.customer_count} stops
            </div>
          </div>

          <div className="card-body" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Current Optimized Route:</strong> {currentBuiltRoute.full_path_string}
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                INSPECT INDIVIDUAL DELIVERY LEGS VIA DIJKSTRA:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {currentBuiltRoute.legs.map((leg) => {
                  const isActiveLeg = startNode === leg.from_node && endNode === leg.to_node;
                  return (
                    <button
                      key={`leg-btn-${leg.stop_number}`}
                      type="button"
                      className={`btn btn-sm ${isActiveLeg ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setStartNode(leg.from_node);
                        setEndNode(leg.to_node);
                        onCalculateRoute(leg.from_node, leg.to_node);
                      }}
                      style={{ fontSize: '0.8rem', fontWeight: '700', padding: '5px 12px' }}
                    >
                      <span>Stop #{leg.stop_number}: {leg.from_node} ➔ {leg.to_node}</span>
                      <span style={{
                        background: isActiveLeg ? 'rgba(255,255,255,0.25)' : 'var(--bg-muted)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem'
                      }}>
                        {leg.travel_time}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {setActiveTab && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('visualizer')}
                  style={{ fontSize: '0.78rem', gap: '6px' }}
                >
                  <Zap size={14} color="var(--primary)" />
                  <span>Step Through In Dijkstra Visualizer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Finder Form Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Navigation size={18} color="var(--primary)" />
            <span>Select Delivery Origin & Destination</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Dijkstra Shortest Path Search
          </span>
        </div>

        <div className="card-body">
          {nodes.length < 2 ? (
            <div style={{
              background: 'var(--warning-light)',
              border: '1px solid var(--warning-border)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              color: '#92400e',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertTriangle size={20} />
              <span>Please add at least 2 locations and connected roads in <strong>Build Route</strong> before finding routes.</span>
            </div>
          ) : (
            <form onSubmit={handleFindRoute}>
              {errorMsg && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                  fontWeight: '600'
                }}>
                  {errorMsg}
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto',
                gap: '16px',
                alignItems: 'flex-end'
              }}>
                {/* Start Location Dropdown */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="select-start-node">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--success)" />
                      Starting Location:
                    </span>
                  </label>
                  <select
                    id="select-start-node"
                    className="form-select"
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                  >
                    <option value="">-- Select Starting Location --</option>
                    {nodes.map((node) => (
                      <option key={`start-${node}`} value={node}>
                        Location {node}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap button */}
                <button
                  type="button"
                  className="btn btn-secondary btn-icon-only"
                  style={{ marginBottom: '2px' }}
                  onClick={handleSwapNodes}
                  title="Swap Origin and Destination"
                >
                  ⇄
                </button>

                {/* Ending Location Dropdown */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="select-end-node">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#8b5cf6" />
                      Ending Location:
                    </span>
                  </label>
                  <select
                    id="select-end-node"
                    className="form-select"
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                  >
                    <option value="">-- Select Destination Location --</option>
                    {nodes.map((node) => (
                      <option key={`end-${node}`} value={node}>
                        Location {node}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Find Shortest Route Button */}
                <button
                  id="find-shortest-route-btn"
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading || !startNode || !endNode}
                  style={{ marginBottom: '2px', minWidth: '220px' }}
                >
                  <Zap size={18} />
                  <span>{loading ? 'CALCULATING...' : 'FIND SHORTEST ROUTE'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* RESULT SECTION (As explicitly required by prompt) */}
      {routeResult && (
        <>
          {routeResult.found ? (
            <div className="result-banner">
              <div className="result-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="result-badge">
                    <CheckCircle2 size={16} />
                    <span>DIJKSTRA SHORTEST PATH FOUND</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Calculated dynamically in {routeResult.execution_time_ms} ms
                  </span>
                </div>
              </div>

              {/* Path Node Sequence Display */}
              <div className="result-route-display">
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', marginRight: '8px' }}>
                  SHORTEST ROUTE:
                </span>
                {routeResult.path.map((node, idx) => (
                  <React.Fragment key={`path-node-${node}-${idx}`}>
                    <div className="route-node-pill">
                      {node}
                    </div>
                    {idx < routeResult.path.length - 1 && (
                      <div className="route-arrow">
                        <ArrowRight size={20} color="var(--primary)" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Summary Stats Grid */}
              <div className="result-stats-row">
                <div className="result-stat-box">
                  <span className="stat-box-label">START</span>
                  <span className="stat-box-value" style={{ color: 'var(--success-dark)' }}>
                    {routeResult.start}
                  </span>
                </div>

                <div className="result-stat-box">
                  <span className="stat-box-label">DESTINATION</span>
                  <span className="stat-box-value" style={{ color: '#6d28d9' }}>
                    {routeResult.destination}
                  </span>
                </div>

                <div className="result-stat-box">
                  <span className="stat-box-label">MINIMUM TRAVEL TIME</span>
                  <span className="stat-box-value" style={{ color: 'var(--primary)' }}>
                    {routeResult.total_travel_time} minutes
                  </span>
                </div>

                <div className="result-stat-box">
                  <span className="stat-box-label">ROADS USED</span>
                  <span className="stat-box-value">
                    {routeResult.roads_used}
                  </span>
                </div>

                <div className="result-stat-box">
                  <span className="stat-box-label">NODES PROCESSED</span>
                  <span className="stat-box-value">
                    {routeResult.nodes_processed}
                  </span>
                </div>

                <div className="result-stat-box">
                  <span className="stat-box-label">EDGES CHECKED</span>
                  <span className="stat-box-value">
                    {routeResult.edges_checked}
                  </span>
                </div>
              </div>

              {/* Turn-by-turn road breakdown */}
              {routeResult.road_segments && routeResult.road_segments.length > 0 && (
                <div style={{ marginTop: '18px', background: 'white', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Milestone size={15} color="var(--primary)" />
                    <span>SEGMENT BREAKDOWN (TOTAL: {routeResult.road_segments.map(s => `${s.travel_time}m`).join(' + ')} = {routeResult.total_travel_time} minutes)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {routeResult.road_segments.map((seg, idx) => (
                      <div key={idx} style={{
                        background: 'var(--bg-muted)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ fontWeight: '800', color: 'var(--primary)' }}>Step {idx + 1}:</span>
                        <span>{seg.from} → {seg.to}</span>
                        <span style={{ color: 'var(--text-muted)' }}>({seg.travel_time} min)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <AlertTriangle size={28} />
              <div>
                <h4 style={{ fontWeight: '800', marginBottom: '2px' }}>No Route Found</h4>
                <p style={{ fontSize: '0.9rem' }}>{routeResult.error || 'Destination is not reachable from the starting location.'}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Highlighted Graph Canvas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Layers size={18} color="var(--primary)" />
            <span>Delivery Graph (Highlighted Shortest Route)</span>
          </h3>
          {routeResult && routeResult.found && (
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--success-dark)' }}>
              Active Path: {routeResult.path_string}
            </span>
          )}
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <GraphCanvas
            nodes={nodes}
            roads={roads}
            highlightPath={routeResult && routeResult.found ? routeResult.path : []}
            highlightEdges={routeResult && routeResult.found ? routeResult.path_edges : []}
            height="500px"
          />
        </div>
      </div>

    </div>
  );
}
