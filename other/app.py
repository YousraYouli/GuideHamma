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
point_properties = {tuple(feature["geometry"]["coordinates"]): feature["properties"] 
                   for feature in points_data["features"]}

with open('static/roads.json') as f:
    roads_data = json.load(f)

# === Build the graph ===
G = nx.Graph()

def find_closest_point(coord, point_list):
    return min(point_list, key=lambda p: geodesic(coord[::-1], p[::-1]).meters)

# Add nodes with properties
for pt in points:
    G.add_node(pt, **point_properties.get(pt, {}))

# Add edges by snapping road points to closest nodes
for feature in roads_data["features"]:
    coords = feature["geometry"]["coordinates"]
    for i in range(len(coords) - 1):
        start = find_closest_point(tuple(coords[i]), points)
        end = find_closest_point(tuple(coords[i+1]), points)
        if start != end:
            dist = geodesic(start[::-1], end[::-1]).meters
            G.add_edge(start, end, weight=dist)

# Fixed start point (Entrée principale)
start_coord = (3.072866677193673, 36.7468386861365)

@app.route("/")
def index():
    return render_template("dijkstra.html")

@app.route("/route", methods=["POST"])
def route():
    try:
        data = request.get_json()
        if not data or "end_coord" not in data:
            return jsonify({"error": "Missing end_coord parameter"}), 400
            
        end_coord = tuple(data["end_coord"])
        
        # Find closest nodes in the graph
        start_node = find_closest_point(start_coord, G.nodes)
        end_node = find_closest_point(end_coord, G.nodes)
        
        print(f"Calculating route from {start_node} to {end_node}")
        
        try:
            path = nx.dijkstra_path(G, start_node, end_node, weight="weight")
            path_length = nx.dijkstra_path_length(G, start_node, end_node, weight="weight")
        except nx.NetworkXNoPath:
            return jsonify({"error": "No path found between the selected points"}), 404
        
        # Prepare response with path and information about points
        path_coords = [list(pt) for pt in path]
        path_features = []
        
        # Add the path line
        path_features.append(
            geojson.Feature(
                geometry=geojson.LineString(path_coords),
                properties={
                    "type": "path",
                    "length": round(path_length, 2),
                    "units": "meters"
                }
            )
        )
        
        # Add markers for start and end points
        path_features.append(
            geojson.Feature(
                geometry=geojson.Point(start_node),
                properties={
                    "type": "start",
                    "name": G.nodes[start_node].get("name", "Start Point")
                }
            )
        )
        
        path_features.append(
            geojson.Feature(
                geometry=geojson.Point(end_node),
                properties={
                    "type": "end",
                    "name": G.nodes[end_node].get("name", "Destination")
                }
            )
        )
        
        # Add intermediate points if needed
        for i, pt in enumerate(path[1:-1], 1):
            path_features.append(
                geojson.Feature(
                    geometry=geojson.Point(pt),
                    properties={
                        "type": "waypoint",
                        "name": G.nodes[pt].get("name", f"Point {i}"),
                        "order": i
                    }
                )
            )
        
        geojson_path = geojson.FeatureCollection(path_features)
        
        return jsonify(geojson_path)
    
    except Exception as e:
        print(f"Error in route calculation: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/preferences')
def preferences():
    return render_template('prefrencesPage.html')

@app.route("/dijkstra")
def dijkstra():
    return render_template("dijkstra.html")

@app.route("/points")
def get_points():
    """Endpoint to get all points of interest"""
    try:
        # Return the original points data with properties
        return jsonify(points_data)
    except Exception as e:
        print(f"Error fetching points: {str(e)}")
        return jsonify({"error": "Could not load points data"}), 500


@app.route("/tour-plan")
def tour_plan():
    return render_template("tourPlanPage.html")

if __name__ == "__main__":
    app.run(debug=True)