
/// <reference path="lib/collections.ts" />

module Astar{
    //-- Interfaces -------------------------------------------

    export class Error implements Error {
        public name = "Astar.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    /**
    * returns the neighbouring states from the current state.
    */
    export interface Neighbours<T>{
        (state : T) : Neighb<T>[] ;
    }

    export function neighbourVertex<T>(s : Search<T>, v : Vertex<T>, neighb : Neighb<T>){
        return {
            state : neighb.state,
            cost : v.cost + neighb.transitionCost,
            heur : s.h(neighb.state),
            previous : s.x,
            action : neighb.action
        };
    }

    export interface Neighb<T>{
        state : T ;
        action : string ;
        transitionCost : number ;
    }

    /**
    * Heuristic function.
    */
    export interface Heuristic<T>{
        (state : T) : number ;
    }

    /**
    * returns true iff the state is accepting, ie is a goal state.
    * Thus, there can be several goal states.
    */
    export interface Goal<T>{
        (state : T) : boolean ;
    }

    /**
    * Used internally by the function `search`.
    */
    export interface Vertex<T>{
        state : T ;
        cost : number ;
        heur : number ;
        previous : number ;
        action : string ;
    }

    export class Search<T>{
        public prioQueue : collections.PriorityQueue<Astar.Vertex<T>>;
        public visited : collections.Set<T> = new collections.Set<T>();
        public x : number = 0;
        public order : Array<Astar.Vertex<T>> = [];
        public startVertex : Astar.Vertex<T>;

        constructor(
            start : T,
            public hLimit : number,
            public f : Astar.Neighbours<T>,
            public h : Astar.Heuristic<T>,
            public isGoal : Astar.Goal<T>,
            public maxIter : number = 25000,
            public multiPathPruning : boolean = true
        ){
            this.prioQueue = new collections.PriorityQueue<Astar.Vertex<T>>(( (a, b) => {
                return b.cost + b.heur - a.cost - a.heur;
            } )) ;
            this.startVertex = {
                state : start,
                cost : 0,
                heur : 0,
                previous : -1,
                action : "init"

            };
        }
    }

    /**
    * Type alias used for comparison in the PriorityQueue.
    */
    interface Compare<T> {
        icf : collections.ICompareFunction<Vertex<T>>;
    }

    //-- Algorithms -------------------------------------------

    // export function astar<T>(f : Neighbours<T>, c : Cost<T>, h : Heuristic<T>, start : T,
    //                   isGoal : Goal<T>, multiPathPruning : boolean = true,
    //                   maxIter : number = 25000 ) : string[]{
    //     // var comp : Compare<T> = {
    //     //     icf : ((a, b) => {
    //     //         return b.cost + h(b.state) - a.cost - h(a.state);
    //     //     } )
    //     // } ;
    //     var searchObj : Search<T> = new Search<T>(start, Infinity, f, h, isGoal, maxIter, multiPathPruning);
    //     return astarSearch
    //     // return
    //     // return search<T>(comp, f, c, h, start, isGoal, multiPathPruning, maxIter);
    // }

    /**
    * Best-first algorithm.
    *
    * Entirely disregards cost, only looking at the heuristic.
    */
    // export function bestFirst<T>(f : Neighbours<T>, h : Heuristic<T>, start : T, isGoal : Goal<T>,
    //                       multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
    //     var c : Cost<T> = ((a,b)=>0);
    //     var comp : Compare<T> = {
    //         icf : ((a, b) => {
    //             return h(b.state) - h(a.state);
    //         } )
    //     } ;
    //     return search<T>(comp, f, c, h, start, isGoal, multiPathPruning, maxIter);
    // }

    /**
    * Lowest-cost algorithm.
    *
    * Entirely disregards heuristic, only looking at the cost.
    */
    // export function lowestCost<T>(f : Neighbours<T>, c : Cost<T>, start : T, isGoal : Goal<T>,
    //                        multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
    //     var h : Heuristic<T> = (s => 0);
    //     var comp : Compare<T> = {
    //         icf : ((a, b) => {
    //             return b.cost - a.cost;
    //         } )
    //     } ;
    //     return search<T>(comp, f, c, h, start, isGoal, multiPathPruning, maxIter);
    // }

    /**
    * Breadth-first algorithm.
    *
    * Entirely disregards heuristic and assumes cost 1 on each state transition.
    */
    // export function breadthFirst<T>(f : Neighbours<T>, start : T, isGoal : Goal<T>,
    //                        multiPathPruning : boolean = true, maxIter : number = 25000 ) : string[]{
    //     var c : Cost<T> = ((a,b)=>1);
    //     return lowestCost<T>(f, c, start, isGoal, multiPathPruning, maxIter);
    // }

    export function astarSearch<T>(s : Search<T>){

        var visited = new collections.Set<T>() ;
        s.prioQueue.enqueue(s.startVertex);

        while(! s.prioQueue.isEmpty()){

            if(s.x > s.maxIter){
                throw new Astar.Error("Stopping early after " + s.x + " iterations. Size of queue: " + s.prioQueue.size() + " current cost: " + current.cost);
                // return postProcess<T>(order, x-1);
            }

            var current : Vertex<T> = s.prioQueue.dequeue();

            if(s.multiPathPruning){
                if(visited.contains(current.state)){
                    continue;
                }
                visited.add(current.state);
            }

            s.order[s.x] = current ;

            if(s.isGoal(current.state)){
                return postProcess<T>(s.order, s.x);
            }

            var neighbours = s.f(current.state);

            for(var n in neighbours){
                var next = neighbours[n];
                s.prioQueue.enqueue(neighbourVertex<T>(s, current, next));
            }
            s.x = s.x + 1;
        }
        throw new Astar.Error("No solution found!");
    }
    /**
    * Backtracks from the final state to the original state.
    *
    * returns the path as a list, ie from start to goal.
    */
    export function postProcess<T>(order : Array<Vertex<T>>, finish : number) : string[]{
        console.log("Completed in " + finish + " iterations.");
        var result = Array<string>();

        for(var x : number = finish; x >= 0; x = order[x].previous){
            result.unshift(order[x].action);
        }
        return result;
    }

    /**
    * returns an ordered list of explored states. They do not form a path
    * but shows in which order the states were explored, starting with the inital state.
    */
    function showVisited<T>(order : Array<Vertex<T>>) : T[]{
        var result = [];
        for (var n in order){
            result.push(order[n].state);
        }
        return result;
    }

}
