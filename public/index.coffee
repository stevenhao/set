root = exports ? this

root.Settings = {
  fastMode: true
  autoComplete: true
  theme: 'dark'
  gestureTimeout: 1000
  keyboardTimeout: 2000
  animationTime: 400
}

root.variant = Variants.set

root.Controller = do ->
  ## Game Controller
  start = -> 
    if not Model.loadGame()
      Model.newGame()
  checkSet = -> 
    if Model.checkSet()
      Model.clearSet()
      Model.saveGame()
  noSet = -> 
    Model.noSet()
    Model.saveGame()
  restart = -> 
    Model.restart()
    # do not save game until we actually do something nontrivial

  ##  Gesture controller
  currentGesture = null

  beginGesture = (action) ->
    currentGesture = {
      action: action
      expire: Date.now() + Settings.gestureTimeout
    }
    return currentGesture

  renewCurrentGesture = ->
    if currentGesture?
      currentGesture.expire = Date.now() + Settings.gestureTimeout

  endCurrentGesture = ->
    currentGesture = null

  releaseHold = ->
    if currentGesture?
      endCurrentGesture()
      if Settings.fastMode
        checkSet()

  hitCard = (i) ->
    action = if Model.isCardSelected(i) then 'deselect' else 'select'
    if !(currentGesture?)
      beginGesture(action)
    if action == currentGesture.action
      if action == 'select'
        Model.select(i)
        if Settings.autoComplete
          Model.assistSet()
      else
        Model.deselect(i)
    renewCurrentGesture()

  pressedKeys = {}
  pressKey = (keyCode, isShiftPressed, isRepeat) ->
    if keyCode in ['Space', 'Enter']
      checkSet()
    else if isShiftPressed
      if isRepeat then return
      if keyCode == 'KeyL'
        toggleTheme()
      else if keyCode == 'KeyR'
        restart()
      else if keyCode == 'KeyN'
        noSet()
      else if keyCode == 'KeyF'
        toggleFullScreen()
      else if keyCode == 'KeyX'
        noSet()
        checkSet()
    else
      keyboard = ['KeyQ','KeyA','KeyZ','KeyW','KeyS','KeyX','KeyE','KeyD','KeyC','KeyR','KeyF','KeyV','KeyT','KeyG','KeyB','KeyY','KeyH','KeyN','KeyU','KeyJ','KeyM']
      if 0 <= keyboard.indexOf(keyCode) < Model.getCardsLength()
        hitCard(keyboard.indexOf(keyCode))
        pressedKeys[keyCode] = {expire: Date.now() + Settings.keyboardTimeout}

  releaseKey = (keyCode) ->
    if pressedKeys[keyCode]?
      delete pressedKeys[keyCode]
    if Object.keys(pressedKeys).length == 0
      releaseHold()

  do expireEvents = ->
    if currentGesture? and currentGesture.expire < Date.now()
      print 'expiring', currentGesture
      endCurrentGesture()
    for keyCode, keyObj of pressedKeys
      if keyObj.expire < Date.now()
        print 'expiring', keyCode, keyObj
        delete pressedKeys[keyCode]
    setTimeout(expireEvents, 5000)

  ## Display controller
  toggleTheme = ->
    if Settings.theme == 'dark'
      Settings.theme = 'light'
    else
      Settings.theme = 'dark'
    View.setTheme(Settings.theme)

  toggleFullScreen = ->
    View.toggleFullScreen()

  return {
    start: start
    restart: restart
    checkSet: checkSet
    noSet: noSet
    hitCard: hitCard
    pressKey: pressKey
    releaseKey: releaseKey
    releaseMouse: releaseHold
    toggleTheme: toggleTheme
    toggleFullScreen: toggleFullScreen
  }

root.View = do ->
  $cards = []
  $window = $(window)
  $body = $(document.body)
  $display = $('#display')
  $clock = $('#clock')
  $restartBig = $('#restartBig')
  $restart = $('#restart')
  $noSet = $('#no-set')
  $noSetText = $('#no-set-text')
  $checkSet = $('#check-set')
  $toggleTheme = $('#light-dark')

  ## decorate functions to wait until animation completes
  ## (@w fn)(...) behaves like fn(...)
  waitUntil = Date.now()
  lockFor = (time) ->
    time += Date.now()
    if time > waitUntil
      waitUntil = time

  @w = (fn) ->
    ->
      if Date.now() > waitUntil
        fn.apply(this, arguments)
      else
        print 'locked for animation'

  ## Event listeners
  do registerListeners = ->
    $toggleTheme.on('click', Controller.toggleTheme)
    $restart.on('click', @w Controller.restart)
    $restartBig.on('click', @w Controller.restart)
    $checkSet.on('click', @w Controller.checkSet)
    $noSet.on('click', @w Controller.noSet)

    $window.on 'orientationchange resize', ->
      layoutCards()
      $body.css('display', 'table').height()
      $body.css('display', 'block')

    ## Gesture input listeners
    $body.on 'keydown', @w (evt) ->
      print 'this', this, 'evt', evt
      if evt.originalEvent.metaKey
        return true
      else
        evt.preventDefault()
        Controller.pressKey(evt.originalEvent.code, evt.shiftKey, evt.originalEvent.repeat)
        return false

    hitXY = @w (x, y, hitBox) ->
      $cards.forEach ($card, i) ->
        rect = $card[0].getBoundingClientRect()
        [cx, cy] = [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2]
        [w, h] = [rect.right - rect.left, rect.bottom - rect.top]
        if (cx - w / 2 * hitBox <= x and x <= cx + w / 2 * hitBox and
            cy - h / 2 * hitBox <= y and y <= cy + h / 2 * hitBox)
          Controller.hitCard(i)

    $body.on 'mousedown', (evt) ->
      if evt.buttons == 1
        hitXY(evt.clientX, evt.clientY, 1)

    $body.on 'touchstart', (evt) ->
      evt.originalEvent.changedTouches.forEach (touch) ->
        hitXY(touch.pageX, touch.pageY, 1)

    $body.on 'mousemove', (evt) ->
      if evt.buttons == 1
        hitXY(evt.clientX, evt.clientY, .9)

    $body.on 'touchmove', (evt) ->
      evt.originalEvent.changedTouches.forEach (touch) ->
        hitXY(touch.pageX, touch.pageY, .9)

    ## End-of-gesture listeners
    $body.on 'keyup', (evt) ->
      Controller.releaseKey(evt.originalEvent.code)

    $body.on 'mouseup', (evt) ->
      Controller.releaseMouse()

    $body.on 'touchend', (evt) ->
      Controller.releaseMouse()

  ## DOM
  setLabels = (phase) ->
    if phase == 'gameover'
      $noSet.fadeOut()
      $checkSet.fadeOut()
    else
      $noSet.fadeIn()
      $checkSet.fadeIn()
      if phase == 'normal'
        $noSetText.html('No Set')
      else if phase == 'endgame'
        $noSetText.html('Done!')
    
  layoutCards = ->
    rows = 3
    cols = Math.ceil($cards.length / rows)
    unit = Math.min(
      $display.width() / (cols * 2 + (cols + 1) * .15),
      $display.height() / (rows * 1 + (rows + 1) * .15))

    w = unit * 2
    h = unit
    range(cols).forEach (c) ->
      range(rows).forEach (r) ->
        i = r + rows * c
        if i < $cards.length
          marginw = ($display.width() - (cols * unit * 2)) / (cols + 1)
          marginh = ($display.height() - (rows * unit)) / (rows + 1)
          $cards[i].css {
            position: 'absolute'
            left: marginw * (c + 1) + w * c
            top: marginh * (r + 1) + h * r
            width: w
            height: h
          }

  addCard = (cardModel) ->
    $card = $('<div>').addClass('card')
    if cardModel?
      makeSVG(cardModel).appendTo($card)
    $card.appendTo($display)
    $card.css({'display': 'none'})
    $card.fadeIn(Settings.animationTime)
    $cards.push($card)

  ## Animation

  toggleFullScreen = ->
    doc = window.document
    body = $body[0]
    requestFullScreen = body.requestFullscreen ? body.mozRequestFullScreen ? body.webkitRequestFullScreen
    cancelFullScreen = doc.exitFullscreen ? doc.mozCancelFullScreen ? doc.webkitExitFullscreen
    if not doc.fullscreenElement and not doc.mozFullScreenElement and not doc.webkitFullscreenElement
      requestFullScreen.call(body)
    else 
      cancelFullScreen.call(doc)

  replaceCard = (i, newCardModel, time) ->
    time ?= Settings.animationTime
    $card = $cards[i]
    $svg = $('svg', $card)
    if newCardModel?
      $('.shape', $svg).fadeOut(time)
      setTimeout ->
        $card.empty()
        makeSVG(newCardModel).appendTo($card)
      , time
    else
      $svg.fadeOut(time)
      setTimeout ->
        $card.empty()
      , time
    print 'replaceCard', time
    lockFor(time)

  addCards = (newCardModels) ->
    # TODO: animate the transition
    newCardModels.forEach (addCard)
    layoutCards()

  deleteCard = (i) ->
    if $cards[i]?
      $cards[i].remove()
    $cards.delete($cards[i])
    # TODO: animate the transition
    layoutCards()

  showClock = (timeString, time) ->
    $clock.html(timeString)
    $clock.fadeIn(time)
  
  rewindClock = (time) ->
    s = $clock.html()
    ctime = 0
    step = time / 40
    fiddle = (str) -> 
      range(str.length).map(
        (i) -> str[i]
      ).map(
        (ch) -> if ch == ':' then ':' else '0123456789'[rand(10)]
      ).join('')

    range(30).forEach (i) ->
      setTimeout ->
        s = fiddle(s)
        $clock.html(s)
      , ctime
      ctime += step
    [9..1].forEach (i) ->
      setTimeout ->
        pattern = new RegExp('' + i, "g")
        s = s.replace(pattern, i - 1)
        $clock.html(s)
      , ctime
      ctime += step
    $clock.fadeOut(1100)

  gameOver = (timeString) ->
    print 'game over.'
    lockFor(3500)
    rrange($cards.length).forEach (i) ->
      replaceCard(i, null, 1000)
    setTimeout ->
      showClock(timeString, 2000)
    , 500
    setTimeout ->
      $restartBig.fadeIn(2000)
    , 1500

  gameOverDone = ->
    lockFor(800)
    $restartBig.fadeOut(400)
    setTimeout ->
      rewindClock(700)
    , 100

  clear = ->
    $cards.forEach ($card) -> $card.remove()
    $cards = []

  return {
    select: (i) -> 
      $cards[i].addClass('selected')
    deselect: (i) -> $cards[i].removeClass('selected')
    layoutCards: layoutCards
    setLabels: setLabels
    gameOver: gameOver
    gameOverDone: gameOverDone
    clear: clear

    setTheme: (theme) -> $body.removeClass('light dark').addClass(theme)
    toggleFullScreen: toggleFullScreen
    replaceCard: replaceCard
    addCards: addCards
    deleteCard: deleteCard
  }

root.Model = do ->
  gameOver = null
  deck = null
  cards = null
  selected = null
  startTime = null
  phase = null

  getClockTime = ->
    diff = new Date(Date.now() - startTime)
    pad2(diff.getMinutes())+':'+pad2(diff.getSeconds())

  deselectAll = -> selected.slice().forEach(deselect)

  newGame = ->
    deck = variant.makeDeck()
    cards = variant.deal(deck)
    selected = []
    startTime = Date.now()
    phase = 'normal'

    View.clear()
    View.addCards(cards)
    View.layoutCards()
    View.setLabels(phase)

  restart = ->
    if phase == 'gameover'
      View.gameOverDone()
      setTimeout(newGame, 1000)
    else
      newGame()

  loadGame = ->
    gameid = variant.name
    print 'loading', gameid
    if typeof(Storage) isnt 'undefined' and localStorage.getItem(gameid)?
      game = JSON.parse(localStorage.getItem(gameid))
      if game?
        cards = game.cards
        deck = game.deck
        startTime = game.startTime
        selected = game.selected
        phase = game.phase
        View.clear()
        View.addCards(cards)
        View.layoutCards()
        View.setLabels(phase)
        print 'phase', phase
        if phase == 'gameover'
          View.gameOver(getClockTime())
        return true
    return false

  saveGame = ->
    gameid = variant.name
    if typeof(Storage) isnt 'undefined'
      gameString = JSON.stringify {
        cards: cards, deck: deck, startTime: startTime, phase: phase
        selected: [] # do we want to preserve selected cards?
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
        View.setLabels(phase)
        View.gameOver(getClockTime())
    else # highlight the set
      deselectAll()
      cur.forEach(select)

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
    assistSet: assistSet
    select: select
    deselect: deselect

    getCardsLength: -> cards.length
    isCardSelected: (i) -> i in selected
  }
