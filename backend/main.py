from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os

from database import (
    init_db,
    get_all_roads,
    get_unique_nodes,
    add_road,
    update_road,
    delete_road,
    clear_all_roads,
    load_sample_dataset
)
from dijkstra import (
    dijkstra_shortest_path,
    dijkstra_visualizer_trace,
    optimize_multi_delivery_route,
    DEFAULT_MINIMAP_ROADS
)

# Initialize database on startup
init_db()

app = FastAPI(
    title="Smart Delivery Route API",
    description="Backend for DAA Hackathon - Food Delivery Shortest Path Graph Application",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class RoadCreateRequest(BaseModel):
    start_node: str = Field(..., description="Starting location name/identifier (e.g., 'A', 'Kitchen A')")
    end_node: str = Field(..., description="Ending location name/identifier (e.g., 'B', 'Sector 4')")
    travel_time: float = Field(..., gt=0, description="Travel time in minutes (must be > 0)")

class RoadUpdateRequest(BaseModel):
    travel_time: float = Field(..., gt=0, description="New travel time in minutes")

class RouteCalculationRequest(BaseModel):
    start_node: str = Field(..., description="Starting location")
    end_node: str = Field(..., description="Destination location")

class SamplePresetRequest(BaseModel):
    preset: str = Field("food_delivery_hub", description="Preset name: 'food_delivery_hub', 'simple_demo', 'complex_city'")

class MultiDeliveryRequest(BaseModel):
    start_node: str = Field("START", description="Starting location (default 'START' Dispatch Hub)")
    delivery_nodes: List[str] = Field(..., description="List of delivery location nodes (e.g., ['A', 'D', 'F', 'H'])")
    roads: Optional[List[Dict[str, Any]]] = Field(None, description="Optional custom road network to use")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Smart Delivery Route API"}


@app.get("/api/graph")
def get_graph():
    roads = get_all_roads()
    nodes = get_unique_nodes()
    return {
        "nodes": nodes,
        "roads": roads,
        "total_nodes": len(nodes),
        "total_roads": len(roads)
    }


@app.post("/api/roads", status_code=status.HTTP_201_CREATED)
def create_or_update_road(req: RoadCreateRequest):
    try:
        result = add_road(req.start_node, req.end_node, req.travel_time)
        return {
            "success": True,
            "data": result,
            "graph": {
                "nodes": get_unique_nodes(),
                "roads": get_all_roads()
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.put("/api/roads/{road_id}")
def edit_road(road_id: int, req: RoadUpdateRequest):
    try:
        result = update_road(road_id, req.travel_time)
        if not result:
            raise HTTPException(status_code=404, detail=f"Road with ID {road_id} not found.")
        return {
            "success": True,
            "data": result,
            "graph": {
                "nodes": get_unique_nodes(),
                "roads": get_all_roads()
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@app.delete("/api/roads/{road_id}")
def remove_road(road_id: int):
    deleted = delete_road(road_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Road with ID {road_id} not found.")
    return {
        "success": True,
        "message": f"Road {road_id} deleted successfully.",
        "graph": {
            "nodes": get_unique_nodes(),
            "roads": get_all_roads()
        }
    }


@app.delete("/api/graph/clear")
def clear_graph():
    count = clear_all_roads()
    return {
        "success": True,
        "message": f"Cleared {count} roads from graph.",
        "graph": {
            "nodes": [],
            "roads": []
        }
    }


@app.post("/api/graph/sample")
def load_sample(req: SamplePresetRequest):
    roads = load_sample_dataset(req.preset)
    nodes = get_unique_nodes()
    return {
        "success": True,
        "message": f"Loaded preset '{req.preset}' with {len(nodes)} nodes and {len(roads)} roads.",
        "graph": {
            "nodes": nodes,
            "roads": roads
        }
    }


@app.post("/api/shortest-path")
def calculate_shortest_route(req: RouteCalculationRequest):
    roads = get_all_roads()
    if not roads:
        raise HTTPException(status_code=400, detail="The road network is empty. Please add some roads first.")
    
    result = dijkstra_shortest_path(roads, req.start_node, req.end_node)
    return result


@app.post("/api/visualize")
def get_visualizer_steps(req: RouteCalculationRequest):
    roads = get_all_roads()
    if not roads:
        raise HTTPException(status_code=400, detail="The road network is empty. Please add some roads first.")
    
    result = dijkstra_visualizer_trace(roads, req.start_node, req.end_node)
    return result


@app.get("/api/minimap-network")
def get_minimap_network():
    """Returns the artificial mini-map topology with fixed nodes and travel times."""
    return {
        "start_node": "START",
        "customer_nodes": ["A", "B", "C", "D", "E", "F", "G", "H"],
        "roads": DEFAULT_MINIMAP_ROADS,
        "total_nodes": 9,
        "total_roads": len(DEFAULT_MINIMAP_ROADS)
    }


@app.post("/api/multi-delivery-route")
def calculate_multi_delivery_route(req: MultiDeliveryRequest):
    """
    Multi-customer route optimization layer built on top of Dijkstra's algorithm.
    Calculates the most efficient delivery order from start_node to all delivery_nodes
    using the fixed travel times.
    """
    roads_to_use = req.roads if (req.roads and len(req.roads) > 0) else DEFAULT_MINIMAP_ROADS
    result = optimize_multi_delivery_route(roads_to_use, req.start_node, req.delivery_nodes)
    if not result.get("success", False) and "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.get("/api/stats")
def get_graph_stats():
    roads = get_all_roads()
    nodes = get_unique_nodes()
    v = len(nodes)
    e = len(roads)
    
    # Calculate density for undirected graph: 2*E / (V * (V - 1))
    density = 0.0
    if v > 1:
        density = round((2.0 * e) / (v * (v - 1)), 4)
    
    avg_degree = round((2.0 * e) / v, 2) if v > 0 else 0.0

    return {
        "nodes_count": v,
        "roads_count": e,
        "density": density,
        "average_degree": avg_degree,
        "time_complexity": "O((V + E) log V)",
        "space_complexity": "O(V + E)",
        "min_heap_used": True,
        "nodes_list": nodes
    }
