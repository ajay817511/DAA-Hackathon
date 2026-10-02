import React, { useState } from 'react';
import GraphCanvas from './GraphCanvas';
import MiniMapDeliveryPlanner from './MiniMapDeliveryPlanner';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Clock, 
  MapPin,
  Navigation,
  GitFork
} from 'lucide-react';

export default function BuildRouteView({
  nodes = [],
  roads = [],
  onAddRoad,
  onUpdateRoad,
  onDeleteRoad,
  onLoadSample,
  loading = false,
  error = null,
  successMessage = null,
  currentBuiltRoute = null,
  onRouteCalculated = null,
  onReset = null,
  setActiveTab = null
}) {
  const [activeMode, setActiveMode] = useState('minimap'); // 'minimap' | 'custom'
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [editingRoadId, setEditingRoadId] = useState(null);
  const [editTravelTime, setEditTravelTime] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const u = startNode.trim().toUpperCase();
    const v = endNode.trim().toUpperCase();
    const timeNum = parseFloat(travelTime);

    if (!u || !v) {
      setFormError('Please enter both Starting location and Ending location.');
      return;
    }
    if (u === v) {
      setFormError('Starting location and Ending location cannot be the same node.');
      return;
    }
    if (isNaN(timeNum) || timeNum <= 0) {
      setFormError('Please enter a valid travel time greater than 0 minutes.');
      return;
    }

    onAddRoad(u, v, timeNum);
    // Reset form inputs
    setTravelTime('');
    // Keep or clear start/end for rapid chaining
  };

  const startEdit = (road) => {
    setEditingRoadId(road.id);
    setEditTravelTime(road.travel_time.toString());
  };

  const saveEdit = (roadId) => {
    const timeNum = parseFloat(editTravelTime);
    if (isNaN(timeNum) || timeNum <= 0) {
      alert('Travel time must be a number greater than 0.');
      return;
    }
    onUpdateRoad(roadId, timeNum);
    setEditingRoadId(null);
  };

  const cancelEdit = () => {
    setEditingRoadId(null);
  };

  const handleQuickNodeSelect = (node) => {
    if (!startNode) {
      setStartNode(node);
    } else if (!endNode && node !== startNode) {
      setEndNode(node);
    } else {
      setStartNode(node);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Notification / Alerts */}
      {error && (
        <div style={{
          background: 'var(--danger-light)',
          border: '1px solid var(--danger-border)',
          color: 'var(--danger)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          background: 'var(--success-light)',
          border: '1px solid var(--success-border)',
          color: 'var(--success-dark)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        padding: '6px 8px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xs)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${activeMode === 'minimap' ? 'btn-primary' : 'btn-secondary'} btn-md`}
            onClick={() => setActiveMode('minimap')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}
          >
            <Navigation size={17} />
            <span>Artificial Mini-Map Planner (Nodes A–H & Restaurant)</span>
            <span style={{
              background: activeMode === 'minimap' ? 'rgba(255,255,255,0.25)' : 'var(--primary-light)',
              color: activeMode === 'minimap' ? '#ffffff' : 'var(--primary)',
              fontSize: '0.7rem',
              padding: '1px 7px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '800'
            }}>
              MULTI-DELIVERY
            </span>
          </button>

          <button
            type="button"
            className={`btn ${activeMode === 'custom' ? 'btn-primary' : 'btn-secondary'} btn-md`}
            onClick={() => setActiveMode('custom')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}
          >
            <GitFork size={17} />
            <span>Custom Road Network Builder ({roads.length} Roads)</span>
          </button>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingRight: '8px' }}>
          {activeMode === 'minimap' 
            ? 'Interactive Multi-Stop Planner' 
            : 'Configure Custom Nodes & Distances'}
        </div>
      </div>

      {activeMode === 'minimap' ? (
        <MiniMapDeliveryPlanner 
          currentRoute={currentBuiltRoute}
          onRouteCalculated={onRouteCalculated}
          onReset={onReset}
          setActiveTab={setActiveTab}
        />
      ) : (
        /* Main Builder Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 380px) 1fr', gap: '24px' }}>
        
        {/* Left Column: Simple Road Addition Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <PlusCircle size={18} color="var(--primary)" />
                <span>Add Road Connection</span>
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                3-FIELD INPUT
              </span>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {formError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    marginBottom: '14px',
                    fontWeight: '600'
                  }}>
                    {formError}
                  </div>
                )}

                {/* 1. Starting Location */}
                <div className="form-group">
                  <label className="form-label" htmlFor="start-location-input">
                    <span>Starting Location:</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>e.g., A, Hub 1</span>
                  </label>
                  <input
                    id="start-location-input"
                    type="text"
                    className="form-input"
                    placeholder="Enter or select node (e.g. A)"
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                    maxLength={15}
                    list="existing-nodes-list"
                    autoFocus
                  />
                </div>

                {/* 2. Ending Location */}
                <div className="form-group">
                  <label className="form-label" htmlFor="end-location-input">
                    <span>Ending Location:</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>e.g., B, Hub 2</span>
                  </label>
                  <input
                    id="end-location-input"
                    type="text"
                    className="form-input"
                    placeholder="Enter or select node (e.g. B)"
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                    maxLength={15}
                    list="existing-nodes-list"
                  />
                </div>

                <datalist id="existing-nodes-list">
                  {nodes.map(n => <option key={n} value={n} />)}
                </datalist>

                {/* Quick Node Chips for existing nodes */}
                {nodes.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      CLICK TO SELECT EXISTING LOCATION:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {nodes.map(n => (
                        <button
                          key={n}
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 10px', fontSize: '0.8rem', fontWeight: '700' }}
                          onClick={() => handleQuickNodeSelect(n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Travel Time */}
                <div className="form-group">
                  <label className="form-label" htmlFor="travel-time-input">
                    <span>Travel Time:</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '700' }}>MINUTES</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="travel-time-input"
                      type="number"
                      step="any"
                      min="0.1"
                      className="form-input"
                      placeholder="Travel time in minutes (e.g. 5)"
                      value={travelTime}
                      onChange={(e) => setTravelTime(e.target.value)}
                    />
                    <Clock 
                      size={16} 
                      color="#94a3b8" 
                      style={{ position: 'absolute', right: '12px', top: '14px', pointerEvents: 'none' }} 
                    />
                  </div>
                </div>

                {/* Add Road Button */}
                <button
                  id="add-road-btn"
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={loading}
                >
                  <PlusCircle size={18} />
                  <span>ADD ROAD</span>
                </button>
              </form>
            </div>
          </div>

          {/* Quick Preset Cards for Hackathon Demo */}
          <div className="card">
            <div className="card-header">
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="var(--primary)" />
                <span>Quick Demo Presets</span>
              </h4>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => onLoadSample('simple_demo')}
              >
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Prompt Example:</span>
                <span>A-B (10m), A-C (2m), C-B (3m)</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => onLoadSample('food_delivery_hub')}
              >
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Food Delivery Hub:</span>
                <span>6 Nodes (A, B, C, D, E, F)</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => onLoadSample('complex_city')}
              >
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Metro City Grid:</span>
                <span>7 Nodes & 11 Roads</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Large Interactive Graph Canvas + Roads Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h3 className="card-title">
                <MapPin size={18} color="var(--primary)" />
                <span>Interactive Road Network Canvas</span>
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Drag nodes to reposition • Scroll to zoom
              </div>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              {roads.length === 0 ? (
                <div style={{
                  height: '460px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '14px',
                  color: 'var(--text-muted)',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <PlusCircle size={32} />
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Graph is Empty</h4>
                    <p style={{ fontSize: '0.88rem', maxWidth: '380px' }}>
                      Enter a <strong>Starting Location</strong>, <strong>Ending Location</strong>, and <strong>Travel Time</strong> on the left, then click <strong>ADD ROAD</strong> to build your graph.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onLoadSample('simple_demo')}
                  >
                    <Sparkles size={14} />
                    <span>Load Prompt Demo Example</span>
                  </button>
                </div>
              ) : (
                <GraphCanvas
                  nodes={nodes}
                  roads={roads}
                  onNodeClick={handleQuickNodeSelect}
                  height="460px"
                />
              )}
            </div>
          </div>

          {/* Road Management Table */}
          {roads.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h4 className="card-title" style={{ fontSize: '0.95rem' }}>
                  <span>Configured Roads ({roads.length})</span>
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Travel times can be updated dynamically
                </span>
              </div>

              <div className="card-body" style={{ padding: 0 }}>
                <div className="custom-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>#</th>
                        <th>Connection</th>
                        <th>Travel Time</th>
                        <th style={{ textAlign: 'right', width: '140px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roads.map((road, index) => {
                        const isEditing = editingRoadId === road.id;
                        return (
                          <tr key={road.id}>
                            <td style={{ color: 'var(--text-muted)', fontWeight: '700' }}>
                              #{index + 1}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                                <span className="node-chip">{road.start_node}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>↔</span>
                                <span className="node-chip">{road.end_node}</span>
                              </div>
                            </td>
                            <td>
                              {isEditing ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input
                                    type="number"
                                    step="any"
                                    min="0.1"
                                    value={editTravelTime}
                                    onChange={(e) => setEditTravelTime(e.target.value)}
                                    className="form-input"
                                    style={{ width: '90px', padding: '4px 8px', fontSize: '0.85rem' }}
                                    autoFocus
                                  />
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>min</span>
                                </div>
                              ) : (
                                <span style={{
                                  background: 'var(--bg-muted)',
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontWeight: '700',
                                  color: 'var(--primary)',
                                  fontSize: '0.88rem'
                                }}>
                                  {road.travel_time} minutes
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                  <button
                                    className="btn btn-success btn-sm btn-icon-only"
                                    onClick={() => saveEdit(road.id)}
                                    title="Save travel time"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm btn-icon-only"
                                    onClick={cancelEdit}
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                  <button
                                    className="btn btn-secondary btn-sm btn-icon-only"
                                    onClick={() => startEdit(road)}
                                    title="Edit travel time"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm btn-icon-only"
                                    onClick={() => onDeleteRoad(road.id)}
                                    title="Delete road"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
      )}
    </div>
  );
}
