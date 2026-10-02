from database import init_db, add_road, get_all_roads, get_unique_nodes, clear_all_roads
from dijkstra import (
    dijkstra_shortest_path, 
    dijkstra_visualizer_trace, 
    optimize_multi_delivery_route, 
    DEFAULT_MINIMAP_ROADS
)

init_db()
clear_all_roads()

# Example from user prompt:
# A -> B = 10 mins
# A -> C = 2 mins
# C -> B = 3 mins
add_road('A', 'B', 10.0)
add_road('A', 'C', 2.0)
add_road('C', 'B', 3.0)

roads = get_all_roads()
print(f"Nodes: {get_unique_nodes()}")
print(f"Total Roads: {len(roads)}")

res1 = dijkstra_shortest_path(roads, 'A', 'B')
print(f"Test 1 (Expected A -> C -> B, 5.0 mins):")
print(f"  Path: {res1['path']}")
print(f"  Travel time: {res1['total_travel_time']} mins")
print(f"  Roads used: {res1['roads_used']}")

# Now user changes C -> B to 20 mins
add_road('C', 'B', 20.0) # will update existing road
roads2 = get_all_roads()
res2 = dijkstra_shortest_path(roads2, 'A', 'B')
print(f"\nTest 2 after updating C -> B to 20 mins (Expected A -> B, 10.0 mins):")
print(f"  Path: {res2['path']}")
print(f"  Travel time: {res2['total_travel_time']} mins")
print(f"  Roads used: {res2['roads_used']}")

# Test Visualizer
trace = dijkstra_visualizer_trace(roads2, 'A', 'B')
print(f"\nVisualizer total steps: {len(trace['steps'])}")
for s in trace['steps']:
    print(f"  Step {s['step_id']}: [{s['action']}] {s['explanation']}")

# Test Multi-Delivery Route Optimization on Artificial Mini-Map
print("\n--- Testing Multi-Delivery Route Optimization Layer ---")
multi_res = optimize_multi_delivery_route(DEFAULT_MINIMAP_ROADS, 'START', ['C', 'A', 'H'])
print(f"Multi-delivery success: {multi_res['success']}")
print(f"Optimized visiting sequence: {multi_res['visiting_sequence']}")
print(f"Total fixed travel time: {multi_res['total_travel_time']} mins")
print(f"Full turn-by-turn path: {multi_res['full_turn_by_turn_path']}")
print(f"Time saved vs naive: {multi_res['time_saved_minutes']} mins ({multi_res['efficiency_improvement_percent']}%)")
assert multi_res['success'] is True
assert multi_res['visiting_sequence'] == ['START', 'A', 'C', 'H']
assert multi_res['total_travel_time'] == 35.0
print("All multi-delivery route tests passed successfully!")

# Restore unified road network in database
init_db(force_seed=True)

