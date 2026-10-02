import React from 'react';
import { 
  BookOpen, 
  Code, 
  Layers, 
  Cpu, 
  CheckCircle, 
  Bike, 
  MapPin, 
  Zap, 
  Sparkles 
} from 'lucide-react';

export default function AboutView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Hero Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', border: '1.5px solid var(--primary-border)' }}>
        <div className="card-body" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div className="sidebar-logo-icon" style={{ width: '48px', height: '48px' }}>
              <Bike size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Smart Delivery Route Optimizer</h2>
              <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
                Design and Analysis of Algorithms (DAA) • Multipurpose Logistics Optimization
              </p>
            </div>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            A multipurpose smart logistics application designed for real-world delivery operations (parcels, documents, food, retail, medical supplies, and general freight). 
            Operating across an interconnected road network with fixed travel times, the system computes provably optimal routes from a central Dispatch Hub to multiple delivery destinations using a pure from-scratch implementation of <strong>Dijkstra's Shortest Path Algorithm</strong> with a binary min-heap priority queue, coupled with a combinatorial <strong>Multi-Location Delivery Sequence Optimization Layer</strong>.
          </p>
        </div>
      </div>

      {/* Core Highlights */}
      <div className="grid-cards">
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div className="metric-icon-box icon-blue" style={{ width: '36px', height: '36px' }}>
                <MapPin size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem' }}>Pure Manual Graph Builder</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Nodes and roads are added interactively with only Start, End, and Travel Time. No hardcoded coordinates or predefined static maps.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div className="metric-icon-box icon-emerald" style={{ width: '36px', height: '36px' }}>
                <Cpu size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem' }}>From-Scratch Dijkstra</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Implemented with Python's min-heap priority queue (<code className="font-mono">heapq</code>) achieving optimal <code className="font-mono">O((V + E) log V)</code> complexity.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div className="metric-icon-box icon-amber" style={{ width: '36px', height: '36px' }}>
                <Zap size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem' }}>Dynamic Recalculation</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Modifying road travel times immediately triggers fresh algorithmic evaluation, updating the optimal route in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Algorithm Pseudocode Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Code size={18} color="var(--primary)" />
            <span>Dijkstra's Algorithm Pseudocode & Theory</span>
          </h3>
        </div>

        <div className="card-body">
          <div style={{
            background: '#0f172a',
            color: '#f8fafc',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
            overflowX: 'auto'
          }}>
            <span style={{ color: '#94a3b8' }}># Dijkstra's Algorithm (Min-Heap Implementation)</span><br />
            <span style={{ color: '#38bdf8' }}>function</span> <span style={{ color: '#a78bfa' }}>Dijkstra</span>(Graph, source, destination):<br />
            &nbsp;&nbsp;<span style={{ color: '#94a3b8' }}># 1. Initialize data structures</span><br />
            &nbsp;&nbsp;distance[source] = <span style={{ color: '#f59e0b' }}>0</span><br />
            &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>for each</span> vertex v <span style={{ color: '#38bdf8' }}>in</span> Graph.Vertices \ &#123;source&#125;:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;distance[v] = <span style={{ color: '#f59e0b' }}>infinity</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;previous[v] = <span style={{ color: '#f59e0b' }}>null</span><br />
            <br />
            &nbsp;&nbsp;<span style={{ color: '#94a3b8' }}># 2. Priority Queue stores (travel_time, node)</span><br />
            &nbsp;&nbsp;PQ = MinHeap()<br />
            &nbsp;&nbsp;PQ.insert((<span style={{ color: '#f59e0b' }}>0</span>, source))<br />
            &nbsp;&nbsp;visited = Set()<br />
            <br />
            &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>while</span> PQ <span style={{ color: '#38bdf8' }}>is not empty</span>:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;(curr_dist, u) = PQ.extract_min()<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>if</span> u <span style={{ color: '#38bdf8' }}>in</span> visited: <span style={{ color: '#38bdf8' }}>continue</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;visited.add(u)<br />
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>if</span> u == destination: <span style={{ color: '#38bdf8' }}>break</span> <span style={{ color: '#94a3b8' }}># Early exit optimal target</span><br />
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#94a3b8' }}># 3. Relaxation step</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>for each</span> neighbor v <span style={{ color: '#38bdf8' }}>of</span> u with weight w:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>if</span> v <span style={{ color: '#38bdf8' }}>not in</span> visited:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;new_dist = distance[u] + w<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>if</span> new_dist &lt; distance[v]:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;distance[v] = new_dist<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;previous[v] = u<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PQ.insert((new_dist, v))<br />
            <br />
            &nbsp;&nbsp;<span style={{ color: '#94a3b8' }}># 4. Reconstruct shortest path</span><br />
            &nbsp;&nbsp;path = []<br />
            &nbsp;&nbsp;curr = destination<br />
            &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>while</span> curr <span style={{ color: '#38bdf8' }}>is not null</span>:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;path.prepend(curr)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;curr = previous[curr]<br />
            &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>return</span> path, distance[destination]<br />
          </div>
        </div>
      </div>

    </div>
  );
}
