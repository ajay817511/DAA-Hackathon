import React, { useState, useEffect, useRef } from 'react';
import GraphCanvas from './GraphCanvas';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  FastForward, 
  CheckCircle, 
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  ListOrdered
} from 'lucide-react';

export default function VisualizerView({
  nodes = [],
  roads = [],
  startNode,
  setStartNode,
  endNode,
  setEndNode,
  currentBuiltRoute = null
}) {
  const [traceData, setTraceData] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1200); // ms per step
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const timerRef = useRef(null);

  // Fetch visualizer trace from backend
  const fetchTrace = async (overrideStart = null, overrideEnd = null) => {
    const s = overrideStart || startNode;
    const e = overrideEnd || endNode;
    if (!s || !e) {
      setErrorMsg('Please select both a Starting Location and an Ending Location.');
      return;
    }
    if (s === e) {
      setErrorMsg('Starting and Ending locations cannot be the same.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_node: s, end_node: e })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to fetch visualizer trace.');
      }

      const data = await response.json();
      setTraceData(data);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBuiltRouteLeg = (fromNode, toNode) => {
    setStartNode(fromNode);
    setEndNode(toNode);
    fetchTrace(fromNode, toNode);
  };

  // Playback loop
  useEffect(() => {
    if (isPlaying && traceData && traceData.steps) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < traceData.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, traceData, playbackSpeed]);

  const handleStart = () => {
    if (!traceData) {
      fetchTrace();
    } else {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (traceData && currentStepIndex < traceData.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (traceData && currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleResume = () => {
    if (traceData && currentStepIndex < traceData.steps.length - 1) {
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleRunAll = () => {
    if (traceData && traceData.steps) {
      setIsPlaying(false);
      setCurrentStepIndex(traceData.steps.length - 1);
    } else {
      // fetch and jump to last
      setLoading(true);
      fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_node: startNode, end_node: endNode })
      })
        .then(res => res.json())
        .then(data => {
          setTraceData(data);
          setCurrentStepIndex(data.steps.length - 1);
          setLoading(false);
        })
        .catch(err => {
          setErrorMsg(err.message);
          setLoading(false);
        });
    }
  };

  const currentStep = traceData && traceData.steps ? traceData.steps[currentStepIndex] : null;

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'INITIALIZE': return 'badge-init';
      case 'VISITING_NODE': return 'badge-visit';
      case 'RELAXATION_SUCCESS': return 'badge-relax-success';
      case 'RELAXATION_NO_CHANGE': return 'badge-relax-skip';
      case 'EDGE_ALREADY_VISITED': return 'badge-relax-skip';
      case 'REACHED_DESTINATION': return 'badge-complete';
      case 'COMPLETED': return 'badge-complete';
      default: return 'badge-init';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Linked Built Route Delivery Legs Quick Walkthrough */}
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
                Step-by-Step Dijkstra Trace for Active Built Route
              </h4>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>
              {currentBuiltRoute.full_path_string}
            </div>
          </div>

          <div className="card-body" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Click any delivery leg to load the live Dijkstra priority-queue and edge-relaxation walkthrough:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentBuiltRoute.legs.map((leg) => {
                const isActive = startNode === leg.from_node && endNode === leg.to_node;
                return (
                  <button
                    key={`vis-leg-${leg.stop_number}`}
                    type="button"
                    className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleSelectBuiltRouteLeg(leg.from_node, leg.to_node)}
                    style={{ fontSize: '0.8rem', fontWeight: '700', padding: '6px 12px' }}
                  >
                    <span>Leg #{leg.stop_number}: {leg.from_node} ➔ {leg.to_node}</span>
                    <span style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-muted)',
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
        </div>
      )}

      {/* Top Header Card: Selectors & Fetch */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Activity size={18} color="var(--primary)" />
            <span>Dijkstra Algorithm Interactive Step Visualizer</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Min-Heap Priority Queue Step Execution
          </span>
        </div>

        <div className="card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '16px',
            alignItems: 'flex-end'
          }}>
            {/* Start Node */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="vis-start-node">
                <span>Start Location:</span>
              </label>
              <select
                id="vis-start-node"
                className="form-select"
                value={startNode}
                onChange={(e) => {
                  setStartNode(e.target.value);
                  setTraceData(null);
                }}
              >
                <option value="">-- Select Start Node --</option>
                {nodes.map(n => <option key={`vis-s-${n}`} value={n}>Location {n}</option>)}
              </select>
            </div>

            {/* End Node */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="vis-end-node">
                <span>Destination Location:</span>
              </label>
              <select
                id="vis-end-node"
                className="form-select"
                value={endNode}
                onChange={(e) => {
                  setEndNode(e.target.value);
                  setTraceData(null);
                }}
              >
                <option value="">-- Select End Node --</option>
                {nodes.map(n => <option key={`vis-e-${n}`} value={n}>Location {n}</option>)}
              </select>
            </div>

            <button
              id="init-visualizer-btn"
              className="btn btn-primary"
              onClick={fetchTrace}
              disabled={loading || !startNode || !endNode}
              style={{ minWidth: '180px' }}
            >
              <Sparkles size={16} />
              <span>{loading ? 'PREPARING...' : 'LOAD VISUALIZER'}</span>
            </button>
          </div>

          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginTop: '14px',
              fontWeight: '600'
            }}>
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Visualizer Controls & Playback */}
      {traceData && (
        <div className="visualizer-controls">
          <div className="controls-group">
            <button 
              id="vis-start-btn" 
              className="btn btn-primary btn-sm" 
              onClick={handleStart}
              title="Start from beginning"
            >
              <Play size={14} />
              <span>START</span>
            </button>

            {isPlaying ? (
              <button 
                id="vis-pause-btn" 
                className="btn btn-secondary btn-sm" 
                onClick={handlePause}
                title="Pause playback"
              >
                <Pause size={14} />
                <span>PAUSE</span>
              </button>
            ) : (
              <button 
                id="vis-play-btn" 
                className="btn btn-secondary btn-sm" 
                onClick={handleResume}
                disabled={currentStepIndex >= traceData.steps.length - 1}
                title="Resume playback"
              >
                <Play size={14} />
                <span>PLAY</span>
              </button>
            )}

            <button 
              id="vis-prev-btn" 
              className="btn btn-secondary btn-sm" 
              onClick={handlePrev} 
              disabled={currentStepIndex === 0}
              title="Previous algorithmic step"
            >
              <SkipBack size={14} />
              <span>PREV STEP</span>
            </button>

            <button 
              id="vis-next-btn" 
              className="btn btn-secondary btn-sm" 
              onClick={handleNext} 
              disabled={currentStepIndex >= traceData.steps.length - 1}
              title="Next algorithmic step"
            >
              <SkipForward size={14} />
              <span>NEXT STEP</span>
            </button>

            <button 
              id="vis-reset-btn" 
              className="btn btn-secondary btn-sm" 
              onClick={handleReset}
              title="Reset to step 1"
            >
              <RotateCcw size={14} />
              <span>RESET</span>
            </button>

            <button 
              id="vis-run-all-btn" 
              className="btn btn-success btn-sm" 
              onClick={handleRunAll}
              title="Jump to completion"
            >
              <FastForward size={14} />
              <span>RUN ALL</span>
            </button>
          </div>

          {/* Speed Selector & Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '600' }}>
              <span>Speed:</span>
              <select
                className="form-select"
                style={{ width: '100px', padding: '4px 8px', fontSize: '0.82rem' }}
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              >
                <option value={2000}>Slow (2s)</option>
                <option value={1200}>Normal (1.2s)</option>
                <option value={600}>Fast (0.6s)</option>
                <option value={300}>Instant (0.3s)</option>
              </select>
            </div>

            <div style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: '800'
            }}>
              Step {currentStepIndex + 1} / {traceData.steps.length}
            </div>
          </div>
        </div>
      )}

      {/* Main Visualizer Stage */}
      {currentStep && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          
          {/* Left: Synchronized Graph Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Step Explanation Card */}
            <div className="step-explanation-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`step-badge ${getActionBadgeClass(currentStep.action)}`}>
                  {currentStep.action.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  STEP #{currentStep.step_id}
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '600', lineHeight: 1.4 }}>
                {currentStep.explanation}
              </p>
            </div>

            {/* Graph Canvas */}
            <div className="card">
              <div className="card-header" style={{ padding: '12px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', fontWeight: '700' }}>
                  <span>Active Node:</span>
                  <span className="node-chip" style={{ background: '#f59e0b', color: 'white', borderColor: '#b45309' }}>
                    {currentStep.current_node || '-'}
                  </span>
                  {currentStep.neighbor_node && (
                    <>
                      <span style={{ color: 'var(--text-muted)' }}>Evaluating Neighbor:</span>
                      <span className="node-chip" style={{ background: '#f97316', color: 'white', borderColor: '#c2410c' }}>
                        {currentStep.neighbor_node}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <GraphCanvas
                  nodes={nodes}
                  roads={roads}
                  highlightPath={currentStep.is_final ? currentStep.final_path : []}
                  currentNode={currentStep.current_node}
                  neighborNode={currentStep.neighbor_node}
                  visitedNodes={currentStep.visited_nodes || []}
                  height="460px"
                />
              </div>
            </div>

          </div>

          {/* Right: Algorithm Tables (Distances, Previous, Min-Heap PQ, Visited) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Distance Table */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title" style={{ fontSize: '0.92rem' }}>
                  <ListOrdered size={16} color="var(--primary)" />
                  <span>Distance Table (distance[u])</span>
                </h4>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="custom-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Node</th>
                        <th>Shortest Known Time</th>
                        <th>Previous</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nodes.map(node => {
                        const dist = currentStep.distances[node];
                        const prev = currentStep.previous[node];
                        const isUpdated = currentStep.updated_node === node;
                        const isVisited = currentStep.visited_nodes.includes(node);

                        return (
                          <tr key={`dist-row-${node}`} style={{
                            backgroundColor: isUpdated ? '#ecfdf5' : (isVisited ? '#f8fafc' : 'white'),
                            transition: 'background-color 0.3s'
                          }}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="node-chip" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                                  {node}
                                </span>
                                {isVisited && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--success-dark)', fontWeight: '700' }}>✓</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span style={{
                                fontWeight: '700',
                                color: dist === 'inf' ? 'var(--text-muted)' : (isUpdated ? 'var(--success-dark)' : 'var(--primary)'),
                                fontSize: '0.88rem'
                              }}>
                                {dist === 'inf' ? '∞' : `${dist} min`}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                fontWeight: '700',
                                color: prev ? 'var(--text-primary)' : 'var(--text-muted)'
                              }}>
                                {prev || 'None'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Min-Heap Priority Queue State */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title" style={{ fontSize: '0.92rem' }}>
                  <Layers size={16} color="#d97706" />
                  <span>Min-Heap Priority Queue</span>
                </h4>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                  (Time, Node)
                </span>
              </div>
              <div className="card-body">
                {currentStep.pq_snapshot.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '8px' }}>
                    Priority Queue is Empty
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentStep.pq_snapshot.map((item, idx) => (
                      <div key={idx} style={{
                        background: idx === 0 ? '#fef3c7' : 'var(--bg-muted)',
                        border: idx === 0 ? '1px solid #fde68a' : '1px solid var(--border-color)',
                        color: idx === 0 ? '#92400e' : 'var(--text-primary)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {idx === 0 && <span style={{ fontSize: '0.7rem', color: '#b45309' }}>[MIN]</span>}
                        <span>Node {item.node}:</span>
                        <span style={{ color: 'var(--primary)' }}>{item.distance} min</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Visited Nodes Set */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title" style={{ fontSize: '0.92rem' }}>
                  <CheckCircle size={16} color="var(--success)" />
                  <span>Finalized / Visited Nodes ({currentStep.visited_nodes.length})</span>
                </h4>
              </div>
              <div className="card-body">
                {currentStep.visited_nodes.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                    No nodes finalized yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {currentStep.visited_nodes.map(node => (
                      <span key={`vis-badge-${node}`} className="node-chip node-chip-active">
                        {node}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
