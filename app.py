from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import geojson
import networkx as nx
from geopy.distance import geodesic
import json

app = Flask(__name__)
CORS(app)

# === Load your points and roads ===
with open('static/points.json') as f:
    points_data = json.load(f)
points = [tuple(feature["geometry"]["coordinates"]) for feature in points_data["features"]]

with open('static/roads.json') as f:
    roads_data = json.load(f)

# === Build the graph ===
G = nx.Graph()

def find_closest_point(coord, point_list):
    return min(point_list, key=lambda p: geodesic(coord[::-1], p[::-1]).meters)

# Add nodes
for pt in points:
    G.add_node(pt)

# Add edges by snapping road points to closest nodes
for feature in roads_data["features"]:
    coords = feature["geometry"]["coordinates"]
    for i in range(len(coords) - 1):
        start = find_closest_point(tuple(coords[i]), points)
        end = find_closest_point(tuple(coords[i+1]), points)
        if start != end:
            dist = geodesic(start[::-1], end[::-1]).meters
            G.add_edge(start, end, weight=dist)

# Fixed start point (can also be dynamic later)
start_coord = (3.0729, 36.7468)

@app.route("/")
def index():
    return render_template("dijkstra.html")

@app.route("/route", methods=["POST"])
def route():
    data = request.get_json()
    end_coord = tuple(data["end_coord"])

    start_node = find_closest_point(start_coord, G.nodes)
    end_node = find_closest_point(end_coord, G.nodes)
    print("Start node:", start_node)
    print("End node:", end_node)
    try:
        path = nx.dijkstra_path(G, start_node, end_node, weight="weight")
    except nx.NetworkXNoPath:
        return jsonify({"error": "No path found."}), 404

    path_coords = [list(pt) for pt in path]
    geojson.Feature(geometry=geojson.Point(pt), properties={"type": "checkpoint"})

    geojson_path = geojson.FeatureCollection([
        geojson.Feature(geometry=geojson.LineString(path_coords), properties={})
    ])
    return jsonify(geojson_path)

if __name__ == "__main__":
    app.run(debug=True)
    

