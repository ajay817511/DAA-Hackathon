import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "delivery_routes.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Standard multipurpose delivery road network (nodes: START, A, B, C, D, E, F, G, H)
# Travel times scaled to realistic urban delivery intervals (5-14 mins)
UNIFIED_DELIVERY_ROADS = [
    ("START", "A", 8.0),
    ("START", "B", 11.0),
    ("A", "B", 9.0),
    ("A", "C", 6.0),
    ("B", "D", 8.0),
    ("C", "D", 14.0),
    ("C", "E", 8.0),
    ("D", "E", 6.0),
    ("D", "F", 10.0),
    ("E", "G", 8.0),
    ("F", "G", 7.0),
    ("F", "H", 9.0),
    ("G", "H", 5.0),
    ("B", "C", 12.0),
    ("E", "F", 11.0),
]

def init_db(force_seed: bool = False):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS roads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_node TEXT NOT NULL,
            end_node TEXT NOT NULL,
            travel_time REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("SELECT count(*) as count FROM roads")
    row = cursor.fetchone()
    # Seed default smart delivery network if database is empty or has fewer than 4 legacy records
    if force_seed or row["count"] < 4:
        cursor.execute("DELETE FROM roads")
        for u, v, w in UNIFIED_DELIVERY_ROADS:
            cursor.execute("INSERT INTO roads (start_node, end_node, travel_time) VALUES (?, ?, ?)", (u, v, w))
    conn.commit()
    conn.close()

def get_all_roads() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, start_node, end_node, travel_time, created_at FROM roads ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": row["id"],
            "start_node": row["start_node"],
            "end_node": row["end_node"],
            "travel_time": row["travel_time"],
            "created_at": row["created_at"]
        }
        for row in rows
    ]

def get_unique_nodes() -> List[str]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT start_node AS node FROM roads
        UNION
        SELECT DISTINCT end_node AS node FROM roads
        ORDER BY node ASC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [row["node"] for row in rows if row["node"]]

def add_road(start_node: str, end_node: str, travel_time: float) -> Dict[str, Any]:
    start_node = start_node.strip().upper()
    end_node = end_node.strip().upper()
    
    if not start_node or not end_node:
        raise ValueError("Start and End locations cannot be empty.")
    if start_node == end_node:
        raise ValueError("Starting location and Ending location cannot be the same.")
    if travel_time <= 0:
        raise ValueError("Travel time must be greater than 0.")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if road already exists in either direction
    cursor.execute("""
        SELECT id, travel_time FROM roads
        WHERE (start_node = ? AND end_node = ?)
           OR (start_node = ? AND end_node = ?)
    """, (start_node, end_node, end_node, start_node))
    existing = cursor.fetchone()

    if existing:
        # Update the travel time for the existing road
        road_id = existing["id"]
        cursor.execute("UPDATE roads SET travel_time = ?, start_node = ?, end_node = ? WHERE id = ?", 
                       (travel_time, start_node, end_node, road_id))
        conn.commit()
        conn.close()
        return {
            "id": road_id,
            "start_node": start_node,
            "end_node": end_node,
            "travel_time": travel_time,
            "action": "updated",
            "message": f"Updated road {start_node} ↔ {end_node} travel time to {travel_time} mins."
        }
    else:
        cursor.execute("INSERT INTO roads (start_node, end_node, travel_time) VALUES (?, ?, ?)",
                       (start_node, end_node, travel_time))
        road_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return {
            "id": road_id,
            "start_node": start_node,
            "end_node": end_node,
            "travel_time": travel_time,
            "action": "created",
            "message": f"Added new road {start_node} ↔ {end_node} with {travel_time} mins travel time."
        }

def update_road(road_id: int, travel_time: float) -> Optional[Dict[str, Any]]:
    if travel_time <= 0:
        raise ValueError("Travel time must be greater than 0.")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE roads SET travel_time = ? WHERE id = ?", (travel_time, road_id))
    affected = cursor.rowcount
    if affected == 0:
        conn.close()
        return None
    cursor.execute("SELECT id, start_node, end_node, travel_time FROM roads WHERE id = ?", (road_id,))
    row = cursor.fetchone()
    conn.commit()
    conn.close()
    return {
        "id": row["id"],
        "start_node": row["start_node"],
        "end_node": row["end_node"],
        "travel_time": row["travel_time"]
    }

def delete_road(road_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM roads WHERE id = ?", (road_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def clear_all_roads() -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM roads")
    count = cursor.rowcount
    conn.commit()
    conn.close()
    return count

def load_sample_dataset(preset: str = "smart_delivery_network") -> List[Dict[str, Any]]:
    clear_all_roads()
    if preset == "smart_delivery_network":
        samples = UNIFIED_DELIVERY_ROADS
    elif preset == "food_delivery_hub":
        samples = [
            ("A", "B", 5.0),
            ("A", "C", 2.0),
            ("C", "B", 3.0),
            ("B", "D", 6.0),
            ("C", "D", 8.0),
            ("C", "E", 4.0),
            ("E", "D", 2.0),
            ("D", "F", 3.0),
            ("E", "F", 7.0),
        ]
    elif preset == "simple_demo":
        samples = [
            ("A", "B", 10.0),
            ("A", "C", 2.0),
            ("C", "B", 3.0),
        ]
    elif preset == "complex_city":
        samples = [
            ("A", "B", 4.0),
            ("A", "C", 2.0),
            ("B", "C", 1.0),
            ("B", "D", 5.0),
            ("C", "D", 8.0),
            ("C", "E", 10.0),
            ("D", "E", 2.0),
            ("D", "F", 6.0),
            ("E", "F", 3.0),
            ("F", "G", 1.0),
            ("E", "G", 5.0),
        ]
    else:
        samples = UNIFIED_DELIVERY_ROADS

    conn = get_db_connection()
    cursor = conn.cursor()
    for u, v, w in samples:
        cursor.execute("INSERT INTO roads (start_node, end_node, travel_time) VALUES (?, ?, ?)", (u, v, w))
    conn.commit()
    conn.close()
    return get_all_roads()
