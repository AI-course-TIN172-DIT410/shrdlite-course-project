///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="search/AStar.ts"/>
///<reference path="test/Graph.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations: Interpreter.Result[], currentState: WorldState): Result[] {
        var plans: Result[] = [];
        interpretations.forEach((intprt) => {
            var plan: Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            //TODO: sort for shortest plan, error handling(null)?
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }


    export interface Result extends Interpreter.Result { plan: string[]; }


    export function planToString(res: Result): string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message?: string) { }
        public toString() {return this.name + ": " + this.message }
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    /*
        Physical laws

        The world is ruled by physical laws that constrain the placement and movement of the objects:

        -The floor can support at most N objects (beside each other).           [ ]
        -All objects must be supported by something.                            [ ]
        -The arm can only hold one object at the time.                          [X]
        -The arm can only pick up free objects.                                 [X]
        -Objects are �inside� boxes, but �ontop� of other objects.              [ ]
        -Balls must be in boxes or on the floor, otherwise they roll away.      [X]
        -Balls cannot support anything.                                         [X]
        -Small objects cannot support large objects.                            [X]
        -Boxes cannot contain pyramids, planks or boxes of the same size.       [X]
        -Small boxes cannot be supported by small bricks or pyramids.           [X]
        -Large boxes cannot be supported by large pyramids.                     [X]
    */

    module PhysicalLaws {

        //Check the validity for arm pickups
        export function possibleArmPickup(obj: string, state: WorldState): boolean {
            var bool = false;

            if (state.holding !== null) {
            } else {
                //Check if the object is free
                for (var i = 0; i < state.stacks.length; i++) {
                    var topObjIndex = state.stacks[i].length - 1;
                    if (topObjIndex >= 0) {
                        if (state.stacks[i][topObjIndex] == obj) {
                            return true;
                        }
                    }
                }
            }
            return bool;
        }

        //Check if an intended move is valid
        export function validPosition(topObj: ObjectDefinition, bottomObj: ObjectDefinition): boolean {

            if (bottomObj.form === "ball")
                return false;
            if (topObj.size === "large" && bottomObj.size === "small")
                return false;
            if (topObj.form === "ball") {
                if (!(bottomObj.form === "box" || bottomObj.form === "floor"))
                    return false;
            }
            if (bottomObj.form === "box") {
                if (topObj.form === "pyramid" || topObj.form === "plank" || topObj.form === "box") {
                    if (bottomObj.size === "small" || topObj.size === "large")
                        return false;
                }
            }
            if (topObj.form === "box") {
                if (topObj.size === "small" && bottomObj.size === "small") {
                    if (bottomObj.form === "brick" || bottomObj.form === "pyramid")
                        return false;
                }
                if (topObj.size === "large" && bottomObj.form === "pyramid" && bottomObj.size === "large")
                    return false;
            }

            return true;
        }

        export function checkInterp(intp: Interpreter.Literal[], state: WorldState): boolean {
            var rel = intp[0].rel;

            for (var i = 0; i < intp.length; i++) {
                var target = intp[i].args[1];
                var primary = intp[i].args[0];
                var targetObject = state.objects[target];
                var primaryObject = state.objects[primary];

                if (rel === 'ontop' || rel === 'above' || rel === 'inside') {
                    if (validPosition(primaryObject, targetObject) === false) {
                        console.log("Removed interpretation in physical check");
                        return false;
                    }
                } else if (rel === 'under') {
                    if (validPosition(targetObject, primaryObject) === false) {
                        console.log("Removed interpretation in physical check");
                        return false;
                    }
                }
            }
            console.log("Interpretation passed physical check");
            return true;
        }
    }

    function planInterpretation(intprt: Interpreter.Literal[][], state: WorldState): string[] {

        /*
            TODO: Structure for planning
                - Filter out obviously invalid interpretations               [X]
                -- Check object physics                                      [X]
                -- Check spatial relations                                   [X]
                - Convert world to PDDL                                      []
                - Calculate heuristic values on every valid interpretation   []
                - Do A* to reach the goalstate                               []
                - List all possible moves                                    []
                - Sort the plans with the one involving least steps first    []
        */

        // Remove invalid interpretations
        var validInterps: Interpreter.Literal[][] = [];
        for (var i = 0; i < intprt.length; i++) {
            if (checkSpatialRelations(intprt[i], state.objects) && PhysicalLaws.checkInterp(intprt[i], state)) {
                console.log("Added!");
                validInterps.push(intprt[i]);
                console.log(validInterps.length);
            }
        }

        //Remove when done
        testCloning(state);

        // This function returns a dummy plan involving a random stac
        do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        var plan: string[] = [];

        // First move the arm to the leftmost nonempty stack
        if (pickstack < state.arm) {
            plan.push("Moving left");
            for (var i = state.arm; i > pickstack; i--) {
                plan.push("l");
            }
        } else if (pickstack > state.arm) {
            plan.push("Moving right");
            for (var i = state.arm; i < pickstack; i++) {
                plan.push("r");
            }
        }

        // Then pick up the object
        var obj = state.stacks[pickstack][state.stacks[pickstack].length - 1];
        plan.push("Picking up the " + state.objects[obj].form,
            "p");

        if (pickstack < state.stacks.length - 1) {
            // Then move to the rightmost stack
            plan.push("Moving as far right as possible");
            for (var i = pickstack; i < state.stacks.length - 1; i++) {
                plan.push("r");
            }

            // Then move back
            plan.push("Moving back");
            for (var i = state.stacks.length - 1; i > pickstack; i--) {
                plan.push("l");
            }
        }

        // Finally put it down again
        plan.push("Dropping the " + state.objects[obj].form,
            "d");

        return plan;

    }


    function checkSpatialRelations(intp: Interpreter.Literal[], objects: { [s: string]: ObjectDefinition }): boolean {
        // Check so that each spatial relation holds between the elements
        // Inside
        // Ontop
        var rel = intp[0].rel;
        if (rel === "inside") {
            // * Several things cannot be in one box
            // * Target is a box 
            var stateSet = new collections.Set<string>(); // To know that one box contain one thing
            for (var i = 0; i < intp.length; i++) {
                var target = intp[i].args[1];
                var obj = intp[i].args[0];

                // Check that target is a box.
                if (objects[target].form !== 'box') {
                    console.log("Removed interpretation: ");
                    console.log(intp[i]);
                    console.log("Due to target is not a box.");
                    return false;
                }

                if (stateSet.contains(target)) {
                    console.log("Removed interpretation: ");
                    console.log(intp[i]);
                    console.log("Due to bad spatial inside relation");
                    return false; // Two things cannot be inside the same box
                } else {
                    stateSet.add(target); // Add the target so we know that it is occupied.
                }
            }
            console.log(intp);
            return true;

        } else if (rel === "ontop") {
            var stateSet = new collections.Set<string>();
            for (var i = 0; i < intp.length; i++) {
                var target = intp[i].args[1];
                var obj = intp[i].args[0];
                if (objects[target].form === 'box') {
                    return false; // Things are inside a box, not ontop. Or is this too harsh?
                }
                if (stateSet.contains(target)) {
                    return false;
                } else {
                    stateSet.add(target);
                }

            }
            return true;
        }
    }


    // Current thoughts of implementations.
    // We accept the interpretations we have left as possible valid solutions
    // we send them to the goalFuncHandle to receive a function to check if our current world
    // is correct.
    // We need to get a function to get a heuristic (this could be a return 0 function for now)
    // 
    // The neighbours to each node in the graph needs to be computed by checking
    //  _ the possible basic moves the arm can do _ that is r,l,p,d and check how the world
    //  changes when putting down or picking up an object.
    //
    //  When this is implemented we should just give these parts to the A-star algorithm and be
    //  thankful for the solution.
    //  The first solution achieved should be the best (not totally convinced of this yet)


    // Function to return a function to check if we fulfilled the goal state
    function goalFuncHandle(intrps: Interpreter.Literal[][]) {
        // Store a set of all interpretations expressed as strings to make subset checks with current world.

        return (function foundGoal(currentWorld: Nworld): boolean {
            var intps = intrps;
            var stacks = currentWorld.states.stacks;
            for (var i = 0; i < intrps.length; i++) {
                // Check if interpretation i holds in the current world
                var goal = true;
                for (var j = 0; j < intrps[i].length; j++) {
                    var pObj = intrps[i][j].args[0];
                    var tObj = intrps[i][j].args[1];
                    var rel = intrps[i][j].rel;
                    var holds = Interpreter.getRelation([pObj], [tObj], rel, stacks); // In this pObj & tObj might need to switch, can't figure out how getRelation does it right now.

                    if (!holds.length) {
                        goal = false;
                    }
                }
                // If we have a literal that is a goal state, return true, otherwise keep searching.
                if (goal)
                    return goal;
            }
            return false;
        });
    }

    function getNeighbours(currentWorld: Nworld): [Nworld, number][]{
        // Return all possible moves as corresponing Nworlds, with actual cost (?)
        return null; // Dummy return
    }

    function getStackIndex(o1: string, stacks: string[][]): number[] {
        var cords: number[] = [-1, -1];
        for (var i = 0; i < stacks.length; i++) {
            for (var j = 0; j < stacks[i].length; j++) {
                if (stacks[i][j] === o1) {
                    cords[0] = i;
                    cords[1] = j;
                }
            }
        }
        return cords;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    /*
        Costs for the heuristic:
        - The heuristic aim to return the number of moves that at least are needed
        - A move is either 'l', 'r', 'p' or 'd'
        - The cost for a move is 1
        - The different relations has different minimum costs

    */
    function allMovesCountsHeuristic(goals: Interpreter.Literal[][]): Search.Heuristic<N> {
        return function (node: Nworld): number {
            var cost: number = Number.MAX_VALUE;

            for (var i = 0; i < goals.length; i++) {
                var max: number = 0;

                for (var j = 0; j < goals[i].length; j++) {
                    var temp: number = calculateCost(goals[i][j], node.states);
                    max = Math.max(temp, max);
                }
                cost = Math.min(cost, max);
            }
            return cost;
        }
    }

    function calculateCost(literal: Interpreter.Literal, state: WorldState): number {
        var cost: number = 0;
        var primary: string = literal.args[0];
        var target = literal.args[1];
        // Since we are searching for the cost we have not yet reached the goal

        if (literal.rel === "holding") {

            cost = calculateHolding(primary, state);

        } else if (literal.rel === "ontop" || literal.rel === "inside") {
            if (state.holding === primary) {
                cost = calculateHolding(target, state) - 1 + 4; //-1 since no picking up then move primary on target
            } else if (state.holding === target) {
                cost = calculateHolding(primary, state) + 2; //sidestep + drop
            } else if (findStack(primary, state.stacks) === findStack(target, state.stacks)) {
                var indexA: number = findStack(primary, state.stacks);
                var indexB: number = findStack(target, state.stacks);
                if (howManyAbove(primary, state.stacks[indexA]) < howManyAbove(target, state.stacks[indexB]))
                    cost = calculateHolding(target, state) - 1 + 4; //-1 since no picking up then move primary on target
                else //target is above
                    cost = calculateHolding(primary, state) + 2; //sidestep + drop
            } else { //primary and taret is in different stacks
                var indexA: number = findStack(primary, state.stacks);
                var indexB: number = findStack(target, state.stacks);
                var dist: number = Math.abs(findStack(primary, state.stacks) - indexB);
                if (howManyAbove(target, state.stacks[indexB]) !== 0) {
                    cost = howManyAbove(target, state.stacks[indexB]) * 4 - 2; //no picking up or moving back to the stack
                    dist = 2 * dist - Math.abs(state.arm - indexA) + Math.abs(state.arm - indexB);
                }
                cost = cost + calculateHolding(primary, state);
                cost = cost + dist + 1; //drop
            }
        } 

        return cost;
    }

    function calculateHolding(primary : string, state : WorldState): number {
        var cost: number = 0;
        
        // It we hold the goal we are done
        // Holding an object above the primary's stack costs three (l d r | r d l)
        // Holding an object anywhere else costs one (d) 
        if (state.holding !== null) {
            if (state.holding === primary)
                return cost;
            cost = state.arm === findStack(primary, state.stacks) ? cost + 3 : cost++;
        }
        // The least amount of moves in horizontal position is added to the cost (# of 'l' or 'r')
        var position: number = findStack(primary, state.stacks);
        if (position !== -1)
            cost = + Math.abs(position - state.arm);
        else
            return Number.MAX_VALUE; //The object doesn't exist in the world

        // When the arm is positioned above the correct stack, it takes at least 4 moves 
        // to move each item above the goal object (p + l|r + d + r|l)
        cost = + howManyAbove(primary, state.stacks[position]) * 4;
        // It costs one move to pick up the goal ('p')
        cost++;

        return cost;
    }


    //Returns the index of the stack in stacks where the obj is
    function findStack(obj: string, stacks: string[][]): number {
        for (var i; i < stacks.length; i++) {
            if (stacks[i].lastIndexOf(obj) !== -1)
                return i;
        }
        return -1;
    }

    //Returns how many items obj has above in the stack
    function howManyAbove(obj: string, stack: string[]): number {
        return stack.length - stack.lastIndexOf(obj) + 1;
    }

    //Clones the worldstate
    function cloneWorldstate(state: WorldState): WorldState {
        var clone: WorldState = {
            arm: state.arm,
            holding: state.holding,
            examples: cloneObject(state.examples),
            objects: cloneObject(state.objects),
            stacks: cloneObject(state.stacks)
        };
        return clone;
    }

    // recursive function to clone an object. If a non object parameter
    // is passed in, that parameter is returned and no recursion occurs.
    function cloneObject(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        var temp = obj.constructor(); // give temp the original obj's constructor
        for (var key in obj) {
            temp[key] = cloneObject(obj[key]);
        }

        return temp;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /*  
        TTTTTTT   EEEEE      sSSSs   tTTTTTt
           T      E         sS   ss      T
           T      EEEe        Ss        T
           T      E        ss   Ss       T
           T      EEEEE     sSSSs        T
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function testCloning(state: WorldState) {
        var cloned: WorldState = cloneWorldstate(state);
        if (cloned.arm == state.arm)
            console.log("STATES ARMS ARE EQUAL");
        if (cloned.examples == state.examples)
            console.log("STATES EXAMPLES ARE EQUAL");
        if (cloned.holding == state.holding)
            console.log("STATES HOLDING ARE EQUAL");
        if (cloned.objects == state.objects)
            console.log("STATES OBJECTS ARE EQUAL");
        if (cloned.stacks == state.stacks)
            console.log("STATES STACKS ARE EQUAL");

        state.stacks = null;
        state.examples = null;
        state.objects = null;
        console.log("Current state: " + state.arm);
        console.log("Current state: " + state.examples);
        console.log("Current state: " + state.holding);
        console.log("Current state: " + state.objects);
        console.log("Current state: " + state.stacks);
        console.log("Cloned state: " + cloned.arm);
        console.log("Cloned state: " + cloned.examples);
        console.log("Cloned state: " + cloned.holding);
        console.log("Cloned state: " + cloned.objects);
        console.log("Cloned state: " + cloned.stacks);
        state.stacks = cloneObject(cloned.stacks);
        state.objects = cloneObject(cloned.objects);
    }

    export class Nworld implements N{
        states: WorldState;
        step: string;
        value: string;
        x: number;
        y: number;
        neighbours: [Nworld, number][];
    }
}
