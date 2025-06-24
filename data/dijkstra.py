import json
import math
from collections import defaultdict
import heapq

def haversine(coord1, coord2):
    R = 6371000  # Earth radius in meters
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def load_geojson(filename):
    with open(filename, 'r') as f:
        return json.load(f)

def build_graph(points, roads):
    coords = [tuple(f["geometry"]["coordinates"]) for f in points["features"]]
    graph = defaultdict(list)

    edge_count = 0
    for road in roads["features"]:
        line = road["geometry"]["coordinates"]
        for i in range(len(line) - 1):
            p1 = line[i]
            p2 = line[i+1]

            idx1 = find_closest_point_index(p1, coords, threshold=50)  # Increased threshold to 50 meters
            idx2 = find_closest_point_index(p2, coords, threshold=50)
            if idx1 is not None and idx2 is not None and idx1 != idx2:
                dist = haversine(coords[idx1], coords[idx2])
                graph[idx1].append((idx2, dist))
                graph[idx2].append((idx1, dist))
                edge_count += 1

    print(f"Graph constructed with {len(graph)} nodes and {edge_count} edges.")
    for node in graph:
        print(f"Node {node} has neighbors: {graph[node]}")
    return graph, coords

def find_closest_point_index(point, points, threshold=50):  # Increased default threshold
    for i, pt in enumerate(points):
        if haversine(point, pt) <= threshold:
            return i
    print(f"No point found within {threshold} meters for {point}")
    return None

def dijkstra(graph, start, end):
    queue = [(0, start, [])]
    visited = set()
    while queue:
        cost, node, path = heapq.heappop(queue)
        if node in visited:
            continue
        visited.add(node)
        path = path + [node]
        if node == end:
            return path, cost
        for neighbor, weight in graph[node]:
            if neighbor not in visited:
                heapq.heappush(queue, (cost + weight, neighbor, path))
    print(f"No path found between {start} and {end}.")
    return [], float('inf')

def main():
    points = load_geojson('points.json')
    roads = load_geojson('roads.json')
    graph, coords = build_graph(points, roads)

    if not graph or not coords:
        print("Graph or coordinates list is empty. Check input files.")
        return

    try:
        start = int(input("\nEnter START point index: "))
        end = int(input("Enter END point index: "))
    except ValueError:
        print("Invalid input. Please enter numeric indices.")
        return

    if start < 0 or end < 0 or start >= len(coords) or end >= len(coords):
        print(f"Invalid index selected. Valid range is 0 to {len(coords) - 1}.")
        return

    path, total_distance = dijkstra(graph, start, end)

    if not path:
        print("No path found.")
        return

    print("\nShortest path (by index):", path)
    print(f"Total distance (meters): {total_distance:.2f}\n")

    print("Path with coordinates:")
    for idx in path:
        print(f"Point {idx}: {coords[idx]}")

if __name__ == '__main__':
    main()