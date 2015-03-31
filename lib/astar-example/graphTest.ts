/// <reference path="../astar-example/astar.ts" />

var schweden = new Graph();

var kiruna = new GraphNode(1, 5, 2, "Kiruna");
var lulea = new GraphNode(2, 10, 7, "Luleå");
var umea = new GraphNode(3, 10, 17, "Umeå");
var tanndalen = new GraphNode(4, 1, 23, "Tänndalen");
var sthlm = new GraphNode(5, 15, 28, "Stockholm");
var gbg = new GraphNode(6, 1, 33, "Gôteborg");
var kalmar = new GraphNode(7, 12, 34, "Kalmar");
var malmo = new GraphNode(8, 4, 40, "Malmö");

schweden.addNode(kiruna);
schweden.addNode(lulea);
schweden.addNode(umea);
schweden.addNode(tanndalen);
schweden.addNode(sthlm);
schweden.addNode(gbg);
schweden.addNode(kalmar);
schweden.addNode(malmo);

schweden.addEdge(new Edge(10, kiruna, lulea));
schweden.addEdge(new Edge(25, tanndalen, kiruna));
schweden.addEdge(new Edge(10, kiruna, lulea));
schweden.addEdge(new Edge(12, lulea, umea));
schweden.addEdge(new Edge(14, umea, tanndalen));
schweden.addEdge(new Edge(16, umea, sthlm));
schweden.addEdge(new Edge(19, tanndalen, sthlm));
schweden.addEdge(new Edge(10, tanndalen, gbg));
schweden.addEdge(new Edge(19, gbg, sthlm));
schweden.addEdge(new Edge(9, sthlm, kalmar));
schweden.addEdge(new Edge(12, gbg, kalmar));
schweden.addEdge(new Edge(10, malmo, gbg));
schweden.addEdge(new Edge(14, kalmar, malmo));

console.log(aStar.aStar(schweden, malmo, kiruna).toString());