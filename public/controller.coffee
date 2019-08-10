root = exports ? this

root.Controller = do ->
  ## Game Controller
  start = -> 
    if not Model.loadGame()
      Model.restart()
  checkSet = -> 
    if Model.checkSet()
      Model.clearSet()
      Model.saveGame()
  noSet = -> 
    Model.noSet()
    Model.saveGame()
  hint = ->
    Model.hint()
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
        if Settings.autocomplete
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
      else if keyCode == 'KeyH'
        hint()
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

  toggleAutocomplete = ->
    Settings.autocomplete = !Settings.autocomplete
    View.setAutocomplete(Settings.autocomplete)

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
    toggleAutocomplete: toggleAutocomplete
    toggleFullScreen: toggleFullScreen
  }
