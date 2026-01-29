import json
import networkx as nx
from geopy.distance import geodesic

# Load JSON files
with open('points.json') as f:
    points_data = json.load(f)

with open('roads.json') as f:
    roads_data = json.load(f)

# Extract points
points = [tuple(feature['geometry']['coordinates']) for feature in points_data['features']]

# Helper function to find the closest point to a given coordinate
def find_closest_point(coord, point_list):
    return min(point_list, key=lambda p: geodesic(coord[::-1], p[::-1]).meters)

# Build graph
G = nx.Graph()

# Add all points as nodes
for pt in points:
    G.add_node(pt)

# Add roads as edges
for feature in roads_data['features']:
    coords = feature['geometry']['coordinates']
    for i in range(len(coords) - 1):
        # Snap each road segment to the nearest defined point
        start = find_closest_point(tuple(coords[i]), points)
        end = find_closest_point(tuple(coords[i + 1]), points)
        distance = geodesic(start[::-1], end[::-1]).meters
        if start != end:
            G.add_edge(start, end, weight=distance)

print("Graph created with:")
print(f"{G.number_of_nodes()} nodes")
print(f"{G.number_of_edges()} edges")


import matplotlib.pyplot as plt
import networkx as nx

# # Draw the graph
pos = {node: (node[0], node[1]) for node in G.nodes()}  # x = lon, y = lat

plt.figure(figsize=(10, 8))
nx.draw(G, pos, with_labels=False, node_size=50, node_color="red", edge_color="gray")
plt.title("Graph from Points and Roads")
plt.xlabel("Longitude")
plt.ylabel("Latitude")
plt.grid(True)
plt.show()


from geopy.distance import geodesic

def find_closest_node(coord, nodes):
    return min(nodes, key=lambda n: geodesic(coord[::-1], n[::-1]).meters)

# Your input points (e.g., clicked on a map or hardcoded)
start_coord = (3.0729, 36.7468)
end_coord = (3.0762, 36.7497)

start_node = find_closest_node(start_coord, G.nodes)
end_node = find_closest_node(end_coord, G.nodes)


import networkx as nx

# Compute shortest path
shortest_path = nx.dijkstra_path(G, source=start_node, target=end_node, weight="weight")

# Optionally get total distance
total_distance = nx.dijkstra_path_length(G, source=start_node, target=end_node, weight="weight")

print("Shortest path (coordinates):")
for node in shortest_path:
    print(node)

print(f"Total distance: {total_distance:.2f} meters")


import matplotlib.pyplot as plt

path_x = [node[0] for node in shortest_path]
path_y = [node[1] for node in shortest_path]

plt.figure(figsize=(10, 8))
nx.draw(G, pos={n: (n[0], n[1]) for n in G.nodes}, node_size=10, edge_color='lightgray')
plt.plot(path_x, path_y, color='blue', linewidth=2, label="Shortest Path")
plt.scatter([start_node[0]], [start_node[1]], color='green', label="Start", s=100)
plt.scatter([end_node[0]], [end_node[1]], color='red', label="End", s=100)
plt.legend()
plt.grid(True)
plt.title("Dijkstra's Shortest Path")
plt.show()

#   compute the shortest path
import geojson

path_coords = [list(node) for node in shortest_path]  # convert tuple to list

geojson_path = geojson.FeatureCollection([
    geojson.Feature(geometry=geojson.LineString(path_coords), properties={})
])

with open("shortest_path.geojson", "w") as f:
    geojson.dump(geojson_path, f)
