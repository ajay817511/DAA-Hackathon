/**
 * Multi-Location Delivery Route Optimizer
 * Built on top of Dijkstra's Algorithm for the Artificial Mini-Map
 * Supports multipurpose delivery: parcels, food, documents, packages, and freight.
 */

export const FIXED_MINIMAP_NODES = {
  START: { id: 'START', label: 'Start Hub', type: 'start', x: 90, y: 240, address: 'Central Dispatch Depot' },
  A: { id: 'A', label: 'A', type: 'customer', x: 220, y: 120, address: 'Delivery Zone A' },
  B: { id: 'B', label: 'B', type: 'customer', x: 210, y: 360, address: 'Delivery Zone B' },
  C: { id: 'C', label: 'C', type: 'customer', x: 350, y: 110, address: 'Delivery Zone C' },
  D: { id: 'D', label: 'D', type: 'customer', x: 370, y: 330, address: 'Delivery Zone D' },
  E: { id: 'E', label: 'E', type: 'customer', x: 490, y: 150, address: 'Delivery Zone E' },
  F: { id: 'F', label: 'F', type: 'customer', x: 550, y: 340, address: 'Delivery Zone F' },
  G: { id: 'G', label: 'G', type: 'customer', x: 650, y: 170, address: 'Delivery Zone G' },
  H: { id: 'H', label: 'H', type: 'customer', x: 750, y: 260, address: 'Delivery Zone H' },
};

// Fixed road network with realistic urban travel times (5–14 min range)
export const FIXED_MINIMAP_ROADS = [
  { id: 1, start_node: 'START', end_node: 'A', travel_time: 8.0 },
  { id: 2, start_node: 'START', end_node: 'B', travel_time: 11.0 },
  { id: 3, start_node: 'A', end_node: 'B', travel_time: 9.0 },
  { id: 4, start_node: 'A', end_node: 'C', travel_time: 6.0 },
  { id: 5, start_node: 'B', end_node: 'D', travel_time: 8.0 },
  { id: 6, start_node: 'C', end_node: 'D', travel_time: 14.0 },
  { id: 7, start_node: 'C', end_node: 'E', travel_time: 8.0 },
  { id: 8, start_node: 'D', end_node: 'E', travel_time: 6.0 },
  { id: 9, start_node: 'D', end_node: 'F', travel_time: 10.0 },
  { id: 10, start_node: 'E', end_node: 'G', travel_time: 8.0 },
  { id: 11, start_node: 'F', end_node: 'G', travel_time: 7.0 },
  { id: 12, start_node: 'F', end_node: 'H', travel_time: 9.0 },
  { id: 13, start_node: 'G', end_node: 'H', travel_time: 5.0 },
  { id: 14, start_node: 'B', end_node: 'C', travel_time: 12.0 },
  { id: 15, start_node: 'E', end_node: 'F', travel_time: 11.0 },
];

/**
 * Builds adjacency list representation from undirected road segments
 */
export function buildAdjacencyList(roads) {
  const adj = {};
  const allNodes = new Set();

  for (const road of roads) {
    const u = String(road.start_node).trim().toUpperCase();
    const v = String(road.end_node).trim().toUpperCase();
    const w = parseFloat(road.travel_time);
    const roadId = road.id || 0;

    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];

    adj[u].push({ neighbor: v, travel_time: w, road_id: roadId });
    adj[v].push({ neighbor: u, travel_time: w, road_id: roadId });

    allNodes.add(u);
    allNodes.add(v);
  }

  return { adj, allNodes };
}

/**
 * Pure Dijkstra's Shortest Path algorithm with priority queue
 */
export function dijkstraShortestPath(roads, startNode, endNode) {
  const start = String(startNode).trim().toUpperCase();
  const end = String(endNode).trim().toUpperCase();
  const { adj, allNodes } = buildAdjacencyList(roads);

  if (!allNodes.has(start) || !allNodes.has(end)) {
    return {
      found: false,
      error: `Start or destination location not found in road network.`,
      path: [],
      total_travel_time: null,
    };
  }

  if (start === end) {
    return {
      found: true,
      start,
      destination: end,
      path: [start],
      total_travel_time: 0.0,
      path_edges: [],
    };
  }

  const distances = {};
  const previous = {};

  for (const node of allNodes) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;

  // Min-priority queue array
  const pq = [{ node: start, dist: 0 }];
  const visited = new Set();

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node: curr, dist: currDist } = pq.shift();

    if (visited.has(curr)) continue;
    visited.add(curr);

    if (curr === end) break;

    const neighbors = adj[curr] || [];
    for (const { neighbor, travel_time } of neighbors) {
      if (visited.has(neighbor)) continue;

      const newDist = currDist + travel_time;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor] = curr;
        pq.push({ node: neighbor, dist: newDist });
      }
    }
  }

  if (distances[end] === Infinity) {
    return {
      found: false,
      start,
      destination: end,
      error: `No route exists between ${start} and ${end}.`,
      path: [],
      total_travel_time: null,
    };
  }

  // Reconstruct path
  const path = [];
  let curr = end;
  while (curr !== null) {
    path.push(curr);
    curr = previous[curr];
  }
  path.reverse();

  return {
    found: true,
    start,
    destination: end,
    path,
    total_travel_time: Math.round(distances[end] * 100) / 100,
  };
}

/**
 * Generate all permutations of an array
 */
function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = getPermutations(remaining);
    for (const p of perms) {
      result.push([current, ...p]);
    }
  }
  return result;
}

/**
 * Multi-Location Route Optimization Layer
 * Calculates optimal visiting order from Start Hub to all selected delivery locations
 */
export function optimizeMultiDeliveryRouteLocal(roads, startNode, deliveryNodes) {
  const startTime = performance.now();
  const start = String(startNode).trim().toUpperCase();

  // Deduplicate and filter out start
  const uniqueCustomers = [
    ...new Set(
      deliveryNodes
        .map((n) => String(n).trim().toUpperCase())
        .filter((n) => n && n !== start)
    ),
  ];

  if (uniqueCustomers.length === 0) {
    return {
      success: false,
      error: 'Please select at least one delivery location on the mini-map.',
      start_node: start,
      optimized_order: [],
      visiting_sequence: [start],
      total_travel_time: 0.0,
      total_distance_km: 0.0,
      estimated_cost: 0.0,
      naive_travel_time: 0.0,
      time_saved_minutes: 0.0,
      efficiency_improvement_percent: 0.0,
      legs: [],
      full_turn_by_turn_path: [start],
      active_edges: [],
      execution_time_ms: 0,
    };
  }

  // Precompute pairwise Dijkstra shortest paths
  const allTargets = [start, ...uniqueCustomers];
  const pairCache = {};
  let dijkstraCalls = 0;

  for (const u of allTargets) {
    for (const v of allTargets) {
      if (u !== v && !pairCache[`${u}->${v}`]) {
        const res = dijkstraShortestPath(roads, u, v);
        dijkstraCalls++;
        if (!res.found) {
          return {
            success: false,
            error: `Location '${v}' is unreachable from '${u}'.`,
            start_node: start,
          };
        }
        pairCache[`${u}->${v}`] = res;
        if (!pairCache[`${v}->${u}`]) {
          pairCache[`${v}->${u}`] = {
            found: true,
            path: [...res.path].reverse(),
            total_travel_time: res.total_travel_time,
          };
        }
      }
    }
  }

  // Calculate naive click order travel time for comparison
  let naiveTime = pairCache[`${start}->${uniqueCustomers[0]}`].total_travel_time;
  for (let i = 0; i < uniqueCustomers.length - 1; i++) {
    naiveTime += pairCache[`${uniqueCustomers[i]}->${uniqueCustomers[i + 1]}`].total_travel_time;
  }

  // Find optimal permutation minimizing total delivery travel time
  const perms = getPermutations(uniqueCustomers);
  let bestOrder = null;
  let bestTime = Infinity;

  for (const perm of perms) {
    let currentCost = pairCache[`${start}->${perm[0]}`].total_travel_time;
    let valid = true;

    for (let i = 0; i < perm.length - 1; i++) {
      const legDist = pairCache[`${perm[i]}->${perm[i + 1]}`].total_travel_time;
      currentCost += legDist;
      if (currentCost >= bestTime) {
        valid = false;
        break;
      }
    }

    if (valid && currentCost < bestTime) {
      bestTime = currentCost;
      bestOrder = perm;
    }
  }

  // Assemble legs & turn-by-turn road path
  const legs = [];
  const fullTurnByTurn = [start];
  const activeEdges = [];
  let prevNode = start;

  for (let idx = 0; idx < bestOrder.length; idx++) {
    const nextNode = bestOrder[idx];
    const legInfo = pairCache[`${prevNode}->${nextNode}`];
    legs.push({
      stop_number: idx + 1,
      from_node: prevNode,
      to_node: nextNode,
      travel_time: legInfo.total_travel_time,
      path: legInfo.path,
      path_string: legInfo.path.join(' -> '),
    });

    for (let i = 0; i < legInfo.path.length - 1; i++) {
      activeEdges.push([legInfo.path[i], legInfo.path[i + 1]]);
    }

    fullTurnByTurn.push(...legInfo.path.slice(1));
    prevNode = nextNode;
  }

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
  const timeSaved = Math.round(Math.max(0, naiveTime - bestTime) * 100) / 100;
  const efficiencyPct = naiveTime > 0 ? Math.round((timeSaved / naiveTime) * 1000) / 10 : 0.0;
  const distKm = Math.round(bestTime * 0.75 * 10) / 10;
  const estCost = Math.round((12.0 + bestTime * 1.5) * 100) / 100;

  return {
    success: true,
    start_node: start,
    customer_count: uniqueCustomers.length,
    selected_nodes: uniqueCustomers,
    optimized_order: bestOrder,
    visiting_sequence: [start, ...bestOrder],
    total_travel_time: Math.round(bestTime * 100) / 100,
    total_distance_km: distKm,
    estimated_cost: estCost,
    naive_travel_time: Math.round(naiveTime * 100) / 100,
    time_saved_minutes: timeSaved,
    efficiency_improvement_percent: efficiencyPct,
    legs,
    full_turn_by_turn_path: fullTurnByTurn,
    full_path_string: fullTurnByTurn.join(' -> '),
    active_edges: activeEdges,
    dijkstra_calls: dijkstraCalls,
    permutations_evaluated: perms.length,
    execution_time_ms: elapsedMs,
  };
}

/**
 * Fetch multi-delivery route from backend API with fallback to local optimizer
 */
export async function calculateMultiDeliveryRoute(deliveryNodes, startNode = 'START', customRoads = null) {
  const roadsToUse = customRoads || FIXED_MINIMAP_ROADS;
  try {
    const res = await fetch('/api/multi-delivery-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_node: startNode,
        delivery_nodes: deliveryNodes,
        roads: roadsToUse,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend multi-delivery route endpoint error, falling back to local optimizer:', err);
  }

  // Fallback to local computation
  return optimizeMultiDeliveryRouteLocal(roadsToUse, startNode, deliveryNodes);
}
