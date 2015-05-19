///<reference path="Interpreter.ts"/>

/** Generate new ID given a state */
function generateID(state: string[][]):string{
    return prettyMat(state);
}

function prettyMat(mat: string[][]){
    var prettyString = "[";
    for(var i=0; i<mat.length; i++){
        prettyString+="[";
        for(var j=0; j<mat[i].length; j++){
            prettyString+= mat[i][j] + "";
            if(j!=mat[i].length-1){
                prettyString+=",";
            }
        }
        prettyString+="]";
        if(i!=mat.length-1){
            prettyString+=",";
        }
    }
    prettyString+="]";
    return prettyString;
}

/** Checks if the world (worldstate) is valid, given the top object, bottom object and the list of different objects */
function validPlacement(topObject: string, bottomObject: string, objects: {[s:string]: ObjectDefinition}) : boolean {
    
    //Everything can be placed on the floor
    if(bottomObject == undefined){
        return true;
    }
    
    
	
	//balls should be in boxes or on the floor
	if(objects[topObject].form == "ball" && objects[bottomObject].form != "box") {
		return false;
	}
    
	
	//Balls can't support anything
	if (objects[bottomObject].form == "ball") {
		return false
	}
    
	
	//Small objects can't support large objects
	if(objects[bottomObject].size == "small" && objects[topObject].size == "large") {
		return false;
	}
    
	
	// Boxes cannot contain pyramids, planks or boxes of the same size.
	if(objects[bottomObject].form == "box" && (objects[topObject].form == "pyramid" || objects[topObject].form == "plank" || objects[topObject].form == "box") && objects[bottomObject].size == objects[topObject].size) {
		return false;
	}
    
	
	//Small boxes cannot be supported by small bricks or pyramids.
	if(objects[bottomObject].form == "brick" || objects[bottomObject].form == "pyramid" && objects[topObject].form == "box" && objects[topObject].size == "small"){
		return false;
	}
    
	
	//Large boxes cannot be supported by large pyramids.
	if(objects[bottomObject].form == "pyramid" && objects[bottomObject].size == "large" && objects[topObject].form == "box" && objects[topObject].size == "large") {
		return false
	}
    
	return true;
	
}

/** Checks if first is allowed to be placed on top of second */
function validPlacementAbove(first: string, second: string, objects: {[s:string]: ObjectDefinition}) : boolean {
    //If second is a ball, then no
    if(objects[second].form == "ball"){
        return false;
    }
    
    //second är small, så måste first vara small
    if(objects[second].size == "small" && objects[first].size != "small"){
        return false;
    }
    
    
    //om first är en ball, så måste det finnas en motsvarande box i rätt storlek
    if(objects[first].form == "ball"){
        if(objects[first].size == "large"){
            //Nånstans i världen måste finnas en stor box
        } else {
            //Nånstans i världen måste det finnas en box (valfri storlek)
            //boxElement
            var foundElement = null;
            for(var element in objects){
                if(objects[element].form == "box"){
                    foundElement = element;
                    break;
                }
            }
            if(foundElement == null){
                return false;
            }
            
            if(objects[second].size == "small"){
                //boxElement måste vara litet
                if(objects[foundElement].size != "small"){
                    return false;
                }
                    
            } else {
                //Boxelement kan vara valfri storlek
            }
        }
    }
    
    //Om stor boll, så stor boxes
    //Om liten boll så måste det finnas en box. NEJ, är det undre elementet nått litet, så måste det vara en liten box
    
    
    return true;
}

function copyStack(original: string[][]):string[][]{

    var newStack: string[][] = [];

    for(var i = 0; i < original.length; i++){
    
        newStack.push([]);
        for(var j = 0; j < original[i].length; j++){
            var elementIJ = original[i][j];
            newStack[i].push(elementIJ);
        }
    }
    
    return newStack;
}

function ontop(first: string, second: string, stacks: string[][]){
    for(var i=0; i<stacks.length; i++){
        if(second == "floor"){
            if (stacks[i][0] == first){
                return true;
            }
        }else{
            for(var j=0; j<stacks[i].length; j++){
                if(j<stacks[i].length-1 &&
                   stacks[i][j+1] == first &&
                   stacks[i][j] == second){
                    return true;
                }
            }
        }
    }
    return false;
}
function above(first: string, second: string, stacks: string[][]){
    var bool = false;
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(bool && stacks[i][j] == first){
                return true;
            }
            if(j<stacks.length-1 &&
               stacks[i][j] == second){
                bool = true;
            }
        }
        if(bool){
            return false;
        }
    }
    return false;
}
function under(first: string, second: string, stacks: string[][]){
    return above(second, first, stacks);
}
function beside(first: string, second: string, stacks: string[][]){
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if((stacks[i][j] == first || stacks[i][j] == second) && i<stacks.length-1){
                for(var k=0; k<stacks[i+1].length; k++){
                    if(stacks[i+1][k] == first || stacks[i+1][k] == second){
                        return true;
                    }
                }
                return false;
            }
        }
    }
    return false;
}
function left(first: string, second: string, stacks: string[][]){
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(stacks[i][j] == first && i<stacks.length-1){
                for(var k=0; k<stacks[i+1].length; k++){
                    if(stacks[i+1][k] == second){
                        return true;
                    }
                }
                return false;
            }
        }
    }
    return false;
}
function right(first: string, second: string, stacks: string[][]){
    return left(second, first, stacks);
}
function holding(first: string, stacks: string[][]){
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(stacks[i][j] == first){
                return j==stacks[i].length-1;
            }
        }
    }
    return false;
}

function check(first: string, rel: string, second: string, stacks: string[][]){
    switch(rel){
        case "ontop": 
            return ontop(first, second, stacks);
        case "inside": 
            return ontop(first, second, stacks);
        case "above":
            return above(first, second, stacks);
        case "under":
            return under(first, second, stacks);
        case "beside":
            return beside(first, second, stacks);
        case "leftof":
            return left(first, second, stacks);
        case "rightof":
            return right(first, second, stacks);
        case "holding":
            return holding(first, stacks);
        default:
            console.log("check no match");
            return false;
    }
}

function validInterpretation(int: Interpreter.Literal, objectDef: {[s:string]: ObjectDefinition}){
    switch(int.rel){
        case "ontop":
        case "inside":
            return validPlacement(int.args[0], int.args[1], objectDef);
        case "above":
            return validPlacementAbove(int.args[0], int.args[1], objectDef);
        case "under":
            //Same as above, just flipped order on the arguments
            return validPlacementAbove(int.args[1], int.args[0], objectDef);
        default:
            return true;
    }
}

function heuristicOntop(first: string, second: string, stacks: string[][]){
    var foundF = false;
    var foundS = false;
    var h = 0;
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(stacks[i][j] == second){
                foundS = true;
                if(stacks[i].length-1>j && stacks[i][j+1] == first){
                    return 0
                }
                h += stacks[i].length-1-j;
            }
            if(stacks[i][j] == first){
                foundF = true;
                h += stacks[i].length-1-j;
            }
            if(foundF && foundS){
                return h+1;
            }
        }
    }
    console.log("heur ontop return");
    return h+1;
}
function heuristicAbove(first: string, second: string, stacks: string[][]){
    var foundF = false;
    var foundS = false;
    var h = 0;
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(stacks[i][j] == second){
                foundS = true;
                for(var k=j; k<stacks[i].length; k++){
                    if(stacks[i][k] == first){
                        return 0;
                    }
                }
            }
            if(stacks[i][j] == first){
                foundF = true;
                h = stacks[i].length-1-j;
            }
            if(foundF && foundS){
                return h+1;
            }
        }
    }
    return h+1;
}
function heuristicUnder(first: string, second: string, stacks: string[][]){
    return heuristicAbove(second,first,stacks);
}
function heuristicBeside(first: string, second: string, stacks: string[][]){
    var foundF = false;
    var foundS = false;
    var hF = 0;
    var hS = 0;
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(stacks[i][j] == second){
                foundS = true;
                if(!foundF && stacks.length-1>i){
                    for(var k=0; k<stacks[i+1].length; k++){
                        if(stacks[i+1][k] == first){
                            return 0;
                        }
                    }
                }
                hS = stacks[i].length-1-j;
            }
            if(stacks[i][j] == first){
                foundF = true;
                if(!foundS && stacks.length-1>i){
                    for(var k=0; k<stacks[i+1].length; k++){
                        if(stacks[i+1][k] == first){
                            return 0;
                        }
                    }
                }
                hF = stacks[i].length-1-j;
            }
            if(foundF && foundS){
                return Math.min(hF,hS)+1;
            }
        }
    }
    return Math.min(hF,hS)+1;
}
function heuristicLeft(first: string, second: string, stacks: string[][]){
    var foundF = false;
    var foundS = false;
    var hF = 0;
    var hS = 0;
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(stacks[i][j] == second){
                foundS = true;
                hS = stacks[i].length-1-j;
            }
            if(stacks[i][j] == first){
                foundF = true;
                if(!foundS){
                    for(var k=0; k<stacks[i+1].length; k++){
                        if(stacks.length-1>i && stacks[i+1][k] == first){
                            return 0;
                        }
                    }
                }
                hF = stacks[i].length-1-j;
            }
            if(foundF && foundS){
                return Math.min(hF,hS)+1;
            }
        }
    }
    return Math.min(hF,hS)+1;
}
function heuristicRight(first: string, second: string, stacks: string[][]){
    return heuristicLeft(second,first,stacks);
}
function heuristicHold(first: string, stacks: string[][]){
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(stacks[i][j] == first){
                return stacks[i].length-1-j;
            }
        }
    }
    return 0;
}

function heuristics(first: string, rel: string, second: string, stacks: string[][]){
    switch(rel){
        case "ontop":
            return heuristicOntop(first,second,stacks);
        case "inside":
            return heuristicOntop(first,second,stacks);
        case "above":
            return heuristicAbove(first,second,stacks);
        case "under":
            return heuristicUnder(first,second,stacks);
        case "beside":
            return heuristicBeside(first, second, stacks);
        case "leftof":
            return heuristicLeft(first, second, stacks);
        case "rightof":
            return heuristicRight(first, second, stacks);
        case "holding":
            return heuristicHold(first, stacks);
        default:
            console.log("heuristics no match");
            return 0;
    }
}

