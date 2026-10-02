import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import BuildRouteView from './components/BuildRouteView';
import ShortestRouteView from './components/ShortestRouteView';
import VisualizerView from './components/VisualizerView';
import AnalyticsView from './components/AnalyticsView';
import AboutView from './components/AboutView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nodes, setNodes] = useState([]);
  const [roads, setRoads] = useState([]);
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [routeResult, setRouteResult] = useState(null);
  const [currentBuiltRoute, setCurrentBuiltRoute] = useState(null);
  const [lastCalculation, setLastCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch current graph from backend
  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch('/api/graph');
      if (!res.ok) throw new Error('Failed to fetch road network.');
      const data = await res.json();
      setNodes(data.nodes || []);
      setRoads(data.roads || []);
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server. Make sure Python FastAPI is running.');
    }
  }, []);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Recalculate route if startNode and endNode are valid
  const calculateRoute = useCallback(async (start, end) => {
    if (!start || !end || start === end) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/shortest-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_node: start, end_node: end })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Failed to calculate shortest path.');
      }

      setRouteResult(data);
      if (data.found) {
        setLastCalculation(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add road handler
  const handleAddRoad = async (start, end, travelTime) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/roads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_node: start,
          end_node: end,
          travel_time: travelTime
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to add road.');
      }

      setNodes(data.graph.nodes);
      setRoads(data.graph.roads);
      setSuccessMessage(data.data.message);

      // Auto-set start/end if empty
      if (!startNode) setStartNode(start);
      if (!endNode && end !== startNode) setEndNode(end);

      // Dynamic recalculation if start & end are currently selected
      const curStart = startNode || start;
      const curEnd = endNode || end;
      if (curStart && curEnd && curStart !== curEnd) {
        calculateRoute(curStart, curEnd);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update road handler
  const handleUpdateRoad = async (roadId, newTravelTime) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch(`/api/roads/${roadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travel_time: newTravelTime })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update road.');
      }

      setNodes(data.graph.nodes);
      setRoads(data.graph.roads);
      setSuccessMessage(`Updated road travel time to ${newTravelTime} mins.`);

      // Dynamic recalculation: re-run Dijkstra
      if (startNode && endNode && startNode !== endNode) {
        calculateRoute(startNode, endNode);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete road handler
  const handleDeleteRoad = async (roadId) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch(`/api/roads/${roadId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to delete road.');
      }

      setNodes(data.graph.nodes);
      setRoads(data.graph.roads);
      setSuccessMessage('Road deleted successfully.');

      if (startNode && endNode && startNode !== endNode) {
        calculateRoute(startNode, endNode);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear entire graph handler
  const handleClearGraph = async () => {
    if (!window.confirm('Are you sure you want to clear all roads and locations from the graph?')) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/graph/clear', {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to clear graph.');

      setNodes([]);
      setRoads([]);
      setRouteResult(null);
      setLastCalculation(null);
      setStartNode('');
      setEndNode('');
      setSuccessMessage('Graph cleared successfully. You can now build a new road network.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load sample dataset handler
  const handleLoadSample = async (presetName) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/graph/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: presetName })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load sample dataset.');

      setNodes(data.graph.nodes);
      setRoads(data.graph.roads);
      setSuccessMessage(data.message);

      // Default start/end for sample
      if (presetName === 'simple_demo') {
        setStartNode('A');
        setEndNode('B');
        calculateRoute('A', 'B');
      } else if (data.graph.nodes.length >= 2) {
        setStartNode(data.graph.nodes[0]);
        setEndNode(data.graph.nodes[data.graph.nodes.length - 1]);
        calculateRoute(data.graph.nodes[0], data.graph.nodes[data.graph.nodes.length - 1]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear notifications after 5s
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nodeCount={nodes.length}
        roadCount={roads.length}
      />

      {/* Main Content View */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          nodes={nodes}
          roads={roads}
          onClearGraph={handleClearGraph}
          onLoadSample={handleLoadSample}
        />

        <main className="content-container">
          {activeTab === 'dashboard' && (
            <DashboardView
              nodes={nodes}
              roads={roads}
              startNode={startNode}
              setStartNode={setStartNode}
              endNode={endNode}
              setEndNode={setEndNode}
              onCalculateRoute={calculateRoute}
              routeResult={routeResult}
              setActiveTab={setActiveTab}
              onLoadSample={handleLoadSample}
              currentBuiltRoute={currentBuiltRoute}
            />
          )}

          {activeTab === 'build-route' && (
            <BuildRouteView
              nodes={nodes}
              roads={roads}
              onAddRoad={handleAddRoad}
              onUpdateRoad={handleUpdateRoad}
              onDeleteRoad={handleDeleteRoad}
              onLoadSample={handleLoadSample}
              loading={loading}
              error={error}
              successMessage={successMessage}
              currentBuiltRoute={currentBuiltRoute}
              onRouteCalculated={(route) => setCurrentBuiltRoute(route)}
              onReset={() => setCurrentBuiltRoute(null)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'shortest-route' && (
            <ShortestRouteView
              nodes={nodes}
              roads={roads}
              startNode={startNode}
              setStartNode={setStartNode}
              endNode={endNode}
              setEndNode={setEndNode}
              onCalculateRoute={calculateRoute}
              routeResult={routeResult}
              loading={loading}
              currentBuiltRoute={currentBuiltRoute}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'visualizer' && (
            <VisualizerView
              nodes={nodes}
              roads={roads}
              startNode={startNode}
              setStartNode={setStartNode}
              endNode={endNode}
              setEndNode={setEndNode}
              currentBuiltRoute={currentBuiltRoute}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              nodes={nodes}
              roads={roads}
              lastCalculation={lastCalculation}
              currentBuiltRoute={currentBuiltRoute}
            />
          )}

          {activeTab === 'about' && (
            <AboutView />
          )}
        </main>
      </div>
    </div>
  );
}
