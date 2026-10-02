import heapq
import time
from collections import defaultdict
from typing import List, Dict, Any, Tuple, Optional, Set

def build_adjacency_list(roads: List[Dict[str, Any]]) -> Tuple[Dict[str, List[Tuple[str, float, int]]], Set[str]]:
    """
    Builds an undirected adjacency list from the road list.
    Returns (adj, all_nodes)
    adj maps node -> list of (neighbor_node, travel_time, road_id)
    """
    adj = defaultdict(list)
    all_nodes = set()

    for road in roads:
        u = str(road["start_node"]).strip().upper()
        v = str(road["end_node"]).strip().upper()
        w = float(road["travel_time"])
        road_id = road.get("id", 0)

        adj[u].append((v, w, road_id))
        adj[v].append((u, w, road_id))
        all_nodes.add(u)
        all_nodes.add(v)

    return adj, all_nodes

def dijkstra_shortest_path(
    roads: List[Dict[str, Any]], 
    start_node: str, 
    end_node: str
) -> Dict[str, Any]:
    """
    Calculates the shortest travel time and path between start_node and end_node using
    Dijkstra's Algorithm implemented from scratch with a min-heap priority queue.
    """
    start_time_perf = time.perf_counter()

    start = start_node.strip().upper()
    end = end_node.strip().upper()

    adj, all_nodes = build_adjacency_list(roads)

    if start not in all_nodes:
        return {
            "found": False,
            "error": f"Starting location '{start}' does not exist in the graph.",
            "path": [],
            "total_travel_time": None,
            "roads_used": 0,
            "execution_time_ms": 0.0,
            "nodes_processed": 0,
            "edges_checked": 0,
            "distances": {},
            "path_edges": []
        }

    if end not in all_nodes:
        return {
            "found": False,
            "error": f"Ending location '{end}' does not exist in the graph.",
            "path": [],
            "total_travel_time": None,
            "roads_used": 0,
            "execution_time_ms": 0.0,
            "nodes_processed": 0,
            "edges_checked": 0,
            "distances": {},
            "path_edges": []
        }

    # Special case: Start equals End
    if start == end:
        return {
            "found": True,
            "start": start,
            "destination": end,
            "path": [start],
            "total_travel_time": 0.0,
            "roads_used": 0,
            "execution_time_ms": 0.01,
            "nodes_processed": 1,
            "edges_checked": 0,
            "distances": {start: 0.0},
            "path_edges": []
        }

    # Distance table initialized to infinity
    distances: Dict[str, float] = {node: float("inf") for node in all_nodes}
    distances[start] = 0.0

    # Previous pointer table for path reconstruction
    previous: Dict[str, Optional[str]] = {node: None for node in all_nodes}
    previous_edge_id: Dict[str, Optional[int]] = {node: None for node in all_nodes}

    # Priority queue storing (distance, node)
    # Python's heapq is a min-heap
    pq: List[Tuple[float, str]] = [(0.0, start)]

    visited: Set[str] = set()
    nodes_processed = 0
    edges_checked = 0

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        # If we pulled an outdated distance entry, skip it
        if current_distance > distances[current_node]:
            continue

        if current_node in visited:
            continue

        visited.add(current_node)
        nodes_processed += 1

        # Early exit if we reached the destination node
        if current_node == end:
            break

        # Check all outgoing edges (roads connected to current_node)
        for neighbor, travel_time, road_id in adj[current_node]:
            edges_checked += 1
            if neighbor in visited:
                continue

            new_distance = current_distance + travel_time

            # Relaxation step
            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous[neighbor] = current_node
                previous_edge_id[neighbor] = road_id
                heapq.heappush(pq, (new_distance, neighbor))

    # Calculate execution time in milliseconds
    elapsed_ms = (time.perf_counter() - start_time_perf) * 1000

    # Check if destination is reachable
    if distances[end] == float("inf"):
        return {
            "found": False,
            "start": start,
            "destination": end,
            "error": f"No road connection exists between location '{start}' and '{end}'.",
            "path": [],
            "total_travel_time": None,
            "roads_used": 0,
            "execution_time_ms": round(elapsed_ms, 4),
            "nodes_processed": nodes_processed,
            "edges_checked": edges_checked,
            "distances": {k: (v if v != float("inf") else "∞") for k, v in distances.items()},
            "path_edges": []
        }

    # Reconstruct the shortest path
    path = []
    path_edges = []
    curr = end
    while curr is not None:
        path.append(curr)
        edge_id = previous_edge_id[curr]
        if edge_id is not None:
            path_edges.append(edge_id)
        curr = previous[curr]

    path.reverse()
    path_edges.reverse()

    # Format distance dictionary for response
    formatted_distances = {
        node: (round(dist, 2) if dist != float("inf") else "inf")
        for node, dist in distances.items()
    }

    # Create road segments detail
    road_segments = []
    for i in range(len(path) - 1):
        u = path[i]
        v = path[i + 1]
        # find matching road weight
        weight = None
        for nbr, w, r_id in adj[u]:
            if nbr == v:
                weight = w
                break
        road_segments.append({
            "from": u,
            "to": v,
            "travel_time": weight
        })

    return {
        "found": True,
        "start": start,
        "destination": end,
        "path": path,
        "path_string": " -> ".join(path),
        "total_travel_time": round(distances[end], 2),
        "roads_used": len(path) - 1,
        "road_segments": road_segments,
        "path_edges": path_edges,
        "nodes_processed": nodes_processed,
        "edges_checked": edges_checked,
        "execution_time_ms": round(elapsed_ms, 4),
        "distances": formatted_distances,
        "all_nodes_count": len(all_nodes),
        "total_roads_count": len(roads)
    }

def dijkstra_visualizer_trace(
    roads: List[Dict[str, Any]], 
    start_node: str, 
    end_node: str
) -> Dict[str, Any]:
    """
    Executes Dijkstra's algorithm step-by-step and records every discrete algorithmic action.
    Used for the interactive Dijkstra Visualizer in the frontend.
    """
    start = start_node.strip().upper()
    end = end_node.strip().upper()

    adj, all_nodes = build_adjacency_list(roads)
    sorted_all_nodes = sorted(list(all_nodes))

    if start not in all_nodes or end not in all_nodes:
        return {
            "success": False,
            "error": "Start or End node not found in graph.",
            "steps": []
        }

    steps = []
    step_count = 0

    # Distances & previous tracking
    distances = {node: float("inf") for node in sorted_all_nodes}
    distances[start] = 0.0
    previous = {node: None for node in sorted_all_nodes}
    visited = set()

    # PQ storing (distance, node)
    pq = [(0.0, start)]

    def get_snapshot(action_type: str, explanation: str, curr_node: Optional[str] = None, 
                     neighbor_node: Optional[str] = None, active_edge_id: Optional[int] = None, 
                     updated_node: Optional[str] = None, is_final: bool = False, final_path: List[str] = None):
        nonlocal step_count
        step_count += 1
        return {
            "step_id": step_count,
            "action": action_type,
            "explanation": explanation,
            "current_node": curr_node,
            "neighbor_node": neighbor_node,
            "active_edge_id": active_edge_id,
            "updated_node": updated_node,
            "visited_nodes": list(visited),
            "pq_snapshot": [{"distance": d, "node": n} for d, n in sorted(pq)],
            "distances": {k: (round(v, 2) if v != float("inf") else "inf") for k, v in distances.items()},
            "previous": {k: v for k, v in previous.items()},
            "is_final": is_final,
            "final_path": final_path or []
        }

    # Step 1: Initialization
    steps.append(get_snapshot(
        action_type="INITIALIZE",
        explanation=f"Initialized distances: set distance[{start}] = 0 and all other {len(sorted_all_nodes) - 1} node(s) to inf. Added ({start}, 0 mins) to Priority Queue.",
        curr_node=start
    ))

    reached_destination = False

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        if current_distance > distances[current_node]:
            continue

        if current_node in visited:
            continue

        # Mark node as visited / finalized
        visited.add(current_node)

        steps.append(get_snapshot(
            action_type="VISITING_NODE",
            explanation=f"Extracted minimum distance node '{current_node}' from Priority Queue with shortest known travel time = {current_distance} mins. Marked '{current_node}' as VISITED.",
            curr_node=current_node
        ))

        if current_node == end:
            reached_destination = True
            steps.append(get_snapshot(
                action_type="REACHED_DESTINATION",
                explanation=f"Destination node '{end}' reached with minimum travel time of {current_distance} mins!",
                curr_node=current_node
            ))
            break

        # Check all incident roads
        neighbors = adj[current_node]
        for neighbor, travel_time, road_id in neighbors:
            if neighbor in visited:
                steps.append(get_snapshot(
                    action_type="EDGE_ALREADY_VISITED",
                    explanation=f"Checking road {current_node} <-> {neighbor} ({travel_time} mins): Neighbor '{neighbor}' is already visited/finalized. Skipped.",
                    curr_node=current_node,
                    neighbor_node=neighbor,
                    active_edge_id=road_id
                ))
                continue

            new_distance = current_distance + travel_time
            old_distance = distances[neighbor]

            if new_distance < old_distance:
                distances[neighbor] = new_distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (new_distance, neighbor))

                old_str = "inf" if old_distance == float("inf") else f"{old_distance} mins"
                steps.append(get_snapshot(
                    action_type="RELAXATION_SUCCESS",
                    explanation=f"RELAXATION on road {current_node} <-> {neighbor}: Found shorter travel time to '{neighbor}'! ({current_distance} + {travel_time} = {new_distance} mins < {old_str}). Updated distance[{neighbor}] = {new_distance} mins, previous[{neighbor}] = '{current_node}'.",
                    curr_node=current_node,
                    neighbor_node=neighbor,
                    active_edge_id=road_id,
                    updated_node=neighbor
                ))
            else:
                steps.append(get_snapshot(
                    action_type="RELAXATION_NO_CHANGE",
                    explanation=f"Checking road {current_node} <-> {neighbor} ({travel_time} mins): Candidate travel time ({current_distance} + {travel_time} = {new_distance} mins) is NOT shorter than existing best time ({old_distance} mins). No update made.",
                    curr_node=current_node,
                    neighbor_node=neighbor,
                    active_edge_id=road_id
                ))

    # Final reconstruction step
    final_path = []
    if reached_destination or distances[end] != float("inf"):
        curr = end
        while curr is not None:
            final_path.append(curr)
            curr = previous[curr]
        final_path.reverse()

        steps.append(get_snapshot(
            action_type="COMPLETED",
            explanation=f"Dijkstra execution finished! Optimal shortest route found: {' -> '.join(final_path)} with total travel time of {distances[end]} mins.",
            curr_node=end,
            is_final=True,
            final_path=final_path
        ))
    else:
        steps.append(get_snapshot(
            action_type="UNREACHABLE",
            explanation=f"Dijkstra completed: No path exists between '{start}' and '{end}'.",
            curr_node=start,
            is_final=True,
            final_path=[]
        ))

    return {
        "success": True,
        "start": start,
        "destination": end,
        "total_steps": len(steps),
        "steps": steps,
        "final_path": final_path,
        "total_travel_time": distances[end] if distances[end] != float("inf") else None
    }

# Standard multipurpose delivery road network (nodes: START, A, B, C, D, E, F, G, H)
# Travel times scaled to realistic urban delivery intervals (5-14 mins)
DEFAULT_MINIMAP_ROADS: List[Dict[str, Any]] = [
    {"id": 1, "start_node": "START", "end_node": "A", "travel_time": 8.0},
    {"id": 2, "start_node": "START", "end_node": "B", "travel_time": 11.0},
    {"id": 3, "start_node": "A", "end_node": "B", "travel_time": 9.0},
    {"id": 4, "start_node": "A", "end_node": "C", "travel_time": 6.0},
    {"id": 5, "start_node": "B", "end_node": "D", "travel_time": 8.0},
    {"id": 6, "start_node": "C", "end_node": "D", "travel_time": 14.0},
    {"id": 7, "start_node": "C", "end_node": "E", "travel_time": 8.0},
    {"id": 8, "start_node": "D", "end_node": "E", "travel_time": 6.0},
    {"id": 9, "start_node": "D", "end_node": "F", "travel_time": 10.0},
    {"id": 10, "start_node": "E", "end_node": "G", "travel_time": 8.0},
    {"id": 11, "start_node": "F", "end_node": "G", "travel_time": 7.0},
    {"id": 12, "start_node": "F", "end_node": "H", "travel_time": 9.0},
    {"id": 13, "start_node": "G", "end_node": "H", "travel_time": 5.0},
    {"id": 14, "start_node": "B", "end_node": "C", "travel_time": 12.0},
    {"id": 15, "start_node": "E", "end_node": "F", "travel_time": 11.0},
]

def optimize_multi_delivery_route(
    roads: List[Dict[str, Any]], 
    start_node: str, 
    delivery_nodes: List[str]
) -> Dict[str, Any]:
    """
    Multi-location route optimization layer built on top of Dijkstra's algorithm.
    Finds the most efficient delivery order starting from start_node (Dispatch Hub)
    and visiting all unique delivery location nodes in delivery_nodes.
    Uses existing Dijkstra algorithm for pairwise shortest paths and exact permutation search.
    """
    import itertools

    start_perf = time.perf_counter()
    start = str(start_node).strip().upper()

    # Deduplicate customer list while preserving selection order and excluding start node
    customers = [str(c).strip().upper() for c in delivery_nodes if str(c).strip().upper() != start]
    unique_customers = list(dict.fromkeys(customers))

    if not unique_customers:
        return {
            "success": False,
            "error": "No delivery locations selected. Please click at least one location node on the mini-map.",
            "start_node": start,
            "optimized_order": [],
            "visiting_sequence": [start],
            "total_travel_time": 0.0,
            "total_distance_km": 0.0,
            "estimated_cost": 0.0,
            "naive_travel_time": 0.0,
            "time_saved_minutes": 0.0,
            "efficiency_improvement_percent": 0.0,
            "legs": [],
            "full_turn_by_turn_path": [start],
            "active_edges": [],
            "execution_time_ms": 0.0
        }

    # Precompute pairwise shortest paths using existing Dijkstra algorithm
    all_targets = [start] + unique_customers
    pair_results = {}
    dijkstra_calls = 0

    for u in all_targets:
        for v in all_targets:
            if u != v and (u, v) not in pair_results:
                res = dijkstra_shortest_path(roads, u, v)
                dijkstra_calls += 1
                if not res.get("found", False):
                    return {
                        "success": False,
                        "error": f"Delivery location '{v}' is unreachable from '{u}'.",
                        "start_node": start,
                        "optimized_order": [],
                        "visiting_sequence": [],
                        "total_travel_time": None,
                        "legs": []
                    }
                pair_results[(u, v)] = res
                if (v, u) not in pair_results:
                    rev_path = list(reversed(res["path"]))
                    pair_results[(v, u)] = {
                        "found": True,
                        "path": rev_path,
                        "total_travel_time": res["total_travel_time"],
                        "path_edges": list(reversed(res.get("path_edges", [])))
                    }

    # Calculate naive click order travel time for comparison
    naive_time = pair_results[(start, unique_customers[0])]["total_travel_time"]
    for i in range(len(unique_customers) - 1):
        naive_time += pair_results[(unique_customers[i], unique_customers[i + 1])]["total_travel_time"]

    best_order = None
    best_time = float("inf")
    perms_evaluated = 0

    # Exhaustive permutation optimization (instantaneous for k <= 8 customer stops)
    for perm in itertools.permutations(unique_customers):
        perms_evaluated += 1
        current_cost = pair_results[(start, perm[0])]["total_travel_time"]
        for i in range(len(perm) - 1):
            current_cost += pair_results[(perm[i], perm[i + 1])]["total_travel_time"]
            if current_cost >= best_time:
                break
        if current_cost < best_time:
            best_time = current_cost
            best_order = perm

    # Reconstruct leg details and full path
    legs = []
    full_turn_by_turn = [start]
    active_edges = []
    prev_node = start

    for idx, next_node in enumerate(best_order):
        leg_info = pair_results[(prev_node, next_node)]
        leg_path = leg_info["path"]
        legs.append({
            "stop_number": idx + 1,
            "from_node": prev_node,
            "to_node": next_node,
            "travel_time": leg_info["total_travel_time"],
            "path": leg_path,
            "path_string": " -> ".join(leg_path)
        })
        for i in range(len(leg_path) - 1):
            active_edges.append((leg_path[i], leg_path[i + 1]))
        full_turn_by_turn.extend(leg_path[1:])
        prev_node = next_node

    elapsed_ms = (time.perf_counter() - start_perf) * 1000

    time_saved = round(max(0.0, naive_time - best_time), 2)
    efficiency_pct = round((time_saved / naive_time * 100.0), 1) if naive_time > 0 else 0.0
    dist_km = round(best_time * 0.75, 1)
    est_cost = round(12.0 + best_time * 1.5, 2)

    return {
        "success": True,
        "start_node": start,
        "customer_count": len(unique_customers),
        "selected_nodes": unique_customers,
        "optimized_order": list(best_order),
        "visiting_sequence": [start] + list(best_order),
        "total_travel_time": round(best_time, 2),
        "total_distance_km": dist_km,
        "estimated_cost": est_cost,
        "naive_travel_time": round(naive_time, 2),
        "time_saved_minutes": time_saved,
        "efficiency_improvement_percent": efficiency_pct,
        "legs": legs,
        "full_turn_by_turn_path": full_turn_by_turn,
        "full_path_string": " -> ".join(full_turn_by_turn),
        "active_edges": active_edges,
        "dijkstra_calls": dijkstra_calls,
        "permutations_evaluated": perms_evaluated,
        "execution_time_ms": round(elapsed_ms, 3)
    }


