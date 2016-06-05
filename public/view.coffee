root = exports ? this

root.View = do ->
  $cards = []
  $window = $(window)
  $body = $(document.body)
  $display = $('#display')
  $clock = $('#clock')
  $restartBig = $('#restartBig')
  $restart = $('#restart')
  $noSet = $('#no-set')
  $done = $('#done')
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
    $toggleTheme.on('click touchend', Controller.toggleTheme)
    $restart.on('click touchend', @w Controller.restart)
    $restartBig.on('click touchend', @w Controller.restart)
    $checkSet.on('click touchend', @w Controller.checkSet)
    $noSet.on('click touchend', @w Controller.noSet)
    $done.on('click touchend', @w Controller.noSet)

    $window.on 'orientationchange resize', ->
      layoutCards()

    ## Gesture input listeners
    $body.on 'keydown', @w (evt) ->
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
      evt.preventDefault()
      touchList = evt.originalEvent.changedTouches
      range(touchList.length).map(
        (i) -> touchList.item(i)
      ).forEach (touch) ->
        hitXY(touch.pageX, touch.pageY, 1)

    $body.on 'mousemove', (evt) ->
      if evt.buttons == 1
        hitXY(evt.clientX, evt.clientY, .9)

    $body.on 'touchmove', (evt) ->
      evt.preventDefault()
      touchList = evt.originalEvent.changedTouches
      range(touchList.length).map(
        (i) -> touchList.item(i)
      ).forEach (touch) ->
        hitXY(touch.pageX, touch.pageY, .9)

    ## End-of-gesture listeners
    $body.on 'keyup', (evt) ->
      Controller.releaseKey(evt.originalEvent.code)

    $body.on 'mouseup', (evt) ->
      Controller.releaseMouse()

    $body.on 'touchend', (evt) ->
      if evt.originalEvent.touches.length == 0
        Controller.releaseMouse()

  ## DOM
  setLabels = (phase) ->
    if phase == 'gameover'
      lockFor(400)
      $noSet.fadeOut()
      $done.fadeOut()
      $checkSet.fadeOut()
    else
      lockFor(400)
      $checkSet.fadeIn()
      $clock.fadeOut()
      $restartBig.fadeOut()
      if phase == 'normal'
        $noSet.fadeIn()
        $done.fadeOut()
      else if phase == 'endgame'
        $noSet.fadeOut()
        $done.fadeIn()
    
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
    $body.css('display', 'table').height()
    $body.css('display', 'block') # force redraw

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

    isAnimating: -> Date.now() <= waitUntil
  }
