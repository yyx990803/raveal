;(function () {

  /**
   * Setup clipPath container ------------------------------
   */

  var svgNS = 'http://www.w3.org/2000/svg'
  var holder = document.createElement('div')
  holder.style.width = holder.style.height = '0px'
  holder.style.overflow = 'hidden'
  holder.innerHTML =
    '<svg xmlns="' + svgNS + '" version="1.1">' +
      '<defs></defs>' +
    '</svg>'
  var defs = holder.querySelector('defs')
  var isHolderAppended = false

  /**
   * Compatibility -----------------------------------------
   */

  // Firefox & Webkit handles the position of clipPaths
  // differently. In webkit it is relative to client
  // viewport while in Firefox it is relative to the clipped
  // element.
  var isFirefox = navigator.userAgent.indexOf('Firefox') > 0
  var rAF =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (fn) { setTimeout(fn, 16) }

  /**
   * Variables ---------------------------------------------
   */

  // Uid to keep track of defs
  var uid = 0
  var prefix =
    'raveal-' +
    Math.floor(Math.random().toFixed(5) * 1e5) +
    '-'

  // State enums
  var CLOSED = 0
  var OPEN = 1
  var CLOSING = 2
  var OPENING = 3

  /**
   * Raveal class ------------------------------------------
   */

  /**
   * Instance constructor
   *
   * @param {Element} el
   * @contructor
   */

  function Raveal (e, opts) {

    if (!isHolderAppended) {
      isHolderAppended = true
      document.body.appendChild(holder)
    }

    opts = opts || {}

    var el = typeof e === 'string'
      ? document.querySelector(e)
      : e
    if (!el) {
      console.warn('Cannot find element: ' + e)
      return
    }

    this.id = prefix + uid++
    this.el = el

    // setup clipPath
    this.clip = document.createElementNS(svgNS, 'clipPath')
    this.circle = document.createElementNS(svgNS, 'circle')
    this.clip.id = this.id
    defs.appendChild(this.clip)
    this.clip.appendChild(this.circle)

    this.ease = opts.ease || 6
    // position & size
    this.x = 0
    this.y = 0
    if (opts.maxR) {
      this.maxR = opts.maxR
    } else {
      var ow = el.offsetWidth
      var oh = el.offsetHeight
      this.maxR = Math.sqrt(ow * ow + oh * oh)
    }
    if (opts.closed) {
      this.r = 0
    } else {
      this.r = this.maxR
    }

    // state
    this.state = CLOSED
    var self = this
    this.loop = function loop () {
      if (
        self.state === OPENING ||
        self.state === CLOSING
      ) {
        rAF(loop)
      }
      self.update()
    }

    this.update()
  }

  var p = Raveal.prototype

  /**
   * Update the clip path
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} r
   */

  p.update = function (x, y, r) {
    updaters[this.state].call(this)
    this.circle.setAttribute('cx', this.x)
    this.circle.setAttribute('cy', this.y)
    this.circle.setAttribute('r', this.r)
    this.el.style.webkitClipPath =
    this.el.style.clipPath =
      'url(#' + this.id + ')'
  }

  /**
   * Reveal the layer at given position
   *
   * @param {Number} [x]
   * @param {Number} [y]
   *
   * --- or ---
   *
   * @param {Event} [e]
   */

  p.open = function (x, y) {
    this.setPosition(x, y)
    this.el.style.pointerEvents = 'auto'
    if (this.state === OPEN || this.state === CLOSED) {
      this.state = OPENING
      this.loop()
    } else {
      this.state = OPENING
    }
  }

  /**
   * Close the layer at given position
   *
   * @param {Number} [x]
   * @param {Number} [y]
   *
   * --- or ---
   *
   * @param {Event} [e]
   */

  p.close = function (x, y) {
    this.setPosition(x, y)
    this.el.style.pointerEvents = 'none'
    if (this.state === OPEN || this.state === CLOSED) {
      this.state = CLOSING
      this.loop()
    } else {
      this.state = CLOSING
    }
  }

  /**
   * Update the clip mask to the given position.
   * Chrome and Firefox handles the clipPath's position
   * quite differently here.
   *
   * @param {Number} [x]
   * @param {Number} [y]
   *
   * --- or ---
   *
   * @param {Event} [e]
   */

  p.setPosition = function (x, y) {
    var box = this.el.getBoundingClientRect()
    if (typeof x !== 'number') {
      // event
      var e = x
      // touch event
      if (e.changedTouches) {
        e = e.changedTouches[0]
      }
      x = isFirefox
        ? e.clientX - box.left
        : e.pageX
      y = isFirefox
        ? e.clientY - box.top
        : e.pageY
    } else {
      // raw position
      x = isFirefox
        ? x
        : x + box.left
      y = isFirefox
        ? y
        : y + box.top
    }
    this.x = x === 0 ? x : (x || this.x)
    this.y = y === 0 ? y : (y || this.y)
  }

  /**
   * Toggle open/close
   *
   * @param {Number} [x]
   * @param {Number} [y]
   *
   * --- or ---
   *
   * @param {Event} [e]
   */

  p.toggle = function (x, y) {
    if (this.state === OPEN || this.state === OPENING) {
      this.close(x, y)
    } else {
      this.open(x, y)
    }
  }

  /**
   * Animation update functions ----------------------------
   */

  var updaters = {}

  /**
   * Closed
   */

  updaters[CLOSED] = function () {
    this.r = 0
  }

  /**
   * Open
   */

  updaters[OPEN] = function () {
    this.r = this.maxR
  }

  /**
   * Opening
   */

  updaters[OPENING] = function () {
    if (this.r === this.maxR) {
      return
    } else if (Math.abs(this.maxR - this.r) < 0.1) {
      this.state = OPEN
    } else {
      this.r += (this.maxR - this.r) / (this.ease * 2)
    }
  }

  /**
   * Closing
   */

  updaters[CLOSING] = function () {
    if (this.r === 0) {
      return
    } else if (Math.abs(0 - this.r) < 0.1) {
      this.state = CLOSED
    } else {
      this.r += (0 - this.r) / this.ease
    }
  }

  /**
   * Expose API --------------------------------------------
   */

  if (typeof exports == "object") {
    module.exports = Raveal
  } else if (typeof define == "function" && define.amd) {
    define(function(){ return Raveal })
  } else {
    window.Raveal = Raveal
  }

})()