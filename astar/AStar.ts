/**
 * Created by Niklas on 2015-03-27.
 */
///<reference path="../lib/collections.ts"/>


module AStar {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Types

    export class Node  {
        label: string;
        neighbours: Node[];
        neighbourCosts: number[];
        cost:number;
        previous: Node;
        constructor (label : string, neighbours : Node[], neighbourCosts : number[],
                     cost:number=Infinity,previous:Node=null) {
            this.label = label;
            this.neighbours = neighbours;
            this.neighbourCosts = neighbourCosts;
            this.cost = cost;
            this.previous = previous;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // A* algorithm

    export function astar(s: Node, t : Node) : Node[] {

        function getBest() : Node {
            // Return Node in todo-list with minimum cost
            return todo.reduce((currMin : Node, n : Node) => {
                return (n.cost<=currMin.cost)?n:currMin;
            }, new Node(null,null,null,Infinity));
        }

        var todo     : Node[]   = [s]
          , done     : Node[]   = []
          ;
        // Start node's cost from start node is 0
        s.cost = 0;
        s.previous = null;

        while (todo.length > 0) {
            var v = getBest();

            // Possibly update neighbours of node we're visiting now
            for (var nKey in v.neighbours) {
                var n = v.neighbours[nKey];

                // Add to todo if not already visited
                if (done.indexOf(n) === -1)
                    todo.push(n);

                // Update if path through v is better
                var newCost = v.neighbourCosts[nKey] + v.cost;
                if (newCost<=n.cost) {
                    n.cost     = newCost;
                    n.previous = v;
                }
            }

            // Mark node v as visited
            todo.splice(todo.indexOf(v),1);
            done.push(v);
        }

        // Retrieve path
        var path = [];
        var v = t;
        while (v !== s) {
            path.unshift(v);
            v = v.previous;
        }
        path.unshift(s);

        return path;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Test cases

    // Creates an example graph and runs AStar on it
    export function testGraph() {

        // Define graph
        var a = new Node("a", [], []);
        var b = new Node("b", [], []);
        var c = new Node("c", [], []);
        var d = new Node("d", [], []);
        var e = new Node("e", [], []);
        var nodes = [a,b,c,d,e];
        var edges : [[Node,Node,number]] = [[a,b,1], [b,c,1], [c,d,1], [a,e,1], [e,d,4]];

        initGraph(nodes, edges); // Updates node objects to be a proper graph

        console.log("Running astar test ... ");
        var path = astar(a, d);
        var correctPath = [a,b,c,d];
        console.log(arrayEquals(path, correctPath) ? "... passed!" : "... FAILED!" );

    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Utility functions

    // Creates a graph from a list of blank nodes and edges.
    // More specifically, updates all nodes by adding the neighbour references/costs specified in edges
    function initGraph(nodes : Node[], edges : [[Node,Node,number]]) {
        for (var eKey in edges) {
            var e = edges[eKey];
            var v1 = e[0], v2 = e[1], c = e[2];
            v1.neighbours.push(v2);
            v2.neighbours.push(v1);
            v1.neighbourCosts.push(c);
            v2.neighbourCosts.push(c);
        }
    }

    // Can't extend prototype in typescript? :(
    //Array.prototype.shallowEquals = ...

    // Compares shallowly if two arrays are equal
    function arrayEquals<T>(first : Array<T>, second : Array<T>) : boolean {
        if (!first || !second)              return false;
        if (first.length !== second.length) return false;

        // Compare all refs in array
        for (var i=0;i<first.length;i++) {
            if (first[i] !== second[i]) return false;
        }
        return true;
    }

    // (Not used)
    function listMinus(a : Object[], b : Object[]) : Object[] {
        var newA = a.slice(0);
        return newA.filter((o) => {
            return b.indexOf(o) !== -1;
        });
    }

}