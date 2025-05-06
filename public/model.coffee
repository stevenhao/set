root = exports ? this

root.Model = do ->
  gameOver = null
  deck = null
  cards = null
  selected = null
  startTime = null
  endTime = null
  phase = null
  seed = null

  getClockTime = ->
    seconds = Math.floor((endTime - startTime) / 1000)
    return pad2(Math.floor(seconds / 60)) + ':' + pad2(seconds % 60)

  deselectAll = -> selected.slice().forEach(deselect)

  newGame = ->
    deck = variant.makeDeck(seed)
    cards = variant.deal(deck)
    selected = []
    startTime = Date.now()
    phase = 'normal'

    View.clear()
    View.addCardsFancy(cards)
    View.layoutCards()
    View.setLabels(phase)

  restart = ->
    seed = (rand(0x1000000)).toString(16)
    View.showSeed(seed)
    if phase == 'gameover'
      View.gameOverDone()
      setTimeout(newGame, 1000)
    else
      newGame()

  loadGame = ->
    seed = if initialSeed? then initialSeed else null
    gameid = variant.name
    print 'loading', gameid
    if typeof(Storage) isnt 'undefined' and localStorage.getItem(gameid)?
      game = JSON.parse(localStorage.getItem(gameid))
      if (game? and game.cards? and game.deck? and game.startTime? and game.selected? and game.phase?)
        if seed != null and seed != game.seed
          return false
        seed = game.seed
        cards = game.cards
        deck = game.deck
        startTime = game.startTime
        selected = game.selected
        phase = game.phase
        if phase == 'gameover'
          if true # do we show the most recent game?
            return false
          else # in the future, this should be a setting
            if game.endTime?           
              endTime = game.endTime
              View.gameOver(getClockTime())
            else
              return false
        else
          View.clear()
          View.addCards(cards)
          View.layoutCards()
          View.setLabels(phase)
          View.showSeed(seed)
          return true
    return false

  saveGame = ->
    gameid = variant.name
    if typeof(Storage) isnt 'undefined'
      gameString = JSON.stringify {
        cards: cards, deck: deck, startTime: startTime, phase: phase, seed: seed,
        selected: [], # do we want to preserve selected cards?
        endTime: endTime, # may be null
      }
      localStorage.setItem(gameid, gameString)

  isSet = (indices) ->
    variant.isSet(indices.map (i) -> cards[i])

  checkSet = -> isSet(selected)

  clearSet = ->
    cur = selected.slice()
    deselectAll()
    cur.sort (a, b) -> b - a
    cur.forEach (i) ->
      if cards.length <= variant.tableSize
        if phase == 'normal'
          cards[i] = deck.pop()
          if deck.length == 0
            phase = 'endgame'
            View.setLabels(phase)
        else # endgame
          cards[i] = null
        View.replaceCard(i, cards[i])
      else
        cards.delete(cards[i])
        View.deleteCard(i)
    if (cards.every (c) -> !(c?))
      phase = 'gameover'
      endTime = Date.now()
      View.setLabels(phase)
      View.gameOver(getClockTime())

  noSet = ->
    cur = selected.slice()
    if isSet(cur)
      cur = variant.findNextSet(cards, cur)
    else
      cur = variant.findSet(cards)

    if cur == null # there is no set
      if phase == 'normal'
        add = Math.min(variant.tableIncrement, deck.length)
        newCards = deck.slice(deck.length - add)
        deck = deck.slice(0, deck.length - add)
        if deck.length == 0
          phase = 'endgame'
          View.setLabels(phase)
        cards = cards.concat(newCards)
        View.addCards(newCards)
      else if phase == 'endgame' # game over
        phase = 'gameover'
        endTime = Date.now()
        View.setLabels(phase)
        View.gameOver(getClockTime())
    else # highlight the set
      deselectAll()
      cur.forEach(select)

  hint = ->
    target = variant.findSet(cards)
    if target == null
      noSet()
    else
      if not (selected.every (i) -> i in target)
        deselectAll()
      newTarget = (target.filter (i) -> i not in selected)
      if newTarget.length > 0
        select(newTarget[0])
      else # selected cards form a set already
        #do nothing

  assistSet = ->
    for i in range(cards.length)
      if i not in selected
        cur = selected.concat([i])
        if isSet(cur)
          select(i)

  select = (i) ->
    if cards[i]?
      selected.push(i)
      View.select(i)

  deselect = (i) ->
    if cards[i]?
      selected.delete(i)
      View.deselect(i)

  return {
    newGame: newGame
    restart: restart
    loadGame: loadGame
    saveGame: saveGame
    checkSet: checkSet
    clearSet: clearSet
    noSet: noSet
    hint: hint
    assistSet: assistSet
    select: select
    deselect: deselect

    getCardsLength: -> cards.length
    isCardSelected: (i) -> i in selected
  }

