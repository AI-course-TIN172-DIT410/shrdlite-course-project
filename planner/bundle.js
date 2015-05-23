(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jslint node: true, esnext: true */
"use strict";

function Set(tostring) {
    this.tostring = tostring;
    this.store = {};
}

Set.prototype.add = function(elem) {
    this.store[this.tostring(elem)] = true;
};

Set.prototype.has = function(elem) {
    return this.tostring(elem) in this.store;
};

Set.prototype.size = function(elem) {
    return Object.keys(this.store).length;
};


function Map(tostring) {
    this.tostring = tostring;
    this.store = {};
}

Map.prototype.get = function(key, def) {
    var ret = this.store[this.tostring(key)];
    if (ret === undefined) {
        return def;
    } else {
        return ret;
    }
};

Map.prototype.set = function(key, val) {
    this.store[this.tostring(key)] = val;
};


var Heap = require("./binary-heap-hash/binary-heap-hash");


// A-star algorithm. Should have optimal complexity
// Terminates if the graph is finite or has a solution
// Arguments:
// h: heuristic function from one node to another
// cost: cost from one node to an adjacent node
// neighbours: returns the neighbours from any given node
// start, goal: obvious
// Returns list of an optimal path or undefined if there is none.
module.exports = function (G, start) {
    // Frontier, heap map sorted by lowest approximated distance
    var front = new Heap(G.state_hash);
    // Nodes that are already completely evaluated to prevent reevaluation
    // var evaluated = new Set([], Object.equals, G.state_hash);
    var evaluated = new Set(G.state_hash);
    // Map of backlinks of best path.
    var previous = new Map(G.state_hash);
    // Map of actual distances from the start node;
    var d = new Map(G.state_hash);

    // Start exploring
    d.set(start, 0);
    front.add(start, G.h(start));

    // When there are elements in the frontier, get the one with the lowest heuristic distance
    while (front.length > 0) {
        var elem = front.pop().obj;
        evaluated.add(elem);

        // Finished, follow backlinks to reconstruct path.
        if (G.isgoal(elem)) {
            var ret = [];
            var bs = elem;
            while (G.state_hash(bs) != G.state_hash(start)) {
                ret.unshift(bs);
                bs = previous.get(bs);
            }
            ret.unshift(bs);
            console.log('Nodes evaluated: ' + evaluated.size());
            console.log('Goal steps: ' + (ret.length-1));
            return ret;
        }

        // Check every neighbour and see if this path improves the distance to it.
        for (var neigh of G.neighbours(elem)) {
            if (evaluated.has(neigh)) {
                continue;
            }

            var old_distance = d.get(neigh, Infinity);
            var new_distance = d.get(elem) + G.cost(elem, neigh);
            if (new_distance < old_distance) {
                d.set(neigh, new_distance);
                previous.set(neigh, elem);

                // Update front
                var new_approx = new_distance + G.h(neigh);
                if (!front.changePriority(neigh, new_approx)) {
                    front.add(neigh, new_approx);
                }
            }
        }
    }
    console.log('Nodes evaluated: ' + evaluated.size());
    return undefined;
};

},{"./binary-heap-hash/binary-heap-hash":2}],2:[function(require,module,exports){
/*jslint node: true */
"use strict";


var Heap = function (hashf) {
    this.store = [];
    this.hash  = {};
    this.length = 0;
    this.hashf = hashf || String;
};

Heap.prototype.peek = function () {
    return this.store[0];
};

Heap.prototype.pop = function () {
    if (this.length === 0) {
        return undefined;
    }
    var elem = this.store[0];
    delete this.hash[this.hashf(elem.obj)];
    this.length -= 1;

    var lastelem = this.store.pop();
    this.store[0] = lastelem;
    this.bubbleDown(1);
    return elem;
};


Heap.prototype.setElem = function (elem, pos) {
    this.store[pos-1] = elem;
    this.hash[this.hashf(elem.obj)] = pos;
};

Heap.prototype.add = function (obj, prio) {
    this.length += 1;
    this.store.push({prio: prio, obj: obj});
    this.bubbleUp(this.length);
};

Heap.prototype.changePriority = function (obj, newprio) {
    var pos = this.hash[this.hashf(obj)];
    if (pos === undefined) {
        return false;
    } else {
        var elem = this.store[pos-1];
        var oldprio = elem.prio;
        elem.prio = newprio;
        if (newprio > oldprio) {
            this.bubbleDown(pos);
        } else if (newprio < oldprio) {
            this.bubbleUp(pos);
        }
        return true;
    }
};


Heap.prototype.bubbleUp = function (pos) {
    var elem = this.store[pos-1];

    while (pos > 1) {
        var parent = Math.floor(pos/2);
        var parent_elem = this.store[parent-1];

        if (elem.prio < parent_elem.prio) {
            this.setElem(parent_elem, pos);
            pos = parent;
        } else {
            break;
        }
    }
    this.setElem(elem, pos);
};

Heap.prototype.bubbleDown = function (pos) {
    var elem = this.store[pos-1];

    while (true) {
        var left, right, posb, child;
        var posl = pos * 2;
        var posr = posl + 1;

        if (posl > this.length) {
            break;
        }

        left = this.store[posl-1];
        if (posr > this.length) {
            posb = posl;
            child = left;
        } else {
            right = this.store[posr-1];
            if (left.prio > right.prio) {
                posb = posr;
                child = right;
            } else {
                posb = posl;
                child = left;
            }
        }
        if (elem.prio > child.prio) {
            this.setElem(child, pos);
            pos = posb;
        } else {
            break;
        }
    }
    this.setElem(elem, pos);
};


module.exports = Heap;

},{}],3:[function(require,module,exports){
/*jslint node: true, esnext: true */
"use strict";

/// Reinventing a decent standard library /////////////////////////////////////////////////////////

Array.prototype.contains = function(e) {
    return this.indexOf(e) !== -1;
};

Array.prototype.intersects = function(other) {
    for (var elem of this) {
        if (other.indexOf(elem) !== -1) {
            return true;
        }
    }
    return false;
};

Array.prototype.last = function() {
    return this[this.length-1];
};

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

Array.prototype.flatten = function() {
    var ret = [];
    for (var sub of this) {
        for (var nest of sub) {
            ret.push(nest);
        }
    }
    return ret;
};

/// A-star required prototype function  ///////////////////////////////////////////////////////////

var SearchGraph = function (currentState, pddl) {
    this.objects = currentState.objects;
    this.startNode = { stacks: currentState.stacks,
                       arms: currentState.arms
                     };
    this.pddl = pddl;
};

// If top can be placed on bottom
// Forms: Bricks, planks, balls, pyramids, boxes and tables.
// Colors: Red, black, blue, green, yellow, white.
// Sizes: Large, small.
SearchGraph.prototype.can_place = function(top, stack) {
    if (stack.length === 0) {
        return true;
    }
    var objArm = this.objects[top];
    var objTop = this.objects[stack.last()];
    // Balls must be in boxes or on the floor, otherwise they roll away.
    // Balls cannot support anything.
    // Small objects cannot support large objects.
    // Boxes cannot contain pyramids, planks or boxes of the same size.
    // Small boxes cannot be supported by small bricks or pyramids.
    // Large boxes cannot be supported by large pyramids.
    return !(objTop.form == "ball" ||
        (objArm.form == "ball"  && objTop.form != "box") ||
        (objArm.size == "large" && objTop.size == "small") ||
        (objTop.form == "box" && ["pyramid", "plank", "box"].contains(objArm.form) &&  objArm.size == objTop.size) ||
        (objArm.form == "box" && objArm.size == "small" && objTop.size == "small" && ["brick", "pyramid"].contains(objTop.form)) ||
        (objArm.form == "box" && objArm.size == "large" && objArm.form == "pyramid" && objArm.size == "large")
    );
};

function cartesian(lst) {
    function addTo(curr, args) {
        var i, copy;
        var rest = args.slice(1);
        var last = !rest.length;
        var result = [];

        for (i = 0; i < args[0].length; i++) {
            copy = curr.slice();
            copy.push(args[0][i]);
            if (last) {
                result.push(copy);
            } else {
                result = result.concat(addTo(copy, rest));
            }
        }

        return result;
    }
    return addTo([], Array.prototype.slice.call(lst));
}

function collision(arr) {
    var look = {};
    for (var e of arr) {
        if (typeof e == 'string') {
            continue;
        }
        if (e in look) {
            return true;
        }
        look[e] = true;
    }
    return false;
}

SearchGraph.prototype.internal_neighbours =  function(state) {
    var combs = [];

    // Things that depend only on the arm itself
    for (var arm of state.arms) {
        var actions = ['-'];
        if (arm.holding === null) {
            if (state.stacks[arm.pos].length > 0) {
              actions.push('p');
            }
        } else {
            if (this.can_place(arm.holding, state.stacks[arm.pos])) {
                actions.push('d');
            }
        }
        if (arm.pos !== 0) {
            actions.push(-1);
        }
        if (arm.pos !== state.stacks.length-1) {
            actions.push(1);
        }
        combs.push(actions);
    }
    var candidates = cartesian(combs);


    // Invalidating dependent actions
    var valid = [];
    outer: for (var cand of candidates) {
        // Candidate arm posisiton
        var next_armpos = new Array(cand.length);
        for (var i = 0; i < cand.length; i++) {
            if (typeof(cand[i]) == 'number') {
                next_armpos[i] = cand[i] + state.arms[i].pos;
            } else {
                next_armpos[i] = state.arms[i].pos;
            }
        }

        // No doing nothing
        if (cand.every(function(x) { return x == '-';})) {
            continue;
        }

        // Never arms on the same spot
        if (collision(next_armpos)) {
            continue;
        }

        // No crossing other arms
        // permutations :)
        for (var i=0; i<next_armpos.length; i++) {
            for (var j=0; j<next_armpos.length; j++) {
                if (next_armpos[i] > next_armpos[j] && state.arms[i].pos < state.arms[j].pos) {
                    continue outer;
                }
            }
        }

        valid.push(cand);
    }
    return valid;
};



function clone(obj) {
    if(obj === null || typeof(obj) !== 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}


// Move left or right, or put up or down
SearchGraph.prototype.neighbours = function* (state) {
    var internal = this.internal_neighbours(state);


    for (var outer of internal) {
        var new_state = clone(state);
        //injecting backlink
        new_state.backlink = [];
        for (var i=0; i < outer.length; i++) {
            switch (outer[i]) {
                case -1: new_state.arms[i].pos -= 1;
                    new_state.backlink[i] = 'l';
                    break;
                case +1: new_state.arms[i].pos += 1;
                    new_state.backlink[i] = 'r';
                    break;
                case 'p':
                    new_state.arms[i].holding = new_state.stacks[new_state.arms[i].pos].pop();
                    new_state.backlink[i] = 'p';
                    break;
                case 'd':
                    new_state.stacks[new_state.arms[i].pos].push(new_state.arms[i].holding);
                    new_state.arms[i].holding = null;
                    new_state.backlink[i] = 'd';
                    break;
                default:
                    new_state.backlink[i] = '-';
                    break; // This captures the '-'
            }
        }
        yield new_state;
    }
};


SearchGraph.prototype.cost = function(from, to) {
    return 1;
};



// If a constraint is satisfied for a given object
SearchGraph.prototype.binds = function(constr, obj) {
    if (typeof constr == 'string') {
        return constr == obj;
    }
    var desc = this.objects[obj];
    return (constr.form  === null || constr.form  == desc.form) &&
           (constr.size  === null || constr.size  == desc.size) &&
           (constr.color === null || constr.color == desc.color);
};

// If one PDDL rule is satisfied for a state
SearchGraph.prototype.rule_satisfied = function(rule, state) {
    // Find the object
    var i = 0;
    var j = -1;
    for (var stack of state.stacks) {
        j = stack.indexOf(rule.item);
        if (j !== -1) {
            break;
        }
        i++;
    }

    switch (rule.rel) {
        case "holding":
            var res = state.arms.some(function(arm) {
                return arm.holding === rule.item;
            });
            return res;

        case "floor":
            return j === 0;

        case "ontop":
            return j > 0 && rule.oneof.contains(stack[j-1]);

        case "beside":
            if (j === -1) {
                return false;
            }
            return  (i !== 0 && rule.oneof.intersects(state.stacks[i-1])) ||
                    (i !== state.stacks.length && rule.oneof.intersects(state.stacks[i+1]));

        case "left":
            return (j !== -1) && state.stacks.slice(i+1).flatten().intersects(rule.oneof);

        case "right":
            return (j !== -1) && state.stacks.slice(i-1).flatten().intersects(rule.oneof);

        default:
            throw "ERRORRRR";
    }

};


// Check if all PDDL goals are satisfied.
SearchGraph.prototype.isgoal = function(state) {
    for (var rule of this.pddl) {
        if (!this.rule_satisfied(rule, state)) {
            return false;
        }
    }
    return true;
};



SearchGraph.prototype.closest_legal_putdown = function(obj, state) {
    var dist = state.stacks.length;
    var i = 0;
    for (var stack of state.stacks) {
        if (this.can_place(obj, state.stacks[i])) {
            dist = Math.min(dist, Math.abs(i-state.arm));
        }
        i++;
    }
    return dist;
};

function* indices (start, min, max) {
    yield start;
    var i = 0;
    do {
        i++;
        if (start+i < max) {
            yield start+i;
        }
        if (start-i >= min) {
            yield start-i;
        }
    } while (start+i < max || start-i >= min);
}

// The distance to the nearest floor from the current arm position.
function closest_floor(armpos, state) {
    var candidate = 10000;
    for (var i of indices(armpos, 0, state.stacks.length)) {
        if (state.stacks[i].length === 0) {
            candidate = Math.min(candidate, Math.abs(armpos - i));
        } else {
            candidate = Math.min(candidate, Math.abs(armpos - i)*2 + 4*state.stacks[i].length);
        }
    }
    // 6 instead moving away objects from the closest stack
    // return Math.min(candidate, 6);
    return candidate;
}

// Cost to put an element on top of obj
function putOnTopOf(obj, state) {
    // Find the object
    var i = 0;
    var j = -1;
    for (var stack of state.stacks) {
        j = stack.indexOf(obj);
        if (j !== -1) {
            break;
        }
        i++;
    }
    if (j === -1) {
        return 1; // Arm is holding it, can just put it down (maybe :)
    }
    // Move the arm to the stack, put it down. (Plus remove all above objects if needed)
    return Math.abs(state.arm - i) + 1 + 4*(stack.length-j);
}

SearchGraph.prototype.h = function (state) {
    return 0;
};
/*
SearchGraph.prototype.h = function (state) {
    // return 0;
    var estimate = 0;
    for (var rule of this.pddl) {
        if (this.rule_satisfied(rule, state)) {
            continue;
        }
        // Find the object
        var i = 0;
        var j = -1;
        for (var stack of state.stacks) {
            j = stack.indexOf(rule.item);
            if (j !== -1) {
                break;
            }
            i++;
        }
        switch (rule.rel) {
            case "holding":
                // Move the arm to object, and pick up. Plus remove elements above (4 each naive estimate)
                estimate += Math.abs(state.arm - i) + 1 + 4*(stack.length-j);
                break;

            case "floor":
                // 10 theoretically smallest to rearange stack instead of finding closest free floor
                if (state.holding == rule.item) {
                    // Find closest floor and put down
                    estimate += closest_floor(state.arm, state) + 1;
                } else {
                    // Move to object, take, move to closest floor, put down
                    estimate += Math.abs(state.arm - i) + 2 +  closest_floor(i, state);
                }
                break;

            case "ontop":
                var least = 100000;
                for (var obj of rule.oneof) {
                    least = Math.min(least, putOnTopOf(obj,state));
                }
                if (state.holding != rule.item) {
                    estimate += Math.abs(state.arm - i) + 1; // Go pick it up.
                }
                estimate += least;
                break;

            // TODO
            case "beside":
                estimate += 1;
                break;
            //     if (j === -1) {
            //         return false;
            //     }
            //     return  (i !== 0 && rule.oneof.intersects(state.stacks[i-1])) ||
            //             (i !== state.stacks.length && rule.oneof.intersects(state.stacks[i+1]));

            case "left":
                estimate += 1;
                break;
            //     return (j !== -1) && state.stacks.slice(i+1).flatten().intersects(rule.oneof);

            case "right":
                estimate += 1;
                break;
            //     return (j !== -1) && state.stacks.slice(i-1).flatten().intersects(rule.oneof);

            default:
                throw "ERRORRRR";
        }

    }
    return estimate;
};
*/

SearchGraph.prototype.state_hash = function(state) {
    return JSON.stringify([state.stacks, state.arms]);
};

//TODO
SearchGraph.prototype.isPossible = function(state) {
    var elems = state.stacks.flatten();
    if (state.holding !== null) {
        elems.push(state.holding);
    }

    //Check that each element exists, and that the rule is possible.
    for (var rule of this.pddl) {
        if (!elems.contains(rule.item)) {
            return false;
        }
        if (rule.rel == "holding" || rule.rel == "floor") {
            continue;
        }
        for (var sub of rule.oneof) {
            if (!elems.contains(sub)) {
                return false;
            }
            if (rule.rel == "ontop" && !this.can_place(rule.item, [sub])){
                return false;
            }
        }
    }
    return true;
};


// d drop
// p pick up
// l left
// r right
function backlink(path) {
    var link = [];
    for (var i = 1; i < path.length; i++) {
        link.push(path[i].backlink);
    }

    return link;
}

var astar = require("./astar.js");

module.exports = function(currentState, pddl) {
    var g = new SearchGraph(currentState, pddl);
    if (!g.isPossible(g.startNode)) {
        return undefined;
    }
    var res = astar(g, g.startNode);
    if (res === undefined) {
        return undefined;
    } else {
        return backlink(res);
    }
};

},{"./astar.js":1}],4:[function(require,module,exports){
window.plannerCore = require('./planner-core.js');

},{"./planner-core.js":3}]},{},[4]);
