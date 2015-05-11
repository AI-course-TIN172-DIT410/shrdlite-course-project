///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="collections.ts"/>
///<reference path="AStar.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export class ShrdliteNode implements AStar.Node<Interpreter.Literal[]> {

        private pddl : Interpreter.Literal[]; 

        constructor(public state : WorldState) {this.pddl = null;}

        getState(){
            if(this.pddl == null) {this.pddl = stackToPddl(this.state);}
            return this.pddl;
        }

        getChildren(){
            return generateChildren(this.state);
        }
    } 

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }

    export function checkGoal(goal : Interpreter.Literal[][]) : AStar.Goal<Interpreter.Literal[]>{
        return function(lits : Interpreter.Literal[]){
            var allFound : boolean = false;
            goal.forEach(function(and : Interpreter.Literal[]){
                var goalReached = true;
                and.forEach(function(lit : Interpreter.Literal){
                    var found : boolean = isElem(lit, lits);
                    if(found != lit.pol) { goalReached = false; }
                })
                if(goalReached == true) { allFound = true; }
            })
            return allFound;
        }
    }

    function isElem(elem : Interpreter.Literal, arr : Interpreter.Literal[]): boolean {
	for(var i = 0; i < arr.length; i++) {
	    var a = arr[i];
	    if(elem.rel == a.rel && elem.args.toString() == a.args.toString()) {
		return true;
	    }
	}
	return false;
    }

    export function generateChildren(state : WorldState) : AStar.Edge<Interpreter.Literal[]>[] {
        
        var map : collections.Dictionary<string,WorldState> = new collections.Dictionary<string,WorldState>();
        map.setValue("r", moveRight(state));
        map.setValue("l", moveLeft(state));
        map.setValue("d", drop(state));
        map.setValue("p", pickup(state));

        var edges : AStar.Edge<Interpreter.Literal[]>[] = [];
        map.forEach(function(key:string, value:WorldState){
            if(value != null) { edges.push({cost:1, end: new ShrdliteNode(value), label: key});}
        });

        return edges;
    }

    export function cloneWorldState(state : WorldState) : WorldState {
        var newStack : string[][] = []; 
        state.stacks.forEach(function(col: string[]){
            var temp : string[] = [];
            col.forEach(function(elem : string){
                temp.push(elem);
            })
            newStack.push(temp);
        })
        return {arm: state.arm, holding: state.holding, examples: state.examples, objects: state.objects, stacks: newStack};
    }

    export function moveRight(state : WorldState) : WorldState {
        
        if(state.arm == state.stacks.length) {return null;}

        var newState : WorldState = cloneWorldState(state);
        newState.arm += 1;

        return newState;
    }

    export function moveLeft(state : WorldState) : WorldState {
        
        if(state.arm == 0) {return null;}

        var newState : WorldState = cloneWorldState(state);
        newState.arm -= 1;

        return newState;
    }

    export function drop(state : WorldState) : WorldState {
        
        if(state.holding == null){
            return null;
        }
        var newState : WorldState = cloneWorldState(state);
        newState.stacks[newState.arm].push(newState.holding);
        newState.holding = null;

        return newState;
    }

    export function pickup(state : WorldState) : WorldState {
        
        if(state.holding != null && state.stacks[state.arm].length > 0) {return null;}

        var newState : WorldState = cloneWorldState(state);
        newState.holding = newState.stacks[newState.arm].pop();

        return newState;
    }


    export interface Result extends Interpreter.Result {plan:string[];}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions
    function stackToPddl(state :WorldState) : Interpreter.Literal[] {
    var pddl :Interpreter.Literal[] = [];
	if(state.holding != null) {
	    pddl.push({pol:true, rel: "holding", args: [state.holding]});
	} 

    pddl.push({pol:true, rel: "armpos", args: [state.arm + ""]})
    pddl.push({pol:true, rel: "maxcol", args: [state.stacks.length + ""]})

	for(var x = 0; x < state.stacks.length; x++) {
	    //Create on top of floor
	    var col : string[] = [];
	    for(var y = 0; y < state.stacks[x].length; y++) {
		var o : string = state.stacks[x][y];
		if(y == 0) { // Add floors
		    pddl.push({pol:true, rel: "ontop", args: [o, "f_" + x]});
		} else {
		    pddl.push({pol:true, rel: "ontop", args: [o, state.stacks[x][y-1]]});
		}
		
		col.forEach(function(c) {
		    pddl.push({pol:true, rel: "above", args: [o, c]});
		});
		col.push(o);

		pddl.push({pol:true, rel: "column", args: [o, "" + x]});

	    }
	}
	
	return pddl;
    }


    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {

        var plan : string[] = [];
        var node : ShrdliteNode = new ShrdliteNode(state);
        var path : AStar.Path<Interpreter.Literal[]> = AStar.astarSearch<Interpreter.Literal[]>(node, function(x){return 0;}, checkGoal(intprt));  

        return path.getLabelPath();      
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
