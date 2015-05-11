///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts"/>
///<reference path="../typings/chai/chai.d.ts"/>
///<reference path="../lib/collections.d.ts"/>

import chai = require('chai');
import A = require('../astar/AStar');
import C = require('../lib/collections'); 


module PlannerTest {
  class WorldState implements A.Astar.State {
    h: number;
    stacks: WorldObject[][];
    crane: WorldObject;
    
    match(goal: WorldState) {
      for (var i = 0; i < this.stacks.length; i++) {
        if (this.stacks[i].length == 0 && goal.stacks[i].length == 0) {
          continue;
        }
        if (this.stacks[i].length == 0 || goal.stacks[i].length == 0) {
          return false;
        }
        if (this.stacks[i].length != goal.stacks[i].length) {
          return false;
        }
        for (var j = 0; j < this.stacks[i].length; j++) {
           if (this.stacks[i][j].form != goal.stacks[i][j].form
               || this.stacks[i][j].size != goal.stacks[i][j].size
               || this.stacks[i][j].color != goal.stacks[i][j].color)
             return false;
        }
      }
      return true;
    }

    heuristic(goal: WorldState) {
      return 0;
    }
    
    expand() {
      var neighbours = new Array();
      if (this.crane == null) {
        for (var i = 0; i < this.stacks.length; i++) {
          if (this.stacks[i][0] == undefined)
            continue;
          var topObject : WorldObject = this.stacks[i][this.stacks[i].length - 1];
          
          var newWorld : WorldState = this.clone();
          newWorld.stacks[i].splice(this.stacks[i].length - 1, 1); 
          newWorld.crane = topObject;
          neighbours.push({costs: 1, state: newWorld});
        }
      } else {
        for (var i = 0; i < this.stacks.length; i++) {
          var newWorld : WorldState = this.clone();
          newWorld.stacks[i].push(this.crane);
          newWorld.crane = null;
          neighbours.push({costs: 1, state: newWorld});
        }
      }
      //console.log(neighbours);
      return neighbours;
    }

    toString() {
      var s : string = "";
      for (var i = 0; i < this.stacks.length; i++) {
        s += "[";
        for (var j = 0; j < this.stacks[i].length; j++) {
          s += this.stacks[i][j] + ", ";
        }
        s += "]";
      }
      s += "\n" + this.crane + "\n\n";
      return s; 
    }

    constructor(stacks: string[][], crane: string) {
      if( stacks == null && crane == null){
        this.crane = null;
        this.stacks = new Array<Array<WorldObject>>();
        this.h = 0;
      } else if (stacks != null){
        this.stacks = new Array<Array<WorldObject>>();
        for (var i = 0; i < stacks.length; i++) {
          this.stacks[i] = new Array<WorldObject>();
        }
        for (var i = 0; i < stacks.length; i++) {
          for (var j = 0; j < stacks[i].length; j++) {
            this.stacks[i].push(exampleWorldDescription.getValue(stacks[i][j]));
          }
        }
        if(crane != null){
          this.crane = exampleWorldDescription.getValue(crane);
        } else {
          this.crane = null;
        }
        this.h = 0;
      } else {
        throw new Error("You are stupid! You cant create a world without a stack but with a crane!");
      }
    }

    clone() : WorldState {
      var braveNewWorld : WorldState = new WorldState(null, null);
      for (var i = 0; i < this.stacks.length; i++) {
        braveNewWorld.stacks[i] = new Array<WorldObject>();
        for (var j = 0; j < this.stacks[i].length; j++) {
          braveNewWorld.stacks[i].push(this.stacks[i][j]);
        }
      }
      braveNewWorld.crane = this.crane;
      return braveNewWorld;
    }
  }

  class WorldObject {
  	form: String;
  	size: String;
   	color: String;
    name: String;
   	constructor(form: String, size: String, color: String, name: String) {
  	  this.form = form;
   	  this.size = size;
      this.color = color;
      this.name = name;
    }
    toString() {
      return this.name;
    }
  }
//[[a,b] [c] [] [d, e] []]
  var exampleWorldDescription = new C.collections.Dictionary<String, WorldObject>();
  exampleWorldDescription.setValue("a", new WorldObject("brick", "large", "green", "a"));
  exampleWorldDescription.setValue("b", new WorldObject("brick", "small", "white", "b"));
  exampleWorldDescription.setValue("c", new WorldObject("plank", "large", "red", "c"));
  exampleWorldDescription.setValue("d", new WorldObject("plank", "small", "green", "d"));
  exampleWorldDescription.setValue("e", new WorldObject("ball", "large", "white", "e"));
  exampleWorldDescription.setValue("f", new WorldObject("ball", "small", "black", "f"));
  exampleWorldDescription.setValue("g", new WorldObject("table", "large", "blue", "g"));
  exampleWorldDescription.setValue("h", new WorldObject("table", "small", "red", "h"));
  exampleWorldDescription.setValue("i", new WorldObject("pyramid", "large", "yellow", "i"));
  exampleWorldDescription.setValue("j", new WorldObject("pyramid", "small", "red", "j"));
  exampleWorldDescription.setValue("k", new WorldObject("box", "large", "yellow", "k"));
  exampleWorldDescription.setValue("l", new WorldObject("box", "large", "red", "l"));
  exampleWorldDescription.setValue("m", new WorldObject("box", "small", "blue", "m"));

  var exampleState = {
    "stacks": [["e"],["g","l"],[],["k","m","f"],[]],
    "holding":null,
    "arm":0
  };

  var exampleGoal = "inside(f, k)";
  var expect = chai.expect;

  function checkIfValid(state) {
    for (var i = 0; i < state.stacks.length; i++) {
      for (var j = 1; j < state.stacks[i].length; j++) {
        var currentObjectDescription = exampleWorldDescription.getValue(state.stacks[i][j]);
        var belowObjectDescription = exampleWorldDescription.getValue(state.stacks[i][j-1]);
        // balls must be in boxes or on the floor, otherwise they roll away
        if (currentObjectDescription.form == "ball"
            && belowObjectDescription.form != "box") 
          return false;

        // balls cannot support anything
        if (belowObjectDescription.form == "ball")
          return false;

        // small objects cannot support large objects
	if (currentObjectDescription.size == "large"
            && belowObjectDescription.size == "small")
          return false;

        // boxes cannot contain pyramids, planks or boxes of the same size
        if ((currentObjectDescription.form == "pyramid"
             || currentObjectDescription.form == "plank"
             || currentObjectDescription.form == "boxes")
            && belowObjectDescription.form == "box"
            && belowObjectDescription.size == currentObjectDescription.size)
          return false;

        // small boxes cannot be supported by small bricks or pyramids
        if (currentObjectDescription.form == "box"
            && currentObjectDescription.size == "small"
            && belowObjectDescription.size == "small"
            && (belowObjectDescription.form == "brick" || belowObjectDescription.form == "pyramid"))
          return false;

        // large boxes cannot be supported by large pyramids
        if (currentObjectDescription.form == "box"
            && currentObjectDescription.size == "large"
            && belowObjectDescription.form == "pyramid"
            && belowObjectDescription.size == "large")
          return false;
      }
    }
    return true;
  }

  describe('Planner', () => {

    describe('checkValidState', () => {
      it('returns true when the state is valid', (done) => {
        var example = {
          "stacks": [["e"],["g","l"],[],["k","m","f"],[]],
          "holding":null,
          "arm":0
        };
        var valid = checkIfValid(example);
        expect(valid).to.equal(true);
        done();
      });
      it('return false when the state is invalid', (done) => {
        var example = {
          "stacks": [["e"],["g","l"],["e","f"],["k","m","f"],[]],
          "holding":null,
          "arm":0
        };
        var valid = checkIfValid(example);
        expect(valid).to.equal(false);
        done();
      });
    });
    
    describe('AStar in the Planner', () => {
      it('test if a-star runs', (done) => {
        var nothing: string = null;
        var state: WorldState = new WorldState([new Array<string>(),["g","l"],["e","f"],["a"],new Array<string>()], null);
        var goal: WorldState = new WorldState([new Array<string>(),["l","g"],["f","e"],["a"],new Array<string>()], null);
        var solution = A.Astar.search(state, null, goal);

        for (var i = 0; i < solution.path.length; i++) {
          console.log(solution.path[i].toString());
        }
        console.log(solution);
        done()
      })
    }


)
  });
}
