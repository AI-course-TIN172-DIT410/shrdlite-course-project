/// <reference path="collections.ts" />
/// <reference path="Interpreter.ts"/>

interface Graph<T>{
    getneighbors(node: number):Array<number>;
    getcost(from: number,to:number):number;
    heuristic_cost_estimate(current : number, goal : Interpreter.Literal[] ) : number;
    specialIndexOf(obj:T):number;
    reachedGoal(current:number, conditions:Interpreter.Literal[]):boolean;
    checkGoal(current:number, condition:Interpreter.Literal):boolean;
}

class NodeScore {
	private index:number;
	private fscore:number;
	
	constructor(i:number, fs:number){
		this.index = i;
		this.fscore = fs;
		
	}
	public getIndex():number{
		return this.index;
	}
	public getFscore(){
		return this.fscore;
	}
	public setFscore(fs:number){
		this.fscore = fs;
	}
	
}

class Astar <T>{
    mGraph : Graph<T>;

    constructor(g : Graph<T>){
        this.mGraph = g;
    }

    private reconstruct_path(came_from : number[], goal:number):number[]{
        var result_path:number[] = [];
        result_path.push(goal);
        while(came_from[goal] > 0){
        	goal = came_from[goal];
        	result_path.push(goal);
        }
        
        return result_path;
    }

    private neighbor_nodes(current : number): number[]{
        var result : number[];
        console.log("getting neighbors");
        result = this.mGraph.getneighbors(current);
        console.log("got them");
        return result;
    }

    private cost(from:number, to:number): number{
        var result:number;
        result = this.mGraph.getcost(from,to);
        //if cost -1 then we throw error ?
        return result;
    }
    
    public star (start: number, goal : Interpreter.Literal[]): number[]{
        console.log("star starting");
        // The set of tentative nodes to be evaluated, initially containing the start node
        var openset = new collections.PriorityQueue<NodeScore>(
        					function (a:NodeScore,b:NodeScore){
        						return b.getFscore() - a.getFscore();
        					});
       	var openset_ids = new collections.Set<number>(); 
        var closedset : number [] = [];   // The set of nodes already evaluated.      
        var came_from : number [] = [];    // The map of navigated nodes.
        var g_score : number [] = [];
        var f_score : number [] = [];
        g_score[start] = 0;
        console.log("about to check heuristic_cost_estimate");
        f_score[start] = g_score[start] + this.mGraph.heuristic_cost_estimate(start, goal);
        console.log("finished checking h");
        openset.add(new NodeScore(start,f_score[start]));
        openset_ids.add(start);
        var counter = 0;
        
        while (!openset.isEmpty()){
            console.log("star loop nr: "+counter);
            var current = openset.dequeue().getIndex();
            openset_ids.remove(current);
            counter ++;
            console.log("checking if reached goal");
            if(this.mGraph.reachedGoal(current, goal)){
                console.info("Number of nodes visited " + counter);
                return this.reconstruct_path(came_from, current);//changed to current, since goal will be literals
            } //needs to be adjusted
            console.log("checked if goal. its not");
            closedset.push(current);
            console.log("pushed current to closedset");
            var currentNeighbors = this.neighbor_nodes(current);
            console.log("setcurrentneigh to something");
            for(var i = 0; i < currentNeighbors.length; i++){
                console.log("looping through neighbors");
                var neighbor = currentNeighbors[i];
                if(closedset.indexOf(neighbor) == -1){
                    console.log("inside if1");
                    var tentative_g_score : number = g_score[current] + this.cost(current,neighbor); // distance between c and n
                    var neighborNode = new NodeScore(neighbor, f_score[neighbor]);
                    var containsNode = !(openset.contains(neighborNode));
                    
                	if(containsNode ||tentative_g_score < g_score[neighbor]){
                        console.log("inside if2");
                        came_from[neighbor] = current;
                        g_score[neighbor] = tentative_g_score;
                        console.log("about to check heuristic_cost_estimate2");
                        f_score[neighbor] = g_score[neighbor] + this.mGraph.heuristic_cost_estimate(neighbor, goal);
                        console.log("finished checking h_2");
                        neighborNode.setFscore(f_score[neighbor]);
                        if(containsNode){
                            console.log("inside if3");
                        	openset.add(neighborNode);
                        }
                    }
                }
            }
        }
        //no path found!
        console.error("Astar: no path found!");
        return []; 
    }

}
