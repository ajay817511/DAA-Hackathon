import React from 'react';
import { 
  MapPin, 
  Share2, 
  RotateCcw, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  nodes, 
  roads, 
  onClearGraph, 
  onLoadSample 
}) {
  const titles = {
    'dashboard': 'System Dashboard',
    'build-route': 'Build Road Network Graph',
    'shortest-route': 'Find Shortest Delivery Route',
    'visualizer': 'Dijkstra Step-by-Step Visualizer',
    'analytics': 'Graph Metrics & Complexity Analytics',
    'about': 'DAA Hackathon Algorithm Guide'
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <h2 className="page-heading">{titles[activeTab] || 'Smart Delivery Route'}</h2>
      </div>

      <div className="header-right">
        {/* Live Graph Status Pills */}
        <div className="stat-pill">
          <MapPin size={14} color="#2563eb" />
          <span>Locations: <strong>{nodes.length}</strong></span>
        </div>

        <div className="stat-pill">
          <Share2 size={14} color="#6366f1" />
          <span>Roads: <strong>{roads.length}</strong></span>
        </div>

        {/* Quick Sample Presets Dropdown / Button */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onLoadSample('food_delivery_hub')}
          title="Load sample food delivery network"
        >
          <Sparkles size={14} color="#f59e0b" />
          <span>Load Demo Graph</span>
        </button>

        {/* Clear Graph Button */}
        {roads.length > 0 && (
          <button 
            className="btn btn-danger btn-sm"
            onClick={onClearGraph}
            title="Clear all nodes and roads"
          >
            <RotateCcw size={14} />
            <span>Clear Graph</span>
          </button>
        )}
      </div>
    </header>
  );
}
