import React from 'react';
import GraphCanvas from './GraphCanvas';
import { 
  MapPin, 
  GitFork, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Sparkles,
  Layers,
  ChevronRight,
  Bike
} from 'lucide-react';

export default function DashboardView({
  nodes = [],
  roads = [],
  startNode,
  setStartNode,
  endNode,
  setEndNode,
  onCalculateRoute,
  routeResult = null,
  setActiveTab,
  onLoadSample,
  currentBuiltRoute = null
}) {
  const finalStop = currentBuiltRoute && currentBuiltRoute.optimized_order && currentBuiltRoute.optimized_order.length > 0
    ? currentBuiltRoute.optimized_order[currentBuiltRoute.optimized_order.length - 1]
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Active Multi-Stop Delivery Mission Banner */}
      {currentBuiltRoute && currentBuiltRoute.success && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          border: '1.5px solid var(--primary-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div className="card-body" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Navigation size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>
                    Active Multi-Stop Delivery Mission
                  </h4>
                  <span style={{
                    fontSize: '0.72rem',
                    background: 'var(--success-light)',
                    color: 'var(--success-dark)',
                    fontWeight: '800',
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {currentBuiltRoute.customer_count} STOPS
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Route: <strong>{currentBuiltRoute.full_path_string}</strong> • Total Time: <strong>{currentBuiltRoute.total_travel_time} mins</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('build-route')}
                style={{ fontSize: '0.78rem' }}
              >
                <span>Manage In Built Route</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('visualizer')}
                style={{ fontSize: '0.78rem' }}
              >
                <span>Step Visualizer</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 5 Required Dashboard Metric Cards */}
      <div className="grid-cards">
        
        {/* 1. Total Locations */}
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">TOTAL LOCATIONS</span>
            <span className="metric-value">{nodes.length}</span>
          </div>
          <div className="metric-icon-box icon-blue">
            <MapPin size={22} />
          </div>
        </div>

        {/* 2. Total Roads */}
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">TOTAL ROADS</span>
            <span className="metric-value">{roads.length}</span>
          </div>
          <div className="metric-icon-box icon-indigo">
            <GitFork size={22} />
          </div>
        </div>

        {/* 3. Starting Location */}
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">STARTING LOCATION</span>
            <span className="metric-value" style={{ color: (currentBuiltRoute || startNode) ? 'var(--success-dark)' : 'var(--text-muted)' }}>
              {currentBuiltRoute && currentBuiltRoute.success 
                ? `Hub (${currentBuiltRoute.start_node})` 
                : startNode ? `Node ${startNode}` : 'None Selected'}
            </span>
          </div>
          <div className="metric-icon-box icon-emerald">
            <Navigation size={22} />
          </div>
        </div>

        {/* 4. Ending Location */}
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">DESTINATION / STOPS</span>
            <span className="metric-value" style={{ color: (currentBuiltRoute || endNode) ? '#6d28d9' : 'var(--text-muted)' }}>
              {currentBuiltRoute && currentBuiltRoute.success 
                ? `${currentBuiltRoute.customer_count} Stops (➔ ${finalStop})` 
                : endNode ? `Node ${endNode}` : 'None Selected'}
            </span>
          </div>
          <div className="metric-icon-box icon-purple">
            <MapPin size={22} />
          </div>
        </div>

        {/* 5. Shortest Travel Time */}
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">OPTIMAL TRAVEL TIME</span>
            <span className="metric-value" style={{ color: (currentBuiltRoute || (routeResult && routeResult.found)) ? 'var(--primary)' : 'var(--text-muted)' }}>
              {currentBuiltRoute && currentBuiltRoute.success 
                ? `${currentBuiltRoute.total_travel_time} min` 
                : routeResult && routeResult.found ? `${routeResult.total_travel_time} min` : '—'}
            </span>
          </div>
          <div className="metric-icon-box icon-amber">
            <Clock size={22} />
          </div>
        </div>

      </div>

      {/* Main Dashboard Grid: Canvas Preview + Quick Route Finder */}
      <div className="dashboard-grid">
        
        {/* Left: Graph Canvas Preview */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--primary)" />
              <h3 className="card-title">Current Road Network Preview</h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('build-route')}
            >
              <span>Edit Graph</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {roads.length === 0 ? (
              <div style={{
                height: '460px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: 'var(--text-muted)',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <Bike size={28} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>No Roads Added Yet</h4>
                  <p style={{ fontSize: '0.88rem', maxWidth: '340px' }}>
                    Build your custom road network manually or load a demo preset.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('build-route')}>
                    Build Route
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => onLoadSample('simple_demo')}>
                    <Sparkles size={14} />
                    <span>Load Demo</span>
                  </button>
                </div>
              </div>
            ) : (
              <GraphCanvas
                nodes={nodes}
                roads={roads}
                highlightPath={routeResult && routeResult.found ? routeResult.path : []}
                height="460px"
              />
            )}
          </div>
        </div>

        {/* Right: Quick Route Calculation & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Solver Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
                <Zap size={16} color="var(--primary)" />
                <span>Quick Route Solver</span>
              </h3>
            </div>

            <div className="card-body">
              {nodes.length < 2 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Add at least 2 locations in <strong>Build Route</strong> to find shortest paths.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Start Node:</label>
                    <select
                      className="form-select"
                      value={startNode}
                      onChange={(e) => setStartNode(e.target.value)}
                    >
                      <option value="">Select origin...</option>
                      {nodes.map(n => <option key={`dash-s-${n}`} value={n}>Location {n}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Destination Node:</label>
                    <select
                      className="form-select"
                      value={endNode}
                      onChange={(e) => setEndNode(e.target.value)}
                    >
                      <option value="">Select destination...</option>
                      {nodes.map(n => <option key={`dash-e-${n}`} value={n}>Location {n}</option>)}
                    </select>
                  </div>

                  <button
                    className="btn btn-primary"
                    disabled={!startNode || !endNode || startNode === endNode}
                    onClick={() => {
                      onCalculateRoute(startNode, endNode);
                      setActiveTab('shortest-route');
                    }}
                  >
                    <Navigation size={16} />
                    <span>Find Shortest Route</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Result Card if available */}
          {routeResult && routeResult.found && (
            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div className="card-header" style={{ padding: '12px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-dark)', fontWeight: '800', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} />
                  <span>OPTIMAL ROUTE</span>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>
                  {routeResult.path_string}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Travel Time: <strong>{routeResult.total_travel_time} minutes</strong> ({routeResult.roads_used} roads)
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: '6px' }}
                  onClick={() => setActiveTab('visualizer')}
                >
                  <span>Open Step Visualizer</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Fast Navigation Quick Links */}
          <div className="card">
            <div className="card-header">
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700' }}>Quick Shortcuts</h4>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('build-route')}>
                <span>1. Build Custom Graph</span>
                <ChevronRight size={14} />
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('shortest-route')}>
                <span>2. Calculate Shortest Route</span>
                <ChevronRight size={14} />
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('visualizer')}>
                <span>3. Run Dijkstra Visualizer</span>
                <ChevronRight size={14} />
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('analytics')}>
                <span>4. View Math & Complexity</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
