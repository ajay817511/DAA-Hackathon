import React from 'react';
import { 
  LayoutDashboard, 
  GitFork, 
  Navigation, 
  PlaySquare, 
  BarChart3, 
  Info,
  Bike
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, nodeCount, roadCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'build-route', label: 'Built Route', icon: GitFork },
    { id: 'shortest-route', label: 'Shortest Route', icon: Navigation },
    { id: 'visualizer', label: 'Dijkstra Visualizer', icon: PlaySquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Bike size={24} />
        </div>
        <div>
          <h1 className="sidebar-title">Smart Delivery</h1>
          <p className="sidebar-subtitle">DAA Route Optimizer</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="nav-item-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status-card">
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>FastAPI Dijkstra Active</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Graph: <strong>{nodeCount}</strong> Nodes | <strong>{roadCount}</strong> Roads
          </div>
        </div>
      </div>
    </aside>
  );
}
