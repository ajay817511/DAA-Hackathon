# Smart Delivery DAA Route Optimizer

A graph-theory and algorithms project designed for the **Design and Analysis of Algorithms (DAA)** Hackathon. It implements a pure, from-scratch **Dijkstra's Shortest Path Algorithm** with binary min-heap priority queue (`heapq`) and an optimal **Multi-Customer Route Optimization Layer** on an interactive artificial mini-map.

---

## 🌟 Key Features

1. **Artificial Mini-Map Multi-Customer Delivery Planner** (Located in **Build Route** tab):
   - Fixed topology with **Restaurant start point** and 8 customer delivery locations (**A, B, C, D, E, F, G, H**).
   - 15 fixed bidirectional road segments with fixed travel times in minutes.
   - **Direct interactive selection/deselection** by clicking nodes on the mini-map or customer pill buttons (no duplicate selections).
   - **Multi-Customer Route Optimization Layer**: Built directly on top of Dijkstra's algorithm to calculate the globally minimal travel time delivery sequence.
   - **Visual Route Highlighting**: Active road edges illuminate on the mini-map with direction and glow; stops display optimized order numbers (`Stop 1`, `Stop 2`, ...).
   - **Trip Breakdown**: Shows the optimal visiting sequence, total fixed travel time, per-leg details, turn-by-turn road paths, and execution time.
   - **Reset Option**: One-click reset to immediately clear selections and plan another delivery.

2. **Manual Graph Network Builder & Roads Table**:
   - Preserves complete existing manual graph creation with 3-field input (Start, End, Travel Time).
   - Dynamic road editing and deletion.
   - Full Vis-Network physics canvas.

3. **Single-Origin Dijkstra Shortest Route Finder**:
   - Computes point-to-point shortest paths dynamically with execution performance metrics.

4. **Interactive Step-by-Step Dijkstra Visualizer**:
   - Step-by-step playback with priority queue state snapshots, relaxation evaluations, and visited sets.

5. **Analytics & Complexity Insights**:
   - Graph statistics, degree, density, and algorithm theoretical complexity ($O((V + E) \log V)$).

---

## 🚀 Getting Started

### 1. Backend (FastAPI + Python)

Navigate to the `backend` directory and run:

```bash
cd backend
python -m uvicorn main:app --reload --port 8080
```

Backend API endpoints:
- `GET  /api/health` - Health check
- `GET  /api/graph` - Get current database roads and nodes
- `POST /api/roads` - Add or update a road
- `POST /api/shortest-path` - Single origin to destination Dijkstra shortest path
- `POST /api/visualize` - Discrete step-by-step trace of Dijkstra
- `GET  /api/minimap-network` - Fixed mini-map topology (Restaurant, A–H, 15 roads)
- `POST /api/multi-delivery-route` - Multi-customer delivery route optimizer

### 2. Frontend (React + Vite)

In a separate terminal, navigate to `frontend` and start Vite:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.
