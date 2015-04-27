class Planner

Planner.plan = (interpretations, currentState) ->
  
  plans = []
  plan = interpretations[0]
  movesToGoal = Astar(currentState, plan.intp[0], heuristicFunction,
     nextMoves, getNextState, satisfaction, equality)
  plan.plan = planInterpretation(movesToGoal)
  plans.push(plan)
  return plans
# This function adds text about what shrd does
planInterpretation = (moves) ->
  plan = []
  lastMove = ''
  for move in moves
    if not (move is lastMove)
      switch move
        when 'p'
          plan.push("Picking up item")
          lastMove = 'p'
        when 'd'
          plan.push("Dropping item")
          lastMove = 'd'
        when 'r'
          plan.push("Moving right")
          lastMove = 'r'
        when 'l'
          plan.push("Moving left")
          lastMove = 'l'
    plan.push(move)
  return plan

heuristicFunction = (start, goal) ->
  return 0

nextMoves = (state) ->
  moves = []
  
  nbrOfStacks = state.stacks.length
  cranePos = state.arm
  craneItem = state.holding

  # Crane movement
  if cranePos > 0
    moves.push("l")
  if cranePos < nbrOfStacks-1
    moves.push("r")

  # Crane items
  stack = state.stacks[cranePos]
  if craneItem is null
    if stack.length > 0
      moves.push("p")
  else
    # Check if drop is legit
    if stack.length > 0
      topItem = stack[stack.length-1]
      if isObjectDropValid(craneItem, topItem)
        moves.push("d")
    else
      # No items in stack
      moves.push("d")

  return moves

isObjectDropValid = (craneItem, topItem) ->
  # Cannot place large item on small item
  if not (topItem.size is "small" and craneItem.size is "large")
    # Cannot place any items on a ball
    if topItem.form is not "ball"

      # Cases for crane item

      # Box cannot contain plank or pyramid of same size
      if craneItem.form is "plank" or craneItem.form is "pyramid"
        return topItem.form is "box" and (topItem.size is craneItem.size)

      switch craneItem.form
        when "brick"
          return true
        when "ball"
          # Ball can only be in box or on floor(which is checked outside)
          return topItem.form is "box"
        when "table" 
          return true
        when "box" 
          # Box cannot contain box of same size
          if not (topItem.form is "box" and (topItem.size is craneItem.size))
            # Box cannot be supported by pyramid
            if not (topItem.form is "pyramid")
              # Small box cannot be supported by small brick
              if not (craneItem.size is "small" and topItem.size is "small" and topItem.form is "brick")
                return true 
          return false
  return false

getNextState = (state, move) ->
  stackCopy = []
  for s,i in state.stacks
    stackCopy.push([])
    for item in s
      stackCopy[i].push(item)
  newState =
    holding: state.holding
    arm:     state.arm
    stacks:  stackCopy
  if move is 'p'
    newState.holding = newState.stacks[newState.arm].pop()
  else if move is 'd'
    newState.stacks[newState.arm].push(newState.holding) 
    newState.holding = null
  else if move is 'r'
    newState.arm = state.arm + 1
  else if move is 'l'
    newState.arm = state.arm - 1
  return newState

equality = (state, goal) ->
  return state.arm == goal.arm && state.holding == goal.holding && "#{state.stacks}" is "#{goal.stacks}"

polarity = (polarity, b) ->
  return ((not polarity and not b) or (polarity and b))

leftOfCheck = (state, left, right) ->
  result = false
  for stack,i in state.stacks
    if right in stack
      if i is not 0 and left in state.stacks[i - 1]
        result = true
  return result

onTopCheck = (state, above, below) ->
  result = false
  if below is "floor" # Floor is a special case..
    for stack in state.stacks
      if above in stack
        return stack.indexOf(above) is 0
  for stack in state.stacks
    if below in stack
      if stack.indexOf(above) - stack.indexOf(below) is 1
        result = true
  return result

aboveCheck = (state, above, below) ->
  result = false
  for stack in state.stacks
    if below in stack
      if stack.indexOf(above) - stack.indexOf(below) >= 1
        result = true
  return result

satisfaction = (state, goalRep) ->
  result = true
  for goal in goalRep
    p = goal.pol
    c = false
    switch goal.rel
      when "holding"
        c = (goal.args[0] is state.holding)
      when "ontop", "inside"
        a = goal.args[0]
        b = goal.args[1]
        c = onTopCheck(state,a,b)
      when "leftof"
        a = goal.args[0]
        b = goal.args[1]
        c = leftOfCheck(state,a,b)
      when "rightof"
        a = goal.args[0]
        b = goal.args[1]
        c = leftOfCheck(state,b,a)
      when "beside"
        a = goal.args[0]
        b = goal.args[1]
        c = leftOfCheck(state,a,b) or leftOfCheck(state,b,a)
      when "above"
        a = goal.args[0]
        b = goal.args[1]
        c = aboveCheck(state,a,b)
      when "under"
        a = goal.args[0]
        b = goal.args[1]
        c = aboveCheck(state,b,a)
    result = result and polarity(p, c)

  return result

Planner.planToString = (res)->
  console.log "called planToString"
  return "tostring"

class Planner.Error
  constructor: (@msg) ->

  toString : ->
    return @msg