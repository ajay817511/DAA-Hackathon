import React from 'react';
import { 
  Cpu, 
  HardDrive, 
  GitBranch, 
  Layers, 
  Clock, 
  Activity,
  Network,
  TrendingDown,
  DollarSign,
  Milestone,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export default function AnalyticsView({
  nodes = [],
  roads = [],
  lastCalculation = null,
  currentBuiltRoute = null
}) {
  const v = nodes.length;
  const e = roads.length;
  const density = v > 1 ? ((2 * e) / (v * (v - 1))).toFixed(4) : '0.0000';
  const avgDegree = v > 0 ? ((2 * e) / v).toFixed(2) : '0.00';

  // Build Adjacency Matrix
  const adjMatrix = {};
  nodes.forEach(u => {
    adjMatrix[u] = {};
    nodes.forEach(w => {
      adjMatrix[u][w] = (u === w) ? 0 : '∞';
    });
  });

  roads.forEach(road => {
    const u = road.start_node;
    const w = road.end_node;
    const time = road.travel_time;
    if (adjMatrix[u] && adjMatrix[u][w] !== undefined) {
      adjMatrix[u][w] = time;
      adjMatrix[w][u] = time;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Active Built Route Mission Analytics */}
      {currentBuiltRoute && currentBuiltRoute.success && (
        <div className="card" style={{
          border: '1.5px solid var(--primary-border)',
          boxShadow: 'var(--shadow-md)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          <div className="card-header" style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Navigation size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                  Active Built Route Mission Analytics
                </h4>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Route: <strong>{currentBuiltRoute.full_path_string}</strong>
                </div>
              </div>
            </div>
            <span style={{
              background: 'var(--success-light)',
              color: 'var(--success-dark)',
              border: '1px solid var(--success-border)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: '800'
            }}>
              LIVE OPTIMIZATION METRICS
            </span>
          </div>

          <div className="card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* 4 Multi-Stop KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              
              {/* Total Travel Time */}
              <div className="metric-card" style={{ padding: '14px' }}>
                <div className="metric-info">
                  <span className="metric-label">TOTAL TRAVEL TIME</span>
                  <span className="metric-value" style={{ color: 'var(--primary)' }}>
                    {currentBuiltRoute.total_travel_time} <span style={{ fontSize: '0.9rem' }}>min</span>
                  </span>
                </div>
                <div className="metric-icon-box icon-blue">
                  <Clock size={20} />
                </div>
              </div>

              {/* Total Distance */}
              <div className="metric-card" style={{ padding: '14px' }}>
                <div className="metric-info">
                  <span className="metric-label">ESTIMATED DISTANCE</span>
                  <span className="metric-value" style={{ color: 'var(--secondary)' }}>
                    {currentBuiltRoute.total_distance_km} <span style={{ fontSize: '0.9rem' }}>km</span>
                  </span>
                </div>
                <div className="metric-icon-box icon-indigo">
                  <Milestone size={20} />
                </div>
              </div>

              {/* Estimated Cost */}
              <div className="metric-card" style={{ padding: '14px' }}>
                <div className="metric-info">
                  <span className="metric-label">ESTIMATED COST</span>
                  <span className="metric-value" style={{ color: 'var(--success-dark)' }}>
                    ${currentBuiltRoute.estimated_cost}
                  </span>
                </div>
                <div className="metric-icon-box icon-emerald">
                  <DollarSign size={20} />
                </div>
              </div>

              {/* Optimization Gain */}
              <div className="metric-card" style={{ padding: '14px' }}>
                <div className="metric-info">
                  <span className="metric-label">OPTIMIZATION GAIN</span>
                  <span className="metric-value" style={{ color: '#ea580c' }}>
                    {currentBuiltRoute.efficiency_improvement_percent}% <span style={{ fontSize: '0.8rem' }}>faster</span>
                  </span>
                </div>
                <div className="metric-icon-box icon-amber">
                  <TrendingDown size={20} />
                </div>
              </div>

            </div>

            {/* DAA Optimization Efficiency Note */}
            {currentBuiltRoute.time_saved_minutes > 0 && (
              <div style={{
                background: 'var(--success-light)',
                border: '1px solid var(--success-border)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.84rem',
                color: 'var(--success-dark)',
                fontWeight: '600'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} />
                  <span>
                    Compared to arbitrary click order ({currentBuiltRoute.naive_travel_time} mins), 
                    DAA multi-destination optimization saved <strong>{currentBuiltRoute.time_saved_minutes} minutes</strong>!
                  </span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: '800' }}>
                  {currentBuiltRoute.execution_time_ms} ms runtime
                </span>
              </div>
            )}

            {/* Delivery Progression Table */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>
                TURN-BY-TURN DELIVERY PROGRESSION & CUMULATIVE TIME:
              </div>
              <div className="custom-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px' }}>Stop #</th>
                      <th>Origin ➔ Destination</th>
                      <th>Turn-by-Turn Road Path</th>
                      <th>Leg Time</th>
                      <th>Cumulative Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let cumulative = 0;
                      return currentBuiltRoute.legs.map((leg) => {
                        cumulative += leg.travel_time;
                        return (
                          <tr key={`analytics-leg-${leg.stop_number}`}>
                            <td style={{ fontWeight: '800', color: 'var(--text-muted)' }}>
                              #{leg.stop_number}
                            </td>
                            <td style={{ fontWeight: '700' }}>
                              <span className="node-chip">{leg.from_node}</span>
                              <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>➔</span>
                              <span className="node-chip" style={{ background: '#ecfdf5', color: '#047857' }}>{leg.to_node}</span>
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>
                              {leg.path_string}
                            </td>
                            <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                              {leg.travel_time} min
                            </td>
                            <td style={{ fontWeight: '800', color: 'var(--success-dark)' }}>
                              {cumulative.toFixed(1)} min
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Top Asymptotic Complexity Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        
        {/* Time Complexity Card */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div className="metric-icon-box icon-blue">
              <Cpu size={24} />
            </div>
            <div>
              <span className="metric-label">TIME COMPLEXITY</span>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: '800', color: 'var(--primary)', margin: '4px 0' }}>
                O((V + E) log V)
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Using binary min-heap priority queue. Each node extraction takes O(log V) and each edge relaxation takes O(log V).
              </p>
            </div>
          </div>
        </div>

        {/* Space Complexity Card */}
        <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div className="metric-icon-box icon-indigo">
              <HardDrive size={24} />
            </div>
            <div>
              <span className="metric-label">SPACE COMPLEXITY</span>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: '800', color: 'var(--secondary)', margin: '4px 0' }}>
                O(V + E)
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Adjacency list stores V vertices and 2E directed road entries, plus O(V) for distances, previous, and priority queue.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Graph Metrics Summary Grid */}
      <div className="grid-cards">
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">NUMBER OF NODES (V)</span>
            <span className="metric-value">{v}</span>
          </div>
          <div className="metric-icon-box icon-blue">
            <Layers size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">NUMBER OF ROADS (E)</span>
            <span className="metric-value">{e}</span>
          </div>
          <div className="metric-icon-box icon-indigo">
            <GitBranch size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">GRAPH DENSITY</span>
            <span className="metric-value">{density}</span>
          </div>
          <div className="metric-icon-box icon-emerald">
            <Activity size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">AVG NODE DEGREE</span>
            <span className="metric-value">{avgDegree}</span>
          </div>
          <div className="metric-icon-box icon-amber">
            <Network size={22} />
          </div>
        </div>
      </div>

      {/* Real Algorithm Execution Stats */}
      {lastCalculation && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} color="var(--success)" />
              <span>Latest Dijkstra Execution Run ({lastCalculation.start} → {lastCalculation.destination})</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time measurement from FastAPI Python kernel
            </span>
          </div>

          <div className="card-body">
            <div className="grid-cards">
              <div className="result-stat-box">
                <span className="stat-box-label">NODES PROCESSED</span>
                <span className="stat-box-value" style={{ color: 'var(--primary)' }}>
                  {lastCalculation.nodes_processed} / {v}
                </span>
              </div>

              <div className="result-stat-box">
                <span className="stat-box-label">EDGES CHECKED</span>
                <span className="stat-box-value" style={{ color: 'var(--secondary)' }}>
                  {lastCalculation.edges_checked}
                </span>
              </div>

              <div className="result-stat-box">
                <span className="stat-box-label">SHORTEST TRAVEL TIME</span>
                <span className="stat-box-value" style={{ color: 'var(--success-dark)' }}>
                  {lastCalculation.total_travel_time != null ? `${lastCalculation.total_travel_time} min` : 'Unreachable'}
                </span>
              </div>

              <div className="result-stat-box">
                <span className="stat-box-label">ALGORITHM EXECUTION TIME</span>
                <span className="stat-box-value" style={{ color: '#d97706' }}>
                  {lastCalculation.execution_time_ms} ms
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjacency Matrix Display */}
      {v > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Network size={18} color="var(--primary)" />
              <span>Graph Adjacency Matrix (Travel Times in Minutes)</span>
            </h3>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="custom-table-wrapper" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ background: '#f1f5f9' }}>Location</th>
                    {nodes.map(node => (
                      <th key={`matrix-head-${node}`} style={{ textAlign: 'center' }}>
                        {node}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nodes.map(rowNode => (
                    <tr key={`matrix-row-${rowNode}`}>
                      <td style={{ fontWeight: '800', background: '#f8fafc' }}>
                        Node {rowNode}
                      </td>
                      {nodes.map(colNode => {
                        const val = adjMatrix[rowNode] ? adjMatrix[rowNode][colNode] : '∞';
                        const isSelf = rowNode === colNode;
                        const hasRoad = val !== '∞' && !isSelf;

                        return (
                          <td key={`matrix-cell-${rowNode}-${colNode}`} style={{
                            textAlign: 'center',
                            fontWeight: hasRoad ? '800' : '500',
                            color: hasRoad ? 'var(--primary)' : (isSelf ? 'var(--text-muted)' : '#cbd5e1'),
                            background: hasRoad ? 'var(--primary-light)' : 'transparent'
                          }}>
                            {isSelf ? '0' : (hasRoad ? `${val}m` : '—')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
